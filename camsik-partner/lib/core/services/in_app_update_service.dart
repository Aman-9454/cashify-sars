import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:in_app_update/in_app_update.dart';

class InAppUpdateService {
  /// Checks if an update is available on Google Play Store and performs the update.
  /// This only runs on Android devices in non-debug mode.
  static Future<void> checkForUpdate() async {
    if (kIsWeb) {
      debugPrint('InAppUpdateService: Web platform, skipping.');
      return;
    }
    if (!Platform.isAndroid) {
      debugPrint('InAppUpdateService: Non-Android platform, skipping.');
      return;
    }

    try {
      debugPrint('InAppUpdateService: Checking for update...');
      final info = await InAppUpdate.checkForUpdate();
      
      if (info.updateAvailability == UpdateAvailability.updateAvailable) {
        debugPrint('InAppUpdateService: Update is available.');
        
        // Prefer Immediate Update if allowed (forces user to update to continue using the app)
        if (info.immediateUpdateAllowed) {
          debugPrint('InAppUpdateService: Starting immediate update...');
          await InAppUpdate.performImmediateUpdate();
        } 
        // Otherwise, fall back to Flexible Update (downloads in background, user can continue using the app)
        else if (info.flexibleUpdateAllowed) {
          debugPrint('InAppUpdateService: Starting flexible update...');
          await InAppUpdate.startFlexibleUpdate();
          debugPrint('InAppUpdateService: Flexible update downloaded. Completing update...');
          await InAppUpdate.completeFlexibleUpdate();
        }
      } else {
        debugPrint('InAppUpdateService: App is up to date.');
      }
    } catch (e) {
      debugPrint('InAppUpdateService Error: $e');
    }
  }
}
