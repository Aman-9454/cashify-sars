import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sizer/sizer.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/delivery_models.dart';
import 'bloc/earnings_cubit.dart';
import 'bloc/earnings_state.dart';

class DeliveryEarningsScreen extends StatelessWidget {
  const DeliveryEarningsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: BlocBuilder<EarningsCubit, EarningsState>(
        builder: (context, state) {
          final earningsCubit = context.read<EarningsCubit>();
          final isLoading = state is EarningsLoading;
          final isLoaded = state is EarningsLoaded;
          final completed = isLoaded ? state.completedTasks : <DeliveryTask>[];
          final totalEarnings = isLoaded ? state.totalEarnings : 0.0;

          return RefreshIndicator(
            color: const Color(0xFFFF5722),
            onRefresh: () => earningsCubit.loadEarnings(),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 30),
              children: [
                _buildWalletCard(context, totalEarnings: totalEarnings, completedCount: completed.length),
                const SizedBox(height: 16),
                _buildKpiSummaryRow(completedCount: completed.length, totalEarnings: totalEarnings),
                const SizedBox(height: 16),
                _buildWeeklyActivityCard(completedCount: completed.length),
                const SizedBox(height: 16),
                _buildPayoutAccountCard(context),
                const SizedBox(height: 16),
                _buildIncentiveTargetCard(completedCount: completed.length),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Completed Trip Run Logs (${completed.length})', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16.sp, color: const Color(0xFF0F172A))),
                    if (completed.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(10)),
                        child: Text('100% Verified', style: TextStyle(color: const Color(0xFF16A34A), fontSize: 14.sp, fontWeight: FontWeight.bold)),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                if (isLoading && completed.isEmpty)
                  const Center(child: Padding(padding: EdgeInsets.all(32.0), child: CircularProgressIndicator(color: Color(0xFFFF5722))))
                else if (completed.isEmpty)
                  _buildEmptyRunsPlaceholder()
                else
                  ...completed.map((t) => _buildTransactionCard(context, task: t)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildWalletCard(BuildContext context, {required double totalEarnings, required int completedCount}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [Color(0xFF0F172A), Color(0xFF1E293B)]),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF334155), width: 1.2),
        boxShadow: [BoxShadow(color: const Color(0xFF0F172A).withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(color: const Color(0xFFFF5722).withValues(alpha: 0.2), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.account_balance_wallet_rounded, color: Color(0xFFFF5722), size: 16),
                  ),
                  const SizedBox(width: 8),
                  Text('DELIVERY AGENT WALLET', style: TextStyle(color: const Color(0xFF94A3B8), fontSize: 14.sp, fontWeight: FontWeight.w800, letterSpacing: 0.8)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF065F46).withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.5)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(width: 6, height: 6, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
                    const SizedBox(width: 5),
                    Text('Auto Payout', style: TextStyle(color: const Color(0xFF6EE7B7), fontSize: 14.sp, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(CurrencyFormatter.format(totalEarnings), style: TextStyle(color: Colors.white, fontSize: 18.sp, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.stars_rounded, color: Color(0xFFFCD34D), size: 16),
              const SizedBox(width: 6),
              Expanded(child: Text('Rate: ₹250 flat incentive per verified doorstep run', style: TextStyle(color: const Color(0xFFFDE68A), fontSize: 14.sp, fontWeight: FontWeight.w600))),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(color: Color(0xFF334155), height: 1),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => _showInstantWithdrawSheet(context, totalEarnings),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFFFF5722), Color(0xFFF97316)]), borderRadius: BorderRadius.circular(12)),
                    child: Center(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.bolt_rounded, size: 16, color: Colors.white),
                          const SizedBox(width: 4),
                          Text('Withdraw Now', style: TextStyle(color: Colors.white, fontSize: 14.sp, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: InkWell(
                  onTap: () => _showPayoutScheduleSheet(context),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(color: const Color(0xFF334155).withValues(alpha: 0.6), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFF475569))),
                    child: Center(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.calendar_month_rounded, size: 16, color: Color(0xFFE2E8F0)),
                          const SizedBox(width: 4),
                          Text('Daily at 10 PM', style: TextStyle(color: const Color(0xFFE2E8F0), fontSize: 14.sp, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildKpiSummaryRow({required int completedCount, required double totalEarnings}) {
    return Row(
      children: [
        Expanded(child: _buildKpiTile(label: 'Trips Done', value: '$completedCount', icon: Icons.two_wheeler_rounded, iconColor: const Color(0xFFEA580C), iconBg: const Color(0xFFFFF7ED))),
        const SizedBox(width: 10),
        Expanded(child: _buildKpiTile(label: 'Avg / Trip', value: '₹250', icon: Icons.currency_rupee_rounded, iconColor: const Color(0xFF2563EB), iconBg: const Color(0xFFEFF6FF))),
        const SizedBox(width: 10),
        Expanded(child: _buildKpiTile(label: 'On-Time', value: '100%', icon: Icons.verified_rounded, iconColor: const Color(0xFF16A34A), iconBg: const Color(0xFFDCFCE7))),
      ],
    );
  }

  Widget _buildKpiTile({required String label, required String value, required IconData icon, required Color iconColor, required Color iconBg}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6, offset: const Offset(0, 2))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(8)), child: Icon(icon, size: 16, color: iconColor)),
          const SizedBox(height: 8),
          Text(label, style: TextStyle(color: const Color(0xFF64748B), fontSize: 14.sp, fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(color: const Color(0xFF0F172A), fontSize: 17.sp, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }

  Widget _buildWeeklyActivityCard({required int completedCount}) {
    final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final todayIndex = DateTime.now().weekday - 1;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Weekly Trip Streak', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15.sp, color: const Color(0xFF0F172A))),
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(10)), child: Text('Active Week', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: const Color(0xFFB45309)))),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(7, (idx) {
              final isToday = idx == todayIndex;
              final isPast = idx <= todayIndex;
              final height = isToday ? 52.0 : (isPast ? 36.0 : 18.0);
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 28, height: height,
                    decoration: BoxDecoration(
                      gradient: isToday ? const LinearGradient(begin: Alignment.bottomCenter, end: Alignment.topCenter, colors: [Color(0xFFFF5722), Color(0xFFF97316)]) : null,
                      color: isToday ? null : (isPast ? const Color(0xFFDCFCE7) : const Color(0xFFF1F5F9)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: isToday ? const Center(child: Icon(Icons.check, size: 14, color: Colors.white)) : (isPast && completedCount > 0 && idx == todayIndex ? const Center(child: Icon(Icons.check, size: 14, color: Color(0xFF16A34A))) : null),
                  ),
                  const SizedBox(height: 6),
                  Text(days[idx], style: TextStyle(fontSize: 14.sp, fontWeight: isToday ? FontWeight.w900 : FontWeight.w600, color: isToday ? const Color(0xFFFF5722) : const Color(0xFF64748B))),
                ],
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildPayoutAccountCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6, offset: const Offset(0, 2))]),
      child: Row(
        children: [
          Container(width: 44, height: 44, decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(12)), child: const Center(child: Icon(Icons.account_balance_rounded, color: Color(0xFF2563EB), size: 22))),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('Direct IMPS / UPI Account', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp, color: const Color(0xFF0F172A))),
                    const SizedBox(width: 6),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(6)), child: Text('Linked', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: const Color(0xFF16A34A)))),
                  ],
                ),
                const SizedBox(height: 2),
                Text('HDFC Bank •••• 4291 • Instant settlements', style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B))),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
        ],
      ),
    );
  }

  Widget _buildIncentiveTargetCard({required int completedCount}) {
    const target = 10;
    final progress = (completedCount / target).clamp(0.0, 1.0);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFFFFF7ED), Color(0xFFFFEDD5)]),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFED7AA)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.emoji_events_rounded, color: Color(0xFFEA580C), size: 20),
                  const SizedBox(width: 6),
                  Text('Weekly Milestone Bonus', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15.sp, color: const Color(0xFF7C2D12))),
                ],
              ),
              Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: const Color(0xFFEA580C), borderRadius: BorderRadius.circular(10)), child: Text('+₹500 Extra', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: Colors.white))),
            ],
          ),
          const SizedBox(height: 6),
          Text('Complete $target doorstep runs this week to unlock ₹500 performance incentive.', style: TextStyle(color: const Color(0xFF9A3412), fontSize: 14.sp, fontWeight: FontWeight.w500)),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(value: progress, minHeight: 8, backgroundColor: Colors.white, color: const Color(0xFFEA580C)),
          ),
          const SizedBox(height: 6),
          Align(
            alignment: Alignment.centerRight,
            child: Text('$completedCount of $target runs completed (${(progress * 100).toInt()}%)', style: TextStyle(color: const Color(0xFF7C2D12), fontSize: 14.sp, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyRunsPlaceholder() {
    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFE2E8F0))),
      child: Column(
        children: [
          Container(width: 56, height: 56, decoration: const BoxDecoration(color: Color(0xFFF1F5F9), shape: BoxShape.circle), child: const Center(child: Icon(Icons.receipt_long_rounded, color: Color(0xFF94A3B8), size: 28))),
          const SizedBox(height: 12),
          Text('No Completed Runs Yet', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.sp, color: const Color(0xFF0F172A))),
          const SizedBox(height: 4),
          Text('Complete assigned doorstep pickups to earn ₹250 flat fee per verified order.', textAlign: TextAlign.center, style: TextStyle(color: const Color(0xFF64748B), fontSize: 14.sp)),
        ],
      ),
    );
  }

  Widget _buildTransactionCard(BuildContext context, {required DeliveryTask task}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFE2E8F0)), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6, offset: const Offset(0, 2))]),
      child: InkWell(
        onTap: () => _showTripReceiptSheet(context, task),
        borderRadius: BorderRadius.circular(18),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Container(width: 48, height: 52, color: const Color(0xFFF8FAFC), child: _buildDeviceThumbnail(task)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('+${CurrencyFormatter.format(250)} Fee Earned', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15.sp, color: const Color(0xFF15803D))),
                      Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(8)), child: Text('Verified', style: TextStyle(color: const Color(0xFF16A34A), fontSize: 14.sp, fontWeight: FontWeight.bold))),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(task.deviceName, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp, color: const Color(0xFF0F172A)), maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Text('${task.orderNumber} • ${task.customerName}', style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B)), maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            const SizedBox(width: 6),
            const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildDeviceThumbnail(DeliveryTask task) {
    final name = task.deviceName.toLowerCase();
    String? imageUrl;
    if (name.contains('iphone')) {
      imageUrl = 'https://casmik-one.vercel.app/assets/images/refurbished/iphone-15-pro.png';
    } else if (name.contains('oneplus')) {
      imageUrl = 'https://casmik-one.vercel.app/assets/images/refurbished/oneplus-12.png';
    } else if (name.contains('macbook') || name.contains('laptop')) {
      imageUrl = 'https://casmik-one.vercel.app/assets/images/refurbished/macbook-air-m2.png';
    } else if (name.contains('dslr') || name.contains('canon') || name.contains('camera')) {
      imageUrl = 'https://casmik-one.vercel.app/assets/images/categories/dslr.png';
    }
    if (imageUrl != null) {
      return Image.network(imageUrl, fit: BoxFit.contain, errorBuilder: (ctx, err, stack) => _buildDeviceIconFallback(task));
    }
    return _buildDeviceIconFallback(task);
  }

  Widget _buildDeviceIconFallback(DeliveryTask task) {
    IconData icon = Icons.phone_iphone_rounded;
    Color color = const Color(0xFFEA580C);
    switch (task.detectedCategory) {
      case DeviceCategory.camera: icon = Icons.camera_alt_outlined; color = const Color(0xFF2563EB); break;
      case DeviceCategory.lens: icon = Icons.camera_rounded; color = const Color(0xFF0D9488); break;
      case DeviceCategory.laptop: icon = Icons.laptop_mac_rounded; color = const Color(0xFF4F46E5); break;
      case DeviceCategory.tablet: icon = Icons.tablet_mac_rounded; color = const Color(0xFF7C3AED); break;
      case DeviceCategory.smartwatch: icon = Icons.watch_rounded; color = const Color(0xFFE11D48); break;
      case DeviceCategory.smartphone: icon = Icons.phone_iphone_rounded; color = const Color(0xFFEA580C); break;
    }
    return Center(child: Icon(icon, color: color, size: 24));
  }

  void _showInstantWithdrawSheet(BuildContext context, double balance) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 18),
            Text('Instant Bank Transfer', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17.sp, color: const Color(0xFF0F172A))),
            const SizedBox(height: 4),
            Text('Transfer your available earnings directly to linked bank account.', style: TextStyle(color: const Color(0xFF64748B), fontSize: 14.sp)),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE2E8F0))),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Transferable Amount', style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B))),
                  Text(CurrencyFormatter.format(balance), style: TextStyle(fontSize: 17.sp, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A))),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFF5722), foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('⚡ Instant transfer request submitted! Credited in 5 mins.'), backgroundColor: Color(0xFF16A34A)),
                );
              },
              child: Text('Confirm Payout to HDFC Bank', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  void _showPayoutScheduleSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 18),
            Text('Automated Payout Cycle', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17.sp, color: const Color(0xFF0F172A))),
            const SizedBox(height: 12),
            Text('• Daily Settlement: Every night at 10:00 PM via IMPS\n• Minimum Balance: ₹0 (No threshold)\n• Processing Fee: ₹0 (100% Free for fleet riders)\n• Bank Linked: HDFC Bank •••• 4291', style: TextStyle(color: const Color(0xFF334155), fontSize: 14.sp, height: 1.6)),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white, minimumSize: const Size(double.infinity, 44), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: () => Navigator.pop(context),
              child: Text('Got It', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  void _showTripReceiptSheet(BuildContext context, DeliveryTask task) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 18),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Trip Payout Receipt', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17.sp, color: const Color(0xFF0F172A))),
                Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(8)), child: Text('Paid & Verified', style: TextStyle(color: const Color(0xFF16A34A), fontSize: 14.sp, fontWeight: FontWeight.bold))),
              ],
            ),
            const SizedBox(height: 14),
            _buildReceiptRow('Order Number', task.orderNumber),
            _buildReceiptRow('Device', task.deviceName),
            _buildReceiptRow('Customer', task.customerName),
            _buildReceiptRow('Base Doorstep Fee', '₹200.00'),
            _buildReceiptRow('Verification Incentive', '₹50.00'),
            const Divider(height: 20),
            _buildReceiptRow('Total Credited', '+₹250.00', isBold: true),
            const SizedBox(height: 18),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), foregroundColor: Colors.white, minimumSize: const Size(double.infinity, 44), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: () => Navigator.pop(context),
              child: Text('Close Receipt', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: const Color(0xFF64748B), fontSize: 14.sp)),
          Text(value, style: TextStyle(color: isBold ? const Color(0xFF15803D) : const Color(0xFF0F172A), fontWeight: isBold ? FontWeight.w900 : FontWeight.w600, fontSize: isBold ? 16.sp : 14.sp)),
        ],
      ),
    );
  }
}
