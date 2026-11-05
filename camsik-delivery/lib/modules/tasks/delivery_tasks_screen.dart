import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sizer/sizer.dart';
import '../../models/delivery_models.dart';
import 'bloc/tasks_cubit.dart';
import 'bloc/tasks_state.dart';
import 'screens/delivery_order_detail_screen.dart';
import 'widgets/task_card_widget.dart';

class DeliveryTasksScreen extends StatefulWidget {
  const DeliveryTasksScreen({super.key});

  @override
  State<DeliveryTasksScreen> createState() => _DeliveryTasksScreenState();
}

class _DeliveryTasksScreenState extends State<DeliveryTasksScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<TasksCubit, TasksState>(
      builder: (context, state) {
        final tasksCubit = context.read<TasksCubit>();
        final isLoading = state is TasksLoading;
        final isLoaded = state is TasksLoaded;
        final tasks = isLoaded ? state.filteredTasks : const [];
        final totalCount = isLoaded ? state.allTasks.length : 0;
        final selectedFilter = isLoaded ? state.selectedFilter : 'all';

        return RefreshIndicator(
          color: const Color(0xFFFF5722),
          onRefresh: () => tasksCubit.loadTasks(),
          child: Container(
            color: const Color(0xFFF8FAFC),
            child: Column(
              children: [
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                  child: Column(
                    children: [
                      // Modern Search Box
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
                        ),
                        child: TextField(
                          controller: _searchController,
                          style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A)),
                          onChanged: (v) {
                            tasksCubit.searchTasks(v);
                            setState(() {});
                          },
                          decoration: InputDecoration(
                            hintText: 'Search Task ID, Customer or Street...',
                            hintStyle: TextStyle(fontSize: 14.sp, color: const Color(0xFF94A3B8)),
                            prefixIcon: const Icon(Icons.search_rounded, size: 20, color: Color(0xFF64748B)),
                            suffixIcon: _searchController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear_rounded, size: 18, color: Color(0xFF64748B)),
                                    onPressed: () {
                                      _searchController.clear();
                                      tasksCubit.searchTasks('');
                                      setState(() {});
                                    },
                                  )
                                : null,
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(vertical: 13, horizontal: 12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Modern Filter Chips
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _buildChip(
                              context,
                              key: 'all',
                              label: 'All Runs ($totalCount)',
                              icon: Icons.layers_rounded,
                              isSelected: selectedFilter == 'all',
                            ),
                            _buildChip(
                              context,
                              key: 'pickup',
                              label: 'Pickups',
                              icon: Icons.two_wheeler_rounded,
                              isSelected: selectedFilter == 'pickup',
                            ),
                            _buildChip(
                              context,
                              key: 'delivery',
                              label: 'Deliveries',
                              icon: Icons.local_shipping_rounded,
                              isSelected: selectedFilter == 'delivery',
                            ),
                            _buildChip(
                              context,
                              key: 'completed',
                              label: 'Completed',
                              icon: Icons.check_circle_rounded,
                              isSelected: selectedFilter == 'completed',
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: isLoading && tasks.isEmpty
                      ? const Center(child: CircularProgressIndicator(color: Color(0xFFFF5722)))
                      : tasks.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 64,
                                    height: 64,
                                    decoration: BoxDecoration(color: const Color(0xFFFFF7ED), shape: BoxShape.circle),
                                    child: const Center(child: Icon(Icons.assignment_outlined, size: 30, color: Color(0xFFEA580C))),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    'No matching delivery tasks found.',
                                    style: TextStyle(color: const Color(0xFF64748B), fontSize: 15.sp, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                              itemCount: tasks.length,
                              itemBuilder: (_, idx) {
                                final task = tasks[idx];
                                final prevTask = idx > 0 ? tasks[idx - 1] : null;
                                final showHeader = idx == 0 || prevTask?.timeSectionLabel != task.timeSectionLabel;

                                return Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (showHeader) _buildTimeSlotHeader(task),
                                    TaskCardWidget(
                                      task: task,
                                      tasksCubit: tasksCubit,
                                      onRefresh: () => tasksCubit.loadTasks(),
                                      onTap: () => DeliveryOrderDetailScreen.navigateTo(
                                        context: context,
                                        task: task,
                                        tasksCubit: tasksCubit,
                                        onRefresh: () => tasksCubit.loadTasks(),
                                      ),
                                    ),
                                  ],
                                );
                              },
                            ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTimeSlotHeader(DeliveryTask task) {
    final slotPeriod = task.slotPeriod;
    final dayGroup = task.dayGroup;
    final IconData icon;
    final Color badgeColor;

    if (slotPeriod == SlotPeriod.morning) {
      icon = Icons.wb_sunny_outlined;
      badgeColor = const Color(0xFFD97706);
    } else if (slotPeriod == SlotPeriod.afternoon) {
      icon = Icons.wb_sunny_rounded;
      badgeColor = const Color(0xFFEA580C);
    } else {
      icon = Icons.nightlight_round;
      badgeColor = const Color(0xFF7C3AED);
    }

    final dayText = dayGroup == DayGroup.today
        ? 'TODAY'
        : (dayGroup == DayGroup.tomorrow ? 'TOMORROW' : task.pickupDate.toUpperCase());

    return Container(
      margin: const EdgeInsets.only(top: 4, bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(color: badgeColor.withValues(alpha: 0.12), shape: BoxShape.circle),
                child: Icon(icon, size: 14, color: badgeColor),
              ),
              const SizedBox(width: 8),
              Text(
                '$dayText • ${task.slotPeriod == SlotPeriod.morning ? "MORNING" : (task.slotPeriod == SlotPeriod.afternoon ? "AFTERNOON" : "EVENING")}',
                style: TextStyle(
                  color: const Color(0xFF0F172A),
                  fontWeight: FontWeight.w900,
                  fontSize: 14.sp,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: badgeColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              slotPeriod == SlotPeriod.morning
                  ? '8 AM – 12 PM'
                  : (slotPeriod == SlotPeriod.afternoon ? '12 PM – 4 PM' : '4 PM – 9 PM'),
              style: TextStyle(
                color: badgeColor,
                fontSize: 14.sp,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(
    BuildContext context, {
    required String key,
    required String label,
    required IconData icon,
    required bool isSelected,
  }) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: InkWell(
        onTap: () => context.read<TasksCubit>().filterBy(key),
        borderRadius: BorderRadius.circular(20),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            gradient: isSelected
                ? const LinearGradient(colors: [Color(0xFFFF5722), Color(0xFFF97316)])
                : null,
            color: isSelected ? null : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? Colors.transparent : const Color(0xFFE2E8F0),
              width: 1.2,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: const Color(0xFFFF5722).withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ]
                : [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    ),
                  ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 15,
                color: isSelected ? Colors.white : const Color(0xFF64748B),
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w800,
                  color: isSelected ? Colors.white : const Color(0xFF334155),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
