import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../models/delivery_models.dart';
import '../bloc/tasks_cubit.dart';
import '../widgets/doorstep_payout_dialog.dart';
import '../widgets/hub_deposit_dialog.dart';
import 'doorstep_inspection_screen.dart';

class DeliveryOrderDetailScreen extends StatefulWidget {
  final DeliveryTask task;
  final TasksCubit tasksCubit;
  final VoidCallback? onRefresh;

  const DeliveryOrderDetailScreen({
    super.key,
    required this.task,
    required this.tasksCubit,
    this.onRefresh,
  });

  static Future<void> navigateTo({
    required BuildContext context,
    required DeliveryTask task,
    required TasksCubit tasksCubit,
    VoidCallback? onRefresh,
  }) {
    return Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => DeliveryOrderDetailScreen(
          task: task,
          tasksCubit: tasksCubit,
          onRefresh: onRefresh,
        ),
      ),
    );
  }

  @override
  State<DeliveryOrderDetailScreen> createState() => _DeliveryOrderDetailScreenState();
}

class _DeliveryOrderDetailScreenState extends State<DeliveryOrderDetailScreen> {
  late DeliveryTask _task;
  bool _isEnRouteUpdating = false;

  @override
  void initState() {
    super.initState();
    _task = widget.task;
  }

  Future<void> _refreshOrderState() async {
    widget.onRefresh?.call();
    if (mounted) setState(() {});
  }

