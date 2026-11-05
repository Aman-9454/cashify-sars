import '../services/session_service.dart';
import '../services/storage_service.dart';
import 'logger.dart';

class SessionManager {
  static bool _isLoggingOut = false;

  static Future<void> forceLogout() async {
    if (_isLoggingOut) return;

    _isLoggingOut = true;
    appLog("🚪 Force logout triggered for admin session");

    try {
      final prefs = await SharedPreferencesService.getInstance();
      await prefs.clear();
      await SessionService.clearSession();
    } catch (e) {
      appLog("Error clearing prefs on force logout: $e");
    } finally {
      _isLoggingOut = false;
    }
  }
}
