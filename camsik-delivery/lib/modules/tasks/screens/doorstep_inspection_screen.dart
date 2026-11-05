import 'dart:math';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../models/delivery_models.dart';
import '../bloc/tasks_cubit.dart';
import '../models/diagnostic_check_registry.dart';

class DoorstepInspectionScreen extends StatefulWidget {
  final DeliveryTask task;
  final TasksCubit tasksCubit;
  final VoidCallback? onComplete;

  const DoorstepInspectionScreen({super.key, required this.task, required this.tasksCubit, this.onComplete});

  static Future<void> navigateTo({
    required BuildContext context,
    required DeliveryTask task,
    required TasksCubit tasksCubit,
    VoidCallback? onComplete,
  }) {
    return Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => DoorstepInspectionScreen(task: task, tasksCubit: tasksCubit, onComplete: onComplete)),
    );
  }

  @override
  State<DoorstepInspectionScreen> createState() => _DoorstepInspectionScreenState();
}

class _DoorstepInspectionScreenState extends State<DoorstepInspectionScreen> {
  int _activeTabIndex = 0;
  // NOTE: Step 2 starts empty. Nothing is pass by default!
  final Map<String, String> _testResults = {};
  final Set<String> _capturedAngleIds = {};

  final _imeiFieldController = TextEditingController();
  final _remarksController = TextEditingController();
  final _customPriceController = TextEditingController();
  final _otpFieldController = TextEditingController();

  bool _isManualPriceEnabled = false;
  bool _isSubmitting = false;

  late List<DiagnosticCheckItem> _diagnosticItems;
  late final List<Map<String, String>> _angleSlots;

  @override
  void initState() {
    super.initState();
    _diagnosticItems = List.from(DiagnosticCheckRegistry.getChecksForCategory(widget.task.detectedCategory));
    _angleSlots = DiagnosticCheckRegistry.getPhotoAnglesForCategory(widget.task.detectedCategory);
    if (widget.task.deviceImei != null && widget.task.deviceImei!.isNotEmpty) {
      _imeiFieldController.text = widget.task.deviceImei!;
    }
    _fetchAdminQuestions();
  }

  Future<void> _fetchAdminQuestions() async {
    final catId = widget.task.category ?? widget.task.apiCategoryId;
    final questions = await ApiService.fetchDiagnosticQuestions(catId, quotedPrice: widget.task.quotedPrice);
    if (questions.isNotEmpty && mounted) {
      setState(() => _diagnosticItems = questions);
    }
  }

  @override
  void dispose() {
    _imeiFieldController.dispose();
    _remarksController.dispose();
    _customPriceController.dispose();
    _otpFieldController.dispose();
    super.dispose();
  }

  int get _passedItemsCount => _testResults.values.where((s) => s == 'pass').length;
  int get _failedItemsCount => _testResults.values.where((s) => s == 'fail').length;
  int get _skippedItemsCount => _testResults.values.where((s) => s == 'skip').length;
  int get _evaluatedCount => _testResults.length;

  int get _calculatedHealthScore {
    final tested = _passedItemsCount + _failedItemsCount;
    if (tested == 0) return 100;
    return ((_passedItemsCount / tested) * 100).round();
  }

  int get _systemCalculatedPayout {
    final basePrice = widget.task.quotedPrice;
    final failedChecks = _diagnosticItems.where((i) => _testResults[i.id] == 'fail');
    final totalDeductionPct = min(failedChecks.fold<int>(0, (sum, i) => sum + i.deductionPct), 75);
    final deductionAmount = (basePrice * (totalDeductionPct / 100)).round();
    return max((basePrice - deductionAmount).round(), (basePrice * 0.25).round());
  }

  int get _finalDisbursementPrice {
    if (_isManualPriceEnabled && _customPriceController.text.trim().isNotEmpty) {
      return int.tryParse(_customPriceController.text.trim()) ?? _systemCalculatedPayout;
    }
    return _systemCalculatedPayout;
  }

