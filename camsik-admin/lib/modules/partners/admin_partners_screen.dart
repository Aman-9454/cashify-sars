import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../core/utils/helpers.dart';
import '../../widgets/status_badge.dart';
import 'bloc/partners_cubit.dart';
import 'bloc/partners_state.dart';

class AdminPartnersScreen extends StatefulWidget {
  const AdminPartnersScreen({super.key});

  @override
  State<AdminPartnersScreen> createState() => _AdminPartnersScreenState();
}

class _AdminPartnersScreenState extends State<AdminPartnersScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<PartnersCubit, PartnersState>(
      builder: (context, state) {
        final partnersCubit = context.read<PartnersCubit>();
        final isLoading = state is PartnersLoading;
        final partners = state is PartnersLoaded ? state.filteredPartners : const [];

        return Scaffold(
          body: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                color: Colors.white,
                child: TextField(
                  controller: _searchController,
                  onChanged: (v) => partnersCubit.searchPartners(v),
                  decoration: InputDecoration(
                    hintText: 'Search Store Name, Owner, City...',
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
                  onRefresh: () => partnersCubit.loadPartners(),
                  child: isLoading && partners.isEmpty
                      ? const Center(child: CircularProgressIndicator())
                      : partners.isEmpty
                          ? const Center(
                              child: Text(
                                'No matching partner stores found.',
                                style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: partners.length,
                              itemBuilder: (ctx, idx) {
                                final p = partners[idx];
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
                                                  Icons.storefront_rounded,
                                                  color: AppColors.primary,
                                                  size: 20,
                                                ),
                                                const SizedBox(width: 8),
                                                Text(
                                                  p.storeName,
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 15,
                                                    color: AppColors.textPrimary,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            StatusBadge(status: p.status),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Text(
                                          'Owner: ${p.ownerName} • ${p.city}',
                                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                        ),
                                        if (p.phone.isNotEmpty) ...[
                                          const SizedBox(height: 4),
                                          InkWell(
                                            onTap: () => openDialer(p.phone),
                                            child: Row(
                                              children: [
                                                const Icon(Icons.phone_outlined, size: 14, color: AppColors.accent),
                                                const SizedBox(width: 4),
                                                Text(
                                                  p.phone,
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
                                              p.rating.toStringAsFixed(1),
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                                            ),
                                            const SizedBox(width: 16),
                                            Text(
                                              '${p.totalOrders} Orders Handled',
                                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                            ),
                                            const Spacer(),
                                            Text(
                                              'Balance: ${CurrencyFormatter.format(p.balance)}',
                                              style: const TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                                color: AppColors.success,
                                              ),
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
                                                final ok = await partnersCubit.togglePartnerStatus(p);
                                                if (context.mounted && ok) {
                                                  showCustomSnackBar(
                                                    context,
                                                    '${p.storeName} status updated to ${p.status == 'active' ? 'SUSPENDED' : 'ACTIVE'}',
                                                  );
                                                }
                                              },
                                              icon: Icon(
                                                p.status == 'active' ? Icons.pause_circle_outline : Icons.play_circle_outline,
                                                size: 16,
                                                color: p.status == 'active' ? AppColors.error : AppColors.success,
                                              ),
                                              label: Text(
                                                p.status == 'active' ? 'Suspend Store' : 'Reactivate Store',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: p.status == 'active' ? AppColors.error : AppColors.success,
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
