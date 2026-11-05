import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/delivery_models.dart';
import '../constants/app_keys.dart';

class SessionService {
  static const String _keyDeliverySession = 'camsik_delivery_session';
  static DeliveryAgentUser? _currentUser;

  static DeliveryAgentUser? get currentUser => _currentUser;
  static bool get isLoggedIn => _currentUser != null;

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_keyDeliverySession);
    if (raw != null && raw.isNotEmpty) {
      try {
        final Map<String, dynamic> data = jsonDecode(raw);
        _currentUser = DeliveryAgentUser.fromJson(data);
      } catch (_) {}
    }
  }

  static Future<void> saveSession(DeliveryAgentUser user, {String? token, String? refreshToken}) async {
    _currentUser = user;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyDeliverySession, jsonEncode(user.toJson()));
    if (token != null && token.isNotEmpty) {
      await prefs.setString(AppKeys.accessToken, token);
    }
    if (refreshToken != null && refreshToken.isNotEmpty) {
      await prefs.setString(AppKeys.refreshToken, refreshToken);
    }
  }

  static Future<void> clearSession() async {
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyDeliverySession);
    await prefs.remove(AppKeys.accessToken);
    await prefs.remove(AppKeys.refreshToken);
  }
}
