import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../models/delivery_models.dart';
import '../bloc/tasks_cubit.dart';
import '../screens/doorstep_inspection_screen.dart';
import 'doorstep_payout_dialog.dart';
import 'hub_deposit_dialog.dart';

class TaskCardWidget extends StatelessWidget {
  final DeliveryTask task;
  final TasksCubit tasksCubit;
  final VoidCallback? onRefresh;
  final VoidCallback? onTap;

  const TaskCardWidget({
    super.key,
    required this.task,
    required this.tasksCubit,
    this.onRefresh,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isCompleted = task.status == 'completed';
    final isStep1Done = task.isStep1Done;
    final isStep2Done = task.isStep2Done;
    final isStep3Done = task.isStep3Done;
    final isStep4Done = task.isStep4Done;

    final slotPeriod = task.slotPeriod;
    final dayGroup = task.dayGroup;
    final Color slotBgColor;
    final Color slotTextColor;
    final IconData slotIcon;

    if (slotPeriod == SlotPeriod.morning) {
      slotBgColor = const Color(0xFFFEF3C7);
      slotTextColor = const Color(0xFFB45309);
      slotIcon = Icons.wb_sunny_outlined;
    } else if (slotPeriod == SlotPeriod.afternoon) {
      slotBgColor = const Color(0xFFFFEDD5);
      slotTextColor = const Color(0xFFC2410C);
      slotIcon = Icons.wb_sunny_rounded;
    } else {
      slotBgColor = const Color(0xFFEDE9FE);
      slotTextColor = const Color(0xFF6D28D9);
      slotIcon = Icons.nightlight_round;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Top row: Time slot chip & Status pill
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: slotBgColor,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: slotTextColor.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(slotIcon, size: 14, color: slotTextColor),
                          const SizedBox(width: 5),
                          Text(
                            '${dayGroup == DayGroup.today ? "Today" : (dayGroup == DayGroup.tomorrow ? "Tomorrow" : task.pickupDate)} • ${task.pickupSlot}',
                            style: TextStyle(color: slotTextColor, fontSize: 14.sp, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    _buildStatusBadge(task),
                  ],
                ),
                const SizedBox(height: 12),

                // 2. Device info with Thumbnail & Price
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        width: 50,
                        height: 56,
                        color: const Color(0xFFF8FAFC),
                        child: _buildDeviceThumbnail(task),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            task.deviceName,
                            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16.sp, color: const Color(0xFF0F172A)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 3),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(6)),
                                child: Text('#${task.orderNumber}', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: const Color(0xFF475569))),
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  task.taskTypeDisplay,
                                  style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B), fontWeight: FontWeight.w600),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          CurrencyFormatter.format(task.finalPrice > 0 ? task.finalPrice : task.quotedPrice),
                          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18.sp, color: const Color(0xFF0F172A)),
                        ),
                        if (task.paymentStatus == 'paid')
                          Container(
                            margin: const EdgeInsets.only(top: 2),
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: const Color(0xFFDCFCE7), borderRadius: BorderRadius.circular(6)),
                            child: Text('PAID 🟢', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w900, color: const Color(0xFF16A34A))),
                          ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // 3. Customer Info & Quick Action Pills (Call / Maps)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Row(
                              children: [
                                Container(
                                  width: 28,
                                  height: 28,
                                  decoration: const BoxDecoration(color: Color(0xFFFFEDD5), shape: BoxShape.circle),
                                  child: const Center(child: Icon(Icons.person_rounded, size: 16, color: Color(0xFFEA580C))),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    task.customerName,
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15.sp, color: const Color(0xFF0F172A)),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              InkWell(
                                onTap: () => openDialer(task.customerPhone),
                                borderRadius: BorderRadius.circular(10),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEFF6FF),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: const Color(0xFFBFDBFE)),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.phone_rounded, size: 13, color: Color(0xFF2563EB)),
                                      const SizedBox(width: 4),
                                      Text('Call', style: TextStyle(color: const Color(0xFF2563EB), fontSize: 14.sp, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 6),
                              InkWell(
                                onTap: () => openGoogleMapsNavigation('${task.customerAddress}, ${task.city} ${task.pinCode}'),
                                borderRadius: BorderRadius.circular(10),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFF7ED),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: const Color(0xFFFED7AA)),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.near_me_rounded, size: 13, color: Color(0xFFEA580C)),
                                      const SizedBox(width: 4),
                                      Text('Maps', style: TextStyle(color: const Color(0xFFEA580C), fontSize: 14.sp, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      InkWell(
                        onTap: () => openGoogleMapsNavigation('${task.customerAddress}, ${task.city} ${task.pinCode}'),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.location_on_rounded, size: 16, color: Color(0xFFEA580C)),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                '${task.customerAddress}, ${task.city} - ${task.pinCode}',
                                style: TextStyle(color: const Color(0xFF334155), fontSize: 14.sp, fontWeight: FontWeight.w600),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // 4. Modern Workflow Stepper & Action Tiles (No Steps Numbering)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'ORDER WORKFLOW',
                            style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A), letterSpacing: 0.4),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: isCompleted ? const Color(0xFFDCFCE7) : const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              isCompleted ? 'Completed 🔒' : 'Live Sync',
                              style: TextStyle(
                                fontSize: 14.sp,
                                fontWeight: FontWeight.bold,
                                color: isCompleted ? const Color(0xFF16A34A) : const Color(0xFF2563EB),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // Stepper progress indicator track
                      _buildProgressStepper(isStep1Done, isStep2Done, isStep3Done, isStep4Done),
                      const SizedBox(height: 12),

                      // 4 Action Tiles: On Way, Diagnostic, Instant Pay, Complete
                      Row(
                        children: [
                          Expanded(
                            child: _buildWorkflowTile(
                              label: 'On Way',
                              icon: Icons.two_wheeler_rounded,
                              isDone: isStep1Done,
                              isActive: task.status == 'pickup_scheduled' || task.status == 'in_transit',
                              isDisabled: isCompleted || isStep1Done,
                              onPressed: () async {
                                final success = await tasksCubit.updateTaskStatus(
                                  orderId: task.id,
                                  status: 'pickup_scheduled',
                                  pickupDate: 'Today',
                                );
                                if (success) {
                                  onRefresh?.call();
                                  if (context.mounted) {
                                    showCustomSnackBar(context, '🚚 En route to ${task.customerName}!', isError: false);
                                  }
                                }
                              },
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: _buildWorkflowTile(
                              label: 'Diagnostic',
                              icon: Icons.fact_check_rounded,
                              isDone: isStep2Done,
                              isActive: task.status == 'inspection',
                              isDisabled: isCompleted,
                              onPressed: () {
                                DoorstepInspectionScreen.navigateTo(
                                  context: context,
                                  task: task,
                                  tasksCubit: tasksCubit,
                                  onComplete: onRefresh,
                                );
                              },
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: _buildWorkflowTile(
                              label: 'Instant Pay',
                              icon: Icons.currency_rupee_rounded,
                              isDone: isStep3Done,
                              isActive: task.paymentStatus == 'paid',
                              isDisabled: isCompleted || isStep3Done,
                              onPressed: () {
                                DoorstepPayoutDialog.show(
                                  context: context,
                                  task: task,
                                  tasksCubit: tasksCubit,
                                  onPaid: onRefresh,
                                );
                              },
                            ),
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: _buildWorkflowTile(
                              label: isCompleted ? 'Done' : 'Complete',
                              icon: Icons.check_circle_rounded,
                              isDone: isStep4Done,
                              isActive: isCompleted,
                              isDisabled: isCompleted,
                              onPressed: () {
                                HubDepositDialog.show(
                                  context: context,
                                  task: task,
                                  tasksCubit: tasksCubit,
                                  onCompleted: onRefresh,
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(DeliveryTask task) {
    Color bg = const Color(0xFFEFF6FF);
    Color text = const Color(0xFF2563EB);

    final s = task.status.toLowerCase();
    if (s.contains('completed') || s.contains('paid')) {
      bg = const Color(0xFFDCFCE7);
      text = const Color(0xFF16A34A);
    } else if (s.contains('assigned') || s.contains('created')) {
      bg = const Color(0xFFF1F5F9);
      text = const Color(0xFF475569);
    } else if (s.contains('pickup') || s.contains('route') || s.contains('transit')) {
      bg = const Color(0xFFEFF6FF);
      text = const Color(0xFF2563EB);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
      child: Text(task.statusDisplay, style: TextStyle(color: text, fontSize: 14.sp, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildProgressStepper(bool s1, bool s2, bool s3, bool s4) {
    return Row(
      children: [
        _buildStepNode(isDone: s1, icon: Icons.two_wheeler_rounded),
        Expanded(child: _buildStepLine(isDone: s2)),
        _buildStepNode(isDone: s2, icon: Icons.fact_check_rounded),
        Expanded(child: _buildStepLine(isDone: s3)),
        _buildStepNode(isDone: s3, icon: Icons.currency_rupee_rounded),
        Expanded(child: _buildStepLine(isDone: s4)),
        _buildStepNode(isDone: s4, icon: Icons.check_circle_rounded),
      ],
    );
  }

  Widget _buildStepNode({required bool isDone, required IconData icon}) {
    return Container(
      width: 22,
      height: 22,
      decoration: BoxDecoration(
        color: isDone ? const Color(0xFF16A34A) : Colors.white,
        shape: BoxShape.circle,
        border: Border.all(color: isDone ? const Color(0xFF16A34A) : const Color(0xFFCBD5E1), width: 2),
      ),
      child: Center(
        child: Icon(isDone ? Icons.check : icon, size: 12, color: isDone ? Colors.white : const Color(0xFF94A3B8)),
      ),
    );
  }

  Widget _buildStepLine({required bool isDone}) {
    return Container(
      height: 3,
      color: isDone ? const Color(0xFF16A34A) : const Color(0xFFE2E8F0),
    );
  }

  Widget _buildWorkflowTile({
    required String label,
    required IconData icon,
    required bool isDone,
    required bool isActive,
    required bool isDisabled,
    required VoidCallback onPressed,
  }) {
    Color bg = Colors.white;
    Color fg = const Color(0xFF475569);
    Border border = Border.all(color: const Color(0xFFE2E8F0), width: 1.2);

    if (isDone) {
      bg = const Color(0xFFDCFCE7);
      fg = const Color(0xFF15803D);
      border = Border.all(color: const Color(0xFF86EFAC), width: 1.2);
    } else if (isActive) {
      bg = const Color(0xFFFEF3C7);
      fg = const Color(0xFFB45309);
      border = Border.all(color: const Color(0xFFFCD34D), width: 1.2);
    }

    return InkWell(
      onTap: isDisabled ? null : onPressed,
      borderRadius: BorderRadius.circular(10),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10), border: border),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(isDone ? Icons.check_circle_rounded : icon, size: 16, color: fg),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: fg),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeviceThumbnail(DeliveryTask task) {
    final name = task.deviceName.toLowerCase();
    String? imageUrl;
    if (name.contains('iphone')) {
      imageUrl = 'https://casmik-one.vercel.app/assets/images/refurbished/iphone-15-pro.png';
    } else if (name.contains('oneplus')) {
      imageUrl = 'https://casmik-one.vercel.app/assets/images/refurbished/oneplus-12.png';
    } else if (name.contains('macbook') || name.contains('laptop')) {
      imageUrl = 'https://casmik-one.vercel.app/assets/images/refurbished/macbook-air-m2.png';
    } else if (name.contains('dslr') || name.contains('canon') || name.contains('camera')) {
      imageUrl = 'https://casmik-one.vercel.app/assets/images/categories/dslr.png';
    }
    if (imageUrl != null) {
      return Image.network(
        imageUrl,
        fit: BoxFit.contain,
        errorBuilder: (ctx, err, stack) => _buildDeviceIconFallback(task),
      );
    }
    return _buildDeviceIconFallback(task);
  }

  Widget _buildDeviceIconFallback(DeliveryTask task) {
    IconData icon = Icons.phone_iphone_rounded;
    Color color = const Color(0xFFEA580C);

    switch (task.detectedCategory) {
      case DeviceCategory.camera:
        icon = Icons.camera_alt_outlined; color = const Color(0xFF2563EB); break;
      case DeviceCategory.lens:
        icon = Icons.camera_rounded; color = const Color(0xFF0D9488); break;
      case DeviceCategory.laptop:
        icon = Icons.laptop_mac_rounded; color = const Color(0xFF4F46E5); break;
      case DeviceCategory.tablet:
        icon = Icons.tablet_mac_rounded; color = const Color(0xFF7C3AED); break;
      case DeviceCategory.smartwatch:
        icon = Icons.watch_rounded; color = const Color(0xFFE11D48); break;
      case DeviceCategory.smartphone:
        icon = Icons.phone_iphone_rounded; color = const Color(0xFFEA580C); break;
    }

    return Center(child: Icon(icon, color: color, size: 24));
  }
}
