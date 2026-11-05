import 'dart:async';
import 'package:flutter/material.dart';
import 'app.dart';
import 'core/services/api_service.dart';
import 'core/services/session_service.dart';

void main() async {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();
    ApiService.init();
    await SessionService.init();
    FlutterError.onError = (details) {
      FlutterError.presentError(details);
    };
    runApp(const CamsikPartnerApp());
  }, (error, stack) {
    debugPrint('Global Camsik Partner Error: $error');
  });
}
