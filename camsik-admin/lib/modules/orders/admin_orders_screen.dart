import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../models/admin_models.dart';
import 'bloc/orders_cubit.dart';
import 'bloc/orders_state.dart';
import 'widgets/admin_order_card.dart';
import 'widgets/admin_order_detail_modal.dart';

class AdminOrdersScreen extends StatefulWidget {
  const AdminOrdersScreen({super.key});

  @override
  State<AdminOrdersScreen> createState() => _AdminOrdersScreenState();
}

class _AdminOrdersScreenState extends State<AdminOrdersScreen> {
  final _searchController = TextEditingController();

  final List<String> _statuses = [
    'all',
    'created',
    'assigned',
    'accepted',
    'pickup_scheduled',
    'picked_up',
    'in_transit',
    'inspection',
    'completed',
    'cancelled',
    'rejected',
  ];

  final List<String> _types = [
    'all',
    'sell',
    'buy',
    'repair',
    'rent',
    'exchange',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showOrderDetailSheet(
    BuildContext context, {
    required AdminOrder order,
    required List<AdminPartner> partners,
    required List<AdminDeliveryAgent> agents,
    required OrdersCubit ordersCubit,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => AdminOrderDetailModal(
        order: order,
        partners: partners,
        agents: agents,
        ordersCubit: ordersCubit,
        onOrderUpdated: () {
          Navigator.pop(ctx);
          ordersCubit.loadOrders();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OrdersCubit, OrdersState>(
      builder: (context, state) {
        final ordersCubit = context.read<OrdersCubit>();
        final isLoading = state is OrdersLoading;
        final isLoaded = state is OrdersLoaded;
        final orders = isLoaded ? state.filteredOrders : const [];
        final partners = isLoaded ? state.partners : <AdminPartner>[];
        final agents = isLoaded ? state.agents : <AdminDeliveryAgent>[];
        final selectedStatus = isLoaded ? state.selectedStatus : 'all';
        final selectedType = isLoaded ? state.selectedType : 'all';

        return Scaffold(
          body: Column(
            children: [
              // Search & Filter Header
              Container(
                color: Colors.white,
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 10),
                child: Column(
                  children: [
                    TextField(
                      controller: _searchController,
                      onChanged: (v) => ordersCubit.searchOrders(v),
                      decoration: InputDecoration(
                        hintText: 'Search Order ID, Customer, Model...',
                        hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                        prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textSecondary),
                        filled: true,
                        fillColor: AppColors.background,
                        contentPadding: const EdgeInsets.symmetric(vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _statuses.map((s) {
                          final isSelected = selectedStatus == s;
                          return Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: FilterChip(
                              label: Text(
                                s.replaceAll('_', ' ').toUpperCase(),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : AppColors.textPrimary,
                                ),
                              ),
                              selected: isSelected,
                              selectedColor: AppColors.primary,
                              backgroundColor: AppColors.background,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              showCheckmark: false,
                              onSelected: (_) => ordersCubit.filterByStatus(s),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 4),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _types.map((t) {
                          final isSelected = selectedType == t;
                          return Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: ChoiceChip(
                              label: Text(
                                t.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : AppColors.textSecondary,
                                ),
                              ),
                              selected: isSelected,
                              selectedColor: AppColors.accent,
                              backgroundColor: AppColors.background,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              onSelected: (_) => ordersCubit.filterByType(t),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),

              // Orders List
              Expanded(
                child: RefreshIndicator(
                  onRefresh: () => ordersCubit.loadOrders(),
                  child: isLoading && orders.isEmpty
                      ? const Center(child: CircularProgressIndicator())
                      : orders.isEmpty
                          ? const Center(
                              child: Text(
                                'No matching orders found.',
                                style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: orders.length,
                              itemBuilder: (ctx, idx) => AdminOrderCard(
                                order: orders[idx],
                                onTap: () => _showOrderDetailSheet(
                                  context,
                                  order: orders[idx],
                                  partners: partners,
                                  agents: agents,
                                  ordersCubit: ordersCubit,
                                ),
                              ),
                            ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
