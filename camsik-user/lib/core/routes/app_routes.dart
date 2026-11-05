import 'package:flutter/material.dart';
import '../../models/user_order.dart';
import '../../models/user_profile.dart';
import '../../modules/auth/auth_screen.dart';
import '../../modules/buy/buy_refurbished_screen.dart';
import '../../modules/exchange/exchange_workflow_screen.dart';
import '../../modules/main_navigation_screen.dart';
import '../../modules/onboarding/onboarding_screen.dart';
import '../../modules/rent/rental_cameras_screen.dart';
import '../../modules/sell/sell_workflow_screen.dart';

class AppRoutes {
  AppRoutes._();

  // Route Name Constants
  static const String initial = '/';
  static const String onboarding = '/onboarding';
  static const String auth = '/auth';
  static const String mainNav = '/main';
  static const String sell = '/sell';
  static const String buy = '/buy';
  static const String exchange = '/exchange';
  static const String rent = '/rent';

  // Central Route Generator
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case onboarding:
        final onFinish = settings.arguments as VoidCallback? ?? () {};
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => CamsikOnboardingScreen(onFinish: onFinish),
        );

      case auth:
        final args = settings.arguments as Map<String, dynamic>?;
        final onAuthSuccess = args?['onAuthSuccess'] as Function(UserProfile)? ?? (_) {};
        final initialProfile = args?['initialProfile'] as UserProfile? ??
            UserProfile(name: '', phone: '', email: '', avatarIndex: 0, upiId: '', bankAccount: '', address: '');
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => CamsikAuthScreen(
            onAuthSuccess: onAuthSuccess,
            initialProfile: initialProfile,
          ),
        );

      case mainNav:
        final args = settings.arguments as Map<String, dynamic>?;
        final profile = args?['userProfile'] as UserProfile? ??
            UserProfile(name: 'Camsik Customer', phone: '', email: '', avatarIndex: 0, upiId: '', bankAccount: '', address: '');
        final onUpdate = args?['onProfileUpdate'] as Function(UserProfile)? ?? (_) {};
        final onLogout = args?['onLogout'] as VoidCallback? ?? () {};
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => UserMainNavigationScreen(
            userProfile: profile,
            onProfileUpdate: onUpdate,
            onLogout: onLogout,
          ),
        );

      case sell:
        final args = settings.arguments as Map<String, dynamic>?;
        final categories = args?['categories'] as List<Map<String, dynamic>>? ?? [];
        final profile = args?['userProfile'] as UserProfile? ??
            UserProfile(name: '', phone: '', email: '', avatarIndex: 0, upiId: '', bankAccount: '', address: '');
        final onUpdate = args?['onProfileUpdate'] as Function(UserProfile)? ?? (_) {};
        final onCreated = args?['onOrderCreated'] as Function(UserOrder)? ?? (_) {};
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => Scaffold(
            body: SafeArea(
              child: SellWorkflowWidget(
                categories: categories,
                userProfile: profile,
                onProfileUpdate: onUpdate,
                onOrderCreated: onCreated,
              ),
            ),
          ),
        );

      case buy:
        final args = settings.arguments as Map<String, dynamic>?;
        final products = args?['products'] as List<Map<String, dynamic>>? ?? [];
        final profile = args?['userProfile'] as UserProfile? ??
            UserProfile(name: '', phone: '', email: '', avatarIndex: 0, upiId: '', bankAccount: '', address: '');
        final onUpdate = args?['onProfileUpdate'] as Function(UserProfile)? ?? (_) {};
        final onCreated = args?['onOrderCreated'] as Function(UserOrder)? ?? (_) {};
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => Scaffold(
            body: SafeArea(
              child: BuyRefurbishedWidget(
                products: products,
                userProfile: profile,
                onProfileUpdate: onUpdate,
                onOrderCreated: onCreated,
              ),
            ),
          ),
        );

      case exchange:
        final args = settings.arguments as Map<String, dynamic>?;
        final products = args?['refurbishedProducts'] as List<Map<String, dynamic>>? ?? [];
        final profile = args?['userProfile'] as UserProfile? ??
            UserProfile(name: '', phone: '', email: '', avatarIndex: 0, upiId: '', bankAccount: '', address: '');
        final onUpdate = args?['onProfileUpdate'] as Function(UserProfile)? ?? (_) {};
        final onCreated = args?['onOrderCreated'] as Function(UserOrder)? ?? (_) {};
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => Scaffold(
            body: SafeArea(
              child: ExchangeWorkflowWidget(
                refurbishedProducts: products,
                userProfile: profile,
                onProfileUpdate: onUpdate,
                onOrderCreated: onCreated,
              ),
            ),
          ),
        );

      case rent:
        final args = settings.arguments as Map<String, dynamic>?;
        final cameras = args?['rentalCameras'] as List<Map<String, dynamic>>? ?? [];
        final profile = args?['userProfile'] as UserProfile? ??
            UserProfile(name: '', phone: '', email: '', avatarIndex: 0, upiId: '', bankAccount: '', address: '');
        final onUpdate = args?['onProfileUpdate'] as Function(UserProfile)? ?? (_) {};
        final onCreated = args?['onOrderCreated'] as Function(UserOrder)? ?? (_) {};
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => Scaffold(
            body: SafeArea(
              child: RentalCamerasWidget(
                rentalCameras: cameras,
                userProfile: profile,
                onProfileUpdate: onUpdate,
                onOrderCreated: onCreated,
              ),
            ),
          ),
        );

      default:
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => Scaffold(
            appBar: AppBar(title: const Text('Page Not Found')),
            body: Center(
              child: Text('No route defined for ${settings.name}'),
            ),
          ),
        );
    }
  }

  // Navigation Helper Methods
  static Future<T?> push<T>(BuildContext context, String routeName, {Object? arguments}) {
    return Navigator.pushNamed<T>(context, routeName, arguments: arguments);
  }

  static Future<T?> pushReplacement<T, TO>(BuildContext context, String routeName, {TO? result, Object? arguments}) {
    return Navigator.pushReplacementNamed<T, TO>(context, routeName, result: result, arguments: arguments);
  }

  static Future<T?> pushAndRemoveUntil<T>(BuildContext context, String routeName, {Object? arguments}) {
    return Navigator.pushNamedAndRemoveUntil<T>(context, routeName, (route) => false, arguments: arguments);
  }

  static void pop<T>(BuildContext context, [T? result]) {
    Navigator.pop<T>(context, result);
  }
}
