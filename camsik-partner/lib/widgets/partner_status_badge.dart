import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../core/constants/app_colors.dart';

class PartnerStatusBadge extends StatelessWidget {
  final String status;

  const PartnerStatusBadge({super.key, required this.status});

  Color _getStatusColor() {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'inspection_completed':
        return const Color(0xFF10B981);
      case 'assigned':
      case 'accepted':
      case 'pickup_scheduled':
        return AppColors.primary;
      case 'inspection':
      case 'picked_up':
      case 'in_transit':
      case 'final_price':
        return const Color(0xFFD97706);
      case 'cancelled':
      case 'rejected':
        return const Color(0xFFEF4444);
      default:
        return const Color(0xFF64748B);
    }
  }

  String _formatStatus() {
    return status.replaceAll('_', ' ').toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final color = _getStatusColor();
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.5.h),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Text(
        _formatStatus(),
        style: TextStyle(
          color: color,
          fontSize: 14.sp,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.4,
        ),
      ),
    );
  }
}
