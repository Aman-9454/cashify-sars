import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../models/admin_models.dart';
import '../../../../widgets/status_badge.dart';

class RecentOrderTile extends StatelessWidget {
  final AdminOrder order;
  final VoidCallback? onTap;

  const RecentOrderTile({
    super.key,
    required this.order,
    this.onTap,
  });

  Color _getTypeColor(String type) {
    switch (type.toLowerCase()) {
      case 'sell':
        return const Color(0xFF16A34A);
      case 'buy':
        return const Color(0xFF2563EB);
      case 'exchange':
        return const Color(0xFF7C3AED);
      case 'rent':
        return const Color(0xFFEA580C);
      default:
        return AppColors.textSecondary;
    }
  }

  Color _getTypeBg(String type) {
    switch (type.toLowerCase()) {
      case 'sell':
        return const Color(0xFFDCFCE7);
      case 'buy':
        return const Color(0xFFDBEAFE);
      case 'exchange':
        return const Color(0xFFF3E8FF);
      case 'rent':
        return const Color(0xFFFFEDD5);
      default:
        return const Color(0xFFF1F5F9);
    }
  }

  @override
  Widget build(BuildContext context) {
    final typeColor = _getTypeColor(order.type);
    final typeBg = _getTypeBg(order.type);
    final displayOrderNum = order.orderNumber.isNotEmpty ? order.orderNumber : order.id;
    final displayDevice = order.deviceName.isNotEmpty ? order.deviceName : order.deviceModel;
    final price = order.finalPrice > 0 ? order.finalPrice : order.quotedPrice;

    String dateStr = '';
    if (order.createdAt.isNotEmpty) {
      try {
        final d = DateTime.parse(order.createdAt);
        dateStr = '${d.day}/${d.month}';
      } catch (_) {}
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Order # + Date + Amount
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      displayOrderNum,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    if (dateStr.isNotEmpty) ...[
                      const SizedBox(width: 6),
                      Text(
                        '• $dateStr',
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ],
                ),
                Text(
                  CurrencyFormatter.format(price),
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),

            // Device Name
            Text(
              displayDevice,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),

            // Customer & City
            Text(
              '${order.customerName}${order.pickupCity.isNotEmpty ? ' • ${order.pickupCity}' : ''}',
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textSecondary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 10),

            // Bottom Badges: Type + Partner + Status
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: typeBg,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: typeColor.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    order.type.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: typeColor,
                    ),
                  ),
                ),
                const SizedBox(width: 8),

                // Partner badge
                if (order.partnerName.isNotEmpty && order.partnerName != 'null')
                  Flexible(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        order.partnerName,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  )
                else
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFFFECACA)),
                    ),
                    child: const Text(
                      'Unassigned',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFDC2626),
                      ),
                    ),
                  ),

                const Spacer(),
                StatusBadge(status: order.status),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
