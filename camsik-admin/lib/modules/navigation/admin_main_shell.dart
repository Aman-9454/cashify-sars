import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/api_constants.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/session_service.dart';
import '../../models/admin_models.dart';
import '../catalog/admin_catalog_screen.dart';
import '../fleet/bloc/fleet_cubit.dart';
import '../operations/admin_operations_hub_screen.dart';
import '../operations/screens/admin_server_settings_screen.dart';
import '../orders/admin_orders_screen.dart';
import '../orders/bloc/orders_cubit.dart';
import '../overview/admin_overview_screen.dart';
import '../overview/bloc/overview_cubit.dart';
import '../partners/bloc/partners_cubit.dart';
import '../profile/admin_profile_screen.dart';
import '../profile/bloc/profile_cubit.dart';
import '../rentals/admin_rentals_screen.dart';
import 'bloc/navigation_cubit.dart';

class AdminMainShell extends StatelessWidget {
  final AdminUser? user;

  const AdminMainShell({super.key, this.user});

  @override
  Widget build(BuildContext context) {
    return _AdminMainShellView(user: user);
  }
}

class _AdminMainShellView extends StatelessWidget {
  final AdminUser? user;

  const _AdminMainShellView({this.user});

  String _getTitle(int index) {
    switch (index) {
      case 0:
        return 'Central Ecosystem Hub';
      case 1:
        return 'Orders Command Center';
      case 2:
        return 'Rental Cameras & Fleet';
      case 3:
        return 'Catalog & Pricing Engine';
      case 4:
        return 'Operations & Management Hub';
      default:
        return 'Camsik Admin Suite';
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = context.watch<NavigationCubit>().state;
    final adminUser = user ?? SessionService.currentUser;
    final serverShort = ApiConstants.serverUrl.replaceAll('http://', '').replaceAll('https://', '');

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.secondary,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              _getTitle(currentIndex),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  child: Text(
                    adminUser?.name ?? 'Admin',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                  ),
                ),
                const SizedBox(width: 4),
                const Text('•', style: TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                const SizedBox(width: 4),
                Flexible(
                  child: InkWell(
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminServerSettingsScreen()));
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.25),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.circle, size: 6, color: AppColors.success),
                          const SizedBox(width: 3),
                          Flexible(
                            child: Text(
                              serverShort,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 9, color: Color(0xFFC4B5FD), fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.dns_rounded, size: 19, color: Colors.white),
            tooltip: 'Server Settings',
            visualDensity: VisualDensity.compact,
            padding: const EdgeInsets.all(8),
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminServerSettingsScreen()));
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh, size: 19, color: Colors.white),
            tooltip: 'Refresh All Hubs',
            visualDensity: VisualDensity.compact,
            padding: const EdgeInsets.all(8),
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            onPressed: () {
              context.read<OverviewCubit>().loadOverview();
              context.read<OrdersCubit>().loadOrders();
              context.read<PartnersCubit>().loadPartners();
              context.read<FleetCubit>().loadAgents();
              context.read<ProfileCubit>().loadProfile();
            },
          ),
          IconButton(
            icon: const Icon(Icons.account_circle, size: 21, color: Colors.white),
            tooltip: 'Super Admin Profile',
            visualDensity: VisualDensity.compact,
            padding: const EdgeInsets.all(8),
            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => Scaffold(body: AdminProfileScreen(user: adminUser))));
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: IndexedStack(
        index: currentIndex,
        children: const [
          AdminOverviewScreen(),
          AdminOrdersScreen(),
          AdminRentalsScreen(),
          AdminCatalogScreen(),
          AdminOperationsHubScreen(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (idx) => context.read<NavigationCubit>().setTab(idx),
        backgroundColor: Colors.white,
        elevation: 8,
        indicatorColor: AppColors.primary.withValues(alpha: 0.15),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard, color: AppColors.primary),
            label: 'Overview',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long, color: AppColors.primary),
            label: 'Orders',
          ),
          NavigationDestination(
            icon: Icon(Icons.camera_alt_outlined),
            selectedIcon: Icon(Icons.camera_alt, color: AppColors.primary),
            label: 'Rentals',
          ),
          NavigationDestination(
            icon: Icon(Icons.category_outlined),
            selectedIcon: Icon(Icons.category, color: AppColors.primary),
            label: 'Catalog',
          ),
          NavigationDestination(
            icon: Icon(Icons.hub_outlined),
            selectedIcon: Icon(Icons.hub, color: AppColors.primary),
            label: 'Operations',
          ),
        ],
      ),
    );
  }
}
