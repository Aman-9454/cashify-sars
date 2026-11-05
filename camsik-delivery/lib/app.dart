import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import 'core/routes/app_routes.dart';
import 'core/theme/app_theme.dart';

final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey =
    GlobalKey<ScaffoldMessengerState>();

class CamsikDeliveryApp extends StatelessWidget {
  const CamsikDeliveryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Sizer(
      builder: (context, orientation, deviceType) {
        return MaterialApp(
          title: 'Camsik Delivery',
          scaffoldMessengerKey: scaffoldMessengerKey,
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          initialRoute: AppRoutes.initial,
          onGenerateRoute: AppRoutes.onGenerateRoute,
        );
      },
    );
  }
}
