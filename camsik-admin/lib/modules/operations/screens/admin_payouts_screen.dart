import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/helpers.dart';
import '../../../models/admin_models.dart';
import '../repositories/operations_repository.dart';

class AdminPayoutsScreen extends StatefulWidget {
  const AdminPayoutsScreen({super.key});

  @override
  State<AdminPayoutsScreen> createState() => _AdminPayoutsScreenState();
}

class _AdminPayoutsScreenState extends State<AdminPayoutsScreen> {
  final OperationsRepository _operationsRepository = OperationsRepositoryImpl();
  bool _isLoading = true;
  String _filter = 'all';
  List<AdminPayout> _payouts = [];

  @override
  void initState() {
    super.initState();
    _loadPayouts();
  }

  Future<void> _loadPayouts() async {
    setState(() => _isLoading = true);
    final items = await _operationsRepository.fetchPayouts(_filter);
    if (!mounted) return;
    setState(() {
      _payouts = items;
      _isLoading = false;
    });
  }

  void _showApproveDialog(AdminPayout payout) {
    final refController = TextEditingController(text: 'CMSK-TXN-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Approve & Process Payout', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Beneficiary: ${payout.requesterName}', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('Amount: ${CurrencyFormatter.format(payout.amount)}', style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 4),
            Text('Account: ${payout.accountDetails}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            const SizedBox(height: 16),
            TextField(
              controller: refController,
              decoration: const InputDecoration(
                labelText: 'Bank / UPI Transaction Reference (UTR)',
                hintText: 'e.g. UTR29482948190',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.success, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              final utr = refController.text.trim();
              final success = await _operationsRepository.updatePayout({
                'id': payout.id,
                'status': 'approved',
                'transactionRef': utr,
              });
              if (success) {
                Helpers.showSuccessSnackbar('Success', 'Payout approved with UTR: $utr');
                _loadPayouts();
              } else {
                Helpers.showErrorSnackbar('Error', 'Failed to approve payout');
              }
            },
            child: const Text('Confirm Payout'),
          ),
        ],
      ),
    );
  }

  void _rejectPayout(AdminPayout payout) async {
    final success = await _operationsRepository.updatePayout({
      'id': payout.id,
      'status': 'rejected',
    });
    if (success) {
      Helpers.showSuccessSnackbar('Rejected', 'Payout request marked as rejected');
      _loadPayouts();
    } else {
      Helpers.showErrorSnackbar('Error', 'Failed to reject payout');
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _payouts.where((p) => _filter == 'all' || p.status == _filter).toList();

    final totalPending = _payouts.where((p) => p.status == 'pending').fold<double>(0, (s, p) => s + p.amount);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet & Payouts', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(icon: const Icon(Icons.refresh, size: 20), onPressed: _loadPayouts),
        ],
      ),
      body: Column(
        children: [
          // Summary Banner
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.primary.withValues(alpha: 0.08),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Pending Payouts', style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 2),
                    Text(
                      CurrencyFormatter.format(totalPending),
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(color: AppColors.warning, borderRadius: BorderRadius.circular(8)),
                  child: Text(
                    '${_payouts.where((p) => p.status == 'pending').length} Action Required',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                ),
              ],
            ),
          ),

          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: ['all', 'pending', 'paid', 'rejected'].map((f) {
                final isSelected = _filter == f;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(f.toUpperCase(), style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : AppColors.textPrimary)),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    onSelected: (_) => setState(() => _filter = f),
                  ),
                );
              }).toList(),
            ),
          ),

          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                    ? const Center(child: Text('No payouts match filter', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textMuted)))
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: filtered.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 12),
                        itemBuilder: (context, idx) {
                          final item = filtered[idx];
                          final isPending = item.status == 'pending';

                          return Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.border),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2)),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(
                                          item.requesterType == 'partner' ? Icons.storefront : Icons.two_wheeler,
                                          size: 18,
                                          color: item.requesterType == 'partner' ? AppColors.primary : AppColors.warning,
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          item.requesterName,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                        ),
                                      ],
                                    ),
                                    Text(
                                      CurrencyFormatter.format(item.amount),
                                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppColors.primary),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text('💳 ${item.paymentMethod} • ${item.accountDetails}', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                                const SizedBox(height: 4),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Requested on ${item.requestedAt}', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: item.status == 'paid' || item.status == 'approved'
                                            ? AppColors.success.withValues(alpha: 0.15)
                                            : item.status == 'rejected'
                                                ? AppColors.error.withValues(alpha: 0.15)
                                                : AppColors.warning.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        item.status.toUpperCase(),
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: item.status == 'paid' || item.status == 'approved'
                                              ? AppColors.success
                                              : item.status == 'rejected'
                                                  ? AppColors.error
                                                  : AppColors.warning,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                if (item.transactionRef.isNotEmpty) ...[
                                  const SizedBox(height: 6),
                                  Text('Ref: ${item.transactionRef}', style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontStyle: FontStyle.italic)),
                                ],
                                if (isPending) ...[
                                  const Divider(height: 20),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: OutlinedButton(
                                          style: OutlinedButton.styleFrom(foregroundColor: AppColors.error),
                                          onPressed: () => _rejectPayout(item),
                                          child: const Text('Reject'),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: ElevatedButton(
                                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.success, foregroundColor: Colors.white),
                                          onPressed: () => _showApproveDialog(item),
                                          child: const Text('Approve & Pay'),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
