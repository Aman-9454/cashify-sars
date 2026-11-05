import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class SessionService {
  static const String _keyIsLoggedIn = 'camsik_is_logged_in';
  static const String _keyOnboarded = 'camsik_has_onboarded';
  static const String _keyUserProfile = 'camsik_user_profile_json';
  static const String _keyAccountsDb = 'camsik_local_accounts_db';

  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  static bool isLoggedIn() {
    return _prefs?.getBool(_keyIsLoggedIn) ?? false;
  }

  static bool hasCompletedOnboarding() {
    return _prefs?.getBool(_keyOnboarded) ?? false;
  }

  static Future<void> setOnboardingCompleted() async {
    await init();
    await _prefs?.setBool(_keyOnboarded, true);
  }

  static Future<void> saveUserSession({
    required String name,
    required String phone,
    required String email,
    String upiId = '',
    String bankAccount = '',
    String address = '',
    int avatarIndex = 0,
  }) async {
    await init();
    final map = {
      'name': name,
      'phone': phone,
      'email': email,
      'upiId': upiId,
      'bankAccount': bankAccount,
      'address': address,
      'avatarIndex': avatarIndex,
    };
    await _prefs?.setString(_keyUserProfile, jsonEncode(map));
    await _prefs?.setBool(_keyIsLoggedIn, true);
    await _prefs?.setBool(_keyOnboarded, true);
  }

  static Map<String, dynamic>? getSavedProfile() {
    final raw = _prefs?.getString(_keyUserProfile);
    if (raw == null || raw.isEmpty) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  static Future<void> clearSession() async {
    await init();
    await _prefs?.setBool(_keyIsLoggedIn, false);
    await _prefs?.remove(_keyUserProfile);
  }

  // ── LOCAL CREDENTIAL STORE ──
  static List<Map<String, dynamic>> _getLocalAccounts() {
    final defaultAccounts = [
      {
        'id': 'usr-demo-9876543210',
        'name': 'Demo User',
        'phone': '9876543210',
        'email': 'user@camsik.in',
        'password': 'Camsik@123',
      },
      {
        'id': 'usr-1790099450773',
        'name': 'Rohit Sharma',
        'phone': '9820011223',
        'email': 'rohit@camsik.in',
        'password': 'mysecretpass',
      },
    ];
    final raw = _prefs?.getString(_keyAccountsDb);
    if (raw == null || raw.isEmpty) return List<Map<String, dynamic>>.from(defaultAccounts);
    try {
      final list = jsonDecode(raw);
      if (list is List) {
        final parsed = <Map<String, dynamic>>[];
        for (final item in list) {
          if (item is Map) {
            parsed.add(Map<String, dynamic>.from(item));
          }
        }
        for (final def in defaultAccounts) {
          if (!parsed.any((a) => a['phone'] == def['phone'])) {
            parsed.add(Map<String, dynamic>.from(def));
          }
        }
        return parsed;
      }
      return List<Map<String, dynamic>>.from(defaultAccounts);
    } catch (_) {
      return List<Map<String, dynamic>>.from(defaultAccounts);
    }
  }

  static Future<void> saveLocalAccount({
    required String phone,
    required String password,
    required String name,
    required String email,
  }) async {
    await init();
    final cleanPhone = phone.replaceAll(RegExp(r'\D'), '').trim();
    final accounts = _getLocalAccounts();
    accounts.removeWhere((acc) =>
        acc['phone'] == cleanPhone ||
        (acc['email'] != null && acc['email'].toString().toLowerCase() == email.trim().toLowerCase()));
    accounts.add({
      'name': name.trim(),
      'phone': cleanPhone,
      'email': email.trim().toLowerCase(),
      'password': password.trim(),
      'savedAt': DateTime.now().toIso8601String(),
    });
    await _prefs?.setString(_keyAccountsDb, jsonEncode(accounts));
  }

  static Map<String, dynamic>? verifyLocalAccount({
    required String identifier,
    required String password,
  }) {
    final cleanId = identifier.trim().toLowerCase();
    final cleanPhone = identifier.replaceAll(RegExp(r'\D'), '').trim();
    final accounts = _getLocalAccounts();

    final match = accounts.firstWhere(
      (acc) =>
          acc['phone'] == cleanPhone ||
          acc['phone'] == cleanId ||
          (acc['email'] != null && acc['email'].toString().toLowerCase() == cleanId),
      orElse: () => <String, dynamic>{},
    );

    if (match.isEmpty) {
      return null; // User not found
    }

    if (match['password'] != password.trim()) {
      return {'error': 'INCORRECT_PASSWORD'};
    }

    return Map<String, dynamic>.from(match);
  }

  // ── MULTI-ADDRESS STORE ──
  static const String _keyAddressesList = 'camsik_user_saved_addresses_v1';

  static List<Map<String, dynamic>> getSavedAddresses({String fallbackAddress = ''}) {
    final raw = _prefs?.getString(_keyAddressesList);
    if (raw != null && raw.isNotEmpty) {
      try {
        final list = jsonDecode(raw);
        if (list is List && list.isNotEmpty) {
          return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        }
      } catch (_) {}
    }

    if (fallbackAddress.isNotEmpty) {
      final parts = fallbackAddress.split(',').map((s) => s.trim()).toList();
      return [
        {
          'id': 'addr-default',
          'tag': 'Home',
          'flat': parts.isNotEmpty ? parts[0] : '',
          'street': parts.length > 1 ? parts[1] : '',
          'city': parts.length > 2 ? parts[2] : 'Mumbai',
          'pincode': parts.length > 3 ? parts[3] : '',
          'isDefault': true,
        }
      ];
    }
    return [];
  }

  static Future<void> saveAddressesList(List<Map<String, dynamic>> addresses) async {
    await init();
    await _prefs?.setString(_keyAddressesList, jsonEncode(addresses));
  }
}
