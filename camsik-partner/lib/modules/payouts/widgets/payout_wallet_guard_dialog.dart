import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/services/session_service.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../data/repositories/payouts_repository.dart';

class PayoutWalletGuard {
  PayoutWalletGuard._();

  /// Checks if the partner has at least [requiredAmount] in their payout wallet float.
  /// If not, displays an interactive modal requiring the partner to add funds before proceeding.
  /// Returns `true` if balance is sufficient (or funds were successfully added), `false` otherwise.
  static Future<bool> ensureSufficientBalance(
    BuildContext context, {
    required double requiredAmount,
    required String partnerId,
  }) async {
    // 1. Get current balance from API or local session
    final wallet = await PayoutsRepositoryImpl().fetchWalletData(partnerId);
    final user = SessionService.currentUser;
    double currentBalance = wallet?.availableBalance ?? (user?.availableBalance ?? 0.0);

    if (currentBalance >= requiredAmount) {
      return true; // Already sufficient
    }

    final deficit = (requiredAmount - currentBalance).ceilToDouble();

    if (!context.mounted) return false;

    // 2. Show Insufficient Payout Wallet Sheet
    final addedSuccessfully = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withValues(alpha: 0.6),
      builder: (ctx) => _InsufficientBalanceSheet(
        partnerId: partnerId,
        requiredAmount: requiredAmount,
        currentBalance: currentBalance,
        suggestedDeficit: deficit,
      ),
    );

    return addedSuccessfully == true;
  }
}

class _InsufficientBalanceSheet extends StatefulWidget {
  final String partnerId;
  final double requiredAmount;
  final double currentBalance;
  final double suggestedDeficit;

  const _InsufficientBalanceSheet({
    required this.partnerId,
    required this.requiredAmount,
    required this.currentBalance,
    required this.suggestedDeficit,
  });

  @override
  State<_InsufficientBalanceSheet> createState() => _InsufficientBalanceSheetState();
}

class _InsufficientBalanceSheetState extends State<_InsufficientBalanceSheet> {
  late final TextEditingController _amountController;
  bool _isSubmitting = false;
  final String _selectedMethod = 'Instant UPI';

  @override
  void initState() {
    super.initState();
    _amountController = TextEditingController(text: widget.suggestedDeficit.toStringAsFixed(0));
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _handleAddFunds() async {
    final amt = double.tryParse(_amountController.text.trim()) ?? 0.0;
    if (amt <= 0) return;

    setState(() => _isSubmitting = true);
    final res = await ApiService.addWalletFunds(
      partnerId: widget.partnerId,
      amount: amt,
      method: _selectedMethod,
    );

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (res['success'] == true) {
      // Update session user balance
      final user = SessionService.currentUser;
      if (user != null) {
        user.availableBalance = widget.currentBalance + amt;
        await SessionService.saveSession(user);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF059669),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            content: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
                SizedBox(width: 2.w),
                Expanded(
                  child: Text(
                    '₹${amt.toStringAsFixed(0)} added to wallet! You can now complete the order.',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp),
                  ),
                ),
              ],
            ),
          ),
        );
        Navigator.pop(context, true);
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: const Color(0xFFEF4444),
          behavior: SnackBarBehavior.floating,
          content: Text(res['message']?.toString() ?? 'Failed to add funds. Please try again.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        5.w,
        2.5.h,
        5.w,
        MediaQuery.of(context).viewInsets.bottom + 3.h,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
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

          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFFECACA)),
                ),
                child: const Icon(
                  Icons.account_balance_wallet_rounded,
                  color: Color(0xFFDC2626),
                  size: 26,
                ),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Insufficient Payout Balance',
                      style: TextStyle(
                        fontSize: 16.5.sp,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF0F172A),
                      ),
                    ),
                    Text(
                      'Add funds to wallet to disburse payout & complete order',
                      style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 2.h),

          // Balance comparison card
          Container(
            padding: EdgeInsets.all(4.w),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Order Payable Amount:',
                      style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B), fontWeight: FontWeight.w600),
                    ),
                    Text(
                      CurrencyFormatter.format(widget.requiredAmount),
                      style: TextStyle(fontSize: 14.5.sp, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A)),
                    ),
                  ],
                ),
                SizedBox(height: 1.h),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Current Payout Wallet Float:',
                      style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B), fontWeight: FontWeight.w600),
                    ),
                    Text(
                      CurrencyFormatter.format(widget.currentBalance),
                      style: TextStyle(fontSize: 14.5.sp, fontWeight: FontWeight.w800, color: const Color(0xFFDC2626)),
                    ),
                  ],
                ),
                const Divider(height: 20, color: Color(0xFFE2E8F0)),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Minimum Required to Add:',
                      style: TextStyle(fontSize: 14.sp, color: const Color(0xFF047857), fontWeight: FontWeight.w700),
                    ),
                    Text(
                      CurrencyFormatter.format(widget.suggestedDeficit),
                      style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w900, color: const Color(0xFF047857)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(height: 2.h),

          // Quick selection chips
          Text(
            'Select / Edit Top-up Amount',
            style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A)),
          ),
          SizedBox(height: 1.h),
          Wrap(
            spacing: 2.w,
            runSpacing: 1.h,
            children: [
              widget.suggestedDeficit,
              widget.suggestedDeficit + 2000,
              widget.suggestedDeficit + 5000,
              widget.suggestedDeficit + 10000,
            ].map((amt) {
              final isSelected = _amountController.text == amt.toStringAsFixed(0);
              return InkWell(
                onTap: () {
                  setState(() {
                    _amountController.text = amt.toStringAsFixed(0);
                  });
                },
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.7.h),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF059669) : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '₹${amt.toStringAsFixed(0)}',
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
          SizedBox(height: 1.5.h),

          // Custom amount input
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A)),
            decoration: InputDecoration(
              labelText: 'Top-up Amount (₹)',
              prefixText: '₹ ',
              prefixStyle: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold, color: const Color(0xFF059669)),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.2.h),
            ),
          ),
          SizedBox(height: 2.5.h),

          // Submit button
          Row(
            children: [
              Expanded(
                child: TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  style: TextButton.styleFrom(
                    foregroundColor: const Color(0xFF64748B),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: Text('Cancel', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600)),
                ),
              ),
              SizedBox(width: 3.w),
              Expanded(
                flex: 2,
                child: SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _handleAddFunds,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 2,
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : Text(
                            'Add Funds & Continue',
                            style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
                          ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
