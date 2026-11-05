import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/services/delivery_socket_service.dart';
import '../../core/services/session_service.dart';
import '../../models/delivery_models.dart';
import '../dashboard/delivery_dashboard_screen.dart';
import '../earnings/bloc/earnings_cubit.dart';
import '../earnings/delivery_earnings_screen.dart';
import '../profile/bloc/profile_cubit.dart';
import '../profile/bloc/profile_state.dart';
import '../profile/delivery_profile_screen.dart';
import '../tasks/bloc/tasks_cubit.dart';
import '../tasks/delivery_tasks_screen.dart';
import '../tasks/widgets/delivery_task_popup_dialog.dart';
import 'bloc/navigation_cubit.dart';

class DeliveryMainNavigationScreen extends StatelessWidget {
  const DeliveryMainNavigationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => NavigationCubit()),
        BlocProvider(create: (_) => TasksCubit()..loadTasks()),
        BlocProvider(create: (_) => EarningsCubit()..loadEarnings()),
        BlocProvider(create: (_) => ProfileCubit()..loadProfile()),
      ],
      child: const _DeliveryMainNavigationView(),
    );
  }
}

class _DeliveryMainNavigationView extends StatefulWidget {
  const _DeliveryMainNavigationView();

  @override
  State<_DeliveryMainNavigationView> createState() => _DeliveryMainNavigationViewState();
}

class _DeliveryMainNavigationViewState extends State<_DeliveryMainNavigationView> {
  StreamSubscription<DeliveryTask>? _socketSub;
  final Set<String> _shownTaskIds = <String>{};
  bool _isPopupShowing = false;

  @override
  void initState() {
    super.initState();
    // Connect to real-time socket stream for instant new pickup assignment alerts
    final agentId = SessionService.currentUser?.id;
    if (agentId != null && agentId.isNotEmpty) {
      DeliverySocketService.instance.connect(agentId);
      _socketSub = DeliverySocketService.instance.onNewTask.listen((task) {
        if (mounted) {
          _showPopupForTask(task);
          context.read<TasksCubit>().loadTasks();
          context.read<EarningsCubit>().loadEarnings();
        }
      });
    }
  }

  @override
  void dispose() {
    _socketSub?.cancel();
    DeliverySocketService.instance.disconnect();
    super.dispose();
  }

  void _showPopupForTask(DeliveryTask task) {
    if (_isPopupShowing || _shownTaskIds.contains(task.id)) return;
    _shownTaskIds.add(task.id);
    _isPopupShowing = true;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      DeliveryTaskPopupDialog.show(
        context: context,
        task: task,
        onAccept: () async {
          final success = await context.read<TasksCubit>().updateTaskStatus(
            orderId: task.id,
            status: 'accepted',
          );
          _isPopupShowing = false;
          return success;
        },
        onDismiss: () {
          _isPopupShowing = false;
        },
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = context.watch<NavigationCubit>().state;

    return Scaffold(
      appBar: currentIndex == 0
          ? null
          : AppBar(
              backgroundColor: Colors.white,
              elevation: 0,
              surfaceTintColor: Colors.transparent,
              title: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(color: const Color(0xFFFF5722), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.two_wheeler_rounded, size: 18, color: Colors.white),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    currentIndex == 1 ? 'MY TASKS' : (currentIndex == 2 ? 'EARNINGS' : 'RIDER PROFILE'),
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF0F172A)),
                  ),
                ],
              ),
              actions: [
                BlocBuilder<ProfileCubit, ProfileState>(
                  builder: (context, state) {
                    final isOnline = state is ProfileLoaded ? state.isOnline : true;
                    return GestureDetector(
                      onTap: () => context.read<ProfileCubit>().toggleShiftStatus(),
                      child: Container(
                        margin: const EdgeInsets.only(right: 16),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: isOnline ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: isOnline ? const Color(0xFF86EFAC) : const Color(0xFFFCA5A5)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 7, height: 7,
                              decoration: BoxDecoration(color: isOnline ? const Color(0xFF16A34A) : Colors.red, shape: BoxShape.circle),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              isOnline ? 'ON DUTY' : 'OFFLINE',
                              style: TextStyle(color: isOnline ? const Color(0xFF16A34A) : Colors.red, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
      body: IndexedStack(
        index: currentIndex,
        children: const [
          DeliveryDashboardScreen(),
          DeliveryTasksScreen(),
          DeliveryEarningsScreen(),
          DeliveryProfileScreen(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: const Color(0xFFE2E8F0), width: 0.8)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: currentIndex,
          onDestinationSelected: (idx) => context.read<NavigationCubit>().setTab(idx),
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.transparent,
          indicatorColor: const Color(0xFFFFEDD5),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined, color: Color(0xFF64748B)),
              selectedIcon: Icon(Icons.home_rounded, color: Color(0xFFEA580C)),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(Icons.assignment_outlined, color: Color(0xFF64748B)),
              selectedIcon: Icon(Icons.assignment_rounded, color: Color(0xFFEA580C)),
              label: 'Tasks',
            ),
            NavigationDestination(
              icon: Icon(Icons.bar_chart_rounded, color: Color(0xFF64748B)),
              selectedIcon: Icon(Icons.bar_chart_rounded, color: Color(0xFFEA580C)),
              label: 'Earnings',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded, color: Color(0xFF64748B)),
              selectedIcon: Icon(Icons.person_rounded, color: Color(0xFFEA580C)),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
