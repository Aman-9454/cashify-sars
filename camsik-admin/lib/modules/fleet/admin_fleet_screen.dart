import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/helpers.dart';
import 'bloc/fleet_cubit.dart';
import 'bloc/fleet_state.dart';

class AdminFleetScreen extends StatefulWidget {
  const AdminFleetScreen({super.key});

  @override
  State<AdminFleetScreen> createState() => _AdminFleetScreenState();
}

class _AdminFleetScreenState extends State<AdminFleetScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FleetCubit, FleetState>(
      builder: (context, state) {
        final fleetCubit = context.read<FleetCubit>();
        final isLoading = state is FleetLoading;
        final agents = state is FleetLoaded ? state.filteredAgents : const [];

        return Scaffold(
          body: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.white,
                child: TextField(
                  controller: _searchController,
                  onChanged: (v) => fleetCubit.searchAgents(v),
                  decoration: InputDecoration(
                    hintText: 'Search Rider Name, Phone, Zone...',
                    hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                    prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textSecondary),
                    filled: true,
                    fillColor: AppColors.background,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                ),
              ),
              Expanded(
                child: RefreshIndicator(
                  onRefresh: () => fleetCubit.loadAgents(),
                  child: isLoading && agents.isEmpty
                      ? const Center(child: CircularProgressIndicator())
                      : agents.isEmpty
                          ? const Center(
                              child: Text(
                                'No matching fleet riders found.',
                                style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: agents.length,
                              itemBuilder: (ctx, idx) {
                                final a = agents[idx];
                                final isOnline = a.dutyStatus == 'online';

                                return Card(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  child: Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(
                                              children: [
                                                const Icon(
                                                  Icons.two_wheeler_rounded,
                                                  color: AppColors.warning,
                                                  size: 22,
                                                ),
                                                const SizedBox(width: 8),
                                                Text(
                                                  a.name,
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 15,
                                                    color: AppColors.textPrimary,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                              decoration: BoxDecoration(
                                                color: isOnline ? AppColors.successLight : AppColors.errorLight,
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: Text(
                                                a.dutyStatus.toUpperCase(),
                                                style: TextStyle(
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold,
                                                  color: isOnline ? AppColors.success : AppColors.error,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          'Zone: ${a.zone} • Vehicle: ${a.vehicleType}',
                                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                        ),
                                        if (a.phone.isNotEmpty) ...[
                                          const SizedBox(height: 4),
                                          InkWell(
                                            onTap: () => openDialer(a.phone),
                                            child: Row(
                                              children: [
                                                const Icon(Icons.phone_outlined, size: 14, color: AppColors.accent),
                                                const SizedBox(width: 4),
                                                Text(
                                                  a.phone,
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    color: AppColors.accent,
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                        const SizedBox(height: 10),
                                        Row(
                                          children: [
                                            const Icon(Icons.star_rounded, size: 16, color: Colors.amber),
                                            const SizedBox(width: 4),
                                            Text(
                                              a.rating.toStringAsFixed(1),
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                                            ),
                                            const SizedBox(width: 16),
                                            Text(
                                              'Active Trips: ${a.activeOrders}',
                                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 12),
                                        const Divider(height: 1, color: AppColors.border),
                                        const SizedBox(height: 8),
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.end,
                                          children: [
                                            TextButton.icon(
                                              onPressed: () async {
                                                final ok = await fleetCubit.toggleDuty(a);
                                                if (context.mounted && ok) {
                                                  showCustomSnackBar(
                                                    context,
                                                    '${a.name} duty changed to ${isOnline ? 'OFFLINE' : 'ONLINE'}',
                                                  );
                                                }
                                              },
                                              icon: Icon(
                                                isOnline ? Icons.cancel_outlined : Icons.check_circle_outline,
                                                size: 16,
                                                color: isOnline ? AppColors.error : AppColors.success,
                                              ),
                                              label: Text(
                                                isOnline ? 'Set Offline' : 'Set Online / Active',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: isOnline ? AppColors.error : AppColors.success,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
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
