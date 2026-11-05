import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';

class DeliveryStatusBadge extends StatelessWidget {
  final String status;

  const DeliveryStatusBadge({super.key, required this.status});

  Color _getStatusColor() {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return AppColors.success;
      case 'assigned':
      case 'accepted':
        return AppColors.info;
      case 'picked_up':
      case 'in_transit':
        return AppColors.primary;
      case 'cancelled':
        return AppColors.error;
      default:
        return AppColors.textMuted;
    }
  }

  String _formatStatus() {
    switch (status.toLowerCase()) {
      case 'assigned':
        return 'ASSIGNED';
      case 'accepted':
        return 'EN ROUTE';
      case 'picked_up':
        return 'PICKED UP';
      case 'in_transit':
        return 'IN TRANSIT';
      case 'completed':
        return 'COMPLETED';
      case 'paid':
        return 'PAID';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status.replaceAll('_', ' ').toUpperCase();
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _getStatusColor();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        _formatStatus(),
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.4,
        ),
      ),
    );
  }
}
