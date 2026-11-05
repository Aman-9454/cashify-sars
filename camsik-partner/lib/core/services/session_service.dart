import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/partner_models.dart';
import '../constants/app_keys.dart';

class SessionService {
  static PartnerUser? _currentUser;

  static PartnerUser? get currentUser => _currentUser;

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(AppKeys.userProfile);
    if (raw != null && raw.isNotEmpty) {
      try {
        final Map<String, dynamic> data = jsonDecode(raw);
        _currentUser = PartnerUser.fromJson(data);
      } catch (_) {}
    }
  }

  static Future<void> saveSession(PartnerUser user) async {
    _currentUser = user;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppKeys.userProfile, jsonEncode(user.toJson()));
    await prefs.setBool(AppKeys.isLoggedIn, true);
  }

  static Future<void> clearSession() async {
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppKeys.userProfile);
    await prefs.setBool(AppKeys.isLoggedIn, false);
  }

  static bool get isLoggedIn => _currentUser != null;
}
