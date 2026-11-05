import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sizer/sizer.dart';
import '../../core/constants/app_colors.dart';
import 'bloc/orders_cubit.dart';
import 'bloc/orders_state.dart';
import 'widgets/order_card_widget.dart';
import 'screens/partner_order_detail_screen.dart';

class PartnerOrdersScreen extends StatefulWidget {
  final Future<void> Function()? onRefresh;

  const PartnerOrdersScreen({
    super.key,
    this.onRefresh,
  });

  @override
  State<PartnerOrdersScreen> createState() => _PartnerOrdersScreenState();
}

class _PartnerOrdersScreenState extends State<PartnerOrdersScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OrdersCubit, OrdersState>(
      builder: (context, state) {
        if (state is OrdersLoading) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.primary),
          );
        }

        if (state is OrdersFailure) {
          return Center(
            child: Padding(
              padding: EdgeInsets.all(6.w),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.error.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.error_outline_rounded,
                      size: 40,
                      color: AppColors.error,
                    ),
                  ),
                  SizedBox(height: 2.h),
                  Text(
                    'Failed to Load Orders',
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF0F172A),
                    ),
                  ),
                  SizedBox(height: 0.8.h),
                  Text(
                    state.error,
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: const Color(0xFF64748B),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 2.5.h),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: EdgeInsets.symmetric(
                        horizontal: 6.w,
                        vertical: 1.4.h,
                      ),
                    ),
                    onPressed: () => context.read<OrdersCubit>().loadOrders(),
                    icon: const Icon(Icons.refresh_rounded, size: 18),
                    label: Text(
                      'Retry Now',
                      style: TextStyle(
                        fontSize: 14.5.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        if (state is OrdersLoaded) {
          final filtered = state.filteredOrders;

          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async {
              if (widget.onRefresh != null) {
                await widget.onRefresh!();
              } else {
                await context.read<OrdersCubit>().loadOrders();
              }
            },
            child: Column(
              children: [
                // Search & Filter header container
                Container(
                  color: Colors.white,
                  padding: EdgeInsets.fromLTRB(4.w, 1.5.h, 4.w, 1.2.h),
                  child: Column(
                    children: [
                      // Search input
                      TextField(
                        controller: _searchController,
                        onChanged: (val) =>
                            context.read<OrdersCubit>().searchOrders(val),
                        style: TextStyle(
                          fontSize: 15.sp,
                          color: const Color(0xFF0F172A),
                        ),
                        decoration: InputDecoration(
                          hintText: 'Search by Order ID, Device or Customer...',
                          hintStyle: TextStyle(
                            fontSize: 14.sp,
                            color: const Color(0xFF94A3B8),
                          ),
                          prefixIcon: const Icon(
                            Icons.search_rounded,
                            size: 20,
                            color: Color(0xFF64748B),
                          ),
                          suffixIcon: state.searchQuery.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(
                                    Icons.clear_rounded,
                                    size: 18,
                                    color: Color(0xFF64748B),
                                  ),
                                  onPressed: () {
                                    _searchController.clear();
                                    context.read<OrdersCubit>().searchOrders('');
                                  },
                                )
                              : null,
                          filled: true,
                          fillColor: const Color(0xFFF1F5F9),
                          contentPadding: EdgeInsets.symmetric(
                            vertical: 1.2.h,
                            horizontal: 4.w,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                      SizedBox(height: 1.2.h),

                      // Filter chips scroll view
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _buildFilterChip(
                              context,
                              'all',
                              'All Orders (${state.allOrders.length})',
                              state.selectedStatus,
                            ),
                            _buildFilterChip(
                              context,
                              'assigned',
                              'Assigned',
                              state.selectedStatus,
                            ),
                            _buildFilterChip(
                              context,
                              'inspection',
                              'In QA',
                              state.selectedStatus,
                            ),
                            _buildFilterChip(
                              context,
                              'completed',
                              'Completed',
                              state.selectedStatus,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Orders List
                Expanded(
                  child: filtered.isEmpty
                      ? Center(
                          child: Padding(
                            padding: EdgeInsets.all(6.w),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(20),
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFF1F5F9),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.inventory_2_outlined,
                                    size: 40,
                                    color: Color(0xFF94A3B8),
                                  ),
                                ),
                                SizedBox(height: 1.8.h),
                                Text(
                                  'No matching orders found',
                                  style: TextStyle(
                                    color: const Color(0xFF0F172A),
                                    fontSize: 16.sp,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                SizedBox(height: 0.6.h),
                                Text(
                                  'Try searching with a different keyword or filter tab.',
                                  style: TextStyle(
                                    color: const Color(0xFF64748B),
                                    fontSize: 14.sp,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        )
                      : ListView.builder(
                          padding: EdgeInsets.symmetric(
                            horizontal: 4.w,
                            vertical: 1.5.h,
                          ),
                          itemCount: filtered.length,
                          itemBuilder: (ctx, idx) {
                            final order = filtered[idx];
                            return OrderCardWidget(
                              order: order,
                              onTap: () {
                                Navigator.push(
                                  ctx,
                                  MaterialPageRoute(
                                    builder: (_) => PartnerOrderDetailScreen(
                                      order: order,
                                      onUpdateStatus: (newStatus) {
                                        context.read<OrdersCubit>().updateOrderStatus(
                                              orderId: order.id,
                                              status: newStatus,
                                            );
                                      },
                                      onOrderUpdated: () async {
                                        context.read<OrdersCubit>().loadOrders();
                                      },
                                    ),
                                  ),
                                );
                              },
                            );
                          },
                        ),
                ),
              ],
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildFilterChip(
    BuildContext context,
    String status,
    String label,
    String currentStatus,
  ) {
    final isSelected = currentStatus == status;
    return Padding(
      padding: EdgeInsets.only(right: 2.w),
      child: InkWell(
        onTap: () => context.read<OrdersCubit>().filterByStatus(status),
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: EdgeInsets.symmetric(
            horizontal: 3.5.w,
            vertical: 0.8.h,
          ),
          decoration: BoxDecoration(
            gradient: isSelected ? AppColors.primaryGradient : null,
            color: isSelected ? null : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected
                  ? Colors.transparent
                  : const Color(0xFFE2E8F0),
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : const Color(0xFF475569),
            ),
          ),
        ),
      ),
    );
  }
}
