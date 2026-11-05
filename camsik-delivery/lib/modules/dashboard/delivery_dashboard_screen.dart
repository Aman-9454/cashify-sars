import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sizer/sizer.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/delivery_models.dart';
import '../navigation/bloc/navigation_cubit.dart';
import '../profile/bloc/profile_cubit.dart';
import '../profile/bloc/profile_state.dart';
import '../tasks/bloc/tasks_cubit.dart';
import '../tasks/bloc/tasks_state.dart';
import '../tasks/screens/delivery_order_detail_screen.dart';

class DeliveryDashboardScreen extends StatefulWidget {
  const DeliveryDashboardScreen({super.key});

  @override
  State<DeliveryDashboardScreen> createState() => _DeliveryDashboardScreenState();
}

class _DeliveryDashboardScreenState extends State<DeliveryDashboardScreen> {
  int _selectedScheduleTab = 0; // 0: Today, 1: Tomorrow, 2: Completed

  int _parseTimeSlot(String? slot) {
    if (slot == null || slot.isEmpty) return 999;
    final s = slot.toLowerCase();
    final regExp = RegExp(r'(\d+)(?::(\d+))?\s*(am|pm)?');
    final match = regExp.firstMatch(s);
    if (match == null) return 999;
    int hours = int.tryParse(match.group(1) ?? '0') ?? 0;
    final minutes = int.tryParse(match.group(2) ?? '0') ?? 0;
    final meridiem = match.group(3) ?? (s.contains('pm') ? 'pm' : 'am');
    if (meridiem == 'pm' && hours < 12) hours += 12;
    if (meridiem == 'am' && hours == 12) hours = 0;
    return hours * 60 + minutes;
  }

  bool _isTomorrow(String? dateStr) {
    if (dateStr == null) return false;
    final lower = dateStr.toLowerCase();
    return lower.contains('tomorrow');
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning, Rider!';
    if (hour < 17) return 'Good Afternoon, Rider!';
    return 'Good Evening, Rider!';
  }

