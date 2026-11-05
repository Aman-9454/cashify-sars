import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../models/user_order.dart';
import '../../orders/widgets/order_chat_bottom_sheet.dart';

class OrderCardWidget extends StatelessWidget {
  final UserOrder order;
  final VoidCallback? onOrderUpdated;

  const OrderCardWidget({
    super.key,
    required this.order,
    this.onOrderUpdated,
  });

  bool get _canCancelOrReschedule =>
      order.status.toLowerCase() != 'cancelled' &&
      order.status.toLowerCase() != 'completed' &&
      order.status.toLowerCase() != 'device picked up';

  void _showCancelDialog(BuildContext context) {
    String selectedReason = 'Change of plans';
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Cancel Order?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Are you sure you want to cancel ${order.orderNumber}?',
                  style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
              const SizedBox(height: 14),
              const Text('Select reason:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: selectedReason,
                decoration: InputDecoration(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                items: const [
                  DropdownMenuItem(value: 'Change of plans', child: Text('Change of plans', style: TextStyle(fontSize: 12))),
                  DropdownMenuItem(value: 'Getting better price locally', child: Text('Better price locally', style: TextStyle(fontSize: 12))),
                  DropdownMenuItem(value: 'Need device longer', child: Text('Need device longer', style: TextStyle(fontSize: 12))),
                  DropdownMenuItem(value: 'Incorrect order details', child: Text('Incorrect order details', style: TextStyle(fontSize: 12))),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => selectedReason = val);
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Keep Order', style: TextStyle(color: Color(0xFF64748B))),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () async {
                Navigator.pop(ctx);
                final success = await ApiService.cancelOrder(orderId: order.id, reason: selectedReason);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(success ? 'Order cancelled successfully' : 'Failed to cancel order'),
                      backgroundColor: success ? const Color(0xFF059669) : const Color(0xFFEF4444),
                    ),
                  );
                }
                onOrderUpdated?.call();
              },
              child: const Text('Confirm Cancel', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  void _showRescheduleDialog(BuildContext context) {
    final availableDates = <String>[
      'Tomorrow',
      'Day After Tomorrow',
      'Coming Weekend',
    ];
    final orderDate = order.pickupDate?.trim() ?? '';
    if (orderDate.isNotEmpty && !availableDates.contains(orderDate)) {
      availableDates.insert(0, orderDate);
    }

    final availableSlots = <String>[
      '9:00 AM – 11:00 AM',
      '11:00 AM – 1:00 PM',
      '1:00 PM – 3:00 PM',
      '3:00 PM – 5:00 PM',
      '5:00 PM – 7:00 PM',
      '10:00 AM – 1:00 PM',
      '1:00 PM – 4:00 PM',
      '4:00 PM – 7:00 PM',
    ];
    final orderSlot = order.pickupSlot?.trim() ?? '';
    if (orderSlot.isNotEmpty && !availableSlots.contains(orderSlot)) {
      availableSlots.insert(0, orderSlot);
    }

    String selectedDate = availableDates.contains(orderDate)
        ? orderDate
        : availableDates.first;
    String selectedSlot = availableSlots.contains(orderSlot)
        ? orderSlot
        : availableSlots.first;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Reschedule Pickup', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Select new date & time slot for inspection executive visit:',
                  style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
              const SizedBox(height: 12),
              const Text('Pickup Date:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: selectedDate,
                decoration: InputDecoration(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                items: availableDates.map((date) {
                  return DropdownMenuItem<String>(
                    value: date,
                    child: Text(date, style: const TextStyle(fontSize: 12)),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => selectedDate = val);
                },
              ),
              const SizedBox(height: 12),
              const Text('Time Slot:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: selectedSlot,
                decoration: InputDecoration(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                items: availableSlots.map((slot) {
                  return DropdownMenuItem<String>(
                    value: slot,
                    child: Text(slot, style: const TextStyle(fontSize: 12)),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => selectedSlot = val);
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Back', style: TextStyle(color: Color(0xFF64748B))),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF059669),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () async {
                Navigator.pop(ctx);
                final success = await ApiService.rescheduleOrder(
                  orderId: order.id,
                  newDate: selectedDate,
                  newSlot: selectedSlot,
                );
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(success ? 'Pickup rescheduled to $selectedDate ($selectedSlot)' : 'Failed to reschedule'),
                      backgroundColor: success ? const Color(0xFF059669) : const Color(0xFFEF4444),
                    ),
                  );
                }
                onOrderUpdated?.call();
              },
              child: const Text('Confirm Reschedule', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  void _showOrderTimelineModal(BuildContext context, UserOrder o) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Order Status Timeline: ${o.orderNumber}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              ...List.generate(o.timelineSteps.length, (idx) {
                final isDone = idx <= o.currentStep;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    children: [
                      Icon(
                        isDone ? Icons.check_circle : Icons.radio_button_off,
                        color: isDone
                            ? const Color(0xFF059669)
                            : const Color(0xFF94A3B8),
                        size: 18,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        o.timelineSteps[idx],
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight:
                              isDone ? FontWeight.bold : FontWeight.normal,
                          color: isDone
                              ? const Color(0xFF0F172A)
                              : const Color(0xFF94A3B8),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: order.type == 'rent'
                      ? const Color(0xFFFFE4E6)
                      : (order.type == 'buy'
                          ? const Color(0xFFEDE9FE)
                          : const Color(0xFFDCFCE7)),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  order.orderNumber,
                  style: TextStyle(
                    color: order.type == 'rent'
                        ? const Color(0xFFE11D48)
                        : (order.type == 'buy'
                            ? const Color(0xFF7C3AED)
                            : const Color(0xFF059669)),
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                ),
              ),
              Text(
                order.status,
                style: TextStyle(
                  color: order.status.toLowerCase().contains('cancel')
                      ? const Color(0xFFEF4444)
                      : (order.type == 'rent'
                          ? const Color(0xFFE11D48)
                          : const Color(0xFF059669)),
                  fontWeight: FontWeight.bold,
                  fontSize: 11,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(order.device,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                formatCurrency(order.amount),
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                  fontSize: 14,
                ),
              ),
              if (order.status.toLowerCase() != 'cancelled')
                Text(
                  'OTP: ${order.otp}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF4F46E5),
                    fontSize: 12,
                  ),
                ),
            ],
          ),
          if (order.deliveryAgentName != null && order.deliveryAgentName!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.delivery_dining_rounded, size: 14, color: Color(0xFF2563EB)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Rider: ${order.deliveryAgentName}${order.deliveryAgentPhone != null && order.deliveryAgentPhone!.isNotEmpty ? " • 📞 ${order.deliveryAgentPhone}" : ""}',
                      style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: Color(0xFF1D4ED8)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ] else if (order.partnerName != null && order.partnerName!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.storefront_rounded, size: 14, color: Color(0xFF16A34A)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Store Partner: ${order.partnerName}',
                      style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: Color(0xFF15803D)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 8),
          const Divider(height: 12),
          Row(
            children: [
              const Icon(Icons.schedule, size: 12, color: Color(0xFF64748B)),
              const SizedBox(width: 4),
              Text(order.date,
                  style: const TextStyle(
                      color: Color(0xFF64748B), fontSize: 11)),
              const Spacer(),
              TextButton.icon(
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  minimumSize: const Size(50, 20),
                ),
                icon: const Icon(Icons.chat_bubble_outline, size: 12, color: Color(0xFF4F46E5)),
                onPressed: () => OrderChatBottomSheet.show(context, order: order),
                label: const Text(
                  'Chat Agent',
                  style: TextStyle(
                    color: Color(0xFF4F46E5),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 4),
              TextButton(
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: const Size(50, 20),
                ),
                onPressed: () => _showOrderTimelineModal(context, order),
                child: const Text(
                  'Timeline',
                  style: TextStyle(
                    color: Color(0xFF059669),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          if (_canCancelOrReschedule) ...[
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                InkWell(
                  onTap: () => _showRescheduleDialog(context),
                  borderRadius: BorderRadius.circular(6),
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                    child: Text(
                      'Reschedule Slot',
                      style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFF3B82F6),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                InkWell(
                  onTap: () => _showCancelDialog(context),
                  borderRadius: BorderRadius.circular(6),
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                    child: Text(
                      'Cancel Order',
                      style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFFEF4444),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
