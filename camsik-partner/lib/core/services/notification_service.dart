import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:sizer/sizer.dart';

class NotificationService {
  static const MethodChannel _channel = MethodChannel('in.camsik.user/notifications');

  static final List<Map<String, dynamic>> _inAppNotifications = [];

  static List<Map<String, dynamic>> get inAppNotifications => List.unmodifiable(_inAppNotifications);

  /// Trigger both Android Notification Drawer and In-App Banner
  static Future<void> triggerNotification({
    required BuildContext? context,
    required String title,
    required String message,
    required String orderId,
    VoidCallback? onTapViewOrder,
  }) async {
    // 1. Post to native Android system drawer
    try {
      await _channel.invokeMethod('showNotification', {
        'title': title,
        'message': message,
        'orderId': orderId,
      });
    } catch (e) {
      debugPrint('Native notification dispatch error (e.g. non-android or simulator): $e');
    }

    // 2. Add to local history
    final notifRecord = {
      'id': 'notif-${DateTime.now().millisecondsSinceEpoch}',
      'title': title,
      'message': message,
      'orderId': orderId,
      'timestamp': DateTime.now().toIso8601String(),
      'read': false,
    };
    _inAppNotifications.insert(0, notifRecord);

    // 3. Show In-App SnackBar / Banner if context is alive
    if (context != null && context.mounted) {
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          elevation: 6,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          backgroundColor: const Color(0xFF0F172A),
          duration: const Duration(seconds: 4),
          content: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF059669).withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle, color: Color(0xFF34D399), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 15.sp,
                      ),
                    ),
                    Text(
                      message,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: Colors.white70, fontSize: 14.sp),
                    ),
                  ],
                ),
              ),
              if (onTapViewOrder != null)
                TextButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).hideCurrentSnackBar();
                    onTapViewOrder();
                  },
                  child: Text(
                    'VIEW',
                    style: TextStyle(
                      color: const Color(0xFF38BDF8),
                      fontWeight: FontWeight.bold,
                      fontSize: 14.sp,
                    ),
                  ),
                ),
            ],
          ),
        ),
      );
    }
  }
}