  Future<void> _handleStartPickup() async {
    setState(() => _isEnRouteUpdating = true);
    final success = await widget.tasksCubit.updateTaskStatus(
      orderId: _task.id,
      status: 'pickup_scheduled',
      pickupDate: 'Today',
    );
    setState(() => _isEnRouteUpdating = false);

    if (success) {
      setState(() => _task.status = 'pickup_scheduled');
      _refreshOrderState();
      if (mounted) {
        showCustomSnackBar(context, '🚚 Status updated to En Route! Customer and Hub notified.', isError: false);
      }
    } else {
      if (mounted) {
        showCustomSnackBar(context, 'Could not update status. Please check your internet.', isError: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isCompleted = _task.status == 'completed';
    final isStep1Done = _task.isStep1Done;
    final isStep2Done = _task.isStep2Done;
    final isStep3Done = _task.isStep3Done;
    final isStep4Done = _task.isStep4Done;

    final slotPeriod = _task.slotPeriod;
    final dayGroup = _task.dayGroup;
    final Color slotBg;
    final Color slotText;
    final IconData slotIcon;

    if (slotPeriod == SlotPeriod.morning) {
      slotBg = const Color(0xFFFEF3C7); slotText = const Color(0xFFB45309); slotIcon = Icons.wb_sunny_outlined;
    } else if (slotPeriod == SlotPeriod.afternoon) {
      slotBg = const Color(0xFFFFEDD5); slotText = const Color(0xFFC2410C); slotIcon = Icons.wb_sunny_rounded;
    } else {
      slotBg = const Color(0xFFEDE9FE); slotText = const Color(0xFF6D28D9); slotIcon = Icons.nightlight_round;
    }

    final effectivePrice = _task.finalPrice > 0 ? _task.finalPrice : _task.quotedPrice;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.black87, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '#${_task.orderNumber}',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16.sp, color: const Color(0xFF1E293B)),
            ),
            Text(
              _task.taskTypeDisplay,
              style: TextStyle(fontSize: 14.sp, color: Colors.black54, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: _task.statusColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              _task.statusDisplay,
              style: TextStyle(color: _task.statusColor, fontSize: 14.sp, fontWeight: FontWeight.w900),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // TIME-SLOT BANNER
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: slotBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: slotText.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                    child: Icon(slotIcon, color: slotText, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${dayGroup == DayGroup.today ? "TODAY" : (dayGroup == DayGroup.tomorrow ? "TOMORROW" : _task.pickupDate.toUpperCase())} • ${_task.slotPeriod == SlotPeriod.morning ? "MORNING SLOT" : (_task.slotPeriod == SlotPeriod.afternoon ? "AFTERNOON" : "EVENING")}',
                          style: TextStyle(color: slotText, fontWeight: FontWeight.w900, fontSize: 14.sp),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Scheduled Doorstep Window: ${_task.pickupSlot}',
                          style: TextStyle(color: slotText.withValues(alpha: 0.9), fontSize: 14.sp, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // GADGET & VALUATION CARD
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'DEVICE UNDER EVALUATION',
                              style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: Colors.black45),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _task.deviceName,
                              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16.sp, color: const Color(0xFF0F172A)),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            'DEAL VALUE',
                            style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: Colors.black45),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            CurrencyFormatter.format(effectivePrice),
                            style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w900, color: AppColors.secondary),
                          ),
                          if (_task.paymentStatus == 'paid')
                            Text('PAID 🟢', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w900, color: const Color(0xFF10B981))),
                        ],
                      ),
                    ],
                  ),
                  const Divider(height: 24, color: Color(0xFFF1F5F9)),
                  Row(
                    children: [
                      _buildGadgetInfoPill(
                        icon: Icons.storefront_rounded,
                        label: 'Partner',
                        value: _task.partnerName ?? 'Central Hub',
                        color: const Color(0xFF0284C7),
                      ),
                      const SizedBox(width: 8),
                      _buildGadgetInfoPill(
                        icon: Icons.qr_code_scanner_rounded,
                        label: 'IMEI',
                        value: _task.deviceImei != null && _task.deviceImei!.isNotEmpty ? _task.deviceImei! : 'Pending',
                        color: const Color(0xFF475569),
                      ),
                    ],
                  ),
                  if (_task.inspectionScore != null) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(8)),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.check_circle, size: 16, color: Color(0xFF10B981)),
                          const SizedBox(width: 6),
                          Text(
                            'Doorstep Inspection Score: ${_task.inspectionScore}%',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp, color: const Color(0xFF065F46)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),

            // CUSTOMER & LOCATION CARD
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'CUSTOMER CONTACT & DESTINATION',
                    style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: Colors.black45),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(color: const Color(0xFFEFF6FF), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.person_rounded, color: Color(0xFF2563EB)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _task.customerName,
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15.sp, color: const Color(0xFF0F172A)),
                            ),
                            const SizedBox(height: 2),
                            Text(_task.customerPhone, style: TextStyle(color: Colors.black54, fontSize: 14.sp)),
                          ],
                        ),
                      ),
                      InkWell(
                        onTap: () => openDialer(_task.customerPhone),
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(12)),
                          child: const Icon(Icons.phone_in_talk_rounded, size: 20, color: AppColors.info),
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 24, color: Color(0xFFF1F5F9)),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(10)),
                        child: const Icon(Icons.location_on_rounded, size: 20, color: AppColors.primary),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_task.isPickup ? 'PICKUP ADDRESS' : 'DELIVERY ADDRESS', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: Colors.black45)),
                            const SizedBox(height: 2),
                            Text('${_task.customerAddress}, ${_task.city} - ${_task.pinCode}', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w600, color: const Color(0xFF1E293B))),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  InkWell(
                    onTap: () => openGoogleMapsNavigation('${_task.customerAddress}, ${_task.city} ${_task.pinCode}'),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)]),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [BoxShadow(color: const Color(0xFF2563EB).withValues(alpha: 0.25), blurRadius: 8, offset: const Offset(0, 3))],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.near_me_rounded, color: Colors.white, size: 18),
                          const SizedBox(width: 8),
                          Text('Open in Google Maps / Live GPS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14.sp)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 4-STEP DOORSTEP PIPELINE
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '4-STEP DOORSTEP PIPELINE',
                  style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A)),
                ),
                Text(
                  isCompleted ? 'Order Closed 🔒' : 'Live Syncing',
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                    color: isCompleted ? const Color(0xFF059669) : AppColors.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // STEP 1
            _buildPipelineStepCard(
              stepNumber: '1',
              title: 'On The Way (En Route)',
              subtitle: 'Mark out for pickup & notify customer with live tracking',
              icon: Icons.two_wheeler_rounded,
              isDone: isStep1Done,
              isActive: _task.status == 'pickup_scheduled' || _task.status == 'in_transit',
              isDisabled: isCompleted || isStep1Done,
              buttonText: isStep1Done ? 'En Route Synced' : 'Start Pickup',
              color: const Color(0xFFF59E0B),
              onAction: _handleStartPickup,
            ),
            const SizedBox(height: 10),

            // STEP 2
            _buildPipelineStepCard(
              stepNumber: '2',
              title: '12-Point Doorstep Diagnostic',
              subtitle: '12 physical checks, 8 angles photos & OTP verification',
              icon: Icons.fact_check_rounded,
              isDone: isStep2Done,
              isActive: _task.status == 'inspection',
              isDisabled: isCompleted,
              buttonText: isStep2Done ? 'Inspected (${_task.inspectionScore ?? 100}%)' : 'Open Diagnostic',
              color: const Color(0xFF6366F1),
              onAction: () async {
                await DoorstepInspectionScreen.navigateTo(
                  context: context,
                  task: _task,
                  tasksCubit: widget.tasksCubit,
                  onComplete: () {
                    setState(() {
                      _task.deviceCollected = true;
                      _task.status = 'picked_up';
                    });
                    _refreshOrderState();
                  },
                );
              },
            ),
            const SizedBox(height: 10),

            // STEP 3
            _buildPipelineStepCard(
              stepNumber: '3',
              title: 'Amount Paid (Instant Payout)',
              subtitle: 'Disburse spot payout via Instant UPI, Cash, or IMPS',
              icon: Icons.currency_rupee_rounded,
              isDone: isStep3Done,
              isActive: _task.paymentStatus == 'paid',
              isDisabled: isCompleted || isStep3Done,
              buttonText: isStep3Done ? 'Amount Paid (Verified)' : 'Disburse Payout',
              color: const Color(0xFF10B981),
              onAction: () {
                DoorstepPayoutDialog.show(
                  context: context,
                  task: _task,
                  tasksCubit: widget.tasksCubit,
                  onPaid: () {
                    setState(() => _task.paymentStatus = 'paid');
                    _refreshOrderState();
                  },
                );
              },
            ),
            const SizedBox(height: 10),

            // STEP 4
            _buildPipelineStepCard(
              stepNumber: '4',
              title: 'Order Completed & Hub Deposit',
              subtitle: 'Deposit device at partner hub and finalize order',
              icon: Icons.check_circle_rounded,
              isDone: isStep4Done,
              isActive: isCompleted,
              isDisabled: isCompleted,
              buttonText: isCompleted ? 'Completed 🔒' : 'Deposit & Lock',
              color: const Color(0xFF0D9488),
              onAction: () {
                HubDepositDialog.show(
                  context: context,
                  task: _task,
                  tasksCubit: widget.tasksCubit,
                  onCompleted: () {
                    setState(() => _task.status = 'completed');
                    _refreshOrderState();
                  },
                );
              },
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Colors.black.withValues(alpha: 0.06))),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -4)),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Current Stage:', style: TextStyle(fontSize: 14.sp, color: Colors.black54)),
                  Text(
                    _task.statusDisplay,
                    style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w900, color: _task.statusColor),
                  ),
                ],
              ),
            ),
            if (!isStep1Done && !isCompleted)
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF59E0B), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                icon: _isEnRouteUpdating ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Icon(Icons.two_wheeler_rounded, size: 18),
                label: Text('1. Start Pickup', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold)),
                onPressed: _isEnRouteUpdating ? null : _handleStartPickup,
              )
            else if (!isStep2Done && !isCompleted)
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                icon: const Icon(Icons.fact_check_rounded, size: 18),
                label: Text('2. Run Diagnostic', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold)),
                onPressed: () async {
                  await DoorstepInspectionScreen.navigateTo(context: context, task: _task, tasksCubit: widget.tasksCubit, onComplete: () {
                    setState(() { _task.deviceCollected = true; _task.status = 'picked_up'; });
                    _refreshOrderState();
                  });
                },
              )
            else if (!isStep3Done && !isCompleted)
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                icon: const Icon(Icons.currency_rupee_rounded, size: 18),
                label: Text('3. Pay Customer', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold)),
                onPressed: () => DoorstepPayoutDialog.show(context: context, task: _task, tasksCubit: widget.tasksCubit, onPaid: () {
                  setState(() => _task.paymentStatus = 'paid');
                  _refreshOrderState();
                }),
              )
            else if (!isCompleted)
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0D9488), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                icon: const Icon(Icons.check_circle_rounded, size: 18),
                label: Text('4. Complete Order', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold)),
                onPressed: () => HubDepositDialog.show(context: context, task: _task, tasksCubit: widget.tasksCubit, onCompleted: () {
                  setState(() => _task.status = 'completed');
                  _refreshOrderState();
                }),
              )
            else
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(color: const Color(0xFFECFDF5), borderRadius: BorderRadius.circular(10)),
                child: Row(
                  children: [
                    const Icon(Icons.lock_rounded, size: 16, color: Color(0xFF059669)),
                    const SizedBox(width: 4),
                    Text('Completed 🔒', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14.sp, color: const Color(0xFF059669))),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildGadgetInfoPill({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(width: 6),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: color)),
                  Text(
                    value,
                    style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPipelineStepCard({
    required String stepNumber,
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isDone,
    required bool isActive,
    required bool isDisabled,
    required String buttonText,
    required Color color,
    required VoidCallback onAction,
  }) {
    Color cardBg = Colors.white;
    Color border = const Color(0xFFE2E8F0);

    if (isDone) {
      cardBg = color.withValues(alpha: 0.06);
      border = color.withValues(alpha: 0.35);
    } else if (isActive) {
      cardBg = const Color(0xFFFEF3C7);
      border = const Color(0xFFFCD34D);
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: cardBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: border)),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(color: isDone ? color : color.withValues(alpha: 0.15), shape: BoxShape.circle),
            child: Center(child: Icon(isDone ? Icons.check_rounded : icon, size: 20, color: isDone ? Colors.white : color)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('STEP $stepNumber', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w900, color: color, letterSpacing: 0.5)),
                    if (isDone) ...[
                      const SizedBox(width: 4),
                      const Icon(Icons.check_circle_rounded, size: 14, color: Color(0xFF10B981)),
                    ],
                  ],
                ),
                Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15.sp, color: const Color(0xFF0F172A))),
                Text(subtitle, style: TextStyle(fontSize: 14.sp, color: Colors.black54), maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: isDone ? Colors.grey.shade200 : color, foregroundColor: isDone ? Colors.black54 : Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)), elevation: isDone ? 0 : 1,
            ),
            onPressed: isDisabled ? null : onAction,
            child: Text(buttonText, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
