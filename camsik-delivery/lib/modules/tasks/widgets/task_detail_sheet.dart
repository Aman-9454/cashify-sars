import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../models/delivery_models.dart';
import '../bloc/tasks_cubit.dart';
import 'doorstep_inspection_sheet.dart';
import 'doorstep_payout_dialog.dart';
import 'hub_deposit_dialog.dart';

class TaskDetailSheet {
  static void show({
    required BuildContext context,
    required DeliveryTask task,
    required TasksCubit tasksCubit,
    VoidCallback? onRefresh,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isCompleted = task.status == 'completed';
        final isStep1Done = task.isStep1Done;
        final isStep2Done = task.isStep2Done;
        final isStep3Done = task.isStep3Done;
        final isStep4Done = task.isStep4Done;

        return DraggableScrollableSheet(
          initialChildSize: 0.82,
          maxChildSize: 0.95,
          minChildSize: 0.5,
          builder: (_, scrollController) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.all(20),
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.black12,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '#${task.orderNumber}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 16,
                              color: AppColors.primary,
                            ),
                          ),
                          Text(
                            task.taskTypeDisplay,
                            style: const TextStyle(fontSize: 11, color: Colors.black54),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: task.statusColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          task.statusDisplay,
                          style: TextStyle(
                            color: task.statusColor,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Scheduled Slot Banner
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFDE68A)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.alarm_on_rounded, size: 18, color: Color(0xFFB45309)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                task.timeSectionLabel,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 12,
                                  color: Color(0xFF92400E),
                                ),
                              ),
                              Text(
                                'Scheduled Slot: ${task.pickupSlot} (${task.pickupDate})',
                                style: const TextStyle(fontSize: 11, color: Color(0xFFB45309)),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Customer & Location
                  const Text(
                    'Customer & Doorstep Location',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Colors.black54,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    task.customerName,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  const SizedBox(height: 4),
                  InkWell(
                    onTap: () => openDialer(task.customerPhone),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.phone, size: 14, color: AppColors.info),
                        const SizedBox(width: 4),
                        Text(
                          '${task.customerPhone} (Tap to Call)',
                          style: const TextStyle(
                            color: AppColors.info,
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 6),
                  InkWell(
                    onTap: () => openGoogleMapsNavigation(
                      '${task.customerAddress}, ${task.city} ${task.pinCode}',
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.navigation, size: 14, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            '${task.customerAddress}, ${task.city} - ${task.pinCode} (Tap to Navigate)',
                            style: const TextStyle(color: Colors.black87, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Device Details
                  const Text(
                    'Gadget Details',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: Colors.black54,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    task.deviceName,
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                  ),
                  if (task.partnerName != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      'Assigned Partner: ${task.partnerName}',
                      style: const TextStyle(fontSize: 11, color: Colors.black54),
                    ),
                  ],
                  const SizedBox(height: 12),

                  // Deal Value Card
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Payout Value',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Colors.black54,
                              ),
                            ),
                            if (task.inspectionScore != null)
                              Text(
                                'Inspection Score: ${task.inspectionScore}%',
                                style: const TextStyle(fontSize: 10, color: Color(0xFF6366F1), fontWeight: FontWeight.bold),
                              ),
                          ],
                        ),
                        Text(
                          CurrencyFormatter.format(task.finalPrice > 0 ? task.finalPrice : task.quotedPrice),
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: AppColors.secondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // ── 4-STEP PIPELINE ACTIONS (Matching Web) ──
                  const Text(
                    '4-Step Doorstep Execution Pipeline',
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 13,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Step 1: On The Way
                  _buildPipelineActionTile(
                    stepNum: '1',
                    title: 'On The Way (En Route)',
                    subtext: 'Mark out for pickup & notify customer with live tracking',
                    icon: Icons.two_wheeler_rounded,
                    isDone: isStep1Done,
                    isDisabled: isCompleted || isStep1Done,
                    buttonText: isStep1Done ? 'En Route Synced' : 'Start Pickup',
                    color: const Color(0xFFF59E0B),
                    onTap: () async {
                      Navigator.pop(ctx);
                      final success = await tasksCubit.updateTaskStatus(
                        orderId: task.id,
                        status: 'pickup_scheduled',
                        pickupDate: 'Today',
                      );
                      if (success) {
                        onRefresh?.call();
                        if (context.mounted) {
                          showCustomSnackBar(context, '🚚 En route to pickup! Synced.', isError: false);
                        }
                      }
                    },
                  ),
                  const SizedBox(height: 8),

                  // Step 2: Diagnostic
                  _buildPipelineActionTile(
                    stepNum: '2',
                    title: '12-Point Doorstep Diagnostic',
                    subtext: 'Inspect 12 hardware points, photos & verify handover OTP',
                    icon: Icons.fact_check_rounded,
                    isDone: isStep2Done,
                    isDisabled: isCompleted,
                    buttonText: isStep2Done ? 'Inspected (${task.inspectionScore ?? 100}%)' : 'Run Inspection',
                    color: const Color(0xFF6366F1),
                    onTap: () {
                      Navigator.pop(ctx);
                      DoorstepInspectionSheet.show(
                        context: context,
                        task: task,
                        tasksCubit: tasksCubit,
                        onComplete: onRefresh,
                      );
                    },
                  ),
                  const SizedBox(height: 8),

                  // Step 3: Amount Paid
                  _buildPipelineActionTile(
                    stepNum: '3',
                    title: 'Amount Paid (Instant Payout)',
                    subtext: 'Disburse instant UPI/Cash/IMPS spot payment to customer',
                    icon: Icons.currency_rupee_rounded,
                    isDone: isStep3Done,
                    isDisabled: isCompleted || isStep3Done,
                    buttonText: isStep3Done ? 'Paid (Disbursed)' : 'Disburse Payout',
                    color: const Color(0xFF10B981),
                    onTap: () {
                      Navigator.pop(ctx);
                      DoorstepPayoutDialog.show(
                        context: context,
                        task: task,
                        tasksCubit: tasksCubit,
                        onPaid: onRefresh,
                      );
                    },
                  ),
                  const SizedBox(height: 8),

                  // Step 4: Completed
                  _buildPipelineActionTile(
                    stepNum: '4',
                    title: 'Order Completed & Hub Deposit',
                    subtext: 'Hand over device to partner hub and finalize order',
                    icon: Icons.check_circle_rounded,
                    isDone: isStep4Done,
                    isDisabled: isCompleted,
                    buttonText: isCompleted ? 'Completed 🔒' : 'Deposit & Lock',
                    color: const Color(0xFF0D9488),
                    onTap: () {
                      Navigator.pop(ctx);
                      HubDepositDialog.show(
                        context: context,
                        task: task,
                        tasksCubit: tasksCubit,
                        onCompleted: onRefresh,
                      );
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  static Widget _buildPipelineActionTile({
    required String stepNum,
    required String title,
    required String subtext,
    required IconData icon,
    required bool isDone,
    required bool isDisabled,
    required String buttonText,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDone ? color.withValues(alpha: 0.08) : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDone ? color.withValues(alpha: 0.4) : const Color(0xFFE2E8F0),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: isDone ? color : color.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Icon(
                isDone ? Icons.check : icon,
                size: 16,
                color: isDone ? Colors.white : color,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
                Text(
                  subtext,
                  style: const TextStyle(fontSize: 10, color: Colors.black54),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: isDone ? Colors.grey.shade200 : color,
              foregroundColor: isDone ? Colors.black54 : Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              elevation: isDone ? 0 : 1,
            ),
            onPressed: isDisabled ? null : onTap,
            child: Text(
              buttonText,
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
