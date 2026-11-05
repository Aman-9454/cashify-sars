import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../models/delivery_models.dart';
import '../bloc/tasks_cubit.dart';

class DoorstepPayoutDialog extends StatefulWidget {
  final DeliveryTask task;
  final TasksCubit tasksCubit;
  final VoidCallback? onPaid;

  const DoorstepPayoutDialog({
    super.key,
    required this.task,
    required this.tasksCubit,
    this.onPaid,
  });

  static Future<void> show({
    required BuildContext context,
    required DeliveryTask task,
    required TasksCubit tasksCubit,
    VoidCallback? onPaid,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => DoorstepPayoutDialog(
        task: task,
        tasksCubit: tasksCubit,
        onPaid: onPaid,
      ),
    );
  }

  @override
  State<DoorstepPayoutDialog> createState() => _DoorstepPayoutDialogState();
}

class _DoorstepPayoutDialogState extends State<DoorstepPayoutDialog> {
  String _selectedMethod = 'instant_upi'; // instant_upi, cash, bank_imps
  final _refController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _refController.dispose();
    super.dispose();
  }

  Future<void> _handleConfirmPayout() async {
    final ref = _refController.text.trim();
    if (_selectedMethod != 'cash' && ref.isEmpty) {
      showCustomSnackBar(
        context,
        'Please enter transaction UTR or reference number',
        isError: true,
      );
      return;
    }

    setState(() => _isSubmitting = true);
    final amount = widget.task.finalPrice > 0
        ? widget.task.finalPrice
        : widget.task.quotedPrice;

    final success = await widget.tasksCubit.updateTaskStatus(
      orderId: widget.task.id,
      status: 'picked_up',
      paymentStatus: 'paid',
      payoutMethod: _selectedMethod,
      finalPrice: amount,
      payoutReferenceId: ref.isNotEmpty ? ref : 'CASH-${DateTime.now().millisecondsSinceEpoch}',
      notes: 'Paid ₹${amount.toInt()} via ${_selectedMethod.toUpperCase()} (Ref: $ref)',
    );

    setState(() => _isSubmitting = false);

    if (success) {
      widget.onPaid?.call();
      if (mounted) {
        showCustomSnackBar(
          context,
          '💰 Payout of ₹${amount.toInt()} verified! Move to Step 4 (Hub Handover).',
          isError: false,
        );
        Navigator.pop(context);
      }
    } else {
      if (mounted) {
        showCustomSnackBar(
          context,
          'Failed to record payout. Please try again.',
          isError: true,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final amount = widget.task.finalPrice > 0
        ? widget.task.finalPrice
        : widget.task.quotedPrice;

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Row(
        children: [
          const Icon(Icons.payments_rounded, color: AppColors.success, size: 24),
          const SizedBox(width: 8),
          Text(
            'Step 3: Doorstep Spot Payout',
            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16.sp),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Disburse instant spot payment to ${widget.task.customerName} for ${widget.task.deviceName}.',
              style: TextStyle(fontSize: 14.sp, color: Colors.black54),
            ),
            const SizedBox(height: 14),

            // Amount Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: Column(
                children: [
                  Text(
                    'Disbursement Amount',
                    style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: const Color(0xFF065F46)),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    CurrencyFormatter.format(amount),
                    style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w900,
                      color: AppColors.success,
                    ),
                  ),
                  if (widget.task.inspectionScore != null)
                    Text(
                      'Inspection Health Score: ${widget.task.inspectionScore}%',
                      style: TextStyle(fontSize: 14.sp, color: const Color(0xFF047857), fontWeight: FontWeight.bold),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            Text('Select Payment Mode', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp)),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildMethodChip('instant_upi', 'Instant UPI', Icons.qr_code_rounded),
                const SizedBox(width: 8),
                _buildMethodChip('cash', 'Spot Cash', Icons.payments_outlined),
                const SizedBox(width: 8),
                _buildMethodChip('bank_imps', 'Bank IMPS', Icons.account_balance_outlined),
              ],
            ),
            const SizedBox(height: 16),

            Text('UTR / Reference ID', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp)),
            const SizedBox(height: 6),
            TextField(
              controller: _refController,
              style: TextStyle(fontSize: 15.sp),
              decoration: InputDecoration(
                hintText: 'Enter bank or UPI reference number',
                hintStyle: TextStyle(fontSize: 14.sp),
                prefixIcon: const Icon(Icons.receipt_long_rounded, size: 20),
                filled: true,
                fillColor: const Color(0xFFF8FAFC),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Cancel', style: TextStyle(fontSize: 15.sp)),
        ),
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.success,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          icon: _isSubmitting
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                )
              : const Icon(Icons.check_circle_rounded, size: 18),
          label: Text('Confirm Disbursed', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold)),
          onPressed: _isSubmitting ? null : _handleConfirmPayout,
        ),
      ],
    );
  }

  Widget _buildMethodChip(String key, String label, IconData icon) {
    final isSelected = _selectedMethod == key;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedMethod = key),
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF10B981) : Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? const Color(0xFF10B981) : const Color(0xFFCBD5E1),
              width: 1.5,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: const Color(0xFF10B981).withValues(alpha: 0.25),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 20, color: isSelected ? Colors.white : const Color(0xFF475569)),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : const Color(0xFF1E293B),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
