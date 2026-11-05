import 'package:flutter/material.dart';
import '../core/services/notification_service.dart';

class NotificationBottomSheet {
  static void show({
    required BuildContext context,
    required VoidCallback onNavigateToOrders,
  }) {
    final notifs = NotificationService.inAppNotifications;
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Notifications', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 12),
              if (notifs.isEmpty)
                const Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.notifications_none, size: 48, color: Color(0xFF94A3B8)),
                        SizedBox(height: 12),
                        Text('No notifications yet', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                )
              else
                Expanded(
                  child: ListView.separated(
                    itemCount: notifs.length,
                    separatorBuilder: (c, i) => const Divider(height: 1),
                    itemBuilder: (c, i) {
                      final n = notifs[i];
                      return ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: Color(0xFFE2E8F0),
                          child: Icon(Icons.check_circle, color: Color(0xFF059669), size: 20),
                        ),
                        title: Text(n['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        subtitle: Text(n['message'] as String, style: const TextStyle(fontSize: 12)),
                        onTap: () {
                          Navigator.pop(ctx);
                          onNavigateToOrders();
                        },
                      );
                    },
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
