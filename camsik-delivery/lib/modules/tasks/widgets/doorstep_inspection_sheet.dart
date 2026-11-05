import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../models/delivery_models.dart';
import '../bloc/tasks_cubit.dart';

class InspectionItem {
  final String id;
  final String label;
  final String subtext;
  final int deductionPct;

  const InspectionItem({
    required this.id,
    required this.label,
    required this.subtext,
    required this.deductionPct,
  });
}

const List<InspectionItem> kInspectionItems = [
  InspectionItem(
    id: 'display',
    label: 'Display & Touchscreen',
    subtext: 'Cracks, dead pixels, lines, touch responsiveness',
    deductionPct: 25,
  ),
  InspectionItem(
    id: 'body',
    label: 'Body & Frame Condition',
    subtext: 'Dents, heavy scratches, bent frame, discoloration',
    deductionPct: 12,
  ),
  InspectionItem(
    id: 'camera',
    label: 'Camera & Optics',
    subtext: 'Front & rear camera focus, lens glass, sensor dust',
    deductionPct: 15,
  ),
  InspectionItem(
    id: 'battery',
    label: 'Battery Health & Endurance',
    subtext: 'Battery health degradation, rapid discharge, swelling',
    deductionPct: 10,
  ),
  InspectionItem(
    id: 'faceid',
    label: 'Biometrics (Face ID / Fingerprint)',
    subtext: 'Face ID, Touch ID, or fingerprint sensor failure',
    deductionPct: 12,
  ),
  InspectionItem(
    id: 'charging',
    label: 'Charging & USB Port',
    subtext: 'Loose port, slow charging, or no PC data sync',
    deductionPct: 8,
  ),
  InspectionItem(
    id: 'speaker',
    label: 'Speakers & Microphones',
    subtext: 'Cracking sound, low earpiece volume, mic distortion',
    deductionPct: 6,
  ),
  InspectionItem(
    id: 'wifi',
    label: 'Wireless (Wi-Fi, Bluetooth, NFC)',
    subtext: 'Wi-Fi drop, Bluetooth pairing failure, GPS glitch',
    deductionPct: 6,
  ),
  InspectionItem(
    id: 'network',
    label: 'Cellular SIM & Antennas',
    subtext: 'No service, baseband issue, damaged SIM slot',
    deductionPct: 10,
  ),
  InspectionItem(
    id: 'buttons',
    label: 'Physical Buttons & Haptics',
    subtext: 'Stuck volume rocker, power key, faulty vibration',
    deductionPct: 5,
  ),
  InspectionItem(
    id: 'water',
    label: 'Liquid Damage Check (LDI)',
    subtext: 'Internal moisture indicator triggered or corrosion',
    deductionPct: 20,
  ),
  InspectionItem(
    id: 'accessories',
    label: 'Original Box & Accessories',
    subtext: 'Missing original box, authentic cable, or adapter',
    deductionPct: 5,
  ),
];

const List<Map<String, String>> kPhotoAngles = [
  {'id': 'front', 'label': 'Front Display (Screen On)'},
  {'id': 'back', 'label': 'Back Panel & Housing'},
  {'id': 'left', 'label': 'Left Side & Frame'},
  {'id': 'right', 'label': 'Right Side & Frame'},
  {'id': 'ports', 'label': 'Top / Bottom Ports'},
  {'id': 'camera_lens', 'label': 'Camera Lens & Optics'},
  {'id': 'imei_label', 'label': 'IMEI / Serial Screen'},
  {'id': 'defect', 'label': 'Scratch / Defect Close-up'},
];

class DoorstepInspectionSheet extends StatefulWidget {
  final DeliveryTask task;
  final TasksCubit tasksCubit;
  final VoidCallback? onComplete;

  const DoorstepInspectionSheet({
    super.key,
    required this.task,
    required this.tasksCubit,
    this.onComplete,
  });

