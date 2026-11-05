import 'package:flutter/material.dart';
import '../../modules/auth/admin_login_screen.dart';
import '../../modules/navigation/admin_main_shell.dart';
import '../services/session_service.dart';

class AppRoutes {
  AppRoutes._();

  static const String initial = '/';
  static const String login = '/login';
  static const String mainNav = '/main';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case login:
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => const AdminLoginScreen(),
        );

      case mainNav:
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => const AdminMainShell(),
        );

      case initial:
      default:
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => SessionService.isLoggedIn
              ? const AdminMainShell()
              : const AdminLoginScreen(),
        );
    }
  }
}
