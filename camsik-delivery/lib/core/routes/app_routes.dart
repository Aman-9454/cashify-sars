import 'package:flutter/material.dart';
import '../../modules/auth/delivery_login_screen.dart';
import '../../modules/navigation/delivery_main_navigation_screen.dart';
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
          builder: (_) => const DeliveryLoginScreen(),
        );

      case mainNav:
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => const DeliveryMainNavigationScreen(),
        );

      case initial:
      default:
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => SessionService.isLoggedIn
              ? const DeliveryMainNavigationScreen()
              : const DeliveryLoginScreen(),
        );
    }
  }
}