  static void show({
    required BuildContext context,
    required DeliveryTask task,
    required TasksCubit tasksCubit,
    VoidCallback? onComplete,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DoorstepInspectionSheet(
        task: task,
        tasksCubit: tasksCubit,
        onComplete: onComplete,
      ),
    );
  }

  @override
  State<DoorstepInspectionSheet> createState() => _DoorstepInspectionSheetState();
}

class _DoorstepInspectionSheetState extends State<DoorstepInspectionSheet> {
  int _currentTab = 0; // 0: Diagnostics, 1: Photos, 2: Handover
  final Map<String, String> _results = {}; // 'pass', 'fail', 'na'
  final Set<String> _capturedPhotos = {};
  final _imeiController = TextEditingController();
  final _notesController = TextEditingController();
  final _customPriceController = TextEditingController();
  final _otpController = TextEditingController();
  bool _isCustomPrice = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.task.deviceImei != null && widget.task.deviceImei!.isNotEmpty) {
      _imeiController.text = widget.task.deviceImei!;
    }
  }

  @override
  void dispose() {
    _imeiController.dispose();
    _notesController.dispose();
    _customPriceController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  int get _passedCount => _results.values.where((v) => v == 'pass').length;
  int get _scorePercent {
    if (kInspectionItems.isEmpty) return 100;
    return ((_passedCount / kInspectionItems.length) * 100).round();
  }

  int get _calculatedPayout {
    final quoted = widget.task.quotedPrice;
    final failed = kInspectionItems.where((i) => _results[i.id] == 'fail');
    final deductionPct = min(
      failed.fold<int>(0, (acc, item) => acc + item.deductionPct),
      75,
    );
    final deductionAmount = (quoted * (deductionPct / 100)).round();
    final payout = max(
      (quoted - deductionAmount).round(),
      (quoted * 0.25).round(),
    );
    return payout;
  }

  int get _finalPayout {
    if (_isCustomPrice && _customPriceController.text.trim().isNotEmpty) {
      return int.tryParse(_customPriceController.text.trim()) ?? _calculatedPayout;
    }
    return _calculatedPayout;
  }

  Future<void> _handleFinalize() async {
    final enteredOtp = _otpController.text.trim();
    if (enteredOtp != '1234' && enteredOtp != widget.task.otp && enteredOtp.length < 4) {
      showCustomSnackBar(
        context,
        'Please enter a valid 4-digit pickup OTP (demo: 1234 or ${widget.task.otp})',
        isError: true,
      );
      return;
    }

    setState(() => _isSubmitting = true);
    final imeiVal = _imeiController.text.trim();
    final noteVal = _notesController.text.trim();
    final finalPriceVal = _finalPayout.toDouble();
    final scoreVal = _scorePercent;

    final success = await widget.tasksCubit.updateTaskStatus(
      orderId: widget.task.id,
      status: 'picked_up',
      finalPrice: finalPriceVal,
      inspectionScore: scoreVal,
      deviceImei: imeiVal.isNotEmpty ? imeiVal : null,
      deviceCollected: true,
      notes: noteVal.isNotEmpty
          ? '$noteVal | Doorstep Inspected (Score: $scoreVal%, Final Price: ₹${finalPriceVal.toInt()})'
          : 'Doorstep Inspected & Collected (Score: $scoreVal%, Final Price: ₹${finalPriceVal.toInt()})',
      otp: enteredOtp,
    );

    setState(() => _isSubmitting = false);

    if (success) {
      widget.onComplete?.call();
      if (mounted) {
        showCustomSnackBar(
          context,
          '✅ Diagnostic Complete! Device picked up. Move to Step 3 (Amount Paid).',
          isError: false,
        );
        Navigator.pop(context);
      }
    } else {
      if (mounted) {
        showCustomSnackBar(
          context,
          'Failed to complete inspection. Please check connection.',
          isError: true,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.92,
      maxChildSize: 0.96,
      minChildSize: 0.5,
      builder: (_, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Sheet Handle & Header
              Container(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.black12,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: const Color(0xFF6366F1).withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(
                                Icons.fact_check_rounded,
                                color: Color(0xFF6366F1),
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Step 2: 12-Point Doorstep Diagnostic',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 14,
                                    color: Color(0xFF1E293B),
                                  ),
                                ),
                                Text(
                                  '${widget.task.orderNumber} • ${widget.task.deviceName}',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: Colors.black54,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, size: 20),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Navigation Tabs
                    Row(
                      children: [
                        _buildTabButton(0, '1. Diagnostics', Icons.checklist_rounded),
                        const SizedBox(width: 6),
                        _buildTabButton(1, '2. Photos (${_capturedPhotos.length}/8)', Icons.camera_alt_outlined),
                        const SizedBox(width: 6),
                        _buildTabButton(2, '3. Handover', Icons.verified_user_outlined),
                      ],
                    ),
                  ],
                ),
              ),

              // Tab Contents
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(16),
                  children: [
                    if (_currentTab == 0) _buildDiagnosticsTab(),
                    if (_currentTab == 1) _buildPhotosTab(),
                    if (_currentTab == 2) _buildHandoverTab(),
                  ],
                ),
              ),

              // Bottom Sticky Action Bar
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border(top: BorderSide(color: Colors.black.withValues(alpha: 0.06))),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 10,
                      offset: const Offset(0, -4),
                    ),
                  ],
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
                              Text(
                                'Final Payout: ',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                              Text(
                                'Score: $_scorePercent%',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF6366F1),
                                ),
                              ),
                            ],
                          ),
                          Text(
                            CurrencyFormatter.format(_finalPayout.toDouble()),
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: AppColors.success,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (_currentTab < 2)
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6366F1),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                        label: Text(_currentTab == 0 ? 'Next: Photos' : 'Next: Handover'),
                        onPressed: () {
                          setState(() => _currentTab++);
                        },
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
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : const Icon(Icons.check_circle_outline_rounded, size: 16),
                        label: const Text(
                          'Collect Device',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        onPressed: _isSubmitting ? null : _handleFinalize,
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTabButton(int index, String label, IconData icon) {
    final isSelected = _currentTab == index;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _currentTab = index),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF6366F1) : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 13,
                color: isSelected ? Colors.white : Colors.black54,
              ),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? Colors.white : Colors.black87,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDiagnosticsTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Summary Card
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Original Quoted Value',
                    style: TextStyle(fontSize: 11, color: Colors.black54, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    CurrencyFormatter.format(widget.task.quotedPrice),
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _scorePercent >= 80 ? const Color(0xFFD1FAE5) : const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Health Score: $_scorePercent%',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 11,
                    color: _scorePercent >= 80 ? const Color(0xFF065F46) : const Color(0xFF92400E),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        const Text(
          '12 Hardware & Physical Checks',
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black54),
        ),
        const SizedBox(height: 8),

        ...kInspectionItems.map((item) {
          final status = _results[item.id] ?? 'pass';
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: status == 'fail' ? const Color(0xFFFEF2F2) : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: status == 'fail' ? const Color(0xFFFCA5A5) : const Color(0xFFE2E8F0),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            item.label,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          if (status == 'fail') ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                              decoration: BoxDecoration(
                                color: const Color(0xFFEF4444),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                '-${item.deductionPct}%',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        item.subtext,
                        style: const TextStyle(fontSize: 11, color: Colors.black54),
                      ),
                    ],
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildToggleBtn(item.id, 'pass', 'PASS', Colors.green),
                    const SizedBox(width: 6),
                    _buildToggleBtn(item.id, 'fail', 'FAIL', Colors.red),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildToggleBtn(String itemId, String value, String label, Color color) {
    final isSelected = (_results[itemId] ?? 'pass') == value;
    return InkWell(
      onTap: () {
        setState(() {
          _results[itemId] = value;
        });
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? color : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w900,
            color: isSelected ? Colors.white : Colors.black54,
          ),
        ),
      ),
    );
  }

  Widget _buildPhotosTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '8 Required Inspection Angles',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        const Text(
          'Capture or upload device angles for warranty, valuation & fraud protection.',
          style: TextStyle(fontSize: 11, color: Colors.black54),
        ),
        const SizedBox(height: 14),

        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.35,
          ),
          itemCount: kPhotoAngles.length,
          itemBuilder: (ctx, idx) {
            final angle = kPhotoAngles[idx];
            final angleId = angle['id']!;
            final isCaptured = _capturedPhotos.contains(angleId);

            return InkWell(
              onTap: () {
                setState(() {
                  if (isCaptured) {
                    _capturedPhotos.remove(angleId);
                  } else {
                    _capturedPhotos.add(angleId);
                  }
                });
              },
              borderRadius: BorderRadius.circular(12),
              child: Container(
                decoration: BoxDecoration(
                  color: isCaptured ? const Color(0xFFECFDF5) : const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isCaptured ? const Color(0xFF10B981) : const Color(0xFFE2E8F0),
                    width: isCaptured ? 1.5 : 1,
                  ),
                ),
                padding: const EdgeInsets.all(10),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      isCaptured ? Icons.check_circle_rounded : Icons.add_a_photo_outlined,
                      color: isCaptured ? const Color(0xFF10B981) : const Color(0xFF6366F1),
                      size: 24,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      angle['label']!,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: isCaptured ? const Color(0xFF065F46) : Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isCaptured ? 'Captured' : 'Tap to Capture',
                      style: TextStyle(
                        fontSize: 9,
                        color: isCaptured ? const Color(0xFF10B981) : Colors.black45,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildHandoverTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Payout recalculation box
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Diagnostic Score', style: TextStyle(fontSize: 12, color: Colors.black54)),
                  Text('$_scorePercent%', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Calculated Payout', style: TextStyle(fontSize: 12, color: Colors.black54)),
                  Text(
                    CurrencyFormatter.format(_calculatedPayout.toDouble()),
                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                  ),
                ],
              ),
              const Divider(height: 16),
              Row(
                children: [
                  Checkbox(
                    value: _isCustomPrice,
                    onChanged: (v) => setState(() => _isCustomPrice = v ?? false),
                    activeColor: const Color(0xFF6366F1),
                  ),
                  const Text(
                    'Manual Price Override',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              if (_isCustomPrice) ...[
                const SizedBox(height: 6),
                TextField(
                  controller: _customPriceController,
                  keyboardType: TextInputType.number,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    prefixText: '₹ ',
                    hintText: 'Enter agreed final price...',
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),

        // IMEI Field
        const Text('Device IMEI Number *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
        const SizedBox(height: 6),
        TextField(
          controller: _imeiController,
          keyboardType: TextInputType.number,
          maxLength: 15,
          decoration: InputDecoration(
            hintText: 'Enter 15-digit IMEI number',
            counterText: '',
            prefixIcon: const Icon(Icons.qr_code_scanner_rounded, size: 18),
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        const SizedBox(height: 14),

        // Customer Handover OTP
        const Text('Customer Pickup Handover OTP *', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
        const SizedBox(height: 4),
        Text(
          'Ask customer for the 4-digit code (demo: 1234 or ${widget.task.otp})',
          style: const TextStyle(fontSize: 11, color: Colors.black45),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: _otpController,
          keyboardType: TextInputType.number,
          maxLength: 4,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 8),
          decoration: InputDecoration(
            counterText: '',
            hintText: '• • • •',
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
        const SizedBox(height: 14),

        // Notes Field
        const Text('Executive Notes (Optional)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
        const SizedBox(height: 6),
        TextField(
          controller: _notesController,
          maxLines: 2,
          decoration: InputDecoration(
            hintText: 'Remarks about condition, charger, packaging...',
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ],
    );
  }
}
