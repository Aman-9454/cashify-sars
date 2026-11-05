import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/helpers.dart';
import '../../../models/admin_models.dart';
import '../repositories/operations_repository.dart';

class AdminPushNotificationsScreen extends StatefulWidget {
  const AdminPushNotificationsScreen({super.key});

  @override
  State<AdminPushNotificationsScreen> createState() => _AdminPushNotificationsScreenState();
}

class _AdminPushNotificationsScreenState extends State<AdminPushNotificationsScreen> {
  final _operationsRepository = OperationsRepository();
  final _titleController = TextEditingController();
  final _messageController = TextEditingController();
  String _targetAudience = 'all'; // 'all', 'customers', 'partners', 'riders'
  bool _isSending = false;
  List<AdminPushNotification> _history = [];

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _loadHistory() async {
    final list = await _operationsRepository.fetchNotifications();
    if (!mounted) return;
    setState(() => _history = list);
  }

  Future<void> _broadcastNotification() async {
    final title = _titleController.text.trim();
    final message = _messageController.text.trim();

    if (title.isEmpty || message.isEmpty) {
      showCustomSnackBar(context, 'Please enter both title and message body', isError: true);
      return;
    }

    setState(() => _isSending = true);
    final ok = await _operationsRepository.sendPushNotification(
      title: title,
      message: message,
      target: _targetAudience,
    );
    if (!mounted) return;
    setState(() => _isSending = false);

    if (ok) {
      showCustomSnackBar(context, 'Broadcast sent to $_targetAudience successfully!', isError: false);
      _titleController.clear();
      _messageController.clear();
      _loadHistory();
    } else {
      showCustomSnackBar(context, 'Failed to send notification', isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Push Broadcasts', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Composer Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 6, offset: const Offset(0, 2)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.campaign, color: AppColors.primary, size: 22),
                      SizedBox(width: 8),
                      Text('Broadcast Announcement', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    ],
                  ),
                  const SizedBox(height: 14),

                  const Text('Target Audience', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 8,
                    children: [
                      {'id': 'all', 'label': 'All Users'},
                      {'id': 'customers', 'label': 'Customers'},
                      {'id': 'partners', 'label': 'Partners'},
                      {'id': 'riders', 'label': 'Fleet Riders'},
                    ].map((t) {
                      final isSelected = _targetAudience == t['id'];
                      return ChoiceChip(
                        label: Text(t['label']!, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : AppColors.textPrimary)),
                        selected: isSelected,
                        selectedColor: AppColors.primary,
                        onSelected: (_) => setState(() => _targetAudience = t['id']!),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 14),

                  TextField(
                    controller: _titleController,
                    decoration: const InputDecoration(
                      labelText: 'Notification Title',
                      hintText: 'e.g. Weekend Flash Sale! 📸',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: _messageController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Message Body',
                      hintText: 'e.g. Get 20% off on all camera rentals using code CAMSIK20.',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                      icon: _isSending ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Icon(Icons.send_rounded),
                      label: Text(_isSending ? 'Broadcasting...' : 'Send Broadcast Notification', style: const TextStyle(fontWeight: FontWeight.bold)),
                      onPressed: _isSending ? null : _broadcastNotification,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'NOTIFICATION FEED / LOGS',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 10),

            if (_history.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(child: Text('No previous broadcasts sent', style: TextStyle(color: AppColors.textMuted))),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _history.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, idx) {
                  final notif = _history[idx];
                  return Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(notif.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                              child: Text(notif.targetRole.toUpperCase(), style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.primary)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(notif.body, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        const SizedBox(height: 6),
                        Text(notif.timestamp.split('T').first, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
