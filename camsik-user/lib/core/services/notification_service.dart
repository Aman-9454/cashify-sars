import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class NotificationService {
  static const MethodChannel _channel = MethodChannel('in.camsik.user/notifications');

  static final List<Map<String, dynamic>> _inAppNotifications = [];
  static List<Map<String, dynamic>> get inAppNotifications => List.unmodifiable(_inAppNotifications);

  static final ValueNotifier<int> unreadCountNotifier = ValueNotifier<int>(0);

  static const String _kReadNotifsKey = 'camsik_read_notification_ids';
  static Set<String> _readIds = {};
  static bool _isInitialized = false;

  static Future<void> _initReadIds() async {
    if (_isInitialized) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_kReadNotifsKey) ?? [];
      _readIds = list.toSet();
      _isInitialized = true;
    } catch (_) {}
  }

  static bool isNotificationRead(String id, {bool defaultRead = false}) {
    if (_readIds.contains(id)) return true;
    return defaultRead;
  }

  /// Check and update total unread notifications count
  static Future<int> checkUnreadCount({String? phone}) async {
    await _initReadIds();

    final Set<String> unreadIds = {};

    // Check local in-app notifications
    for (final n in _inAppNotifications) {
      final id = n['id']?.toString() ?? '';
      final bool isRead = n['read'] == true || _readIds.contains(id);
      if (!isRead && id.isNotEmpty) {
        unreadIds.add(id);
      }
    }

    // Check remote notifications
    try {
      final remote = await ApiService.fetchNotifications(phone: phone);
      for (final n in remote) {
        final id = n['id']?.toString() ?? '';
        final bool isRead = n['read'] == true || _readIds.contains(id);
        if (!isRead && id.isNotEmpty) {
          unreadIds.add(id);
        }
      }
    } catch (_) {}

    unreadCountNotifier.value = unreadIds.length;
    return unreadIds.length;
  }

  /// Mark all notifications as read
  static Future<void> markAllAsRead({
    String? phone,
    List<Map<String, dynamic>>? notifications,
  }) async {
    await _initReadIds();

    for (final n in _inAppNotifications) {
      n['read'] = true;
      final id = n['id']?.toString();
      if (id != null && id.isNotEmpty) {
        _readIds.add(id);
      }
    }

    final list = notifications ?? await ApiService.fetchNotifications(phone: phone);
    for (final n in list) {
      final id = n['id']?.toString();
      if (id != null && id.isNotEmpty) {
        _readIds.add(id);
        ApiService.markNotificationAsRead(id);
      }
    }

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_kReadNotifsKey, _readIds.toList());
    } catch (_) {}

    unreadCountNotifier.value = 0;
  }

  /// Mark single notification as read
  static Future<void> markAsRead(String id) async {
    await _initReadIds();
    _readIds.add(id);
    for (final n in _inAppNotifications) {
      if (n['id']?.toString() == id) {
        n['read'] = true;
      }
    }
    ApiService.markNotificationAsRead(id);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_kReadNotifsKey, _readIds.toList());
    } catch (_) {}
    if (unreadCountNotifier.value > 0) {
      unreadCountNotifier.value -= 1;
    }
  }

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
    unreadCountNotifier.value = unreadCountNotifier.value + 1;

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
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    Text(
                      message,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white70, fontSize: 11),
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
                  child: const Text(
                    'VIEW',
                    style: TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
            ],
          ),
        ),
      );
    }
  }
}
