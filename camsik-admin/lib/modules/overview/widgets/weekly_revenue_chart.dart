import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/currency_formatter.dart';

class WeeklyRevenueChart extends StatelessWidget {
  final List<Map<String, dynamic>> weeklyRevenue;

  const WeeklyRevenueChart({
    super.key,
    required this.weeklyRevenue,
  });

  @override
  Widget build(BuildContext context) {
    final days = weeklyRevenue.isNotEmpty
        ? weeklyRevenue
        : [
            {'day': 'Mon', 'revenue': 0, 'orders': 0},
            {'day': 'Tue', 'revenue': 0, 'orders': 0},
            {'day': 'Wed', 'revenue': 0, 'orders': 0},
            {'day': 'Thu', 'revenue': 0, 'orders': 0},
            {'day': 'Fri', 'revenue': 0, 'orders': 0},
            {'day': 'Sat', 'revenue': 0, 'orders': 0},
            {'day': 'Sun', 'revenue': 0, 'orders': 0},
          ];

    double maxRev = 0;
    double totalWeekRev = 0;
    int totalWeekOrders = 0;

    for (final item in days) {
      final rev = (item['revenue'] as num?)?.toDouble() ?? 0.0;
      final ord = (item['orders'] as num?)?.toInt() ?? 0;
      if (rev > maxRev) maxRev = rev;
      totalWeekRev += rev;
      totalWeekOrders += ord;
    }
    if (maxRev == 0) maxRev = 10000;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text(
                    'Revenue Overview',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCFCE7),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFBBF7D0)),
                    ),
                    child: const Text(
                      '+18.6% ↑',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF16A34A),
                      ),
                    ),
                  ),
                ],
              ),
              Text(
                CurrencyFormatter.format(totalWeekRev),
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Live platform throughput: $totalWeekOrders orders recorded this week',
            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
          ),
          const SizedBox(height: 20),

          // 7-Day Bar Chart
          SizedBox(
            height: 140,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: days.map((d) {
                final dayName = d['day'] as String? ?? '';
                final rev = (d['revenue'] as num?)?.toDouble() ?? 0.0;
                final ratio = min(1.0, max(0.08, rev / maxRev));
                final hasRevenue = rev > 0;

                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        if (hasRevenue)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Text(
                              CurrencyFormatter.compact(rev),
                              style: const TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF16A34A),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          )
                        else
                          const SizedBox(height: 14),
                        Container(
                          height: 90 * ratio,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            gradient: hasRevenue
                                ? const LinearGradient(
                                    colors: [Color(0xFF34D399), Color(0xFF059669)],
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                  )
                                : null,
                            color: hasRevenue ? null : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          dayName,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: hasRevenue ? FontWeight.bold : FontWeight.w500,
                            color: hasRevenue ? AppColors.textPrimary : AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}
