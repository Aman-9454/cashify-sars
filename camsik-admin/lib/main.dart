import 'dart:async';
import 'package:flutter/material.dart';
import 'app.dart';
import 'core/services/api_service.dart';
import 'core/services/session_service.dart';

void main() async {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();
    await ApiService.loadSavedServerUrl();
    ApiService.init();
    await SessionService.init();
    FlutterError.onError = (details) {
      FlutterError.presentError(details);
    };
    runApp(const CamsikAdminApp());
  }, (error, stack) {
    debugPrint('Global Camsik Admin Error: $error');
  });
}
