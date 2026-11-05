import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../../core/extensions/order_extensions.dart';
import '../../core/services/session_service.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/partner_models.dart';
import '../customers/partner_customers_screen.dart';
import '../orders/screens/partner_order_detail_screen.dart';
import '../riders/partner_riders_screen.dart';
import 'data/models/dashboard_stats_model.dart';
import 'data/repositories/dashboard_repository.dart';

class PartnerDashboardScreen extends StatefulWidget {
  final List<PartnerOrder> orders;
  final PartnerUser? user;
  final bool loading;
  final Future<void> Function() onRefresh;
  final Function(int) onNavigate;

  const PartnerDashboardScreen({
    super.key,
    required this.orders,
    this.user,
    required this.loading,
    required this.onRefresh,
    required this.onNavigate,
  });

  @override
  State<PartnerDashboardScreen> createState() => _PartnerDashboardScreenState();
}

class _PartnerDashboardScreenState extends State<PartnerDashboardScreen> {
  final DashboardRepository _dashboardRepo = DashboardRepositoryImpl();
  DashboardStatsModel? _stats;
  bool _fetchingStats = false;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    final activeUser = widget.user ?? SessionService.currentUser;
    final partnerId = activeUser?.id ?? '';
    if (partnerId.isEmpty) return;

    setState(() => _fetchingStats = true);
    final data = await _dashboardRepo.fetchDashboardStats(partnerId);
    if (mounted) {
      setState(() {
        _stats = data;
        _fetchingStats = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if ((widget.loading || _fetchingStats) &&
        widget.orders.isEmpty &&
        _stats == null) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8FAFC),
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFF1E5BF8)),
        ),
      );
    }

    final activeUser = widget.user ?? SessionService.currentUser;
    final commissionRate =
        _stats?.commissionRate ?? (activeUser?.commission ?? 4.5);

    final calculatedVolume =
        widget.orders.fold<double>(0.0, (sum, o) => sum + o.finalPrice);
    final totalVolume =
        (_stats?.storeTradeVolume != null && _stats!.storeTradeVolume > 0)
            ? _stats!.storeTradeVolume
            : calculatedVolume;

    final completedOrders = widget.orders.filterCompleted();
    final completedCount =
        _stats?.completedOrdersCount ?? completedOrders.length;
    final totalUnitsCount = _stats?.totalOrdersCount ?? widget.orders.length;
    final pendingCount =
        _stats?.activePipelineCount ??
        (widget.orders.length - completedOrders.length);

    final commissionEarned =
        (_stats?.totalCommissionEarned != null &&
                _stats!.totalCommissionEarned > 0)
            ? _stats!.totalCommissionEarned
            : ((totalVolume * commissionRate) / 100);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          color: const Color(0xFF1E5BF8),
          onRefresh: () async {
            await Future.wait([widget.onRefresh(), _loadStats()]);
          },
          child: ListView(
            padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.2.h),
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              // 1. Top Bar exactly as shown in screenshot
              _buildTopBar(activeUser),
              SizedBox(height: 1.8.h),

              // 2. Store Trade Volume Main Card
              _buildStoreTradeVolumeCard(
                totalVolume: totalVolume,
                completedCount: completedCount,
                totalUnitsCount: totalUnitsCount,
                growthText: _stats?.momGrowth ?? (completedCount > 0 ? '+${((completedCount / (totalUnitsCount > 0 ? totalUnitsCount : 1)) * 100).toStringAsFixed(1)}% MoM' : '+0.0% MoM'),
              ),
              SizedBox(height: 1.8.h),

              // 3. Middle 2 Metric Cards (Active Pipeline & Commission)
              _buildMiddleMetrics(
                pendingCount: pendingCount,
                commissionRate: commissionRate,
                commissionEarned: commissionEarned,
              ),
              SizedBox(height: 1.8.h),

              // 4. Quick Action Buttons (45-Point QA & Spot Payout)
              _buildActionButtons(),
              SizedBox(height: 2.5.h),

              // 5. Active Queue & Tasks Section
              _buildActiveQueueSection(widget.orders),
              SizedBox(height: 2.5.h),

              // 6. Store Operations Hub 2x2 Grid
              _buildStoreOperationsHubSection(),
              SizedBox(height: 3.h),
            ],
          ),
        ),
      ),
    );
  }

  // 1. Top Bar: Store Icon + CAMSIK PARTNER / Store Dashboard + Bell + Avatar 'S'
  Widget _buildTopBar(PartnerUser? user) {
    final avatarLetter = (user?.name.isNotEmpty == true
            ? user!.name[0]
            : (user?.storeName.isNotEmpty == true
                ? user!.storeName[0]
                : 'S'))
        .toUpperCase();

    return Row(
      children: [
        // Blue store icon container with rounded squircle
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF2563EB).withValues(alpha: 0.28),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Center(
            child: Icon(
              Icons.storefront_rounded,
              color: Colors.white,
              size: 24,
            ),
          ),
        ),
        SizedBox(width: 3.w),

        // Brand & Subtitle
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'CAMSIK PARTNER',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 16.sp,
                  letterSpacing: 0.3,
                  color: const Color(0xFF0F172A),
                ),
              ),
              SizedBox(height: 0.2.h),
              Text(
                'Store Dashboard',
                style: TextStyle(
                  fontSize: 14.sp,
                  color: const Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),

        // Notification Bell with Red Dot
        Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: const BoxDecoration(
                color: Colors.transparent,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.notifications_none_rounded,
                color: Color(0xFF1E293B),
                size: 26,
              ),
            ),
            Positioned(
              top: 5,
              right: 5,
              child: Container(
                width: 9,
                height: 9,
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 1.5),
                ),
              ),
            ),
          ],
        ),
        SizedBox(width: 2.5.w),

        // Avatar Circle 'S'
        Container(
          width: 38,
          height: 38,
          decoration: const BoxDecoration(
            color: Color(0xFFD2DBF9),
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: Text(
            avatarLetter,
            style: TextStyle(
              color: const Color(0xFF3B82F6),
              fontSize: 16.sp,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }

  // 2. Main Volume Card: Gradient with bar chart silhouette, 'This Month' dropdown, volume, MoM badge
  Widget _buildStoreTradeVolumeCard({
    required double totalVolume,
    required int completedCount,
    required int totalUnitsCount,
    required String growthText,
  }) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF1E5BF8),
            Color(0xFF2563EB),
            Color(0xFF3B82F6),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E5BF8).withValues(alpha: 0.35),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Volume bar chart silhouette in background on right
          Positioned(
            right: 22,
            bottom: 24,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _buildBarSilhouette(height: 28, opacity: 0.16),
                const SizedBox(width: 6),
                _buildBarSilhouette(height: 44, opacity: 0.22),
                const SizedBox(width: 6),
                _buildBarSilhouette(height: 62, opacity: 0.30),
                const SizedBox(width: 6),
                _buildBarSilhouette(height: 82, opacity: 0.40),
              ],
            ),
          ),

          // Main Card Content
          Padding(
            padding: EdgeInsets.all(5.w > 20 ? 20 : 5.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top row: Label & Dropdown
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Store Trade Volume',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.95),
                        fontSize: 14.5.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 3.w,
                        vertical: 0.5.h,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.25),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'This Month',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(width: 1.w),
                          const Icon(
                            Icons.keyboard_arrow_down_rounded,
                            color: Colors.white,
                            size: 16,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 1.2.h),

                // Volume Number
                Text(
                  CurrencyFormatter.format(totalVolume),
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                ),
                SizedBox(height: 1.h),

                // MoM Growth Badge
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 2.8.w,
                    vertical: 0.4.h,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF047857).withValues(alpha: 0.45),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: const Color(0xFF10B981).withValues(alpha: 0.4),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.arrow_upward_rounded,
                        color: Color(0xFF34D399),
                        size: 14,
                      ),
                      SizedBox(width: 1.w),
                      Text(
                        growthText,
                        style: TextStyle(
                          color: const Color(0xFF34D399),
                          fontSize: 14.sp,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 1.6.h),

                // Liquidated and Total Registered line
                Text(
                  '$completedCount Orders Liquidated • $totalUnitsCount Total Registered',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.88),
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBarSilhouette({required double height, required double opacity}) {
    return Container(
      width: 10,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: opacity),
        borderRadius: BorderRadius.circular(5),
      ),
    );
  }

  // 3. Middle Metric Cards (Active Pipeline & Commission)
  Widget _buildMiddleMetrics({
    required int pendingCount,
    required double commissionRate,
    required double commissionEarned,
  }) {
    return Row(
      children: [
        // Active Pipeline Card
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Stack(
                children: [
                  Positioned(
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 40,
                    child: CustomPaint(
                      painter: _MiniWavePainter(
                        lineColor: const Color(0xFF3B82F6),
                        fillColor: const Color(0xFF3B82F6),
                      ),
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.all(3.8.w),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: const Color(0xFFEFF6FF),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(
                                Icons.view_in_ar_rounded,
                                color: Color(0xFF2563EB),
                                size: 20,
                              ),
                            ),
                            SizedBox(width: 2.w),
                            Expanded(
                              child: Text(
                                'Active Pipeline',
                                style: TextStyle(
                                  color: const Color(0xFF1E293B),
                                  fontSize: 14.sp,
                                  fontWeight: FontWeight.w600,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 1.2.h),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              '$pendingCount',
                              style: TextStyle(
                                fontSize: 18.sp,
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF0F172A),
                              ),
                            ),
                            SizedBox(width: 1.5.w),
                            Text(
                              'units',
                              style: TextStyle(
                                fontSize: 14.sp,
                                color: const Color(0xFF64748B),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 2.h),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        SizedBox(width: 3.w),

        // Commission Card
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Stack(
                children: [
                  Positioned(
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 40,
                    child: CustomPaint(
                      painter: _MiniWavePainter(
                        lineColor: const Color(0xFF10B981),
                        fillColor: const Color(0xFF10B981),
                      ),
                    ),
                  ),
                  Padding(
                    padding: EdgeInsets.all(3.8.w),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: const Color(0xFFECFDF5),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(
                                Icons.paid_outlined,
                                color: Color(0xFF059669),
                                size: 20,
                              ),
                            ),
                            SizedBox(width: 2.w),
                            Expanded(
                              child: Text(
                                'Commission (${commissionRate.toStringAsFixed(1)}%)',
                                style: TextStyle(
                                  color: const Color(0xFF1E293B),
                                  fontSize: 14.sp,
                                  fontWeight: FontWeight.w600,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 1.2.h),
                        Text(
                          CurrencyFormatter.format(commissionEarned),
                          style: TextStyle(
                            fontSize: 18.sp,
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFF2563EB),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: 2.h),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  // 4. Quick Action Buttons: 45-Point QA & Spot Payout
  Widget _buildActionButtons() {
    return Row(
      children: [
        // 45-Point QA (Royal Blue)
        Expanded(
          child: Material(
            color: const Color(0xFF1E5BF8),
            borderRadius: BorderRadius.circular(18),
            child: InkWell(
              onTap: () => widget.onNavigate(2),
              borderRadius: BorderRadius.circular(18),
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: 3.5.w,
                  vertical: 1.6.h,
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF1E5BF8).withValues(alpha: 0.32),
                      blurRadius: 14,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.qr_code_scanner_rounded,
                      color: Colors.white,
                      size: 22,
                    ),
                    SizedBox(width: 2.w),
                    Expanded(
                      child: Text(
                        '45-Point QA',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 15.sp,
                        ),
                      ),
                    ),
                    const Icon(
                      Icons.chevron_right_rounded,
                      color: Colors.white,
                      size: 20,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        SizedBox(width: 3.w),

        // Spot Payout (Emerald / Mint Green)
        Expanded(
          child: Material(
            color: const Color(0xFF00C988),
            borderRadius: BorderRadius.circular(18),
            child: InkWell(
              onTap: () => widget.onNavigate(3),
              borderRadius: BorderRadius.circular(18),
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: 3.5.w,
                  vertical: 1.6.h,
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF00C988).withValues(alpha: 0.32),
                      blurRadius: 14,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.flash_on_rounded,
                      color: Colors.white,
                      size: 22,
                    ),
                    SizedBox(width: 2.w),
                    Expanded(
                      child: Text(
                        'Spot Payout',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 15.sp,
                        ),
                      ),
                    ),
                    const Icon(
                      Icons.chevron_right_rounded,
                      color: Colors.white,
                      size: 20,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // 5. Active Queue & Tasks Section
  Widget _buildActiveQueueSection(List<PartnerOrder> orders) {
    // Only orders that are NOT completed and NOT cancelled belong in the active queue!
    final activeOrders = orders
        .where((o) => o.status != 'completed' && o.status != 'cancelled')
        .toList();

    if (activeOrders.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 4,
                height: 18,
                decoration: BoxDecoration(
                  color: const Color(0xFF1E5BF8),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              SizedBox(width: 2.w),
              Text(
                'Active Queue & Tasks',
                style: TextStyle(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF0F172A),
                ),
              ),
            ],
          ),
          SizedBox(height: 1.2.h),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.5.h),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: const BoxDecoration(
                    color: Color(0xFFF1F5F9),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.task_alt_rounded,
                    size: 26,
                    color: Color(0xFF64748B),
                  ),
                ),
                SizedBox(width: 3.5.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'All Tasks Complete',
                        style: TextStyle(
                          fontSize: 15.sp,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      SizedBox(height: 0.3.h),
                      Text(
                        'No pending orders in active queue. New customer requests will appear here.',
                        style: TextStyle(
                          fontSize: 13.sp,
                          color: const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  width: 4,
                  height: 18,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E5BF8),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                SizedBox(width: 2.w),
                Text(
                  'Active Queue & Tasks',
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            TextButton(
              onPressed: () => widget.onNavigate(1),
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Active (${activeOrders.length})',
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF1E5BF8),
                    ),
                  ),
                  SizedBox(width: 1.w),
                  const Icon(
                    Icons.arrow_forward_rounded,
                    color: Color(0xFF1E5BF8),
                    size: 16,
                  ),
                ],
              ),
            ),
          ],
        ),
        SizedBox(height: 1.2.h),

        // Active Order Cards
        ...activeOrders.take(3).map((activeOrder) {
          return Padding(
            padding: EdgeInsets.only(bottom: 1.2.h),
            child: Material(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              child: InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => PartnerOrderDetailScreen(
                        order: activeOrder,
                        onOrderUpdated: widget.onRefresh,
                      ),
                    ),
                  );
                },
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding: EdgeInsets.all(3.8.w),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Phone Thumbnail Illustration
                      Container(
                        width: 54,
                        height: 72,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFCBD5E1)),
                        ),
                        child: Center(
                          child: Container(
                            width: 44,
                            height: 62,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(8),
                              gradient: const LinearGradient(
                                colors: [Color(0xFFF472B6), Color(0xFFC084FC)],
                                begin: Alignment.topRight,
                                end: Alignment.bottomLeft,
                              ),
                              border: Border.all(
                                color: const Color(0xFF0F172A),
                                width: 1.5,
                              ),
                            ),
                            child: Align(
                              alignment: Alignment.topCenter,
                              child: Container(
                                margin: const EdgeInsets.only(top: 2),
                                width: 14,
                                height: 3,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F172A),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      SizedBox(width: 3.5.w),

                      // Order Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    activeOrder.deviceName,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15.sp,
                                      color: const Color(0xFF0F172A),
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Container(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: 2.2.w,
                                    vertical: 0.4.h,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEEF2FF),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    activeOrder.statusDisplay.toUpperCase(),
                                    style: TextStyle(
                                      color: const Color(0xFF6366F1),
                                      fontSize: 14.sp,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 0.4.h),
                            Text(
                              'Cust: ${activeOrder.customerName} • ${activeOrder.orderNumber.length > 14 ? "${activeOrder.orderNumber.substring(0, 14)}..." : activeOrder.orderNumber}',
                              style: TextStyle(
                                color: const Color(0xFF64748B),
                                fontSize: 14.sp,
                                fontWeight: FontWeight.w500,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            SizedBox(height: 0.6.h),
                            RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: 'Valuation: ',
                                    style: TextStyle(
                                      color: const Color(0xFF1E5BF8),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15.sp,
                                    ),
                                  ),
                                  TextSpan(
                                    text: CurrencyFormatter.format(
                                      activeOrder.finalPrice > 0 ? activeOrder.finalPrice : activeOrder.quotedPrice,
                                    ),
                                    style: TextStyle(
                                      color: const Color(0xFF1E5BF8),
                                      fontWeight: FontWeight.w900,
                                      fontSize: 15.sp,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Right Chevron
                      const Icon(
                        Icons.chevron_right_rounded,
                        color: Color(0xFF94A3B8),
                        size: 20,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  // 6. Store Operations Hub 2x2 Grid
  Widget _buildStoreOperationsHubSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header
        Row(
          children: [
            Container(
              width: 4,
              height: 18,
              decoration: BoxDecoration(
                color: const Color(0xFF1E5BF8),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            SizedBox(width: 2.w),
            Text(
              'Store Operations Hub',
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.w800,
                color: const Color(0xFF0F172A),
              ),
            ),
          ],
        ),
        SizedBox(height: 1.5.h),

        // 2x2 Cards Grid
        Row(
          children: [
            // Card 1: Delivery Fleet & Riders
            Expanded(
              child: _buildHubCard(
                icon: Icons.two_wheeler_rounded,
                iconBg: const Color(0xFFD1FAE5),
                iconColor: const Color(0xFF0D9488),
                title: 'Delivery Fleet\n& Riders',
                badgeText: 'LIVE FLEET',
                badgeBg: const Color(0xFFD1FAE5),
                badgeColor: const Color(0xFF059669),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PartnerRidersScreen()),
                ),
              ),
            ),
            SizedBox(width: 3.w),

            // Card 2: Customer Directory
            Expanded(
              child: _buildHubCard(
                icon: Icons.people_alt_rounded,
                iconBg: const Color(0xFFEDE9FE),
                iconColor: const Color(0xFF6366F1),
                title: 'Customer\nDirectory',
                badgeText: 'PORTFOLIO',
                badgeBg: const Color(0xFFEDE9FE),
                badgeColor: const Color(0xFF6366F1),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => PartnerCustomersScreen(orders: widget.orders),
                  ),
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 1.5.h),

        Row(
          children: [
            // Card 3: Inspection & QA
            Expanded(
              child: _buildHubCard(
                icon: Icons.fact_check_rounded,
                iconBg: const Color(0xFFFFEDD5),
                iconColor: const Color(0xFFEA580C),
                title: 'Inspection\n& QA',
                badgeText: '45-POINT QA',
                badgeBg: const Color(0xFFFFEDD5),
                badgeColor: const Color(0xFFEA580C),
                onTap: () => widget.onNavigate(2),
              ),
            ),
            SizedBox(width: 3.w),

            // Card 4: Payouts & Settlements
            Expanded(
              child: _buildHubCard(
                icon: Icons.account_balance_wallet_rounded,
                iconBg: const Color(0xFFFFE4E6),
                iconColor: const Color(0xFFE11D48),
                title: 'Payouts &\nSettlements',
                badgeText: 'INSTANT',
                badgeBg: const Color(0xFFFFE4E6),
                badgeColor: const Color(0xFFE11D48),
                onTap: () => widget.onNavigate(3),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildHubCard({
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String title,
    required String badgeText,
    required Color badgeBg,
    required Color badgeColor,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: EdgeInsets.all(3.5.w),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top row: Icon container and Right Chevron
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: iconBg,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(icon, color: iconColor, size: 22),
                  ),
                  const Icon(
                    Icons.chevron_right_rounded,
                    color: Color(0xFF94A3B8),
                    size: 18,
                  ),
                ],
              ),
              SizedBox(height: 1.2.h),

              // Title (2 lines max)
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14.5.sp,
                  color: const Color(0xFF0F172A),
                  height: 1.2,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              SizedBox(height: 1.h),

              // Badge Pill
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: 2.2.w,
                  vertical: 0.35.h,
                ),
                decoration: BoxDecoration(
                  color: badgeBg,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  badgeText,
                  style: TextStyle(
                    color: badgeColor,
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Custom painter for the smooth waves at the bottom of the two metric cards
class _MiniWavePainter extends CustomPainter {
  final Color lineColor;
  final Color fillColor;

  const _MiniWavePainter({
    required this.lineColor,
    required this.fillColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path();
    path.moveTo(0, size.height * 0.7);
    path.cubicTo(
      size.width * 0.25,
      size.height * 0.4,
      size.width * 0.45,
      size.height * 0.9,
      size.width * 0.7,
      size.height * 0.5,
    );
    path.cubicTo(
      size.width * 0.85,
      size.height * 0.2,
      size.width * 0.95,
      size.height * 0.35,
      size.width,
      size.height * 0.4,
    );

    // Fill underneath the wave
    final fillPath = Path.from(path);
    fillPath.lineTo(size.width, size.height);
    fillPath.lineTo(0, size.height);
    fillPath.close();

    final fillPaint = Paint()
      ..shader = LinearGradient(
        colors: [
          fillColor.withValues(alpha: 0.28),
          fillColor.withValues(alpha: 0.0),
        ],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height))
      ..style = PaintingStyle.fill;
    canvas.drawPath(fillPath, fillPaint);

    // Wave stroke line
    final linePaint = Paint()
      ..color = lineColor
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    canvas.drawPath(path, linePaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
