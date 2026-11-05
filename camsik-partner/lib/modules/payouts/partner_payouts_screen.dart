import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sizer/sizer.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/partner_models.dart';
import '../orders/bloc/orders_cubit.dart';
import '../orders/bloc/orders_state.dart';
import 'bloc/payouts_cubit.dart';
import 'bloc/payouts_state.dart';
import 'data/models/payout_transaction_model.dart';

class PartnerPayoutsScreen extends StatelessWidget {
  final List<PartnerOrder>? orders;
  final PartnerUser? user;
  final Future<void> Function()? onRefresh;

  const PartnerPayoutsScreen({
    super.key,
    this.orders,
    this.user,
    this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (ctx) {
        final cubit = PayoutsCubit();
        if (orders != null) {
          cubit.loadPayouts(existingOrders: orders);
        } else {
          final ordersState = ctx.read<OrdersCubit?>()?.state;
          if (ordersState is OrdersLoaded) {
            cubit.loadPayouts(existingOrders: ordersState.orders);
          } else {
            cubit.loadPayouts();
          }
        }
        return cubit;
      },
      child: _PayoutsView(onRefresh: onRefresh, user: user),
    );
  }
}

class _PayoutsView extends StatefulWidget {
  final Future<void> Function()? onRefresh;
  final PartnerUser? user;

  const _PayoutsView({this.onRefresh, this.user});

  @override
  State<_PayoutsView> createState() => _PayoutsViewState();
}

class _PayoutsViewState extends State<_PayoutsView> {
  int _activeTab = 0; // 0: Payouts, 1: Commissions
  int _selectedFilterIndex = 0; // 0: All, 1: Orders, 2: Withdrawals, 3: Top-ups

  String _formatDateTime(String? isoString) {
    if (isoString == null || isoString.isEmpty) return 'Recent';
    final dt = DateTime.tryParse(isoString)?.toLocal();
    if (dt == null) return 'Recent';

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    final monthStr = months[dt.month - 1];
    final dayStr = dt.day.toString().padLeft(2, '0');
    final hour = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final minuteStr = dt.minute.toString().padLeft(2, '0');
    final period = dt.hour >= 12 ? 'PM' : 'AM';

    return '$dayStr $monthStr, $hour:$minuteStr $period';
  }

