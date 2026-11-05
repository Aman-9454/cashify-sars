import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../models/partner_models.dart';

class OrderRequestPopupDialog extends StatefulWidget {
  final PartnerOrder order;
  final Future<bool> Function() onAccept;
  final VoidCallback onDismiss;

  const OrderRequestPopupDialog({
    super.key,
    required this.order,
    required this.onAccept,
    required this.onDismiss,
  });

  static Future<void> show({
    required BuildContext context,
    required PartnerOrder order,
    required Future<bool> Function() onAccept,
    required VoidCallback onDismiss,
  }) {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => OrderRequestPopupDialog(
        order: order,
        onAccept: onAccept,
        onDismiss: onDismiss,
      ),
    );
  }

  @override
  State<OrderRequestPopupDialog> createState() => _OrderRequestPopupDialogState();
}

class _OrderRequestPopupDialogState extends State<OrderRequestPopupDialog>
    with SingleTickerProviderStateMixin {
  bool _isAccepting = false;
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _scaleAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOutBack,
    );
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _handleAccept() async {
    if (_isAccepting) return;
    setState(() => _isAccepting = true);
    final success = await widget.onAccept();
    if (mounted) {
      setState(() => _isAccepting = false);
      if (success) {
        Navigator.of(context, rootNavigator: true).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF059669),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                SizedBox(width: 2.5.w),
                Expanded(
                  child: Text(
                    'Order #${widget.order.orderNumber} Accepted Successfully!',
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
            content: Text(
              'Failed to accept order. Please try again.',
              style: TextStyle(fontSize: 14.sp, color: Colors.white),
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final order = widget.order;

    return PopScope(
      canPop: !_isAccepting,
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 3.h),
          child: Container(
            constraints: BoxConstraints(maxWidth: 90.w),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.25),
                  blurRadius: 28,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Top Header with Alert Gradient
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0xFF10B981).withValues(alpha: 0.5),
                          ),
                        ),
                        child: const Icon(
                          Icons.notifications_active_rounded,
                          color: Color(0xFF10B981),
                          size: 22,
                        ),
                      ),
                      SizedBox(width: 3.5.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.3.h),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '⚡ NEW ORDER ASSIGNED',
                                style: TextStyle(
                                  fontSize: 14.sp,
                                  fontWeight: FontWeight.w900,
                                  color: const Color(0xFF34D399),
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            SizedBox(height: 0.5.h),
                            Text(
                              'Order #${order.orderNumber}',
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        onPressed: _isAccepting
                            ? null
                            : () {
                                Navigator.of(context, rootNavigator: true).pop();
                                widget.onDismiss();
                              },
                        icon: const Icon(Icons.close_rounded, color: Colors.white70, size: 22),
                      ),
                    ],
                  ),
                ),

                // Body Content
                Padding(
                  padding: EdgeInsets.all(5.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Device Card
                      Container(
                        padding: EdgeInsets.all(3.5.w),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.camera_alt_rounded,
                                color: AppColors.primary,
                                size: 24,
                              ),
                            ),
                            SizedBox(width: 3.w),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    order.deviceName,
                                    style: TextStyle(
                                      fontSize: 16.sp,
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF0F172A),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  SizedBox(height: 0.3.h),
                                  Text(
                                    '${order.deviceBrand.isNotEmpty ? order.deviceBrand : "Camera"} • ${order.type.toUpperCase()}',
                                    style: TextStyle(
                                      fontSize: 14.sp,
                                      color: const Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 1.5.h),

                      // Valuation Offer
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.2.h),
                        decoration: BoxDecoration(
                          color: const Color(0xFFECFDF5),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFA7F3D0)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Offered Valuation:',
                              style: TextStyle(
                                fontSize: 14.sp,
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFF065F46),
                              ),
                            ),
                            Text(
                              CurrencyFormatter.format(order.offeredPrice),
                              style: TextStyle(
                                fontSize: 18.sp,
                                fontWeight: FontWeight.w900,
                                color: const Color(0xFF047857),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 1.5.h),

                      // Location & Slot Details
                      _buildDetailRow(
                        Icons.person_rounded,
                        'Customer',
                        order.customerName,
                      ),
                      SizedBox(height: 1.h),
                      _buildDetailRow(
                        Icons.location_on_rounded,
                        'Pickup Area',
                        '${order.city} (PIN: ${order.pinCode})',
                      ),
                      SizedBox(height: 1.h),
                      _buildDetailRow(
                        Icons.access_time_filled_rounded,
                        'Scheduled Slot',
                        '${order.pickupDate} • ${order.pickupSlot}',
                      ),
                      SizedBox(height: 2.5.h),

                      // Action Buttons
                      Row(
                        children: [
                          Expanded(
                            flex: 2,
                            child: OutlinedButton(
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF64748B),
                                side: const BorderSide(color: Color(0xFFCBD5E1)),
                                padding: EdgeInsets.symmetric(vertical: 1.4.h),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                              ),
                              onPressed: _isAccepting
                                  ? null
                                  : () {
                                      Navigator.of(context, rootNavigator: true).pop();
                                      widget.onDismiss();
                                    },
                              child: Text(
                                'Decline / Later',
                                style: TextStyle(
                                  fontSize: 14.5.sp,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                          SizedBox(width: 3.w),
                          Expanded(
                            flex: 3,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF059669),
                                foregroundColor: Colors.white,
                                elevation: 3,
                                shadowColor: const Color(0xFF059669).withValues(alpha: 0.4),
                                padding: EdgeInsets.symmetric(vertical: 1.4.h),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                              ),
                              onPressed: _isAccepting ? null : _handleAccept,
                              child: _isAccepting
                                  ? SizedBox(
                                      height: 20,
                                      width: 20,
                                      child: const CircularProgressIndicator(
                                        strokeWidth: 2.5,
                                        color: Colors.white,
                                      ),
                                    )
                                  : Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Icon(Icons.check_circle_rounded, size: 18),
                                        SizedBox(width: 1.5.w),
                                        Text(
                                          'Accept Order',
                                          style: TextStyle(
                                            fontSize: 15.sp,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: const Color(0xFF64748B)),
        SizedBox(width: 2.w),
        Text(
          '$label: ',
          style: TextStyle(
            fontSize: 14.sp,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF64748B),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF0F172A),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
