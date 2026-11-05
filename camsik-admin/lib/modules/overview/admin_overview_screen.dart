import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/api_constants.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../navigation/bloc/navigation_cubit.dart';
import '../operations/screens/admin_customers_screen.dart';
import '../operations/screens/admin_payouts_screen.dart';
import '../operations/screens/admin_pincodes_screen.dart';
import '../operations/screens/admin_push_notifications_screen.dart';
import '../operations/screens/admin_server_settings_screen.dart';
import 'bloc/overview_cubit.dart';
import 'bloc/overview_state.dart';
import 'widgets/metric_pill.dart';
import 'widgets/recent_order_tile.dart';
import 'widgets/summary_card.dart';
import 'widgets/top_categories_card.dart';
import 'widgets/weekly_revenue_chart.dart';

class AdminOverviewScreen extends StatelessWidget {
  const AdminOverviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OverviewCubit, OverviewState>(
      builder: (context, state) {
        final overviewCubit = context.read<OverviewCubit>();

        if (state is OverviewLoading) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(strokeWidth: 3, color: AppColors.primary),
                SizedBox(height: 16),
                Text(
                  'SYNCING MISSION CONTROL TELEMETRY...',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textSecondary,
                    letterSpacing: 1.0,
                  ),
                ),
              ],
            ),
          );
        }

        if (state is OverviewFailure) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.errorLight,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.cloud_off_rounded, size: 40, color: AppColors.error),
                ),
                const SizedBox(height: 14),
                const Text(
                  'Mission Control Disconnected',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17, color: AppColors.secondary),
                ),
                const SizedBox(height: 6),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 36),
                  child: Text(
                    state.error,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => overviewCubit.loadOverview(),
                      icon: const Icon(Icons.refresh_rounded, size: 16),
                      label: const Text('Re-sync Engine', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                    const SizedBox(width: 12),
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.secondary,
                        side: const BorderSide(color: AppColors.border),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const AdminServerSettingsScreen()),
                        );
                      },
                      icon: const Icon(Icons.dns_rounded, size: 16),
                      label: const Text('Server Settings', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ],
                ),
              ],
            ),
          );
        }

        if (state is! OverviewLoaded) {
          return const SizedBox.shrink();
        }

        final stats = state.stats;
        final recentOrders = state.recentOrders;
        final weeklyRevenue = state.weeklyRevenue;
        final topCategories = state.topCategories;

        final completionRate = stats.totalOrders > 0
            ? ((stats.completedOrders / stats.totalOrders) * 100).round()
            : 0;

        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () => overviewCubit.loadOverview(),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
            children: [
              // 1. Mission Control Telemetry Bar (Live Server & Status)
              InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const AdminServerSettingsScreen()),
                  );
                },
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.secondary,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFF10B981),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(color: Color(0xFF10B981), blurRadius: 6),
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'LIVE SYSTEM',
                        style: TextStyle(
                          color: Color(0xFF10B981),
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text('•', style: TextStyle(color: Colors.white24, fontSize: 12)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          ApiConstants.serverUrl.replaceAll('http://', '').replaceAll('https://', ''),
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Colors.white70,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Row(
                          children: [
                            Text(
                              'Switch',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            SizedBox(width: 2),
                            Icon(Icons.chevron_right_rounded, size: 14, color: Colors.white70),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // 2. Executive Hero Financial Command HUD (Dark Glass Gradient)
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [
                      Color(0xFF0F172A),
                      Color(0xFF1E1B4B),
                      Color(0xFF2E1065),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF2E1065).withValues(alpha: 0.35),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
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
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.shield_rounded, color: Color(0xFFFBBF24), size: 14),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'PLATFORM LIQUIDITY & GMV',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 10.5,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.2,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                          ),
                          child: const Row(
                            children: [
                              Icon(Icons.trending_up_rounded, color: Color(0xFF34D399), size: 13),
                              SizedBox(width: 4),
                              Text(
                                '+18.6% MTD',
                                style: TextStyle(
                                  color: Color(0xFF34D399),
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Primary GMV Output
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          CurrencyFormatter.format(stats.totalRevenue),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'INR',
                          style: TextStyle(
                            color: Colors.white38,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${stats.completedOrders} Settled Runs • ${stats.totalOrders} Cumulative Platform Bookings',
                      style: const TextStyle(color: Colors.white60, fontSize: 12, fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 18),

                    // High-tech Telemetry Matrix
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        MetricPill(
                          label: 'PENDING',
                          value: '${stats.pendingOrders}',
                          dotColor: const Color(0xFFF59E0B),
                        ),
                        MetricPill(
                          label: 'ACTIVE RUNS',
                          value: '${stats.activeOrders}',
                          dotColor: const Color(0xFF06B6D4),
                        ),
                        MetricPill(
                          label: 'PARTNER HUBS',
                          value: '${stats.activePartners}',
                          dotColor: const Color(0xFFA855F7),
                        ),
                        MetricPill(
                          label: 'FLEET RIDERS',
                          value: '${stats.onlineAgents}',
                          dotColor: const Color(0xFF10B981),
                        ),
                        MetricPill(
                          label: 'CLIENT BASE',
                          value: '${stats.totalCustomers}',
                          dotColor: const Color(0xFF6366F1),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 22),

              // 3. Executive KPI Command Matrix (8 Core Operations)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'EXECUTIVE KPI INSTRUMENT PANEL',
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textSecondary,
                      letterSpacing: 0.8,
                    ),
                  ),
                  Text(
                    '8 TELEMETRY NODES',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.15,
                children: [
                  SummaryCard(
                    title: 'Gross Revenue',
                    value: stats.totalRevenue >= 100000
                        ? CurrencyFormatter.compact(stats.totalRevenue)
                        : CurrencyFormatter.format(stats.totalRevenue),
                    subtitle: '${stats.completedOrders} settled orders',
                    icon: Icons.currency_rupee_rounded,
                    color: const Color(0xFF10B981),
                    onTap: () => context.read<NavigationCubit>().setTab(1),
                  ),
                  SummaryCard(
                    title: 'Orders Volume',
                    value: '${stats.totalOrders}',
                    subtitle: '${stats.totalOrders} total bookings',
                    icon: Icons.shopping_bag_rounded,
                    color: const Color(0xFF2563EB),
                    onTap: () => context.read<NavigationCubit>().setTab(1),
                  ),
                  SummaryCard(
                    title: 'Completion Ratio',
                    value: '$completionRate%',
                    subtitle: '${stats.completedOrders} delivered runs',
                    icon: Icons.check_circle_rounded,
                    color: const Color(0xFF059669),
                    onTap: () => context.read<NavigationCubit>().setTab(1),
                  ),
                  SummaryCard(
                    title: 'Pending Action',
                    value: '${stats.pendingOrders}',
                    subtitle: stats.pendingOrders > 0
                        ? '${stats.pendingOrders} need attention'
                        : 'Zero backlog',
                    icon: Icons.access_time_filled_rounded,
                    color: const Color(0xFFD97706),
                    onTap: () => context.read<NavigationCubit>().setTab(1),
                  ),
                  SummaryCard(
                    title: 'Studio Partners',
                    value: '${stats.activePartners}',
                    subtitle: '${stats.pendingPartners} pending approval',
                    icon: Icons.handshake_rounded,
                    color: const Color(0xFF7C3AED),
                    onTap: () => context.read<NavigationCubit>().setTab(4),
                  ),
                  SummaryCard(
                    title: 'Logistics Fleet',
                    value: '${stats.totalDeliveryAgents}',
                    subtitle: '${stats.onlineAgents} riders online',
                    icon: Icons.local_shipping_rounded,
                    color: const Color(0xFF0891B2),
                    onTap: () => context.read<NavigationCubit>().setTab(4),
                  ),
                  SummaryCard(
                    title: 'Customer Directory',
                    value: '${stats.totalCustomers}',
                    subtitle: '${stats.totalCustomers} verified clients',
                    icon: Icons.people_alt_rounded,
                    color: const Color(0xFF4F46E5),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const AdminCustomersScreen()),
                      );
                    },
                  ),
                  SummaryCard(
                    title: 'Payout Ledger',
                    value: CurrencyFormatter.format(stats.pendingPayouts),
                    subtitle: 'Due to partners',
                    icon: Icons.bolt_rounded,
                    color: const Color(0xFFEA580C),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const AdminPayoutsScreen()),
                      );
                    },
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // 4. Live Weekly Revenue Throughput Telemetry Chart
              WeeklyRevenueChart(weeklyRevenue: weeklyRevenue),

              const SizedBox(height: 16),

              // 5. Product Verticals & Top Categories Breakdown
              TopCategoriesCard(
                topCategories: topCategories,
                onManageCatalog: () => context.read<NavigationCubit>().setTab(3),
              ),

              const SizedBox(height: 22),

              // 6. Executive Workflow Shortcuts
              const Text(
                'EXECUTIVE DISPATCH CONSOLE',
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textSecondary,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 10),

              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildDispatchButton(
                      context,
                      icon: Icons.camera_alt_rounded,
                      label: 'Rental Fleet',
                      color: const Color(0xFFF43F5E),
                      onTap: () => context.read<NavigationCubit>().setTab(2),
                    ),
                    const SizedBox(width: 10),
                    _buildDispatchButton(
                      context,
                      icon: Icons.category_rounded,
                      label: 'Catalog Engine',
                      color: const Color(0xFF6366F1),
                      onTap: () => context.read<NavigationCubit>().setTab(3),
                    ),
                    const SizedBox(width: 10),
                    _buildDispatchButton(
                      context,
                      icon: Icons.people_alt_rounded,
                      label: 'Customer CRM',
                      color: const Color(0xFF4F46E5),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const AdminCustomersScreen()),
                        );
                      },
                    ),
                    const SizedBox(width: 10),
                    _buildDispatchButton(
                      context,
                      icon: Icons.account_balance_wallet_rounded,
                      label: 'Disbursements',
                      color: const Color(0xFF10B981),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const AdminPayoutsScreen()),
                        );
                      },
                    ),
                    const SizedBox(width: 10),
                    _buildDispatchButton(
                      context,
                      icon: Icons.pin_drop_rounded,
                      label: 'Geo-Fencing',
                      color: const Color(0xFF0EA5E9),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const AdminPincodesScreen()),
                        );
                      },
                    ),
                    const SizedBox(width: 10),
                    _buildDispatchButton(
                      context,
                      icon: Icons.campaign_rounded,
                      label: 'Broadcasts',
                      color: const Color(0xFF8B5CF6),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const AdminPushNotificationsScreen()),
                        );
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // 7. Live Transaction Stream (Recent Orders)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'LIVE TRANSACTION STREAM',
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textSecondary,
                      letterSpacing: 0.8,
                    ),
                  ),
                  InkWell(
                    onTap: () => context.read<NavigationCubit>().setTab(1),
                    child: Row(
                      children: [
                        Text(
                          'View All ${stats.totalOrders} Orders',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 2),
                        const Icon(Icons.arrow_forward_rounded, size: 14, color: AppColors.primary),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              if (recentOrders.isEmpty)
                Container(
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Center(
                    child: Text(
                      'No live transactions recorded.',
                      style: TextStyle(color: AppColors.textMuted, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ),
                )
              else
                ...recentOrders.map(
                  (o) => RecentOrderTile(
                    order: o,
                    onTap: () => context.read<NavigationCubit>().setTab(1),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDispatchButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 16, color: color),
              ),
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  color: AppColors.secondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
