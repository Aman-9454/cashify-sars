import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../models/delivery_models.dart';
import '../bloc/tasks_cubit.dart';

class HubDepositDialog extends StatefulWidget {
  final DeliveryTask task;
  final TasksCubit tasksCubit;
  final VoidCallback? onCompleted;

  const HubDepositDialog({
    super.key,
    required this.task,
    required this.tasksCubit,
    this.onCompleted,
  });

  static void show({
    required BuildContext context,
    required DeliveryTask task,
    required TasksCubit tasksCubit,
    VoidCallback? onCompleted,
  }) {
    showDialog(
      context: context,
      builder: (ctx) => HubDepositDialog(
        task: task,
        tasksCubit: tasksCubit,
        onCompleted: onCompleted,
      ),
    );
  }

  @override
  State<HubDepositDialog> createState() => _HubDepositDialogState();
}

class _HubDepositDialogState extends State<HubDepositDialog> {
  bool _isSubmitting = false;

  Future<void> _handleComplete() async {
    setState(() => _isSubmitting = true);

    final success = await widget.tasksCubit.updateTaskStatus(
      orderId: widget.task.id,
      status: 'completed',
      deviceCollected: true,
      paymentStatus: 'paid',
      notes: '${widget.task.notes.isNotEmpty ? "${widget.task.notes} | " : ""}Order finalized & deposited to partner hub.',
    );

    setState(() => _isSubmitting = false);

    if (success) {
      widget.onCompleted?.call();
      if (mounted) {
        showCustomSnackBar(
          context,
          '🎉 Order #${widget.task.orderNumber} successfully completed & deposited to hub!',
          isError: false,
        );
        Navigator.pop(context);
      }
    } else {
      if (mounted) {
        showCustomSnackBar(
          context,
          'Failed to complete order. Please check network connection.',
          isError: true,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: const Color(0xFF0D9488).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.storefront_rounded, color: Color(0xFF0D9488), size: 22),
          ),
          const SizedBox(width: 8),
          Text(
            'Step 4: Hub Deposit',
            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16.sp),
          ),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Deposit device to partner hub and finalize order #${widget.task.orderNumber}.',
            style: TextStyle(fontSize: 14.sp, color: Colors.black54),
          ),
          const SizedBox(height: 14),

          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDFA),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF99F6E4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.task.deviceName,
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15.sp),
                    ),
                    Text(
                      CurrencyFormatter.format(widget.task.finalPrice),
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16.sp, color: AppColors.secondary),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Assigned Partner: ${widget.task.partnerName ?? "Camsik Central Hub"}',
                  style: TextStyle(fontSize: 14.sp, color: Colors.black87),
                ),
                const SizedBox(height: 4),
                Text(
                  'Customer: ${widget.task.customerName} (${widget.task.city})',
                  style: TextStyle(fontSize: 14.sp, color: Colors.black54),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              const Icon(Icons.check_circle, size: 16, color: AppColors.success),
              const SizedBox(width: 6),
              Text('Inspection verified & IMEI recorded', style: TextStyle(fontSize: 14.sp, color: Colors.black87)),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.check_circle, size: 16, color: AppColors.success),
              const SizedBox(width: 6),
              Text('Doorstep payment disbursed to customer', style: TextStyle(fontSize: 14.sp, color: Colors.black87)),
            ],
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Cancel', style: TextStyle(fontSize: 15.sp)),
        ),
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0D9488),
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
              : const Icon(Icons.verified_rounded, size: 18),
          label: Text('Complete & Lock Order', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold)),
          onPressed: _isSubmitting ? null : _handleComplete,
        ),
      ],
    );
  }
}
