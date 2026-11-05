import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../models/admin_models.dart';
import '../../../../widgets/status_badge.dart';
import '../bloc/orders_cubit.dart';

class AdminOrderDetailModal extends StatefulWidget {
  final AdminOrder order;
  final List<AdminPartner> partners;
  final List<AdminDeliveryAgent> agents;
  final OrdersCubit ordersCubit;
  final VoidCallback onOrderUpdated;

  const AdminOrderDetailModal({
    super.key,
    required this.order,
    required this.partners,
    required this.agents,
    required this.ordersCubit,
    required this.onOrderUpdated,
  });

  @override
  State<AdminOrderDetailModal> createState() => _AdminOrderDetailModalState();
}

class _AdminOrderDetailModalState extends State<AdminOrderDetailModal> {
  bool _isUpdating = false;

  Future<void> _updateStatus(String newStatus) async {
    setState(() => _isUpdating = true);
    final ok = await widget.ordersCubit.updateOrder(
      orderId: widget.order.id,
      status: newStatus,
      notes: 'Status updated by Super Admin',
    );
    if (!mounted) return;
    setState(() => _isUpdating = false);
    if (ok) {
      widget.onOrderUpdated();
    } else {
      showCustomSnackBar(context, 'Failed to update order status', isError: true);
    }
  }

  void _showAssignPartnerDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Assign Partner Hub', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: SizedBox(
          width: double.maxFinite,
          child: widget.partners.isEmpty
              ? const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text('No active partners found.', style: TextStyle(color: AppColors.textMuted)),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  itemCount: widget.partners.length,
                  separatorBuilder: (_, _) => const Divider(height: 1),
                  itemBuilder: (_, idx) {
                    final p = widget.partners[idx];
                    return ListTile(
                      title: Text(p.storeName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      subtitle: Text('${p.ownerName} • ${p.city}', style: const TextStyle(fontSize: 11)),
                      trailing: StatusBadge(status: p.status),
                      onTap: () async {
                        Navigator.pop(ctx);
                        setState(() => _isUpdating = true);
                        final ok = await widget.ordersCubit.updateOrder(
                          orderId: widget.order.id,
                          assignedPartnerId: p.id,
                          assignedPartnerName: p.storeName,
                        );
                        if (mounted) {
                          setState(() => _isUpdating = false);
                          if (ok) widget.onOrderUpdated();
                        }
                      },
                    );
                  },
                ),
        ),
      ),
    );
  }

  void _showAssignRiderDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Dispatch Field Rider', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: SizedBox(
          width: double.maxFinite,
          child: widget.agents.isEmpty
              ? const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text('No active riders found.', style: TextStyle(color: AppColors.textMuted)),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  itemCount: widget.agents.length,
                  separatorBuilder: (_, _) => const Divider(height: 1),
                  itemBuilder: (_, idx) {
                    final a = widget.agents[idx];
                    return ListTile(
                      leading: const Icon(Icons.two_wheeler, color: AppColors.warning),
                      title: Text(a.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      subtitle: Text('${a.zone} • ${a.vehicleType}', style: const TextStyle(fontSize: 11)),
                      trailing: Text(
                        a.dutyStatus.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: a.dutyStatus == 'online' ? AppColors.success : AppColors.textMuted,
                        ),
                      ),
                      onTap: () async {
                        Navigator.pop(ctx);
                        setState(() => _isUpdating = true);
                        final ok = await widget.ordersCubit.updateOrder(
                          orderId: widget.order.id,
                          assignedRiderId: a.id,
                          assignedRiderName: a.name,
                        );
                        if (mounted) {
                          setState(() => _isUpdating = false);
                          if (ok) widget.onOrderUpdated();
                        }
                      },
                    );
                  },
                ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.order.id,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      'Created on ${widget.order.createdAt.split('T').first}',
                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                    ),
                  ],
                ),
                StatusBadge(status: widget.order.status),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(height: 1, color: AppColors.border),
            const SizedBox(height: 16),

            // Customer Info
            const Text(
              'CUSTOMER & LOGISTICS',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted),
            ),
            const SizedBox(height: 8),
            Text(widget.order.customerName, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            if (widget.order.customerPhone.isNotEmpty) ...[
              const SizedBox(height: 4),
              InkWell(
                onTap: () => openDialer(widget.order.customerPhone),
                child: Row(
                  children: [
                    const Icon(Icons.phone, size: 14, color: AppColors.accent),
                    const SizedBox(width: 4),
                    Text(
                      widget.order.customerPhone,
                      style: const TextStyle(color: AppColors.accent, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 4),
            InkWell(
              onTap: () => openGoogleMapsNavigation(
                '${widget.order.pickupAddress}, ${widget.order.pickupCity}',
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 14, color: AppColors.primary),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      '${widget.order.pickupAddress}, ${widget.order.pickupCity} (Tap for Maps)',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Device & Pricing Info
            const Text(
              'DEVICE & SETTLEMENT',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    '${widget.order.deviceModel} ${widget.order.deviceVariant}',
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  ),
                ),
                Text(
                  CurrencyFormatter.format(widget.order.finalPrice),
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.success),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Assignments Section
            const Text(
              'ACTIVE ASSIGNMENTS',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.storefront_rounded, size: 16, color: AppColors.primary),
                          const SizedBox(width: 8),
                          Text(widget.order.assignedPartnerName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      TextButton(onPressed: _showAssignPartnerDialog, child: const Text('Reassign', style: TextStyle(fontSize: 12))),
                    ],
                  ),
                  const Divider(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.two_wheeler_rounded, size: 16, color: AppColors.warning),
                          const SizedBox(width: 8),
                          Text(widget.order.assignedRiderName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      TextButton(onPressed: _showAssignRiderDialog, child: const Text('Dispatch', style: TextStyle(fontSize: 12))),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Status Actions
            const Text(
              'CHANGE ORDER STATUS',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                'created',
                'assigned',
                'accepted',
                'pickup_scheduled',
                'picked_up',
                'in_transit',
                'inspection',
                'completed',
                'cancelled',
                'rejected',
              ].map((s) {
                final isCurrent = widget.order.status == s || (s == 'inspection' && widget.order.status == 'inspection_in_progress');
                return ChoiceChip(
                  label: Text(s.replaceAll('_', ' ').toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isCurrent ? Colors.white : AppColors.textPrimary)),
                  selected: isCurrent,
                  selectedColor: AppColors.primary,
                  onSelected: (val) {
                    if (val && !isCurrent) _updateStatus(s);
                  },
                );
              }).toList(),
            ),

            if (_isUpdating) ...[
              const SizedBox(height: 16),
              const Center(child: CircularProgressIndicator()),
            ],
          ],
        ),
      ),
    );
  }
}