  String _getFormattedDate() {
    final now = DateTime.now();
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${weekdays[now.weekday - 1]}, ${now.day} ${months[now.month - 1]}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: BlocBuilder<TasksCubit, TasksState>(
          builder: (context, state) {
            final tasksCubit = context.read<TasksCubit>();
            final isLoading = state is TasksLoading;
            final tasks = state is TasksLoaded ? state.allTasks : <DeliveryTask>[];
            final profileState = context.watch<ProfileCubit>().state;
            final isOnline = profileState is ProfileLoaded ? profileState.isOnline : true;

            if (isLoading && tasks.isEmpty) {
              return const Center(child: CircularProgressIndicator(color: Color(0xFFFF5722)));
            }

            final pickups = tasks.where((t) => t.isPickup).length;
            final deliveries = tasks.where((t) => !t.isPickup).length;
            final completed = tasks.where((t) => t.status == 'completed' || t.status == 'paid').length;
            final pending = tasks.length - completed;
            final estimatedFee = (completed * 250.0);

            final completedTasks = tasks.where((t) => t.status == 'completed' || t.status == 'paid').toList();
            final activeTasks = tasks.where((t) => t.status != 'completed' && t.status != 'paid').toList();

            final todayTasks = activeTasks
                .where((t) => !_isTomorrow(t.pickupDate))
                .toList()
              ..sort((a, b) => _parseTimeSlot(a.pickupSlot).compareTo(_parseTimeSlot(b.pickupSlot)));

            final tomorrowTasks = activeTasks
                .where((t) => _isTomorrow(t.pickupDate))
                .toList()
              ..sort((a, b) => _parseTimeSlot(a.pickupSlot).compareTo(_parseTimeSlot(b.pickupSlot)));

            final currentScheduleList = _selectedScheduleTab == 0
                ? todayTasks
                : (_selectedScheduleTab == 1 ? tomorrowTasks : completedTasks);

            return RefreshIndicator(
              color: const Color(0xFFFF5722),
              onRefresh: () async {
                await tasksCubit.loadTasks();
                if (context.mounted) context.read<ProfileCubit>().loadProfile();
              },
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                children: [
                  _buildTopBar(context, isOnline: isOnline),
                  const SizedBox(height: 18),
                  _buildGreetingHeader(),
                  const SizedBox(height: 16),
                  _buildTripEarningsBanner(
                    context,
                    estimatedFee: estimatedFee,
                    completedCount: completed,
                    totalAssigned: tasks.length,
                    isOnline: isOnline,
                  ),
                  const SizedBox(height: 16),
                  _buildKpiCardsRow(
                    pickups: pickups,
                    deliveries: deliveries,
                    distanceKm: (completed * 4.2).toStringAsFixed(0),
                  ),
                  const SizedBox(height: 16),
                  _buildQuickActionGrid(context),
                  const SizedBox(height: 18),
                  _buildPrimaryRouteButton(context, pendingCount: pending),
                  const SizedBox(height: 22),

                  // Scheduled Pickups Header & Tabs
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Pickup Routing & Schedule", style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A))),
                      InkWell(
                        onTap: () => context.read<NavigationCubit>().setTab(1),
                        child: Row(
                          children: [
                            Text('View All (${tasks.length})', style: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.bold, color: const Color(0xFF2563EB))),
                            const SizedBox(width: 4),
                            const Icon(Icons.arrow_forward_rounded, size: 14, color: Color(0xFF2563EB)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Schedule Filter Chips
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () => setState(() => _selectedScheduleTab = 0),
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _selectedScheduleTab == 0 ? const Color(0xFFFF5722) : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(
                                  "Today (${todayTasks.length})",
                                  style: TextStyle(
                                    fontSize: 13.sp,
                                    fontWeight: FontWeight.w800,
                                    color: _selectedScheduleTab == 0 ? Colors.white : const Color(0xFF64748B),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: InkWell(
                            onTap: () => setState(() => _selectedScheduleTab = 1),
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _selectedScheduleTab == 1 ? const Color(0xFF2563EB) : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(
                                  "Tomorrow (${tomorrowTasks.length})",
                                  style: TextStyle(
                                    fontSize: 13.sp,
                                    fontWeight: FontWeight.w800,
                                    color: _selectedScheduleTab == 1 ? Colors.white : const Color(0xFF64748B),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: InkWell(
                            onTap: () => setState(() => _selectedScheduleTab = 2),
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _selectedScheduleTab == 2 ? const Color(0xFF16A34A) : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(
                                  "Completed (${completedTasks.length})",
                                  style: TextStyle(
                                    fontSize: 13.sp,
                                    fontWeight: FontWeight.w800,
                                    color: _selectedScheduleTab == 2 ? Colors.white : const Color(0xFF64748B),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  if (currentScheduleList.isEmpty)
                    _buildEmptyRunsPlaceholder()
                  else
                    ...currentScheduleList.asMap().entries.map(
                          (entry) => _buildOrderRunCard(
                            context,
                            task: entry.value,
                            tasksCubit: tasksCubit,
                            stopIndex: entry.key,
                          ),
                        ),
                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildTopBar(BuildContext context, {required bool isOnline}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(
            color: const Color(0xFFFF5722),
            borderRadius: BorderRadius.circular(14),
            boxShadow: [BoxShadow(color: const Color(0xFFFF5722).withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 3))],
          ),
          child: const Center(child: Icon(Icons.two_wheeler_rounded, color: Colors.white, size: 26)),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('CAMSIK FLEET', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16.sp, letterSpacing: 0.5, color: const Color(0xFF0F172A))),
            Text('Rider Dashboard', style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B), fontWeight: FontWeight.w500)),
          ],
        ),
        const Spacer(),
        GestureDetector(
          onTap: () => context.read<ProfileCubit>().toggleShiftStatus(),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: isOnline ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isOnline ? const Color(0xFF86EFAC) : const Color(0xFFFCA5A5), width: 1),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(width: 7, height: 7, decoration: BoxDecoration(color: isOnline ? const Color(0xFF16A34A) : Colors.red, shape: BoxShape.circle)),
                const SizedBox(width: 6),
                Text(isOnline ? 'ON DUTY' : 'OFFLINE', style: TextStyle(color: isOnline ? const Color(0xFF16A34A) : Colors.red, fontSize: 14.sp, fontWeight: FontWeight.w800)),
              ],
            ),
          ),
        ),
        const SizedBox(width: 10),
        Stack(
          clipBehavior: Clip.none,
          children: [
            InkWell(
              onTap: () => _showNotificationSheet(context),
              borderRadius: BorderRadius.circular(20),
              child: Container(
                width: 38, height: 38,
                decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, border: Border.all(color: const Color(0xFFE2E8F0))),
                child: const Center(child: Icon(Icons.notifications_none_rounded, size: 22, color: Color(0xFF0F172A))),
              ),
            ),
            Positioned(
              top: 6, right: 6,
              child: Container(
                width: 8, height: 8,
                decoration: BoxDecoration(color: const Color(0xFFEF4444), shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 1.5)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildGreetingHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(_getGreeting(), style: TextStyle(fontWeight: FontWeight.w900, fontSize: 17.sp, color: const Color(0xFF0F172A))),
                  const SizedBox(width: 4),
                  const Text('👋', style: TextStyle(fontSize: 18)),
                ],
              ),
              const SizedBox(height: 2),
              Text("Let's complete your deliveries today", style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B), fontWeight: FontWeight.w500)),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(16)),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.calendar_month_outlined, size: 15, color: Color(0xFF334155)),
              const SizedBox(width: 5),
              Text(_getFormattedDate(), style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: const Color(0xFF334155))),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTripEarningsBanner(
    BuildContext context, {
    required double estimatedFee,
    required int completedCount,
    required int totalAssigned,
    required bool isOnline,
  }) {
    return Container(
      height: 154,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFFFF7ED), Color(0xFFFFEDD5)],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFFED7AA), width: 1.2),
        boxShadow: [BoxShadow(color: const Color(0xFFEA580C).withValues(alpha: 0.06), blurRadius: 16, offset: const Offset(0, 6))],
      ),
      child: Stack(
        children: [
          Positioned(right: 0, bottom: 0, top: 15, width: 170, child: _buildScooterIllustration()),
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                InkWell(
                  onTap: () => context.read<NavigationCubit>().setTab(2),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text("Today's Trip Earnings", style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: const Color(0xFF78350F))),
                      const SizedBox(width: 3),
                      const Icon(Icons.chevron_right_rounded, size: 18, color: Color(0xFF78350F)),
                    ],
                  ),
                ),
                Text(
                  CurrencyFormatter.format(estimatedFee),
                  style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A), height: 1.1),
                ),
                Text(
                  '$completedCount Trips Completed • $totalAssigned Total Assigned',
                  style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B), fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
          Positioned(
            top: 14, right: 14,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFFDE68A))),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(width: 6, height: 6, decoration: BoxDecoration(color: isOnline ? const Color(0xFF16A34A) : Colors.grey, shape: BoxShape.circle)),
                  const SizedBox(width: 5),
                  Text(isOnline ? 'Active on Roads' : 'Offline', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: const Color(0xFF92400E))),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScooterIllustration() {
    return CustomPaint(
      painter: _DeliveryScooterPainter(),
      child: const SizedBox.expand(),
    );
  }

  Widget _buildKpiCardsRow({
    required int pickups,
    required int deliveries,
    required String distanceKm,
  }) {
    return Row(
      children: [
        Expanded(child: _buildKpiCard(icon: Icons.inventory_2_outlined, iconColor: const Color(0xFFF97316), iconBg: const Color(0xFFFFF7ED), label: 'Pickups', value: '$pickups')),
        const SizedBox(width: 10),
        Expanded(child: _buildKpiCard(icon: Icons.local_shipping_outlined, iconColor: const Color(0xFF2563EB), iconBg: const Color(0xFFEFF6FF), label: 'Deliveries', value: '$deliveries')),
        const SizedBox(width: 10),
        Expanded(child: _buildKpiCard(icon: Icons.alt_route_rounded, iconColor: const Color(0xFFE11D48), iconBg: const Color(0xFFFFF1F2), label: 'Distance', value: '$distanceKm km')),
      ],
    );
  }

  Widget _buildKpiCard({required IconData icon, required Color iconColor, required Color iconBg, required String label, required String value}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), border: Border.all(color: const Color(0xFFF1F5F9), width: 1.2), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(width: 36, height: 36, decoration: BoxDecoration(color: iconBg, borderRadius: BorderRadius.circular(10)), child: Center(child: Icon(icon, color: iconColor, size: 20))),
          const SizedBox(height: 10),
          Text(label, style: TextStyle(color: const Color(0xFF64748B), fontSize: 14.sp, fontWeight: FontWeight.w500)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(color: const Color(0xFF0F172A), fontSize: 18.sp, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }

  Widget _buildQuickActionGrid(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _buildQuickActionItem(icon: Icons.map_outlined, iconColor: const Color(0xFF0F172A), label: 'My Route', onTap: () => context.read<NavigationCubit>().setTab(1))),
        const SizedBox(width: 10),
        Expanded(child: _buildQuickActionItem(icon: Icons.qr_code_scanner_rounded, iconColor: const Color(0xFFEA580C), label: 'Scan Order', onTap: () => _showScanOrderSheet(context))),
        const SizedBox(width: 10),
        Expanded(child: _buildQuickActionItem(icon: Icons.headset_mic_outlined, iconColor: const Color(0xFF0F172A), label: 'Support', onTap: () => _showSupportHotline(context))),
        const SizedBox(width: 10),
        Expanded(child: _buildQuickActionItem(icon: Icons.more_horiz_rounded, iconColor: const Color(0xFF0F172A), label: 'More', onTap: () => context.read<NavigationCubit>().setTab(3))),
      ],
    );
  }

  Widget _buildQuickActionItem({required IconData icon, required Color iconColor, required String label, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFF1F5F9), width: 1.2), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2))]),
        child: Column(
          children: [
            Icon(icon, color: iconColor, size: 22),
            const SizedBox(height: 6),
            Text(label, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w700, color: const Color(0xFF1E293B))),
          ],
        ),
      ),
    );
  }

  Widget _buildPrimaryRouteButton(BuildContext context, {required int pendingCount}) {
    return InkWell(
      onTap: () => context.read<NavigationCubit>().setTab(1),
      borderRadius: BorderRadius.circular(18),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 15),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [Color(0xFFFF5722), Color(0xFFF97316)]),
          borderRadius: BorderRadius.circular(18),
          boxShadow: [BoxShadow(color: const Color(0xFFFF5722).withValues(alpha: 0.35), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Row(
          children: [
            Transform.rotate(angle: 0.7, child: const Icon(Icons.navigation_rounded, color: Colors.white, size: 20)),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Open Active Route ($pendingCount Pending)',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15.sp),
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: Colors.white, size: 22),
          ],
        ),
      ),
    );
  }

  Widget _buildAssignedRunsHeader(BuildContext context, {required int totalRuns}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text("Assigned Today's Runs", style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A))),
        InkWell(
          onTap: () => context.read<NavigationCubit>().setTab(1),
          child: Row(
            children: [
              Text('View All ($totalRuns)', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: const Color(0xFF2563EB))),
              const SizedBox(width: 4),
              const Icon(Icons.arrow_forward_rounded, size: 14, color: Color(0xFF2563EB)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyRunsPlaceholder() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFF1F5F9))),
      child: Center(
        child: Text('No runs assigned currently. Stay online to receive pickups.', style: TextStyle(color: Colors.black45, fontSize: 14.sp)),
      ),
    );
  }

  Widget _buildOrderRunCard(
    BuildContext context, {
    required DeliveryTask task,
    required TasksCubit tasksCubit,
    int? stopIndex,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9), width: 1.2),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: InkWell(
        onTap: () => DeliveryOrderDetailScreen.navigateTo(
          context: context,
          task: task,
          tasksCubit: tasksCubit,
          onRefresh: () => tasksCubit.loadTasks(),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Container(
                width: 48, height: 56,
                color: const Color(0xFFF8FAFC),
                child: _buildDeviceThumbnail(task),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            if (stopIndex != null && _selectedScheduleTab == 0)
                              Container(
                                margin: const EdgeInsets.only(right: 6),
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F172A),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  'Stop #${stopIndex + 1}',
                                  style: TextStyle(color: Colors.white, fontSize: 10.sp, fontWeight: FontWeight.w900),
                                ),
                              ),
                            Expanded(
                              child: Text(
                                task.deviceName,
                                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14.sp, color: const Color(0xFF0F172A)),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 6),
                      _buildStatusPill(task.statusDisplay),
                    ],
                  ),
                  if (task.pickupSlot.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.access_time_rounded, size: 13, color: Color(0xFF2563EB)),
                        const SizedBox(width: 4),
                        Text(
                          task.pickupSlot,
                          style: TextStyle(fontSize: 12.sp, color: const Color(0xFF2563EB), fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 4),
                  Row(children: [
                    const Icon(Icons.location_on, size: 14, color: Color(0xFFEA580C)),
                    const SizedBox(width: 4),
                    Text(task.taskTypeDisplay, style: TextStyle(fontSize: 14.sp, color: const Color(0xFF475569), fontWeight: FontWeight.w600)),
                  ]),
                  const SizedBox(height: 2),
                  Row(children: [
                    const Icon(Icons.person_outline_rounded, size: 14, color: Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Expanded(child: Text(task.customerName, style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B)), maxLines: 1, overflow: TextOverflow.ellipsis)),
                  ]),
                  const SizedBox(height: 2),
                  Row(children: [
                    const Icon(Icons.home_outlined, size: 14, color: Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Expanded(child: Text('${task.customerAddress}, ${task.city}', style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B)), maxLines: 1, overflow: TextOverflow.ellipsis)),
                  ]),
                ],
              ),
            ),
            const SizedBox(width: 4),
            const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8), size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusPill(String status) {
    Color bg = const Color(0xFFEFF6FF);
    Color text = const Color(0xFF2563EB);

    final s = status.toLowerCase();
    if (s.contains('created') || s.contains('assigned')) {
      bg = const Color(0xFFF1F5F9);
      text = const Color(0xFF475569);
    } else if (s.contains('completed') || s.contains('paid')) {
      bg = const Color(0xFFDCFCE7);
      text = const Color(0xFF16A34A);
    } else if (s.contains('route') || s.contains('scheduled')) {
      bg = const Color(0xFFEFF6FF);
      text = const Color(0xFF2563EB);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
      child: Text(status, style: TextStyle(color: text, fontSize: 14.sp, fontWeight: FontWeight.bold)),
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
      case DeviceCategory.camera:
        icon = Icons.camera_alt_outlined; color = const Color(0xFF2563EB); break;
      case DeviceCategory.lens:
        icon = Icons.camera_rounded; color = const Color(0xFF0D9488); break;
      case DeviceCategory.laptop:
        icon = Icons.laptop_mac_rounded; color = const Color(0xFF4F46E5); break;
      case DeviceCategory.tablet:
        icon = Icons.tablet_mac_rounded; color = const Color(0xFF7C3AED); break;
      case DeviceCategory.smartwatch:
        icon = Icons.watch_rounded; color = const Color(0xFFE11D48); break;
      case DeviceCategory.smartphone:
        icon = Icons.phone_iphone_rounded; color = const Color(0xFFEA580C); break;
    }

    return Center(child: Icon(icon, color: color, size: 28));
  }

  void _showScanOrderSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 18),
            const Icon(Icons.qr_code_scanner_rounded, size: 50, color: Color(0xFFEA580C)),
            const SizedBox(height: 10),
            Text('Scan Consignment Barcode', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.sp)),
            const SizedBox(height: 4),
            Text('Align camera over order QR code or consignment slip to quickly verify.', textAlign: TextAlign.center, style: TextStyle(color: Colors.black54, fontSize: 14.sp)),
            const SizedBox(height: 18),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEA580C), foregroundColor: Colors.white, minimumSize: const Size(double.infinity, 44), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: () => Navigator.pop(context),
              child: Text('Close Scanner', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  void _showSupportHotline(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 18),
            const Icon(Icons.headset_mic_rounded, size: 50, color: Color(0xFF2563EB)),
            const SizedBox(height: 10),
            Text('Rider Fleet Support', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.sp)),
            const SizedBox(height: 4),
            Text('Central Support Desk: +91 98765 43210\nAvailable 8:00 AM – 9:00 PM', textAlign: TextAlign.center, style: TextStyle(color: Colors.black54, fontSize: 14.sp)),
            const SizedBox(height: 18),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2563EB), foregroundColor: Colors.white, minimumSize: const Size(double.infinity, 44), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: () => Navigator.pop(context),
              child: Text('OK', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  void _showNotificationSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 18),
            const Icon(Icons.notifications_active_rounded, size: 46, color: Color(0xFFFF5722)),
            const SizedBox(height: 10),
            Text('Fleet Notifications', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.sp)),
            const SizedBox(height: 4),
            Text('You are on duty! Route optimization active for today\'s scheduled pickups.', textAlign: TextAlign.center, style: TextStyle(color: Colors.black54, fontSize: 14.sp)),
            const SizedBox(height: 18),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF5722), foregroundColor: Colors.white, minimumSize: const Size(double.infinity, 44), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: () => Navigator.pop(context),
              child: Text('Got It', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

class _DeliveryScooterPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // Faint sun/glow circle & city skyline silhouette behind rider
    canvas.drawCircle(Offset(w * 0.72, h * 0.42), 48, Paint()..color = const Color(0xFFFFEDD5).withValues(alpha: 0.9));
    final cityPath = Path()
      ..moveTo(w * 0.05, h * 0.85)..lineTo(w * 0.05, h * 0.45)..lineTo(w * 0.20, h * 0.45)..lineTo(w * 0.20, h * 0.30)
      ..lineTo(w * 0.25, h * 0.30)..lineTo(w * 0.25, h * 0.50)..lineTo(w * 0.38, h * 0.50)..lineTo(w * 0.38, h * 0.38)
      ..lineTo(w * 0.45, h * 0.38)..lineTo(w * 0.45, h * 0.85)..close();
    canvas.drawPath(cityPath, Paint()..color = const Color(0xFFFED7AA).withValues(alpha: 0.35));

    // Ground shadow & wheels
    canvas.drawOval(Rect.fromCenter(center: Offset(w * 0.65, h * 0.88), width: 95, height: 16), Paint()..color = const Color(0xFFEA580C).withValues(alpha: 0.12));
    final tire = Paint()..color = const Color(0xFF1E293B);
    final rim = Paint()..color = const Color(0xFFCBD5E1);
    canvas.drawCircle(Offset(w * 0.42, h * 0.80), 13, tire);
    canvas.drawCircle(Offset(w * 0.42, h * 0.80), 6, rim);
    canvas.drawCircle(Offset(w * 0.85, h * 0.80), 13, tire);
    canvas.drawCircle(Offset(w * 0.85, h * 0.80), 6, rim);

    // Scooter chassis (Orange) & Box
    final chassis = Path()..moveTo(w * 0.38, h * 0.76)..lineTo(w * 0.55, h * 0.76)..lineTo(w * 0.68, h * 0.70)..lineTo(w * 0.78, h * 0.58)..lineTo(w * 0.86, h * 0.68)..lineTo(w * 0.82, h * 0.78)..lineTo(w * 0.65, h * 0.78)..lineTo(w * 0.45, h * 0.78)..close();
    canvas.drawPath(chassis, Paint()..color = const Color(0xFFFF5722));
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(w * 0.32, h * 0.50, 26, 26), const Radius.circular(5)), Paint()..color = const Color(0xFFEA580C));
    canvas.drawRect(Rect.fromLTWH(w * 0.35, h * 0.60, 20, 4), Paint()..color = Colors.white.withValues(alpha: 0.4));

    // Rider Jacket & Pants
    final body = Path()..moveTo(w * 0.52, h * 0.68)..lineTo(w * 0.62, h * 0.50)..lineTo(w * 0.70, h * 0.55)..lineTo(w * 0.65, h * 0.72)..close();
    canvas.drawPath(body, Paint()..color = const Color(0xFFF97316));
    final pants = Path()..moveTo(w * 0.58, h * 0.66)..lineTo(w * 0.70, h * 0.70)..lineTo(w * 0.68, h * 0.78)..lineTo(w * 0.55, h * 0.74)..close();
    canvas.drawPath(pants, Paint()..color = const Color(0xFF1E293B));

    // Helmet & Visor & Light
    canvas.drawCircle(Offset(w * 0.66, h * 0.40), 12, Paint()..color = const Color(0xFFFF5722));
    final visor = Path()..addArc(Rect.fromCircle(center: Offset(w * 0.68, h * 0.40), radius: 10), -0.5, 1.2);
    canvas.drawPath(visor, Paint()..color = const Color(0xFF0F172A));
    canvas.drawLine(Offset(w * 0.76, h * 0.60), Offset(w * 0.73, h * 0.48), Paint()..color = const Color(0xFF334155)..strokeWidth = 3..style = PaintingStyle.stroke);
    canvas.drawCircle(Offset(w * 0.86, h * 0.66), 4, Paint()..color = const Color(0xFFFDE047));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
