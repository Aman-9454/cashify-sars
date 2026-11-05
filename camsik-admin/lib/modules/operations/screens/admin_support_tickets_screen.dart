import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/helpers.dart';
import '../../../models/admin_models.dart';
import '../repositories/operations_repository.dart';

class AdminSupportTicketsScreen extends StatefulWidget {
  const AdminSupportTicketsScreen({super.key});

  @override
  State<AdminSupportTicketsScreen> createState() => _AdminSupportTicketsScreenState();
}

class _AdminSupportTicketsScreenState extends State<AdminSupportTicketsScreen> {
  final OperationsRepository _operationsRepository = OperationsRepositoryImpl();
  String _filter = 'all';
  List<AdminSupportTicket> _tickets = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTickets();
  }

  Future<void> _loadTickets() async {
    setState(() => _isLoading = true);
    final items = await _operationsRepository.fetchSupportTickets(_filter);
    if (!mounted) return;
    setState(() {
      _tickets = items;
      _isLoading = false;
    });
  }

  void _showReplyDialog(AdminSupportTicket ticket) {
    final replyController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Resolve Ticket ${ticket.ticketNumber}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('From: ${ticket.userName} (${ticket.userRole.toUpperCase()})', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('Subject: ${ticket.subject}', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(8)),
              child: Text(ticket.lastMessage, style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic)),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: replyController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Admin Resolution / Reply',
                hintText: 'Type reply to user...',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          OutlinedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final reply = replyController.text.trim();
              if (reply.isNotEmpty) {
                await _operationsRepository.replySupportTicket(ticket.id, reply);
              }
              await _operationsRepository.updateSupportTicket({'id': ticket.id, 'status': 'in_progress'});
              Helpers.showSuccessSnackbar('Updated', 'Ticket status marked In Progress');
              _loadTickets();
            },
            child: const Text('Mark In Progress'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.success, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              final reply = replyController.text.trim();
              if (reply.isNotEmpty) {
                await _operationsRepository.replySupportTicket(ticket.id, reply);
              }
              await _operationsRepository.updateSupportTicket({'id': ticket.id, 'status': 'resolved'});
              Helpers.showSuccessSnackbar('Success', 'Ticket marked as Resolved & reply sent');
              _loadTickets();
            },
            child: const Text('Resolve Ticket'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _tickets.where((t) => _filter == 'all' || t.status == _filter).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Support Tickets', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(icon: const Icon(Icons.refresh, size: 20), onPressed: _loadTickets),
        ],
      ),
      body: Column(
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: ['all', 'open', 'in_progress', 'resolved'].map((f) {
                final isSelected = _filter == f;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(f.replaceAll('_', ' ').toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : AppColors.textPrimary)),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    onSelected: (_) => setState(() => _filter = f),
                  ),
                );
              }).toList(),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                    ? const Center(child: Text('No support tickets in this category', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textMuted)))
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: filtered.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 12),
                        itemBuilder: (context, idx) {
                      final item = filtered[idx];
                      final isOpen = item.status == 'open';

                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: isOpen ? AppColors.error.withValues(alpha: 0.3) : AppColors.border),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2)),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: item.priority == 'high'
                                            ? AppColors.error.withValues(alpha: 0.15)
                                            : item.priority == 'medium'
                                                ? AppColors.warning.withValues(alpha: 0.15)
                                                : AppColors.primary.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        '${item.priority.toUpperCase()} PRIORITY',
                                        style: TextStyle(
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                          color: item.priority == 'high'
                                              ? AppColors.error
                                              : item.priority == 'medium'
                                                  ? AppColors.warning
                                                  : AppColors.primary,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(item.ticketNumber, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: item.status == 'resolved'
                                        ? AppColors.success.withValues(alpha: 0.15)
                                        : item.status == 'in_progress'
                                            ? AppColors.warning.withValues(alpha: 0.15)
                                            : AppColors.error.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    item.status.replaceAll('_', ' ').toUpperCase(),
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      color: item.status == 'resolved'
                                          ? AppColors.success
                                          : item.status == 'in_progress'
                                              ? AppColors.warning
                                              : AppColors.error,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(item.subject, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            const SizedBox(height: 4),
                            Text(item.lastMessage, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                            const Divider(height: 18),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('${item.userName} • ${item.userPhone}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                TextButton.icon(
                                  icon: const Icon(Icons.reply, size: 16),
                                  label: const Text('Resolve / Reply', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                  onPressed: () => _showReplyDialog(item),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
