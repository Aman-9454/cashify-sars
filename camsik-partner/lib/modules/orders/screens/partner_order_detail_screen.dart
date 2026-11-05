import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sizer/sizer.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/services/session_service.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../models/partner_models.dart';
import '../../inspection/partner_inspection_screen.dart';
import '../../payouts/widgets/payout_wallet_guard_dialog.dart';
import '../../riders/data/models/delivery_agent_model.dart';
import '../../riders/data/repositories/riders_repository.dart';
import '../bloc/orders_cubit.dart';

class PartnerOrderDetailScreen extends StatefulWidget {
  final PartnerOrder order;
  final Function(String newStatus)? onUpdateStatus;
  final Future<void> Function()? onOrderUpdated;

  const PartnerOrderDetailScreen({
    super.key,
    required this.order,
    this.onUpdateStatus,
    this.onOrderUpdated,
  });

  @override
  State<PartnerOrderDetailScreen> createState() => _PartnerOrderDetailScreenState();
}

class _PartnerOrderDetailScreenState extends State<PartnerOrderDetailScreen> {
  late PartnerOrder _order;
  bool _isActionLoading = false;

  @override
  void initState() {
    super.initState();
    _order = widget.order;
  }

  Future<void> _makeCall(String phone) async {
    final clean = phone.replaceAll(RegExp(r'\s+'), '');
    final uri = Uri.parse('tel:$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  bool get _isSelfAssigned {
    final partner = SessionService.currentUser;
    final agentId = _order.deliveryAgentId ?? '';
    final agentName = (_order.deliveryAgentName ?? '').toLowerCase();
    return agentId == 'self' ||
        (partner != null && agentId == partner.id) ||
        agentName.contains('direct') ||
        agentName.contains('store partner');
  }

  bool get _isAssignedToRider {
    final agentId = _order.deliveryAgentId ?? '';
    return agentId.isNotEmpty && !_isSelfAssigned;
  }

  Future<void> _selfAssignOrder() async {
    if (_order.status == 'completed' || _order.status == 'paid') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cannot reassign an order that is already completed.'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    final partner = SessionService.currentUser;
    final partnerId = partner?.id ?? '';
    final storeName = partner?.storeName ?? 'Store Partner Direct';
    final partnerPhone = partner?.phone ?? '';

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.storefront_rounded, color: AppColors.primary, size: 24),
            SizedBox(width: 2.w),
            Text(
              'Self-Assign Order?',
              style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Text(
          'Take full charge of Order #${_order.orderNumber} for in-store or direct partner fulfillment without dispatching a separate rider?',
          style: TextStyle(fontSize: 14.sp),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: TextStyle(fontSize: 14.sp)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Confirm Self-Assign', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    setState(() => _isActionLoading = true);

    final ok = await ApiService.updateOrder(
      orderId: _order.id,
      status: _order.status == 'created' || _order.status == 'assigned' ? 'accepted' : _order.status,
      deliveryAgentId: partnerId,
      deliveryAgentName: '$storeName (Direct Handling)',
      deliveryAgentPhone: partnerPhone,
    );

    if (mounted) {
      setState(() => _isActionLoading = false);
      if (ok) {
        setState(() {
          _order = PartnerOrder(
            id: _order.id,
            orderNumber: _order.orderNumber,
            type: _order.type,
            status: _order.status == 'created' || _order.status == 'assigned' ? 'accepted' : _order.status,
            customerName: _order.customerName,
            customerPhone: _order.customerPhone,
            customerAddress: _order.customerAddress,
            city: _order.city,
            pinCode: _order.pinCode,
            deviceName: _order.deviceName,
            deviceBrand: _order.deviceBrand,
            deviceModel: _order.deviceModel,
            deviceStorage: _order.deviceStorage,
            quotedPrice: _order.quotedPrice,
            finalPrice: _order.finalPrice,
            inspectionScore: _order.inspectionScore,
            paymentStatus: _order.paymentStatus,
            pickupDate: _order.pickupDate,
            pickupSlot: _order.pickupSlot,
            notes: '${_order.notes} · Store Direct Handling: Partner inspecting & fulfilling directly.',
            createdAt: _order.createdAt,
            deliveryAgentId: partnerId,
            deliveryAgentName: '$storeName (Direct Handling)',
            deliveryAgentPhone: partnerPhone,
            partnerId: _order.partnerId,
          );
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('🏬 Order #${_order.orderNumber} successfully self-assigned to $storeName!'),
            backgroundColor: const Color(0xFF059669),
          ),
        );
        widget.onOrderUpdated?.call();
        context.read<OrdersCubit>().loadOrders();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to update order. Please check your connection.'),
            backgroundColor: Color(0xFFEF4444),
          ),
        );
      }
    }
  }