  Future<void> _handleConfirmCollection() async {
    final enteredOtp = _otpFieldController.text.trim();
    if (enteredOtp != '1234' && enteredOtp != widget.task.otp && enteredOtp.length < 4) {
      showCustomSnackBar(context, 'Please enter a valid 4-digit pickup OTP (demo: 1234 or ${widget.task.otp})', isError: true);
      return;
    }

    setState(() => _isSubmitting = true);
    final imeiInput = _imeiFieldController.text.trim();
    final remarks = _remarksController.text.trim();
    final finalPriceDouble = _finalDisbursementPrice.toDouble();
    final healthScoreInt = _calculatedHealthScore;

    final summary = 'Pass: $_passedItemsCount, Fail: $_failedItemsCount, Skip: $_skippedItemsCount';
    final success = await widget.tasksCubit.updateTaskStatus(
      orderId: widget.task.id,
      status: 'picked_up',
      finalPrice: finalPriceDouble,
      inspectionScore: healthScoreInt,
      deviceImei: imeiInput.isNotEmpty ? imeiInput : null,
      deviceCollected: true,
      notes: remarks.isNotEmpty
          ? '$remarks | ${widget.task.categoryDisplayName} ($summary, Score: $healthScoreInt%, Final: ₹${finalPriceDouble.toInt()})'
          : 'Doorstep ${widget.task.categoryDisplayName} ($summary, Score: $healthScoreInt%, Final: ₹${finalPriceDouble.toInt()})',
      otp: enteredOtp,
    );

    setState(() => _isSubmitting = false);

    if (success) {
      widget.onComplete?.call();
      if (mounted) {
        showCustomSnackBar(context, '✅ Diagnostic Complete! Device collected. Move to Step 3 (Amount Paid).', isError: false);
        Navigator.pop(context);
      }
    } else {
      if (mounted) showCustomSnackBar(context, 'Failed to complete diagnostic. Please check connection.', isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
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
        titleSpacing: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${_diagnosticItems.length}-Pt Diagnostic (${widget.task.categoryDisplayName})',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15.sp, color: const Color(0xFF1E293B)),
            ),
            Text(
              '${widget.task.orderNumber} • ${widget.task.deviceName}',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 14.sp, color: Colors.black54, fontWeight: FontWeight.w600),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFFEEF2FF), Color(0xFFE0E7FF)]),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF818CF8), width: 1.1),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(width: 6, height: 6, decoration: const BoxDecoration(color: Color(0xFF4F46E5), shape: BoxShape.circle)),
                const SizedBox(width: 4),
                Text(
                  _evaluatedCount == 0 ? '0/${_diagnosticItems.length}' : '$_passedItemsCount Pass',
                  style: TextStyle(color: const Color(0xFF3730A3), fontSize: 14.sp, fontWeight: FontWeight.w900),
                ),
              ],
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Container(
            margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                _buildSegmentTab(0, 'Checks ($_evaluatedCount/${_diagnosticItems.length})', Icons.checklist_rtl_rounded),
                const SizedBox(width: 4),
                _buildSegmentTab(1, 'Photos (${_capturedAngleIds.length}/${_angleSlots.length})', Icons.camera_alt_outlined),
                const SizedBox(width: 4),
                _buildSegmentTab(2, 'Handover', Icons.verified_user_outlined),
              ],
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_activeTabIndex == 0) _buildDiagnosticChecksView(),
            if (_activeTabIndex == 1) _buildDevicePhotosView(),
            if (_activeTabIndex == 2) _buildDeviceHandoverView(),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: Colors.black.withValues(alpha: 0.06))),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 10, offset: const Offset(0, -4))],
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Text('Payout: ', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: Colors.black54)),
                        Text(
                          _evaluatedCount == 0 ? 'Score: 100%' : 'Score: $_calculatedHealthScore%',
                          style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w900, color: const Color(0xFF6366F1)),
                        ),
                      ],
                    ),
                    Text(
                      CurrencyFormatter.format(_finalDisbursementPrice.toDouble()),
                      style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w900, color: AppColors.success),
                    ),
                  ],
                ),
              ),
              if (_activeTabIndex < 2)
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                  label: Text(_activeTabIndex == 0 ? 'Next: Photos' : 'Next: Handover', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold)),
                  onPressed: () => setState(() => _activeTabIndex++),
                )
              else
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.success,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: _isSubmitting
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Icon(Icons.check_circle_outline_rounded, size: 16),
                  label: Text('Collect Device', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold)),
                  onPressed: _isSubmitting ? null : _handleConfirmCollection,
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSegmentTab(int index, String title, IconData icon) {
    final isSelected = _activeTabIndex == index;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _activeTabIndex = index),
        borderRadius: BorderRadius.circular(10),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 160),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            gradient: isSelected ? const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF4F46E5)]) : null,
            color: isSelected ? null : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isSelected
                ? [BoxShadow(color: const Color(0xFF6366F1).withValues(alpha: 0.35), blurRadius: 8, offset: const Offset(0, 2))]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 14, color: isSelected ? Colors.white : const Color(0xFF64748B)),
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
                    color: isSelected ? Colors.white : const Color(0xFF475569),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDiagnosticChecksView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2))],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Original Quoted Value', style: TextStyle(fontSize: 14.sp, color: Colors.black54, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 2),
                  Text(CurrencyFormatter.format(widget.task.quotedPrice), style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w900, color: const Color(0xFF0F172A))),
                ],
              ),
              _buildQuotedStatusChip(),
            ],
          ),
        ),
        const SizedBox(height: 14),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                '${_diagnosticItems.length} ${widget.task.categoryDisplayName} Checks',
                style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w800, color: const Color(0xFF1E293B)),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFFEEF2FF), Color(0xFFE0E7FF)]),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF818CF8), width: 1.1),
                boxShadow: [BoxShadow(color: const Color(0xFF6366F1).withValues(alpha: 0.15), blurRadius: 4, offset: const Offset(0, 1))],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.assignment_turned_in_rounded, size: 13, color: Color(0xFF4F46E5)),
                  const SizedBox(width: 4),
                  Text('$_evaluatedCount/${_diagnosticItems.length} Done', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w900, color: const Color(0xFF4338CA))),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ..._diagnosticItems.map((item) {
          final currentStatus = _testResults[item.id];
          final isFail = currentStatus == 'fail';
          final isPass = currentStatus == 'pass';
          final isSkip = currentStatus == 'skip';

          final borderColor = isFail
              ? const Color(0xFFF87171)
              : (isPass ? const Color(0xFF34D399) : (isSkip ? const Color(0xFFCBD5E1) : const Color(0xFFE2E8F0)));

          final bgColor = isFail
              ? const Color(0xFFFEF2F2)
              : (isPass ? const Color(0xFFF0FDF4) : (isSkip ? const Color(0xFFF8FAFC) : Colors.white));

          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: borderColor, width: currentStatus != null ? 1.6 : 1.0),
              boxShadow: [
                BoxShadow(
                  color: isFail
                      ? const Color(0xFFEF4444).withValues(alpha: 0.08)
                      : (isPass ? const Color(0xFF10B981).withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.03)),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(item.label, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15.sp, color: const Color(0xFF0F172A))),
                          ),
                          if (isFail) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(colors: [Color(0xFFFEF2F2), Color(0xFFFEE2E2)]),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: const Color(0xFFF87171), width: 1.1),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.trending_down_rounded, size: 13, color: Color(0xFFDC2626)),
                                  const SizedBox(width: 2),
                                  Text(
                                    '-${item.deductionPct}%',
                                    style: TextStyle(color: const Color(0xFFDC2626), fontSize: 14.sp, fontWeight: FontWeight.w900),
                                  ),
                                ],
                              ),
                            ),
                          ],
                          if (isSkip) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(color: const Color(0xFFCBD5E1)),
                              ),
                              child: Text('SKIPPED', style: TextStyle(color: const Color(0xFF64748B), fontSize: 14.sp, fontWeight: FontWeight.w800)),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(item.subtext, style: TextStyle(fontSize: 14.sp, color: Colors.black54)),
                    ],
                  ),
                ),
                const SizedBox(width: 6),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildToggleBtn(item.id, 'pass', 'PASS'),
                    const SizedBox(width: 4),
                    _buildToggleBtn(item.id, 'fail', 'FAIL'),
                    const SizedBox(width: 4),
                    _buildToggleBtn(item.id, 'skip', 'SKIP'),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildQuotedStatusChip() {
    final isPending = _evaluatedCount == 0;
    final isGood = _calculatedHealthScore >= 80;

    final List<Color> gradientColors = isPending
        ? const [Color(0xFFFFFBEB), Color(0xFFFEF3C7)]
        : (isGood ? const [Color(0xFFECFDF5), Color(0xFFD1FAE5)] : const [Color(0xFFFEF2F2), Color(0xFFFEE2E2)]);

    final borderColor = isPending ? const Color(0xFFFBBF24) : (isGood ? const Color(0xFF34D399) : const Color(0xFFF87171));
    final textColor = isPending ? const Color(0xFFB45309) : (isGood ? const Color(0xFF065F46) : const Color(0xFF991B1B));
    final shadowColor = isPending ? const Color(0xFFF59E0B) : (isGood ? const Color(0xFF10B981) : const Color(0xFFEF4444));
    final icon = isPending ? Icons.hourglass_bottom_rounded : (isGood ? Icons.verified_rounded : Icons.warning_amber_rounded);
    final label = isPending ? '${_diagnosticItems.length} Checks Pending' : 'Health: $_calculatedHealthScore%';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: gradientColors),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: borderColor, width: 1.2),
        boxShadow: [BoxShadow(color: shadowColor.withValues(alpha: 0.18), blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: textColor),
          const SizedBox(width: 5),
          Text(label, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14.sp, color: textColor)),
        ],
      ),
    );
  }

  Widget _buildToggleBtn(String itemId, String value, String label) {
    final isSelected = _testResults[itemId] == value;
    final isPass = value == 'pass';
    final isFail = value == 'fail';

    final primaryGradient = isPass
        ? const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF059669)])
        : (isFail ? const LinearGradient(colors: [Color(0xFFEF4444), Color(0xFFDC2626)]) : const LinearGradient(colors: [Color(0xFF64748B), Color(0xFF475569)]));

    final unselectedGradient = isPass
        ? const LinearGradient(colors: [Color(0xFFF0FDF4), Color(0xFFDCFCE7)])
        : (isFail ? const LinearGradient(colors: [Color(0xFFFEF2F2), Color(0xFFFEE2E2)]) : const LinearGradient(colors: [Color(0xFFF8FAFC), Color(0xFFF1F5F9)]));

    final activeBorder = isPass ? const Color(0xFF047857) : (isFail ? const Color(0xFFB91C1C) : const Color(0xFF334155));
    final inactiveBorder = isPass ? const Color(0xFF86EFAC) : (isFail ? const Color(0xFFFCA5A5) : const Color(0xFFCBD5E1));
    final inactiveText = isPass ? const Color(0xFF047857) : (isFail ? const Color(0xFFB91C1C) : const Color(0xFF64748B));
    final glowColor = isPass ? const Color(0xFF10B981) : (isFail ? const Color(0xFFEF4444) : const Color(0xFF64748B));
    final iconData = isPass
        ? (isSelected ? Icons.check_circle_rounded : Icons.check_circle_outline_rounded)
        : (isFail ? (isSelected ? Icons.cancel_rounded : Icons.highlight_off_rounded) : (isSelected ? Icons.redo_rounded : Icons.skip_next_rounded));

    return InkWell(
      onTap: () => setState(() => isSelected ? _testResults.remove(itemId) : _testResults[itemId] = value),
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          gradient: isSelected ? primaryGradient : unselectedGradient,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isSelected ? activeBorder : inactiveBorder, width: isSelected ? 1.5 : 1.1),
          boxShadow: isSelected ? [BoxShadow(color: glowColor.withValues(alpha: 0.38), blurRadius: 6, offset: const Offset(0, 2))] : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(iconData, size: 14, color: isSelected ? Colors.white : inactiveText),
            const SizedBox(width: 3),
            Text(label, style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.w900, color: isSelected ? Colors.white : inactiveText, letterSpacing: 0.2)),
          ],
        ),
      ),
    );
  }

  Widget _buildDevicePhotosView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('${_angleSlots.length} Required Angle Photos', style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text('Tap any slot to record photo proof for ${widget.task.categoryDisplayName} valuation and fraud prevention.', style: TextStyle(fontSize: 14.sp, color: Colors.black54)),
        const SizedBox(height: 14),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 1.35),
          itemCount: _angleSlots.length,
          itemBuilder: (ctx, idx) {
            final slot = _angleSlots[idx];
            final slotId = slot['id']!;
            final isCaptured = _capturedAngleIds.contains(slotId);
            return InkWell(
              onTap: () => setState(() => isCaptured ? _capturedAngleIds.remove(slotId) : _capturedAngleIds.add(slotId)),
              borderRadius: BorderRadius.circular(14),
              child: Container(
                decoration: BoxDecoration(
                  gradient: isCaptured
                      ? const LinearGradient(colors: [Color(0xFFECFDF5), Color(0xFFD1FAE5)])
                      : const LinearGradient(colors: [Color(0xFFF8FAFC), Color(0xFFF1F5F9)]),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: isCaptured ? const Color(0xFF34D399) : const Color(0xFFE2E8F0), width: isCaptured ? 1.6 : 1),
                  boxShadow: [BoxShadow(color: isCaptured ? const Color(0xFF10B981).withValues(alpha: 0.15) : Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 1))],
                ),
                padding: const EdgeInsets.all(10),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(isCaptured ? Icons.check_circle_rounded : Icons.add_a_photo_outlined, color: isCaptured ? const Color(0xFF059669) : const Color(0xFF6366F1), size: 24),
                    const SizedBox(height: 6),
                    Text(slot['label']!, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: isCaptured ? const Color(0xFF065F46) : Colors.black87),
                    ),
                    const SizedBox(height: 2),
                    Text(isCaptured ? 'Captured' : 'Tap to Record', style: TextStyle(fontSize: 14.sp, color: isCaptured ? const Color(0xFF059669) : Colors.black45)),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildDeviceHandoverView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: const Color(0xFFF1F5F9), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE2E8F0))),
          child: Column(
            children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text('Diagnostic Score', style: TextStyle(fontSize: 14.sp, color: Colors.black54)),
                Text('$_calculatedHealthScore%', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.sp)),
              ]),
              const SizedBox(height: 6),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text('Calculated Payout', style: TextStyle(fontSize: 14.sp, color: Colors.black54)),
                Text(CurrencyFormatter.format(_systemCalculatedPayout.toDouble()), style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16.sp)),
              ]),
              const Divider(height: 16),
              Row(children: [
                Checkbox(value: _isManualPriceEnabled, onChanged: (v) => setState(() => _isManualPriceEnabled = v ?? false), activeColor: const Color(0xFF6366F1)),
                Text('Manual Price Override', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
              ]),
              if (_isManualPriceEnabled) ...[
                const SizedBox(height: 6),
                TextField(
                  controller: _customPriceController, keyboardType: TextInputType.number, style: TextStyle(fontSize: 15.sp),
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    prefixText: '₹ ', hintText: 'Enter agreed final price...', hintStyle: TextStyle(fontSize: 14.sp),
                    filled: true, fillColor: Colors.white, contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),
        Text('Device Serial / IMEI Number *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp)),
        const SizedBox(height: 6),
        TextField(
          controller: _imeiFieldController, keyboardType: TextInputType.text, maxLength: 20, style: TextStyle(fontSize: 15.sp),
          decoration: InputDecoration(
            hintText: 'Enter serial number or 15-digit IMEI', hintStyle: TextStyle(fontSize: 14.sp), counterText: '',
            prefixIcon: const Icon(Icons.qr_code_scanner_rounded, size: 18), filled: true, fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        const SizedBox(height: 14),
        Text('Customer Pickup Handover OTP *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp)),
        const SizedBox(height: 4),
        Text('Ask customer for the 4-digit code (demo: 1234 or ${widget.task.otp})', style: TextStyle(fontSize: 14.sp, color: Colors.black45)),
        const SizedBox(height: 6),
        TextField(
          controller: _otpFieldController, keyboardType: TextInputType.number, maxLength: 4, textAlign: TextAlign.center,
          style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.w900, letterSpacing: 8),
          decoration: InputDecoration(counterText: '', hintText: '• • • •', hintStyle: TextStyle(fontSize: 16.sp), filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
        ),
        const SizedBox(height: 14),
        Text('Executive Notes (Optional)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp)),
        const SizedBox(height: 6),
        TextField(
          controller: _remarksController, maxLines: 2, style: TextStyle(fontSize: 15.sp),
          decoration: InputDecoration(hintText: 'Remarks about condition, charger...', hintStyle: TextStyle(fontSize: 14.sp), filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
        ),
      ],
    );
  }
}
