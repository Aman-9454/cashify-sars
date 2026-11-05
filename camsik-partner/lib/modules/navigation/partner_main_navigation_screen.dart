import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sizer/sizer.dart';
import '../../core/services/partner_socket_service.dart';
import '../../core/services/session_service.dart';
import '../../models/partner_models.dart';
import '../dashboard/partner_dashboard_screen.dart';
import '../inspection/partner_inspection_screen.dart';
import '../orders/bloc/orders_cubit.dart';
import '../orders/bloc/orders_state.dart';
import '../orders/partner_orders_screen.dart';
import '../orders/widgets/order_request_popup_dialog.dart';
import '../payouts/partner_payouts_screen.dart';
import '../profile/partner_profile_screen.dart';
import 'bloc/navigation_cubit.dart';

class PartnerMainNavigationScreen extends StatelessWidget {
  const PartnerMainNavigationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<NavigationCubit>(create: (_) => NavigationCubit(0)),
        BlocProvider<OrdersCubit>(create: (_) => OrdersCubit()..loadOrders()),
      ],
      child: const _MainNavigationContent(),
    );
  }
}

class _MainNavigationContent extends StatefulWidget {
  const _MainNavigationContent();

  @override
  State<_MainNavigationContent> createState() => _MainNavigationContentState();
}

class _MainNavigationContentState extends State<_MainNavigationContent> {
  StreamSubscription<PartnerOrder>? _socketSub;
  final Set<String> _shownOrderIds = <String>{};
  bool _isPopupShowing = false;

  @override
  void initState() {
    super.initState();
    // Connect to real-time socket stream for instant order notifications
    final partnerId = SessionService.currentUser?.id;
    if (partnerId != null && partnerId.isNotEmpty) {
      PartnerSocketService.instance.connect(partnerId);
      _socketSub = PartnerSocketService.instance.onNewOrder.listen((order) {
        if (mounted && order.status == 'assigned') {
          _showPopupForOrder(order);
          context.read<OrdersCubit>().loadOrders();
        }
      });
    }
  }

  @override
  void dispose() {
    _socketSub?.cancel();
    PartnerSocketService.instance.disconnect();
    super.dispose();
  }

  void _showPopupForOrder(PartnerOrder order) {
    if (_isPopupShowing || _shownOrderIds.contains(order.id)) return;
    _shownOrderIds.add(order.id);
    _isPopupShowing = true;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      OrderRequestPopupDialog.show(
        context: context,
        order: order,
        onAccept: () async {
          final success = await context.read<OrdersCubit>().updateOrderStatus(
            orderId: order.id,
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

  void _checkAndShowNewOrderPopup(List<PartnerOrder> orders) {
    if (_isPopupShowing) return;
    final pendingOrders = orders.where((o) => o.status == 'assigned').toList();
    if (pendingOrders.isEmpty) return;

    for (final order in pendingOrders) {
      if (!_shownOrderIds.contains(order.id)) {
        _showPopupForOrder(order);
        break;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = SessionService.currentUser;

    return BlocListener<OrdersCubit, OrdersState>(
      listener: (context, state) {
        if (state is OrdersLoaded) {
          _checkAndShowNewOrderPopup(state.allOrders);
        }
      },
      child: BlocBuilder<NavigationCubit, int>(
        builder: (context, currentIndex) {
          return Scaffold(
            backgroundColor: const Color(0xFFF8FAFC),
            appBar: currentIndex == 0
                ? null
                : AppBar(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF0F172A),
                    elevation: 0,
                    scrolledUnderElevation: 0,
                    titleSpacing: 4.w,
                    title: Text(
                      currentIndex == 1
                          ? 'Orders'
                          : currentIndex == 2
                              ? 'Inspection & QA'
                              : currentIndex == 3
                                  ? 'Payouts & Balance'
                                  : 'Store KYC & Profile',
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 16.sp,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                    actions: [
                      IconButton(
                        icon: const Icon(
                          Icons.refresh_rounded,
                          size: 22,
                          color: Color(0xFF1E293B),
                        ),
                        tooltip: 'Refresh Data',
                        onPressed: () => context.read<OrdersCubit>().loadOrders(),
                      ),
                      SizedBox(width: 2.w),
                    ],
                  ),
            body: BlocBuilder<OrdersCubit, OrdersState>(
              builder: (context, ordersState) {
                final orders = ordersState is OrdersLoaded
                    ? ordersState.orders
                    : <PartnerOrder>[];
                final loading = ordersState is OrdersLoading;

                return IndexedStack(
                  index: currentIndex,
                  children: [
                    PartnerDashboardScreen(
                      orders: orders,
                      user: user,
                      loading: loading,
                      onRefresh: () => context.read<OrdersCubit>().loadOrders(),
                      onNavigate: (idx) =>
                          context.read<NavigationCubit>().setTab(idx),
                    ),
                    PartnerOrdersScreen(
                      onRefresh: () => context.read<OrdersCubit>().loadOrders(),
                    ),
                    PartnerInspectionScreen(
                      orders: orders,
                      onOrderUpdated: () =>
                          context.read<OrdersCubit>().loadOrders(),
                    ),
                    PartnerPayoutsScreen(
                      orders: orders,
                      user: user,
                      onRefresh: () => context.read<OrdersCubit>().loadOrders(),
                    ),
                    PartnerProfileScreen(user: user),
                  ],
                );
              },
            ),
            bottomNavigationBar: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(
                  top: BorderSide(color: Color(0xFFF1F5F9), width: 1.2),
                ),
              ),
              child: NavigationBar(
                backgroundColor: Colors.white,
                selectedIndex: currentIndex,
                onDestinationSelected: (idx) =>
                    context.read<NavigationCubit>().setTab(idx),
                indicatorColor: const Color(0xFFDBEAFE),
                height: 66,
                labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
                destinations: const [
                  NavigationDestination(
                    icon: Icon(Icons.home_outlined),
                    selectedIcon: Icon(
                      Icons.home_rounded,
                      color: Color(0xFF1E5BF8),
                    ),
                    label: 'Dashboard',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.shopping_bag_outlined),
                    selectedIcon: Icon(
                      Icons.shopping_bag_rounded,
                      color: Color(0xFF1E5BF8),
                    ),
                    label: 'Orders',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.fact_check_outlined),
                    selectedIcon: Icon(
                      Icons.fact_check_rounded,
                      color: Color(0xFF1E5BF8),
                    ),
                    label: 'Inspection',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.account_balance_wallet_outlined),
                    selectedIcon: Icon(
                      Icons.account_balance_wallet_rounded,
                      color: Color(0xFF1E5BF8),
                    ),
                    label: 'Payouts',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.storefront_outlined),
                    selectedIcon: Icon(
                      Icons.storefront_rounded,
                      color: Color(0xFF1E5BF8),
                    ),
                    label: 'Store KYC',
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