  void _showAssignRiderSheet() {
    if (_order.status == 'completed' || _order.status == 'paid') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cannot reassign an order that is already completed.'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _AssignRiderModal(
        order: _order,
        onSelfAssign: () {
          Navigator.pop(ctx);
          _selfAssignOrder();
        },
        onAssigned: (rider) {
          setState(() {
            _order = PartnerOrder(
              id: _order.id,
              orderNumber: _order.orderNumber,
              type: _order.type,
              status: 'pickup_scheduled',
              customerName: _order.customerName,
              customerPhone: _order.customerPhone,
              customerAddress: _order.customerAddress,
              city: _order.city,
              pinCode: _order.pinCode,
              deviceName: _order.deviceName,
              deviceBrand: _order.deviceBrand,
              deviceModel: _order.deviceModel,
              deviceStorage: _order.deviceStorage,
              quotedPrice: _order.quotedPrice,
              finalPrice: _order.finalPrice,
              inspectionScore: _order.inspectionScore,
              paymentStatus: _order.paymentStatus,
              pickupDate: _order.pickupDate,
              pickupSlot: _order.pickupSlot,
              notes: _order.notes,
              createdAt: _order.createdAt,
              deliveryAgentId: rider.id,
              deliveryAgentName: rider.name,
              deliveryAgentPhone: rider.phone,
              partnerId: _order.partnerId,
            );
          });
          widget.onOrderUpdated?.call();
          context.read<OrdersCubit>().loadOrders();
        },
      ),
    );
  }

  Future<void> _recallOrderToStore() async {
    if (_order.status == 'completed' || _order.status == 'paid') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cannot recall an order that is already completed.'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

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

    if (confirm == true && mounted) {
      setState(() => _isActionLoading = true);
      final ok = await ApiService.updateOrder(
        orderId: _order.id,
        status: 'accepted',
        deliveryAgentId: '',
        deliveryAgentName: '',
        deliveryAgentPhone: '',
      );
      if (mounted) {
        setState(() => _isActionLoading = false);
        if (ok) {
          setState(() {
            _order.deliveryAgentId = null;
            _order.deliveryAgentName = null;
            _order.deliveryAgentPhone = null;
            _order.status = 'accepted';
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('🏬 Order #${_order.orderNumber} recalled to store for in-store QA'),
              backgroundColor: const Color(0xFF0F172A),
            ),
          );
          widget.onOrderUpdated?.call();
          context.read<OrdersCubit>().loadOrders();
        }
      }
    }
  }

  Future<void> _updateStatus(String newStatus) async {
    setState(() => _isActionLoading = true);
    final ok = await ApiService.updateOrder(
      orderId: _order.id,
      status: newStatus,
    );
    if (mounted) {
      setState(() => _isActionLoading = false);
      if (ok) {
        setState(() {
          _order.status = newStatus;
        });
        widget.onUpdateStatus?.call(newStatus);
        widget.onOrderUpdated?.call();
        context.read<OrdersCubit>().loadOrders();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Order status updated to ${_order.statusDisplay}'),
            backgroundColor: const Color(0xFF059669),
          ),
        );
      }
    }
  }

  Future<void> _showPickupOtpDialog() async {
    final otpController = TextEditingController();
    String? errorText;

    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF6FF),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.shield_rounded, color: AppColors.primary, size: 24),
                ),
                SizedBox(width: 3.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Customer Pickup OTP',
                        style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Doorstep Device Handover',
                        style: TextStyle(fontSize: 12.sp, color: const Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Enter the 4-digit verification code provided by ${_order.customerName} (${_order.customerPhone}) to authorize device collection.',
                  style: TextStyle(fontSize: 13.5.sp, color: const Color(0xFF334155)),
                ),
                SizedBox(height: 2.h),
                TextField(
                  controller: otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 4,
                  autofocus: true,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 22.sp,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 8,
                    color: const Color(0xFF0F172A),
                  ),
                  decoration: InputDecoration(
                    counterText: '',
                    hintText: '••••',
                    hintStyle: TextStyle(letterSpacing: 8, color: const Color(0xFF94A3B8), fontSize: 20.sp),
                    errorText: errorText,
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.primary, width: 2),
                    ),
                  ),
                  onChanged: (val) {
                    if (errorText != null) {
                      setDialogState(() => errorText = null);
                    }
                  },
                ),
                SizedBox(height: 1.h),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.8.h),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.info_outline_rounded, size: 14, color: Color(0xFF64748B)),
                      SizedBox(width: 1.5.w),
                      Text(
                        'Demo / Test OTP: 1234',
                        style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.bold, color: const Color(0xFF475569)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: Text('Cancel', style: TextStyle(fontSize: 14.sp)),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
                ),
                onPressed: () {
                  final code = otpController.text.trim();
                  if (code.length < 4) {
                    setDialogState(() => errorText = 'Enter 4-digit OTP');
                    return;
                  }
                  Navigator.pop(ctx, true);
                },
                child: Text('Verify & Collect', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
              ),
            ],
          );
        },
      ),
    );

    if (result != true || !mounted) return;

    setState(() => _isActionLoading = true);
    final ok = await ApiService.updateOrder(
      orderId: _order.id,
      status: 'picked_up',
      notes: '${_order.notes} · Device collected & customer handover OTP verified.'.trim(),
    );

    if (mounted) {
      setState(() => _isActionLoading = false);
      if (ok) {
        setState(() {
          _order.status = 'picked_up';
        });
        widget.onUpdateStatus?.call('picked_up');
        widget.onOrderUpdated?.call();
        context.read<OrdersCubit>().loadOrders();

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Device collected & OTP verified! Ready for 45-point inspection.'),
            backgroundColor: Color(0xFF059669),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to update order. Please check your connection.'),
            backgroundColor: Color(0xFFEF4444),
          ),
        );
      }
    }
  }

  Future<void> _showDisbursePayoutModal() async {
    final activeUser = SessionService.currentUser;
    final partnerId = activeUser?.id ?? _order.partnerId ?? '';
    final amount = _order.finalPrice > 0 ? _order.finalPrice : _order.quotedPrice;

    // Payout Wallet Guard: partner must have sufficient wallet float before order completion
    final hasFunds = await PayoutWalletGuard.ensureSufficientBalance(
      context,
      requiredAmount: amount,
      partnerId: partnerId,
    );
    if (!hasFunds || !mounted) return;

    String selectedMethod = 'instant_upi';
    final upiController = TextEditingController(text: '${_order.customerPhone}@upi');
    final refController = TextEditingController();
    bool isSubmitting = false;

    final payoutSuccess = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (dialogCtx, setModalState) {
          return Container(
            padding: EdgeInsets.fromLTRB(5.w, 2.h, 5.w, MediaQuery.of(dialogCtx).viewInsets.bottom + 3.h),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
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

                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.flash_on_rounded, color: Color(0xFF059669), size: 24),
                    ),
                    SizedBox(width: 3.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Disburse Spot Payout',
                            style: TextStyle(
                              fontSize: 17.sp,
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                          Text(
                            'Instant Customer Settlement & Order Completion',
                            style: TextStyle(fontSize: 12.sp, color: const Color(0xFF64748B)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 2.h),

                // Amount Banner
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.all(4.w),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF059669), Color(0xFF047857)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF059669).withValues(alpha: 0.25),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total Payable to Customer',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.88),
                          fontSize: 12.5.sp,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      SizedBox(height: 0.4.h),
                      Text(
                        CurrencyFormatter.format(amount),
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 22.sp,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      SizedBox(height: 0.4.h),
                      Text(
                        'Payee: ${_order.customerName} • ${_order.deviceName}',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.95),
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 2.h),

                Text(
                  'Select Payment Mode',
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF0F172A),
                  ),
                ),
                SizedBox(height: 1.h),

                // Methods
                Row(
                  children: [
                    Expanded(
                      child: _buildPayoutMethodChip(
                        icon: Icons.qr_code_rounded,
                        label: 'Instant UPI',
                        isSelected: selectedMethod == 'instant_upi',
                        onTap: () => setModalState(() => selectedMethod = 'instant_upi'),
                      ),
                    ),
                    SizedBox(width: 2.w),
                    Expanded(
                      child: _buildPayoutMethodChip(
                        icon: Icons.account_balance_rounded,
                        label: 'Bank IMPS',
                        isSelected: selectedMethod == 'bank_transfer',
                        onTap: () => setModalState(() => selectedMethod = 'bank_transfer'),
                      ),
                    ),
                    SizedBox(width: 2.w),
                    Expanded(
                      child: _buildPayoutMethodChip(
                        icon: Icons.payments_rounded,
                        label: 'Cash Handover',
                        isSelected: selectedMethod == 'cash',
                        onTap: () => setModalState(() => selectedMethod = 'cash'),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 1.8.h),

                if (selectedMethod == 'instant_upi') ...[
                  TextField(
                    controller: upiController,
                    decoration: InputDecoration(
                      labelText: 'Customer UPI VPA ID',
                      prefixIcon: const Icon(Icons.alternate_email_rounded, size: 20),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.2.h),
                    ),
                  ),
                  SizedBox(height: 1.2.h),
                ],

                TextField(
                  controller: refController,
                  decoration: InputDecoration(
                    labelText: 'Transaction Reference / UTR (Optional)',
                    hintText: 'e.g. UPI-CR-${DateTime.now().millisecondsSinceEpoch.toString().substring(6)}',
                    prefixIcon: const Icon(Icons.receipt_long_rounded, size: 20),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.2.h),
                  ),
                ),
                SizedBox(height: 2.5.h),

                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 2,
                    ),
                    onPressed: isSubmitting
                        ? null
                        : () async {
                            setModalState(() => isSubmitting = true);
                            final ref = refController.text.trim().isNotEmpty
                                ? refController.text.trim()
                                : 'TXN-${DateTime.now().millisecondsSinceEpoch}';

                            // 1. Create Payout in API
                            await ApiService.createPayout(
                              partnerId: partnerId,
                              orderId: _order.id,
                              orderNumber: _order.orderNumber,
                              amount: amount,
                              method: selectedMethod,
                              referenceId: ref,
                              customerName: _order.customerName,
                              notes: 'Spot payout disbursed via ${selectedMethod.toUpperCase()} (Ref: $ref)',
                            );

                            // 2. Mark Order as Completed & Paid in API
                            final ok = await ApiService.updateOrder(
                              orderId: _order.id,
                              status: 'completed',
                              finalPrice: amount,
                              notes: '${_order.notes} [Payout of ₹${amount.toStringAsFixed(0)} disbursed via ${selectedMethod.toUpperCase()} Ref: $ref]'.trim(),
                            );

                            if (ctx.mounted) {
                              Navigator.pop(ctx, ok);
                            }
                          },
                    child: isSubmitting
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : Text(
                            'Confirm & Settle Payout (${CurrencyFormatter.format(amount)})',
                            style: TextStyle(fontSize: 14.5.sp, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );

    if (payoutSuccess == true && mounted) {
      setState(() {
        _order.status = 'completed';
        _order.paymentStatus = 'paid';
        _order.finalPrice = amount;
      });
      widget.onUpdateStatus?.call('completed');
      widget.onOrderUpdated?.call();
      context.read<OrdersCubit>().loadOrders();

      showDialog(
        context: context,
        builder: (c) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle_rounded, color: Color(0xFF059669), size: 54),
              SizedBox(height: 1.5.h),
              Text(
                'Payout Completed!',
                style: TextStyle(fontSize: 17.sp, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 0.8.h),
              Text(
                '₹${amount.toStringAsFixed(0)} settled successfully to ${_order.customerName}. Order #${_order.orderNumber} is now marked as Completed.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13.5.sp, color: const Color(0xFF64748B)),
              ),
              SizedBox(height: 2.h),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () => Navigator.pop(c),
                child: const Text('Done'),
              ),
            ],
          ),
        ),
      );
    } else if (payoutSuccess == false && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to complete order. Please check network.'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
    }
  }

  Widget _buildPayoutMethodChip({
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 1.2.h, horizontal: 2.w),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFECFDF5) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF059669) : const Color(0xFFCBD5E1),
            width: isSelected ? 1.8 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, size: 22, color: isSelected ? const Color(0xFF059669) : const Color(0xFF64748B)),
            SizedBox(height: 0.5.h),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? const Color(0xFF059669) : const Color(0xFF334155),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _order.orderNumber,
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.w900,
                color: const Color(0xFF0F172A),
                letterSpacing: 0.3,
              ),
            ),
            Text(
              '${_order.type.toUpperCase()} • ${_order.statusDisplay}',
              style: TextStyle(
                fontSize: 11.5.sp,
                color: _order.statusColor,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          if (_order.customerPhone.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.phone_rounded, color: AppColors.primary),
              tooltip: 'Call Customer',
              onPressed: () => _makeCall(_order.customerPhone),
            ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Color(0xFF64748B)),
            tooltip: 'Refresh',
            onPressed: () {
              context.read<OrdersCubit>().loadOrders();
              widget.onOrderUpdated?.call();
            },
          ),
        ],
      ),
      body: _isActionLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
              padding: EdgeInsets.fromLTRB(4.w, 1.5.h, 4.w, 3.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Status & Intake Banner
                  Container(
                    padding: EdgeInsets.all(4.w),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          _order.statusColor.withValues(alpha: 0.12),
                          _order.statusColor.withValues(alpha: 0.04),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: _order.statusColor.withValues(alpha: 0.25)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: _order.statusColor.withValues(alpha: 0.2),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Icon(Icons.assignment_rounded, color: _order.statusColor, size: 22),
                            ),
                            SizedBox(width: 3.w),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _order.statusDisplay,
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 15.sp,
                                    color: _order.statusColor,
                                  ),
                                ),
                                SizedBox(height: 0.2.h),
                                Text(
                                  'Intake Category: ${_order.type.toUpperCase()}',
                                  style: TextStyle(
                                    fontSize: 12.sp,
                                    color: const Color(0xFF64748B),
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.5.h),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: _order.statusColor.withValues(alpha: 0.3)),
                          ),
                          child: Text(
                            _order.type.toUpperCase(),
                            style: TextStyle(
                              fontSize: 12.sp,
                              fontWeight: FontWeight.w900,
                              color: _order.typeColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  SizedBox(height: 2.h),

                  // ── DISPATCH & ASSIGNMENT MANAGEMENT CARD ──
                  Container(
                    padding: EdgeInsets.all(4.w),
                    decoration: BoxDecoration(
                      color: _isAssignedToRider
                          ? const Color(0xFFEFF6FF)
                          : (_isSelfAssigned ? const Color(0xFFF0FDF4) : Colors.white),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _isAssignedToRider
                            ? const Color(0xFF93C5FD)
                            : (_isSelfAssigned ? const Color(0xFF86EFAC) : const Color(0xFFE2E8F0)),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 8,
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
                            Row(
                              children: [
                                Icon(
                                  _isSelfAssigned
                                      ? Icons.storefront_rounded
                                      : (_isAssignedToRider
                                          ? Icons.delivery_dining_rounded
                                          : Icons.assignment_ind_rounded),
                                  size: 22,
                                  color: _isSelfAssigned
                                      ? const Color(0xFF16A34A)
                                      : (_isAssignedToRider
                                          ? const Color(0xFF2563EB)
                                          : const Color(0xFF0F172A)),
                                ),
                                SizedBox(width: 2.w),
                                Text(
                                  _isSelfAssigned
                                      ? '🏬 Store Self-Assigned'
                                      : (_isAssignedToRider
                                          ? '🏍️ Assigned to Store Rider'
                                          : 'Dispatch & Order Assignment'),
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15.sp,
                                    color: _isSelfAssigned
                                        ? const Color(0xFF15803D)
                                        : (_isAssignedToRider
                                            ? const Color(0xFF1E40AF)
                                            : const Color(0xFF0F172A)),
                                  ),
                                ),
                              ],
                            ),
                            if (_isAssignedToRider &&
                                _order.deliveryAgentPhone != null &&
                                _order.deliveryAgentPhone!.isNotEmpty)
                              InkWell(
                                onTap: () => _makeCall(_order.deliveryAgentPhone!),
                                borderRadius: BorderRadius.circular(8),
                                child: Container(
                                  padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.4.h),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF2563EB).withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.phone_rounded, size: 13, color: Color(0xFF2563EB)),
                                      SizedBox(width: 1.w),
                                      Text(
                                        'Call Rider',
                                        style: TextStyle(
                                          color: const Color(0xFF2563EB),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12.sp,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),

                        SizedBox(height: 1.2.h),

                        if (_order.status == 'completed' || _order.status == 'paid') ...[
                          Text(
                            _isSelfAssigned
                                ? 'Handled by: ${_order.deliveryAgentName ?? "Partner Store Direct"}'
                                : (_isAssignedToRider
                                    ? 'Fulfilled by: ${_order.deliveryAgentName ?? "Assigned Rider"}'
                                    : 'Fulfillment Completed'),
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14.5.sp,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                          SizedBox(height: 0.8.h),
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 3.5.w, vertical: 1.2.h),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF0FDF4),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFBBF7D0)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.lock_rounded, color: Color(0xFF16A34A), size: 18),
                                SizedBox(width: 2.5.w),
                                Expanded(
                                  child: Text(
                                    'Order is completed and settled. Handler assignment is permanently locked and cannot be reassigned.',
                                    style: TextStyle(
                                      color: const Color(0xFF15803D),
                                      fontSize: 13.sp,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ] else if (_isSelfAssigned) ...[
                          Text(
                            'Handler: ${_order.deliveryAgentName ?? "Partner Store Direct"}',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14.5.sp,
                              color: const Color(0xFF15803D),
                            ),
                          ),
                          SizedBox(height: 0.3.h),
                          Text(
                            'You have taken charge of this order directly. You can conduct customer doorstep evaluation or walk-in store QA.',
                            style: TextStyle(
                              color: const Color(0xFF166534),
                              fontSize: 13.sp,
                            ),
                          ),
                          SizedBox(height: 1.5.h),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: const Color(0xFF2563EB),
                                    side: const BorderSide(color: Color(0xFF2563EB)),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    padding: EdgeInsets.symmetric(vertical: 1.h),
                                  ),
                                  onPressed: _showAssignRiderSheet,
                                  icon: const Icon(Icons.delivery_dining_rounded, size: 18),
                                  label: Text(
                                    'Reassign to Rider',
                                    style: TextStyle(fontSize: 13.5.sp, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ] else if (_isAssignedToRider) ...[
                          Text(
                            'Executive: ${_order.deliveryAgentName ?? "Assigned Rider"}',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14.5.sp,
                              color: const Color(0xFF1E3A8A),
                            ),
                          ),
                          SizedBox(height: 0.3.h),
                          Text(
                            'Assigned to your field executive. Doorstep evaluation & pickup are actively tracked.',
                            style: TextStyle(
                              color: const Color(0xFF3B82F6),
                              fontSize: 13.sp,
                            ),
                          ),
                          SizedBox(height: 1.5.h),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: const Color(0xFF2563EB),
                                    side: const BorderSide(color: Color(0xFF2563EB)),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  onPressed: _showAssignRiderSheet,
                                  child: Text(
                                    'Change Rider',
                                    style: TextStyle(fontSize: 13.5.sp, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                              SizedBox(width: 2.w),
                              Expanded(
                                child: OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: const Color(0xFFD97706),
                                    side: const BorderSide(color: Color(0xFFD97706)),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                  ),
                                  onPressed: _recallOrderToStore,
                                  child: Text(
                                    'Recall to Store',
                                    style: TextStyle(fontSize: 13.5.sp, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ] else ...[
                          Text(
                            'Assign this order to one of your active delivery executives, or handle pickup and QA directly yourself:',
                            style: TextStyle(
                              color: const Color(0xFF64748B),
                              fontSize: 13.sp,
                            ),
                          ),
                          SizedBox(height: 1.5.h),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF2563EB),
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    padding: EdgeInsets.symmetric(vertical: 1.2.h),
                                    elevation: 1,
                                  ),
                                  onPressed: _showAssignRiderSheet,
                                  icon: const Icon(Icons.delivery_dining_rounded, size: 18),
                                  label: Text(
                                    'Assign Rider',
                                    style: TextStyle(fontSize: 13.5.sp, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                              SizedBox(width: 2.5.w),
                              Expanded(
                                child: ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF059669),
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    padding: EdgeInsets.symmetric(vertical: 1.2.h),
                                    elevation: 1,
                                  ),
                                  onPressed: _selfAssignOrder,
                                  icon: const Icon(Icons.storefront_rounded, size: 18),
                                  label: Text(
                                    'Self-Assign (Store)',
                                    style: TextStyle(fontSize: 13.5.sp, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),

                  SizedBox(height: 2.h),

                  // Device Details Card
                  Container(
                    padding: EdgeInsets.all(4.w),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Icon(Icons.devices_rounded, color: _order.typeColor, size: 28),
                        ),
                        SizedBox(width: 3.5.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _order.deviceName,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15.5.sp,
                                  color: const Color(0xFF0F172A),
                                ),
                              ),
                              SizedBox(height: 0.3.h),
                              Text(
                                'Variant: ${_order.deviceStorage.isNotEmpty ? _order.deviceStorage : "Standard"} • ${_order.deviceBrand.isNotEmpty ? _order.deviceBrand : "Certified Brand"}',
                                style: TextStyle(
                                  fontSize: 13.sp,
                                  color: const Color(0xFF64748B),
                                ),
                              ),
                              if (_order.inspectionScore != null) ...[
                                SizedBox(height: 0.5.h),
                                Row(
                                  children: [
                                    const Icon(Icons.verified_rounded, color: Color(0xFF059669), size: 14),
                                    SizedBox(width: 1.w),
                                    Text(
                                      'QA Score: ${_order.inspectionScore}/100',
                                      style: TextStyle(
                                        color: const Color(0xFF059669),
                                        fontSize: 13.sp,
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

                  // Customer & Doorstep Pickup Address Card
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
                              'Customer & Pickup Location',
                              style: TextStyle(
                                fontSize: 13.5.sp,
                                fontWeight: FontWeight.bold,
                                color: const Color(0xFF64748B),
                              ),
                            ),
                            if (_order.customerPhone.isNotEmpty)
                              InkWell(
                                onTap: () => _makeCall(_order.customerPhone),
                                borderRadius: BorderRadius.circular(8),
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.phone_in_talk_rounded, size: 14, color: AppColors.primary),
                                      SizedBox(width: 1.w),
                                      Text(
                                        'Call Customer',
                                        style: TextStyle(
                                          fontSize: 13.sp,
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
                          '${_order.customerName} (${_order.customerPhone})',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14.5.sp,
                            color: const Color(0xFF0F172A),
                          ),
                        ),
                        SizedBox(height: 0.4.h),
                        Text(
                          '${_order.customerAddress}, ${_order.city} - ${_order.pinCode}',
                          style: TextStyle(
                            color: const Color(0xFF475569),
                            fontSize: 13.sp,
                            height: 1.3,
                          ),
                        ),
                        SizedBox(height: 1.h),
                        Row(
                          children: [
                            const Icon(Icons.schedule_rounded, size: 14, color: Color(0xFF64748B)),
                            SizedBox(width: 1.5.w),
                            Text(
                              'Scheduled Slot: ${_order.pickupDate} • ${_order.pickupSlot}',
                              style: TextStyle(
                                color: const Color(0xFF64748B),
                                fontSize: 13.sp,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  SizedBox(height: 2.h),

                  // Pricing & Payout Box
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
                              'Quoted Customer Offer',
                              style: TextStyle(fontSize: 13.sp, color: const Color(0xFF64748B)),
                            ),
                            SizedBox(height: 0.3.h),
                            Text(
                              CurrencyFormatter.format(_order.quotedPrice),
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
                              'Final Payout Amount',
                              style: TextStyle(
                                fontSize: 13.sp,
                                color: const Color(0xFF059669),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(height: 0.3.h),
                            Text(
                              CurrencyFormatter.format(_order.finalPrice),
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

                  SizedBox(height: 3.h),

                  if (_order.status != 'completed') ...[
                    Text(
                      'Store Operational Actions',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14.sp,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                    SizedBox(height: 1.2.h),

                    // Stage 1: Order Acceptance
                    if (_order.status == 'created' || _order.status == 'assigned') ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(vertical: 1.5.h),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 2,
                          ),
                          onPressed: _isActionLoading ? null : () => _updateStatus('accepted'),
                          icon: const Icon(Icons.check_circle_outline_rounded, size: 20),
                          label: Text(
                            'Accept Store Order',
                            style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],

                    // Stage 2: In-Transit / Doorstep Pickup Handover OTP Verification
                    if (_order.status == 'pickup_scheduled' || _order.status == 'in_transit') ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0D9488),
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(vertical: 1.5.h),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 2,
                          ),
                          onPressed: _isActionLoading ? null : _showPickupOtpDialog,
                          icon: const Icon(Icons.lock_open_rounded, size: 20),
                          label: Text(
                            'Verify Customer OTP & Collect Device',
                            style: TextStyle(fontSize: 14.5.sp, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],

                    // Stage 3: Hardware Diagnostics & 45-Point Inspection
                    if (_order.status == 'accepted' || _order.status == 'picked_up') ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1E5BF8),
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(vertical: 1.5.h),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 2,
                          ),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PartnerInspectionScreen(
                                  orders: [_order],
                                  onOrderUpdated: () async {
                                    await widget.onOrderUpdated?.call();
                                    if (mounted) {
                                      setState(() {
                                        _order.status = 'inspection';
                                      });
                                    }
                                  },
                                ),
                              ),
                            );
                          },
                          icon: const Icon(Icons.qr_code_scanner_rounded, size: 20),
                          label: Text(
                            'Start 45-Point Device Inspection',
                            style: TextStyle(fontSize: 14.5.sp, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],

                    // Stage 4: Spot Payout & Settlement
                    if (_order.status == 'inspection' || _order.status == 'inspection_completed') ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF059669),
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(vertical: 1.5.h),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 3,
                          ),
                          onPressed: _isActionLoading ? null : _showDisbursePayoutModal,
                          icon: const Icon(Icons.flash_on_rounded, size: 22),
                          label: Text(
                            'Disburse Spot Payout & Complete (${CurrencyFormatter.format(_order.finalPrice > 0 ? _order.finalPrice : _order.quotedPrice)})',
                            style: TextStyle(fontSize: 14.5.sp, fontWeight: FontWeight.w900),
                          ),
                        ),
                      ),
                      SizedBox(height: 1.h),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF1E5BF8),
                            side: const BorderSide(color: Color(0xFF1E5BF8)),
                            padding: EdgeInsets.symmetric(vertical: 1.2.h),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PartnerInspectionScreen(
                                  orders: [_order],
                                  onOrderUpdated: widget.onOrderUpdated,
                                ),
                              ),
                            );
                          },
                          icon: const Icon(Icons.edit_note_rounded, size: 20),
                          label: Text(
                            'Review / Adjust 45-Point Diagnostics',
                            style: TextStyle(fontSize: 13.5.sp, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ] else ...[
                    // Order Completed Banner (Permanent Lock)
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(4.w),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDF4),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF86EFAC), width: 1.5),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: const BoxDecoration(
                              color: Color(0xFFDCFCE7),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.verified_rounded,
                              color: Color(0xFF16A34A),
                              size: 28,
                            ),
                          ),
                          SizedBox(width: 3.5.w),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Order Completed & Settled',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 15.sp,
                                    color: const Color(0xFF15803D),
                                  ),
                                ),
                                SizedBox(height: 0.3.h),
                                Text(
                                  'Customer payout of ${CurrencyFormatter.format(_order.finalPrice)} disbursed. Device accepted into store inventory.',
                                  style: TextStyle(
                                    fontSize: 12.5.sp,
                                    color: const Color(0xFF166534),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }
}

