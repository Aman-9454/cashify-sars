import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../../core/constants/app_colors.dart';
import '../../core/extensions/order_extensions.dart';
import '../../core/services/session_service.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/partner_models.dart';

class PartnerReportsScreen extends StatelessWidget {
  final List<PartnerOrder> orders;

  const PartnerReportsScreen({super.key, required this.orders});

  @override
  Widget build(BuildContext context) {
    final completed = orders.filterCompleted();
    final totalTradeVolume = orders.fold<double>(0.0, (s, o) => s + o.finalPrice);
    final commissionRate = SessionService.currentUser?.commission ?? 5.0;
    final commissionYield = (totalTradeVolume * commissionRate) / 100;

    // Category breakdown derived from orders
    final Map<String, List<PartnerOrder>> catMap = {};
    for (final o in orders) {
      final cat = o.type.toUpperCase();
      catMap.putIfAbsent(cat, () => []).add(o);
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'Store Performance & Reports',
          style: TextStyle(
            fontSize: 17.sp,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF0F172A),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView(
        padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
        children: [
          // Total Revenue Card
          Container(
            padding: EdgeInsets.all(5.w),
            decoration: BoxDecoration(
              gradient: AppColors.heroGradient,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'GROSS STORE TRADE VOLUME',
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF94A3B8),
                    letterSpacing: 1.1,
                  ),
                ),
                SizedBox(height: 1.h),
                Text(
                  CurrencyFormatter.format(totalTradeVolume),
                  style: TextStyle(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: 0.5.h),
                Text(
                  '${completed.length} Completed Liquidations • ${orders.length} Total Registered',
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: const Color(0xFF34D399),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 2.h),

          // Yield Overview Cards
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: EdgeInsets.all(3.5.w),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Commission Yield ($commissionRate%)',
                        style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B)),
                      ),
                      SizedBox(height: 0.5.h),
                      Text(
                        CurrencyFormatter.format(commissionYield),
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: Container(
                  padding: EdgeInsets.all(3.5.w),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Avg Ticket Size',
                        style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B)),
                      ),
                      SizedBox(height: 0.5.h),
                      Text(
                        CurrencyFormatter.format(orders.isNotEmpty ? totalTradeVolume / orders.length : 0),
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF059669),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 2.5.h),

          // Section Header: Order Type Breakdown
          Row(
            children: [
              Container(
                width: 4,
                height: 18,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              SizedBox(width: 2.w),
              Text(
                'Intake Category Breakdown',
                style: TextStyle(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF0F172A),
                ),
              ),
            ],
          ),
          SizedBox(height: 1.5.h),

          ...catMap.entries.map((entry) {
            final count = entry.value.length;
            final vol = entry.value.fold<double>(0.0, (s, o) => s + o.finalPrice);
            final pct = orders.isNotEmpty ? (count / orders.length) : 0.0;

            return Container(
              margin: EdgeInsets.only(bottom: 1.5.h),
              padding: EdgeInsets.all(3.5.w),
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
                        'Category: ${entry.key}',
                        style: TextStyle(
                          fontSize: 15.sp,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      Text(
                        '$count units (${(pct * 100).toStringAsFixed(0)}%)',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: const Color(0xFF64748B),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 1.h),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: pct,
                      minHeight: 6,
                      backgroundColor: const Color(0xFFF1F5F9),
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                  ),
                  SizedBox(height: 0.8.h),
                  Text(
                    'Volume: ${CurrencyFormatter.format(vol)}',
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
