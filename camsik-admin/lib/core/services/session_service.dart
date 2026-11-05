import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/admin_models.dart';
import '../constants/app_keys.dart';

class SessionService {
  static AdminUser? _currentUser;

  static AdminUser? get currentUser => _currentUser;
  static bool get isLoggedIn => _currentUser != null;

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(AppKeys.adminSession);
    if (raw != null && raw.isNotEmpty) {
      try {
        final Map<String, dynamic> data = jsonDecode(raw);
        _currentUser = AdminUser.fromJson(data);
      } catch (_) {}
    }
  }

  static Future<void> saveSession(AdminUser user, {String? token, String? refreshToken}) async {
    _currentUser = user;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppKeys.adminSession, jsonEncode(user.toJson()));
    if (token != null && token.isNotEmpty) {
      await prefs.setString(AppKeys.accessToken, token);
    } else if (user.token.isNotEmpty) {
      await prefs.setString(AppKeys.accessToken, user.token);
    }
    if (refreshToken != null && refreshToken.isNotEmpty) {
      await prefs.setString(AppKeys.refreshToken, refreshToken);
    }
  }

  static Future<void> clearSession() async {
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppKeys.adminSession);
    await prefs.remove(AppKeys.accessToken);
    await prefs.remove(AppKeys.refreshToken);
  }

  // Legacy compatibility helpers
  static Future<AdminUser?> getUser() async => _currentUser;
  static Future<void> saveUser(AdminUser user) => saveSession(user);
}