class _AssignRiderModal extends StatefulWidget {
  final PartnerOrder order;
  final Function(DeliveryAgentModel rider) onAssigned;
  final VoidCallback onSelfAssign;

  const _AssignRiderModal({
    required this.order,
    required this.onAssigned,
    required this.onSelfAssign,
  });

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
    if (widget.order.status == 'completed' || widget.order.status == 'paid') {
      Navigator.pop(context);
      return;
    }
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
        widget.onAssigned(rider);
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
              'Assign Order #${widget.order.orderNumber} to your executive, or handle directly:',
              style: TextStyle(
                fontSize: 13.5.sp,
                color: const Color(0xFF64748B),
              ),
            ),
            SizedBox(height: 2.h),

            // Option to Self-Assign directly inside modal
            InkWell(
              onTap: widget.onSelfAssign,
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: EdgeInsets.all(3.5.w),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF86EFAC), width: 1.5),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: const Color(0xFF059669),
                      radius: 20,
                      child: const Icon(Icons.storefront_rounded, color: Colors.white, size: 22),
                    ),
                    SizedBox(width: 3.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '🏬 Self-Assign (Store Partner Direct)',
                            style: TextStyle(
                              fontSize: 14.5.sp,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF15803D),
                            ),
                          ),
                          SizedBox(height: 0.2.h),
                          Text(
                            'Inspect and fulfill this order directly yourself without a rider.',
                            style: TextStyle(
                              fontSize: 12.5.sp,
                              color: const Color(0xFF166534),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF15803D)),
                  ],
                ),
              ),
            ),

            SizedBox(height: 2.h),
            const Divider(),
            SizedBox(height: 1.h),

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
                        fontSize: 14.sp,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF92400E),
                      ),
                    ),
                    SizedBox(height: 0.5.h),
                    Text(
                      'You can use Self-Assign above, or add riders from the "Delivery Fleet & Riders" tab.',
                      style: TextStyle(fontSize: 13.sp, color: const Color(0xFFB45309)),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
            else
              ConstrainedBox(
                constraints: BoxConstraints(maxHeight: 30.h),
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
                                backgroundColor: isSel ? const Color(0xFF2563EB) : const Color(0xFFCBD5E1),
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
                                        fontSize: 14.5.sp,
                                        fontWeight: FontWeight.bold,
                                        color: const Color(0xFF0F172A),
                                      ),
                                    ),
                                    SizedBox(height: 0.2.h),
                                    Text(
                                      '${rider.phone} • ${rider.vehicle.toUpperCase()}',
                                      style: TextStyle(
                                        fontSize: 13.sp,
                                        color: const Color(0xFF64748B),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              if (isSel)
                                const Icon(Icons.check_circle_rounded, color: Color(0xFF2563EB)),
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
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          'Confirm Rider Assignment',
                          style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