  void _showAddFundsModal(
    BuildContext context,
    PayoutsLoaded state,
  ) {
    final controller = TextEditingController(text: '10000');
    bool isSubmitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (dialogCtx, setModalState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(
                5.w,
                2.5.h,
                5.w,
                MediaQuery.of(dialogCtx).viewInsets.bottom + 3.h,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4.5,
                      decoration: BoxDecoration(
                        color: const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                  ),
                  SizedBox(height: 2.h),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFECFDF5),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFA7F3D0)),
                        ),
                        child: const Icon(
                          Icons.add_card_rounded,
                          color: Color(0xFF059669),
                          size: 24,
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Add Float to Payout Wallet',
                              style: TextStyle(
                                fontSize: 16.5.sp,
                                fontWeight: FontWeight.w900,
                                color: const Color(0xFF0F172A),
                              ),
                            ),
                            Text(
                              'Current Float: ${CurrencyFormatter.format(state.floatBalance)}',
                              style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 2.h),

                  // Quick amounts
                  Text(
                    'Quick Add Preset',
                    style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: const Color(0xFF475569)),
                  ),
                  SizedBox(height: 0.8.h),
                  Wrap(
                    spacing: 2.w,
                    runSpacing: 1.h,
                    children: [2000, 5000, 10000, 25000, 50000].map((amt) {
                      final isSelected = controller.text == amt.toString();
                      return InkWell(
                        onTap: () {
                          setModalState(() {
                            controller.text = amt.toString();
                          });
                        },
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          padding: EdgeInsets.symmetric(horizontal: 3.5.w, vertical: 0.8.h),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF059669) : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '+₹${amt.toString()}',
                            style: TextStyle(
                              color: isSelected ? Colors.white : const Color(0xFF334155),
                              fontWeight: FontWeight.bold,
                              fontSize: 14.sp,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  SizedBox(height: 1.8.h),

                  TextField(
                    controller: controller,
                    keyboardType: TextInputType.number,
                    style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A)),
                    decoration: InputDecoration(
                      labelText: 'Amount to Add (₹)',
                      prefixText: '₹ ',
                      prefixStyle: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold, color: const Color(0xFF059669)),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.2.h),
                    ),
                  ),
                  SizedBox(height: 2.5.h),

                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: isSubmitting
                          ? null
                          : () async {
                              final amt = double.tryParse(controller.text.trim()) ?? 0.0;
                              if (amt <= 0) return;
                              setModalState(() => isSubmitting = true);
                              await context.read<PayoutsCubit>().addFunds(amt);
                              if (ctx.mounted) {
                                Navigator.pop(ctx);
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF059669),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : Text('Confirm & Add Float', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showWithdrawModal(
    BuildContext context,
    PayoutsLoaded state,
    double balance,
  ) {
    final bankName = state.wallet?.bankName ?? widget.user?.bankName ?? 'HDFC Bank';
    final accNum = state.wallet?.accountNumber ?? widget.user?.accountNumber ?? '•••• 4892';
    final ifsc = state.wallet?.ifscCode ?? widget.user?.ifscCode ?? 'HDFC0001234';
    final holderName = state.wallet?.accountHolderName ?? widget.user?.name ?? 'Partner Store';
    final isVerified = state.wallet?.isVerified ?? widget.user?.isBankVerified ?? true;

    final controller = TextEditingController();
    String? errorText;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (dialogCtx, setModalState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(
                5.w,
                2.5.h,
                5.w,
                MediaQuery.of(dialogCtx).viewInsets.bottom + 3.h,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4.5,
                      decoration: BoxDecoration(
                        color: const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                  ),
                  SizedBox(height: 2.h),

                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.account_balance_rounded,
                          color: AppColors.primary,
                          size: 24,
                        ),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Withdraw Float to Bank',
                              style: TextStyle(
                                fontSize: 16.5.sp,
                                fontWeight: FontWeight.w900,
                                color: const Color(0xFF0F172A),
                              ),
                            ),
                            Text(
                              'Instant IMPS to your verified bank account',
                              style: TextStyle(
                                fontSize: 14.sp,
                                color: const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 2.h),

                  // Destination Bank Details Card
                  Container(
                    padding: EdgeInsets.all(3.5.w),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.account_balance_rounded,
                            color: AppColors.primary,
                            size: 24,
                          ),
                        ),
                        SizedBox(width: 3.w),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    bankName,
                                    style: TextStyle(
                                      fontSize: 14.sp,
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF0F172A),
                                    ),
                                  ),
                                  SizedBox(width: 2.w),
                                  Text(
                                    accNum,
                                    style: TextStyle(
                                      fontSize: 14.sp,
                                      fontWeight: FontWeight.w700,
                                      color: const Color(0xFF475569),
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(height: 0.3.h),
                              Text(
                                '$holderName • IFSC: $ifsc',
                                style: TextStyle(
                                  fontSize: 14.sp,
                                  color: const Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (isVerified)
                          const Icon(
                            Icons.verified_rounded,
                            color: AppColors.success,
                            size: 18,
                          ),
                      ],
                    ),
                  ),

                  SizedBox(height: 2.h),

                  // Amount input
                  Text(
                    'Enter Withdrawal Amount (₹)',
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF334155),
                    ),
                  ),
                  SizedBox(height: 0.8.h),
                  TextField(
                    controller: controller,
                    keyboardType: TextInputType.number,
                    style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF0F172A),
                    ),
                    decoration: InputDecoration(
                      hintText: 'e.g. 5000',
                      prefixText: '₹ ',
                      prefixStyle: TextStyle(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w900,
                        color: AppColors.primary,
                      ),
                      errorText: errorText,
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 4.w,
                        vertical: 1.5.h,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(
                          color: AppColors.primary,
                          width: 2,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 1.h),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Available Float: ${CurrencyFormatter.format(balance)}',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: const Color(0xFF64748B),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      InkWell(
                        onTap: () {
                          setModalState(() {
                            controller.text = balance.toInt().toString();
                            errorText = null;
                          });
                        },
                        child: Text(
                          'Withdraw Max',
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 2.5.h),

                  // Submit button
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                      ),
                      onPressed: state.isSubmittingWithdrawal
                          ? null
                          : () async {
                              final text = controller.text.trim();
                              final val = double.tryParse(text);
                              if (val == null || val <= 0) {
                                setModalState(() {
                                  errorText = 'Please enter a valid amount';
                                });
                                return;
                              }
                              if (val > balance) {
                                setModalState(() {
                                  errorText = 'Amount exceeds available store float';
                                });
                                return;
                              }

                              await context.read<PayoutsCubit>().requestWithdrawal(
                                val,
                                bankName: bankName,
                                accountNumber: accNum,
                                ifscCode: ifsc,
                              );

                              if (dialogCtx.mounted) {
                                Navigator.pop(dialogCtx);
                              }
                            },
                      child: state.isSubmittingWithdrawal
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : Text(
                              'Confirm Transfer to Bank',
                              style: TextStyle(
                                fontSize: 14.5.sp,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<PayoutsCubit, PayoutsState>(
      listener: (context, state) {
        if (state is PayoutsLoaded) {
          if (state.actionMessage != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: AppColors.success,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                content: Text(
                  state.actionMessage!,
                  style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
                ),
              ),
            );
          } else if (state.actionError != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: AppColors.error,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                content: Text(state.actionError!, style: TextStyle(fontSize: 14.sp)),
              ),
            );
          }
        }
      },
      builder: (context, state) {
        if (state is PayoutsLoading) {
          return const Center(child: CircularProgressIndicator(color: AppColors.primary));
        }

        if (state is PayoutsFailure) {
          return Center(
            child: Padding(
              padding: EdgeInsets.all(6.w),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.error),
                  SizedBox(height: 1.5.h),
                  Text(state.error, style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B)), textAlign: TextAlign.center),
                  SizedBox(height: 2.h),
                  ElevatedButton(
                    onPressed: () => context.read<PayoutsCubit>().loadPayouts(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text('Retry', style: TextStyle(fontSize: 14.sp)),
                  ),
                ],
              ),
            ),
          );
        }

        if (state is PayoutsLoaded) {
          final completedOrders = state.completedOrders;
          final wallet = state.wallet;
          final commissionEarned = wallet?.totalCommissionEarned ??
              (state.totalDisbursed * ((wallet?.commissionRate ?? 5.0) / 100));

          final List<PayoutTransactionModel> rawTxns = state.transactions.isNotEmpty
              ? state.transactions
              : completedOrders.map((o) {
                  return PayoutTransactionModel(
                    id: 'pay-${o.id}',
                    partnerId: o.partnerId ?? 'partner',
                    orderId: o.id,
                    orderNumber: o.orderNumber,
                    customerName: o.customerName,
                    modelName: o.deviceName.isNotEmpty ? o.deviceName : o.deviceModel,
                    amount: o.finalPrice,
                    type: 'spot_payout',
                    status: 'completed',
                    method: 'instant_upi',
                    referenceId: 'IMPS${o.orderNumber.replaceAll(RegExp(r'\D'), '').padLeft(8, '0')}',
                    bankName: 'Verified Bank',
                    accountNumber: '•••• 9468',
                    ifscCode: 'HDFC0001234',
                    holderName: o.customerName,
                    notes: 'Instant spot buyout',
                    createdAt: o.pickupDate,
                  );
                }).toList();

          final seenKeys = <String>{};
          final List<PayoutTransactionModel> allTxns = [];
          for (final t in rawTxns) {
            final key = t.referenceId.isNotEmpty ? t.referenceId : t.id;
            if (key.isNotEmpty && seenKeys.contains(key)) continue;
            if (key.isNotEmpty) seenKeys.add(key);
            allTxns.add(t);
          }

          final filteredTxns = allTxns.where((t) {
            if (_selectedFilterIndex == 1) return t.type == 'spot_payout' || t.orderNumber != null;
            if (_selectedFilterIndex == 2) return t.type == 'withdrawal';
            if (_selectedFilterIndex == 3) return t.type == 'float_topup' || t.type == 'add_funds';
            return true;
          }).toList();

          final orderTxnCount = allTxns.where((t) => t.type == 'spot_payout' || t.orderNumber != null).length;
          final withdrawTxnCount = allTxns.where((t) => t.type == 'withdrawal').length;
          final topupTxnCount = allTxns.where((t) => t.type == 'float_topup' || t.type == 'add_funds').length;

          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async {
              final cubit = context.read<PayoutsCubit>();
              if (widget.onRefresh != null) {
                await widget.onRefresh!();
              }
              await cubit.loadPayouts();
            },
            child: ListView(
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                // ── 2 TABS: "Payouts" AND "Commissions" ──
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () => setState(() => _activeTab = 0),
                          borderRadius: BorderRadius.circular(12),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: EdgeInsets.symmetric(vertical: 1.1.h),
                            decoration: BoxDecoration(
                              color: _activeTab == 0 ? Colors.white : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: _activeTab == 0
                                  ? [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.06),
                                        blurRadius: 8,
                                        offset: const Offset(0, 2),
                                      ),
                                    ]
                                  : null,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.account_balance_wallet_rounded,
                                  size: 18,
                                  color: _activeTab == 0 ? const Color(0xFF0F172A) : const Color(0xFF64748B),
                                ),
                                SizedBox(width: 2.w),
                                Text(
                                  'Payouts',
                                  style: TextStyle(
                                    fontWeight: _activeTab == 0 ? FontWeight.w900 : FontWeight.w600,
                                    fontSize: 14.sp,
                                    color: _activeTab == 0 ? const Color(0xFF0F172A) : const Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: InkWell(
                          onTap: () => setState(() => _activeTab = 1),
                          borderRadius: BorderRadius.circular(12),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: EdgeInsets.symmetric(vertical: 1.1.h),
                            decoration: BoxDecoration(
                              color: _activeTab == 1 ? Colors.white : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: _activeTab == 1
                                  ? [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.06),
                                        blurRadius: 8,
                                        offset: const Offset(0, 2),
                                      ),
                                    ]
                                  : null,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.monetization_on_rounded,
                                  size: 18,
                                  color: _activeTab == 1 ? const Color(0xFF059669) : const Color(0xFF64748B),
                                ),
                                SizedBox(width: 2.w),
                                Text(
                                  'Commissions',
                                  style: TextStyle(
                                    fontWeight: _activeTab == 1 ? FontWeight.w900 : FontWeight.w600,
                                    fontSize: 14.sp,
                                    color: _activeTab == 1 ? const Color(0xFF059669) : const Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                SizedBox(height: 1.8.h),

                // ── TAB CONTENT ──
                if (_activeTab == 0)
                  _buildPayoutsTabContent(
                    context,
                    state,
                    completedOrders,
                    wallet,
                    commissionEarned,
                    allTxns,
                    filteredTxns,
                    orderTxnCount,
                    withdrawTxnCount,
                    topupTxnCount,
                  )
                else
                  _buildCommissionsTabContent(
                    context,
                    state,
                    completedOrders,
                    wallet,
                    commissionEarned,
                  ),
              ],
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );
  }

  // ── TAB 1: PAYOUTS (STORE FLOAT & CUSTOMER DISBURSEMENTS) ──
  Widget _buildPayoutsTabContent(
    BuildContext context,
    PayoutsLoaded state,
    List<PartnerOrder> completedOrders,
    PartnerWalletData? wallet,
    double commissionEarned,
    List<PayoutTransactionModel> allTxns,
    List<PayoutTransactionModel> filteredTxns,
    int orderTxnCount,
    int withdrawTxnCount,
    int topupTxnCount,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Live Indicator & Sync
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFF10B981),
                    shape: BoxShape.circle,
                  ),
                ),
                SizedBox(width: 2.w),
                Text(
                  'Live 24x7 IMPS Settlements',
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF059669),
                  ),
                ),
              ],
            ),
            InkWell(
              onTap: () => context.read<PayoutsCubit>().loadPayouts(),
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.4.h),
                child: Row(
                  children: [
                    const Icon(Icons.refresh_rounded, size: 16, color: Color(0xFF64748B)),
                    SizedBox(width: 1.w),
                    Text(
                      'Sync',
                      style: TextStyle(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 1.2.h),

        // Hero Store Float & Wallet Card
        Container(
          padding: EdgeInsets.all(5.w),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0B132B), Color(0xFF1C2541)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFF3A506B).withValues(alpha: 0.5)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0B132B).withValues(alpha: 0.35),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF48CAE4).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.account_balance_wallet_rounded,
                            color: Color(0xFF48CAE4),
                            size: 16,
                          ),
                        ),
                        SizedBox(width: 1.5.w),
                        Flexible(
                          child: Text(
                            'PAYOUT FLOAT',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: const Color(0xFF94A3B8),
                              fontSize: 14.sp,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 1.5.w),
                  // Action buttons: Add Money & Withdraw
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      InkWell(
                        onTap: () => _showAddFundsModal(context, state),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.6.h),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF059669), Color(0xFF10B981)],
                            ),
                            borderRadius: BorderRadius.circular(8),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF059669).withValues(alpha: 0.3),
                                blurRadius: 6,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.add_rounded, color: Colors.white, size: 14),
                              SizedBox(width: 0.8.w),
                              Text(
                                'Add Funds',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14.sp,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      SizedBox(width: 1.5.w),
                      InkWell(
                        onTap: () => _showWithdrawModal(context, state, state.floatBalance),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: EdgeInsets.symmetric(horizontal: 2.2.w, vertical: 0.6.h),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.arrow_outward_rounded, color: Colors.white, size: 14),
                              SizedBox(width: 0.8.w),
                              Text(
                                'Withdraw',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 14.sp,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              SizedBox(height: 1.8.h),
              Text(
                CurrencyFormatter.format(state.floatBalance),
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
              ),
              SizedBox(height: 0.6.h),
              Text(
                'Instant balance available for customer spot payouts upon device inspection',
                style: TextStyle(
                  color: const Color(0xFF94A3B8),
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                ),
              ),
              SizedBox(height: 1.8.h),

              Container(
                padding: EdgeInsets.symmetric(horizontal: 3.5.w, vertical: 1.2.h),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Total Disbursed',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: const Color(0xFF94A3B8),
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(height: 0.2.h),
                          Text(
                            CurrencyFormatter.format(state.totalDisbursed),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: const Color(0xFF34D399),
                              fontSize: 15.sp,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(width: 1, height: 26, color: Colors.white.withValues(alpha: 0.15)),
                    SizedBox(width: 3.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Liquidated Units',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: const Color(0xFF94A3B8),
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(height: 0.2.h),
                          Text(
                            '${completedOrders.length} Orders',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: const Color(0xFF60A5FA),
                              fontSize: 15.sp,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        SizedBox(height: 2.h),

        // Verified Merchant Bank Card
        Container(
          padding: EdgeInsets.all(4.w),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.account_balance_rounded,
                  color: Color(0xFF334155),
                  size: 22,
                ),
              ),
              SizedBox(width: 3.5.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          wallet?.bankName ?? widget.user?.bankName ?? 'HDFC Bank',
                          style: TextStyle(
                            fontSize: 15.sp,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF0F172A),
                          ),
                        ),
                        SizedBox(width: 2.w),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.2.h),
                          decoration: BoxDecoration(
                            color: AppColors.successLight,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Verified',
                            style: TextStyle(
                              color: AppColors.success,
                              fontSize: 14.sp,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 0.3.h),
                    Text(
                      'Acc: ${wallet?.accountNumber ?? widget.user?.accountNumber ?? "•••• 4892"} • IFSC: ${wallet?.ifscCode ?? widget.user?.ifscCode ?? "HDFC0001234"}',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: const Color(0xFF64748B),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        SizedBox(height: 2.5.h),

        // Section Header: Disbursed Payout History
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  width: 4,
                  height: 18,
                  decoration: BoxDecoration(
                    color: const Color(0xFF059669),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                SizedBox(width: 2.5.w),
                Text(
                  'Payout & Float History',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 16.sp,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            Text(
              '${filteredTxns.length} Records',
              style: TextStyle(
                fontSize: 14.sp,
                color: const Color(0xFF64748B),
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),

        SizedBox(height: 1.2.h),

        // Filter Pills
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildFilterChip(0, 'All (${allTxns.length})'),
              SizedBox(width: 2.w),
              _buildFilterChip(1, 'Spot Payouts ($orderTxnCount)'),
              SizedBox(width: 2.w),
              _buildFilterChip(2, 'Withdrawals ($withdrawTxnCount)'),
              SizedBox(width: 2.w),
              _buildFilterChip(3, 'Top-ups ($topupTxnCount)'),
            ],
          ),
        ),

        SizedBox(height: 1.5.h),

        if (filteredTxns.isEmpty)
          Container(
            padding: EdgeInsets.symmetric(vertical: 4.h, horizontal: 4.w),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: const BoxDecoration(
                      color: Color(0xFFF1F5F9),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.receipt_long_rounded,
                      size: 36,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                  SizedBox(height: 1.5.h),
                  Text(
                    'No payout records found',
                    style: TextStyle(
                      color: const Color(0xFF1E293B),
                      fontSize: 15.sp,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 0.5.h),
                  Text(
                    'Disbursed customer spot payouts and float top-ups will appear here.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: const Color(0xFF64748B),
                      fontSize: 14.sp,
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          ...filteredTxns.map((txn) => _buildTransactionCard(txn)),
      ],
    );
  }

  // ── TAB 2: COMMISSIONS (EARNINGS PER DEVICE & LEDGER) ──
  Widget _buildCommissionsTabContent(
    BuildContext context,
    PayoutsLoaded state,
    List<PartnerOrder> completedOrders,
    PartnerWalletData? wallet,
    double commissionEarned,
  ) {
    final commissionRate = wallet?.commissionRate ?? 5.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Commission Overview Hero Card
        Container(
          padding: EdgeInsets.all(5.w),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF064E3B), Color(0xFF047857)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF064E3B).withValues(alpha: 0.35),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.monetization_on_rounded,
                            color: Color(0xFF6EE7B7),
                            size: 16,
                          ),
                        ),
                        SizedBox(width: 2.w),
                        Flexible(
                          child: Text(
                            'COMMISSION EARNED',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: const Color(0xFFA7F3D0),
                              fontSize: 14.sp,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 2.w),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 2.2.w, vertical: 0.4.h),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '$commissionRate% Flat Margin',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 1.8.h),
              Text(
                CurrencyFormatter.format(commissionEarned),
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
              ),
              SizedBox(height: 0.6.h),
              Text(
                'Calculated as $commissionRate% of all verified liquidated device values',
                style: TextStyle(
                  color: const Color(0xFFA7F3D0),
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                ),
              ),
              SizedBox(height: 1.8.h),

              Container(
                padding: EdgeInsets.symmetric(horizontal: 3.5.w, vertical: 1.2.h),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Liquidated Turnover',
                            style: TextStyle(
                              color: const Color(0xFFA7F3D0),
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(height: 0.2.h),
                          Text(
                            CurrencyFormatter.format(state.totalDisbursed),
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 15.sp,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(width: 1, height: 26, color: Colors.white.withValues(alpha: 0.2)),
                    SizedBox(width: 3.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Earned Units',
                            style: TextStyle(
                              color: const Color(0xFFA7F3D0),
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(height: 0.2.h),
                          Text(
                            '${completedOrders.length} Completed',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 15.sp,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        SizedBox(height: 2.h),

        // Commission info notice
        Container(
          padding: EdgeInsets.all(3.5.w),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFBFDBFE)),
          ),
          child: Row(
            children: [
              const Icon(Icons.info_outline_rounded, color: Color(0xFF2563EB), size: 20),
              SizedBox(width: 3.w),
              Expanded(
                child: Text(
                  'Commissions are automatically verified and settled in real-time when customer inspection passes.',
                  style: TextStyle(fontSize: 14.sp, color: const Color(0xFF1E40AF), fontWeight: FontWeight.w500),
                ),
              ),
            ],
          ),
        ),

        SizedBox(height: 2.5.h),

        // Section Title: Order-wise Commission Breakdown
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Container(
                  width: 4,
                  height: 18,
                  decoration: BoxDecoration(
                    color: const Color(0xFF059669),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                SizedBox(width: 2.5.w),
                Text(
                  'Order-wise Commission Ledger',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 16.sp,
                    color: const Color(0xFF0F172A),
                  ),
                ),
              ],
            ),
            Text(
              '${completedOrders.length} Orders',
              style: TextStyle(
                fontSize: 14.sp,
                color: const Color(0xFF64748B),
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),

        SizedBox(height: 1.5.h),

        if (completedOrders.isEmpty)
          Container(
            padding: EdgeInsets.symmetric(vertical: 4.h, horizontal: 4.w),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: const BoxDecoration(
                      color: Color(0xFFF1F5F9),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.percent_rounded,
                      size: 36,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                  SizedBox(height: 1.5.h),
                  Text(
                    'No completed commission orders yet',
                    style: TextStyle(
                      color: const Color(0xFF1E293B),
                      fontSize: 15.sp,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 0.5.h),
                  Text(
                    'When you accept and complete customer device orders, your $commissionRate% commission per order will be calculated and displayed here.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: const Color(0xFF64748B),
                      fontSize: 14.sp,
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          ...completedOrders.map((o) {
            final orderAmount = o.finalPrice > 0 ? o.finalPrice : o.quotedPrice;
            final orderComm = (orderAmount * (commissionRate / 100)).roundToDouble();

            return Container(
              margin: EdgeInsets.only(bottom: 1.2.h),
              padding: EdgeInsets.all(4.w),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
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
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.verified_rounded,
                              color: Color(0xFF059669),
                              size: 18,
                            ),
                          ),
                          SizedBox(width: 2.5.w),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                o.orderNumber,
                                style: TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 15.sp,
                                  color: const Color(0xFF0F172A),
                                ),
                              ),
                              Text(
                                o.pickupDate.isNotEmpty ? o.pickupDate : 'Completed',
                                style: TextStyle(
                                  fontSize: 14.sp,
                                  color: const Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.4.h),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDCFCE7),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '+${CurrencyFormatter.format(orderComm)}',
                          style: TextStyle(
                            color: const Color(0xFF15803D),
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 1.h),
                  Container(
                    padding: EdgeInsets.all(2.5.w),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '${o.deviceName} • ${o.customerName}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF334155),
                            ),
                          ),
                        ),
                        Text(
                          'Order: ${CurrencyFormatter.format(orderAmount)} ($commissionRate%)',
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
      ],
    );
  }

  Widget _buildFilterChip(int index, String label) {
    final isSelected = _selectedFilterIndex == index;
    return InkWell(
      onTap: () {
        setState(() {
          _selectedFilterIndex = index;
        });
      },
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 3.5.w, vertical: 0.8.h),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary : const Color(0xFFE2E8F0),
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.25),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF64748B),
            fontSize: 14.sp,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildTransactionCard(PayoutTransactionModel txn) {
    final isWithdrawal = txn.type == 'withdrawal';
    final isTopup = txn.type == 'float_topup' || txn.type == 'add_funds';
    final hasOrder = txn.orderNumber != null && txn.orderNumber!.isNotEmpty;

    return Container(
      margin: EdgeInsets.only(bottom: 1.2.h),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: isTopup
                            ? const Color(0xFFECFDF5)
                            : isWithdrawal
                            ? AppColors.primary.withValues(alpha: 0.1)
                            : AppColors.successLight,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        isTopup
                            ? Icons.add_card_rounded
                            : isWithdrawal
                            ? Icons.arrow_downward_rounded
                            : Icons.arrow_upward_rounded,
                        color: isTopup
                            ? const Color(0xFF059669)
                            : isWithdrawal
                            ? AppColors.primary
                            : AppColors.success,
                        size: 20,
                      ),
                    ),
                    SizedBox(width: 3.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            CurrencyFormatter.format(txn.amount),
                            style: TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 16.sp,
                              color: const Color(0xFF0F172A),
                            ),
                          ),
                          SizedBox(height: 0.2.h),
                          Text(
                            isTopup
                                ? 'Wallet Float Deposit'
                                : isWithdrawal
                                ? 'Float Withdrawal to Bank'
                                : (hasOrder
                                    ? '${txn.orderNumber} • ${txn.customerName ?? "Customer"}'
                                    : (txn.notes.isNotEmpty ? txn.notes : 'Spot Disbursal')),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: const Color(0xFF475569),
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(width: 2.w),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.5.h),
                decoration: BoxDecoration(
                  color: txn.status == 'completed'
                      ? AppColors.success.withValues(alpha: 0.1)
                      : const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: txn.status == 'completed'
                        ? AppColors.success.withValues(alpha: 0.25)
                        : const Color(0xFFF59E0B),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      txn.status == 'completed'
                          ? Icons.check_circle_rounded
                          : Icons.hourglass_top_rounded,
                      color: txn.status == 'completed'
                          ? AppColors.success
                          : const Color(0xFFD97706),
                      size: 14,
                    ),
                    SizedBox(width: 1.w),
                    Text(
                      txn.status == 'completed' ? 'Success' : 'Processing',
                      style: TextStyle(
                        color: txn.status == 'completed'
                            ? AppColors.success
                            : const Color(0xFFD97706),
                        fontSize: 14.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          if (txn.modelName != null && txn.modelName!.isNotEmpty) ...[
            SizedBox(height: 1.h),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.4.h),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                'Device: ${txn.modelName}',
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF334155),
                ),
              ),
            ),
          ],

          SizedBox(height: 1.h),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          SizedBox(height: 1.h),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.tag_rounded, size: 14, color: Color(0xFF94A3B8)),
                  SizedBox(width: 1.w),
                  Text(
                    txn.referenceId.isNotEmpty ? txn.referenceId : 'UTR-LIVE-IMPS',
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: const Color(0xFF64748B),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              Text(
                _formatDateTime(txn.createdAt),
                style: TextStyle(
                  fontSize: 14.sp,
                  color: const Color(0xFF94A3B8),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
