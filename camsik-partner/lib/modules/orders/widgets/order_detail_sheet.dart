import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/services/session_service.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../models/partner_models.dart';
import '../../riders/data/models/delivery_agent_model.dart';
import '../../riders/data/repositories/riders_repository.dart';

class OrderDetailSheet extends StatelessWidget {
  final PartnerOrder order;
  final Function(String newStatus)? onUpdateStatus;
  final Future<void> Function()? onOrderUpdated;

  const OrderDetailSheet({
    super.key,
    required this.order,
    this.onUpdateStatus,
    this.onOrderUpdated,
  });

  static void show({
    required BuildContext context,
    required PartnerOrder order,
    required Function(String newStatus) onUpdateStatus,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => OrderDetailSheet(
        order: order,
        onUpdateStatus: onUpdateStatus,
      ),
    );
  }

  Future<void> _makeCall(String phone) async {
    final clean = phone.replaceAll(RegExp(r'\s+'), '');
    final uri = Uri.parse('tel:$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _showAssignRiderSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _AssignRiderModal(
        order: order,
        onAssigned: () {
          Navigator.pop(context);
          onOrderUpdated?.call();
        },
      ),
    );
  }

  Future<void> _recallOrderToStore(BuildContext context) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Recall Order to Store?',
          style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Cancel rider dispatch and conduct device QA & payout directly in your store?',
          style: TextStyle(fontSize: 14.sp),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: TextStyle(fontSize: 14.sp)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD97706),
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Recall to Store', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm == true && context.mounted) {
      final ok = await ApiService.updateOrder(
        orderId: order.id,
        status: 'accepted',
        deliveryAgentId: '',
        deliveryAgentName: '',
        deliveryAgentPhone: '',
      );
      if (ok && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('🏬 Order #${order.orderNumber} recalled to store for in-store QA'),
            backgroundColor: const Color(0xFF0F172A),
          ),
        );
        Navigator.pop(context);
        onOrderUpdated?.call();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Padding(
          padding: EdgeInsets.fromLTRB(5.w, 1.5.h, 5.w, 2.h),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Top drag handle
                Center(
                  child: Container(
                    width: 10.w > 45 ? 45 : 10.w,
                    height: 4,
                    decoration: BoxDecoration(
                      color: const Color(0xFFCBD5E1),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                SizedBox(height: 2.h),

                // Order Number & Status Pill
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          order.orderNumber,
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 16.sp,
                            color: AppColors.primary,
                            letterSpacing: 0.5,
                          ),
                        ),
                        SizedBox(height: 0.3.h),
                        Text(
                          'Intake: ${order.type.toUpperCase()}',
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: const Color(0xFF64748B),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 3.w,
                        vertical: 0.6.h,
                      ),
                      decoration: BoxDecoration(
                        color: order.statusColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: order.statusColor.withValues(alpha: 0.25),
                        ),
                      ),
                      child: Text(
                        order.statusDisplay,
                        style: TextStyle(
                          color: order.statusColor,
                          fontSize: 14.sp,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 2.h),

                // Device Card
                Container(
                  padding: EdgeInsets.all(4.w),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Icon(
                          Icons.devices_rounded,
                          color: order.typeColor,
                          size: 26,
                        ),
                      ),
                      SizedBox(width: 3.5.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              order.deviceName,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16.sp,
                                color: const Color(0xFF0F172A),
                              ),
                            ),
                            if (order.deviceStorage.isNotEmpty) ...[
                              SizedBox(height: 0.3.h),
                              Text(
                                'Variant: ${order.deviceStorage} • Brand: ${order.deviceBrand.isNotEmpty ? order.deviceBrand : "Certified"}',
                                style: TextStyle(
                                  fontSize: 14.sp,
                                  color: const Color(0xFF64748B),
                                ),
                              ),
                            ],
                            if (order.inspectionScore != null) ...[
                              SizedBox(height: 0.5.h),
                              Row(
                                children: [
                                  const Icon(Icons.verified_rounded,
                                      color: Color(0xFF059669), size: 14),
                                  SizedBox(width: 1.w),
                                  Text(
                                    'QA Score: ${order.inspectionScore}/100',
                                    style: TextStyle(
                                      color: const Color(0xFF059669),
                                      fontSize: 14.sp,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                SizedBox(height: 2.h),

                // Customer Details & Pickup Slot
                Container(
                  padding: EdgeInsets.all(4.w),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Customer & Delivery Address',
                            style: TextStyle(
                              fontSize: 14.sp,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF64748B),
                            ),
                          ),
                          if (order.customerPhone.isNotEmpty)
                            InkWell(
                              onTap: () => _makeCall(order.customerPhone),
                              borderRadius: BorderRadius.circular(8),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                child: Row(
                                  children: [
                                    const Icon(
                                      Icons.phone_in_talk_rounded,
                                      size: 14,
                                      color: AppColors.primary,
                                    ),
                                    SizedBox(width: 1.w),
                                    Text(
                                      'Call Customer',
                                      style: TextStyle(
                                        fontSize: 14.sp,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                      SizedBox(height: 1.h),
                      Text(
                        '${order.customerName} (${order.customerPhone})',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15.sp,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      SizedBox(height: 0.4.h),
                      Text(
                        '${order.customerAddress}, ${order.city} - ${order.pinCode}',
                        style: TextStyle(
                          color: const Color(0xFF475569),
                          fontSize: 14.sp,
                          height: 1.3,
                        ),
                      ),
                      SizedBox(height: 1.h),
                      Row(
                        children: [
                          const Icon(Icons.schedule_rounded,
                              size: 14, color: Color(0xFF64748B)),
                          SizedBox(width: 1.5.w),
                          Text(
                            'Slot: ${order.pickupDate} • ${order.pickupSlot}',
                            style: TextStyle(
                              color: const Color(0xFF64748B),
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                SizedBox(height: 2.h),

                // Pricing Summary Box
                Container(
                  padding: EdgeInsets.all(4.w),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFF1F5F9), Color(0xFFE2E8F0)],
                    ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Online Quoted Price',
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: const Color(0xFF64748B),
                            ),
                          ),
                          SizedBox(height: 0.3.h),
                          Text(
                            CurrencyFormatter.format(order.quotedPrice),
                            style: TextStyle(
                              fontSize: 15.sp,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF334155),
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'Final QA Valuation',
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: const Color(0xFF059669),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 0.3.h),
                          Text(
                            CurrencyFormatter.format(order.finalPrice),
                            style: TextStyle(
                              fontSize: 17.sp,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF059669),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                SizedBox(height: 2.h),

                // Delivery Rider Management Section (Parity with Web Portal)
                Builder(
                  builder: (context) {
                    final isAssignedToRider = order.deliveryAgentId != null &&
                        order.deliveryAgentId!.isNotEmpty;
                    return Container(
                      padding: EdgeInsets.all(4.w),
                      decoration: BoxDecoration(
                        color: isAssignedToRider
                            ? const Color(0xFFEFF6FF)
                            : const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isAssignedToRider
                              ? const Color(0xFF93C5FD)
                              : const Color(0xFFE2E8F0),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    Icons.delivery_dining_rounded,
                                    size: 20,
                                    color: isAssignedToRider
                                        ? const Color(0xFF2563EB)
                                        : const Color(0xFF64748B),
                                  ),
                                  SizedBox(width: 2.w),
                                  Text(
                                    isAssignedToRider
                                        ? 'Managed by Store Rider'
                                        : 'Field Pickup Dispatch',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14.5.sp,
                                      color: isAssignedToRider
                                          ? const Color(0xFF1E40AF)
                                          : const Color(0xFF1E293B),
                                    ),
                                  ),
                                ],
                              ),
                              if (isAssignedToRider &&
                                  order.deliveryAgentPhone != null &&
                                  order.deliveryAgentPhone!.isNotEmpty)
                                InkWell(
                                  onTap: () => _makeCall(order.deliveryAgentPhone!),
                                  borderRadius: BorderRadius.circular(8),
                                  child: Container(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: 2.5.w,
                                      vertical: 0.5.h,
                                    ),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF2563EB).withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.phone_rounded,
                                            size: 14, color: Color(0xFF2563EB)),
                                        SizedBox(width: 1.w),
                                        Text(
                                          'Call Rider',
                                          style: TextStyle(
                                            color: const Color(0xFF2563EB),
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14.sp,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          SizedBox(height: 1.h),
                          if (isAssignedToRider) ...[
                            Text(
                              'Executive: ${order.deliveryAgentName ?? 'Assigned Rider'}',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15.sp,
                                color: const Color(0xFF1E3A8A),
                              ),
                            ),
                            SizedBox(height: 0.4.h),
                            Text(
                              'This order is managed by the field rider. Doorstep diagnostics and valuation are handled on-site.',
                              style: TextStyle(
                                color: const Color(0xFF3B82F6),
                                fontSize: 14.sp,
                              ),
                            ),
                            SizedBox(height: 1.2.h),
                            Row(
                              children: [
                                Expanded(
                                  child: OutlinedButton(
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: const Color(0xFF2563EB),
                                      side: const BorderSide(color: Color(0xFF2563EB)),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                    ),
                                    onPressed: () => _showAssignRiderSheet(context),
                                    child: Text(
                                      'Change Rider',
                                      style: TextStyle(
                                        fontSize: 14.sp,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                                SizedBox(width: 2.w),
                                Expanded(
                                  child: OutlinedButton(
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: const Color(0xFFD97706),
                                      side: const BorderSide(color: Color(0xFFD97706)),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                    ),
                                    onPressed: () => _recallOrderToStore(context),
                                    child: Text(
                                      'Recall to Store',
                                      style: TextStyle(
                                        fontSize: 14.sp,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ] else ...[
                            Text(
                              'Dispatch an onboarded store rider for doorstep inspection and device pickup.',
                              style: TextStyle(
                                color: const Color(0xFF64748B),
                                fontSize: 14.sp,
                              ),
                            ),
                            SizedBox(height: 1.h),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF0D9488),
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                padding: EdgeInsets.symmetric(
                                  horizontal: 3.w,
                                  vertical: 1.h,
                                ),
                              ),
                              onPressed: () => _showAssignRiderSheet(context),
                              icon: const Icon(Icons.delivery_dining_rounded, size: 18),
                              label: Text(
                                'Assign Delivery Rider',
                                style: TextStyle(
                                  fontSize: 14.sp,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    );
                  },
                ),

                if (order.status != 'completed') ...[
                  SizedBox(height: 2.5.h),
                  Text(
                    'Order Lifecycle Action',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14.sp,
                      color: const Color(0xFF64748B),
                    ),
                  ),
                  SizedBox(height: 1.2.h),
                  Row(
                    children: [
                      if (order.status == 'assigned')
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: EdgeInsets.symmetric(vertical: 1.4.h),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: () {
                              Navigator.pop(context);
                              if (onUpdateStatus != null) {
                                onUpdateStatus!('accepted');
                              }
                            },
                            child: Text(
                              'Accept Store Task',
                              style: TextStyle(
                                fontSize: 14.5.sp,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      if (order.status == 'accepted')
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFD97706),
                              foregroundColor: Colors.white,
                              padding: EdgeInsets.symmetric(vertical: 1.4.h),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: () {
                              Navigator.pop(context);
                              if (onUpdateStatus != null) {
                                onUpdateStatus!('inspection');
                              }
                            },
                            child: Text(
                              'Start QA Inspection',
                              style: TextStyle(
                                fontSize: 14.5.sp,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      if (order.status == 'inspection_completed' ||
                          order.status == 'final_price')
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF059669),
                              foregroundColor: Colors.white,
                              padding: EdgeInsets.symmetric(vertical: 1.4.h),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: () {
                              Navigator.pop(context);
                              if (onUpdateStatus != null) {
                                onUpdateStatus!('completed');
                              }
                            },
                            child: Text(
                              'Disburse & Complete',
                              style: TextStyle(
                                fontSize: 14.5.sp,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AssignRiderModal extends StatefulWidget {
  final PartnerOrder order;
  final VoidCallback onAssigned;

  const _AssignRiderModal({required this.order, required this.onAssigned});

  @override
  State<_AssignRiderModal> createState() => _AssignRiderModalState();
}

class _AssignRiderModalState extends State<_AssignRiderModal> {
  final RidersRepository _ridersRepo = RidersRepositoryImpl();
  List<DeliveryAgentModel> _riders = [];
  bool _loading = true;
  String? _selectedRiderId;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    final partnerId = SessionService.currentUser?.id ?? '';
    final list = partnerId.isNotEmpty
        ? await _ridersRepo.fetchRiders(partnerId: partnerId)
        : <DeliveryAgentModel>[];
    if (mounted) {
      setState(() {
        _riders = list;
        _loading = false;
        if (list.isNotEmpty) {
          _selectedRiderId = list.first.id;
        }
      });
    }
  }

  Future<void> _confirmAssignment() async {
    if (_selectedRiderId == null) return;
    final rider = _riders.firstWhere((r) => r.id == _selectedRiderId);
    setState(() => _submitting = true);

    final ok = await ApiService.updateOrder(
      orderId: widget.order.id,
      status: 'pickup_scheduled',
      deliveryAgentId: rider.id,
      deliveryAgentName: rider.name,
      deliveryAgentPhone: rider.phone,
    );

    if (mounted) {
      setState(() => _submitting = false);
      if (ok) {
        Navigator.pop(context);
        widget.onAssigned();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to assign rider. Please try again.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(5.w, 2.h, 5.w, 3.h),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFCBD5E1),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            SizedBox(height: 2.h),
            Text(
              'Select Store Delivery Rider',
              style: TextStyle(
                fontSize: 16.5.sp,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF0F172A),
              ),
            ),
            SizedBox(height: 0.5.h),
            Text(
              'Assign Order #${widget.order.orderNumber} for doorstep evaluation',
              style: TextStyle(
                fontSize: 14.sp,
                color: const Color(0xFF64748B),
              ),
            ),
            SizedBox(height: 2.h),
            if (_loading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(24.0),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_riders.isEmpty)
              Container(
                padding: EdgeInsets.all(4.w),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFFBEB),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFDE68A)),
                ),
                child: Column(
                  children: [
                    Text(
                      'No store riders registered yet.',
                      style: TextStyle(
                        fontSize: 14.5.sp,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF92400E),
                      ),
                    ),
                    SizedBox(height: 0.5.h),
                    Text(
                      'Please add your delivery executive in the Store Operations Hub -> "Delivery Fleet & Riders" tab first.',
                      style: TextStyle(fontSize: 14.sp, color: const Color(0xFFB45309)),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
            else
              ConstrainedBox(
                constraints: BoxConstraints(maxHeight: 35.h),
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: _riders.length,
                  separatorBuilder: (context, index) => SizedBox(height: 1.h),
                  itemBuilder: (ctx, i) {
                    final rider = _riders[i];
                    final isSel = rider.id == _selectedRiderId;
                    return Material(
                      color: isSel ? const Color(0xFFEFF6FF) : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      child: InkWell(
                        onTap: () => setState(() => _selectedRiderId = rider.id),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: EdgeInsets.all(3.w),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSel ? const Color(0xFF2563EB) : const Color(0xFFE2E8F0),
                              width: isSel ? 2 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                backgroundColor: isSel
                                    ? const Color(0xFF2563EB)
                                    : const Color(0xFFCBD5E1),
                                radius: 18,
                                child: const Icon(Icons.person, color: Colors.white, size: 20),
                              ),
                              SizedBox(width: 3.w),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      rider.name,
                                      style: TextStyle(
                                        fontSize: 15.sp,
                                        fontWeight: FontWeight.bold,
                                        color: const Color(0xFF0F172A),
                                      ),
                                    ),
                                    SizedBox(height: 0.2.h),
                                    Text(
                                      '${rider.phone} • ${rider.vehicle.toUpperCase()}',
                                      style: TextStyle(
                                        fontSize: 14.sp,
                                        color: const Color(0xFF64748B),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Icon(
                                isSel ? Icons.radio_button_checked : Icons.radio_button_off,
                                color: isSel ? const Color(0xFF2563EB) : const Color(0xFF94A3B8),
                                size: 22,
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            SizedBox(height: 2.h),
            if (_riders.isNotEmpty)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    padding: EdgeInsets.symmetric(vertical: 1.4.h),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: _submitting ? null : _confirmAssignment,
                  child: _submitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          'Confirm Dispatch',
                          style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
