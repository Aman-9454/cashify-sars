import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sizer/sizer.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/api_service.dart';
import '../../core/services/session_service.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/partner_models.dart';
import '../orders/bloc/orders_cubit.dart';
import '../orders/bloc/orders_state.dart';
import 'data/models/device_verification_report_model.dart';
import 'data/repositories/inspection_repository.dart';
import '../payouts/widgets/payout_wallet_guard_dialog.dart';

import 'data/models/inspection_category_config.dart';

class PartnerInspectionScreen extends StatefulWidget {
  final List<PartnerOrder>? orders;
  final Future<void> Function()? onOrderUpdated;

  const PartnerInspectionScreen({
    super.key,
    this.orders,
    this.onOrderUpdated,
  });

  @override
  State<PartnerInspectionScreen> createState() => _PartnerInspectionScreenState();
}

class _PartnerInspectionScreenState extends State<PartnerInspectionScreen> {
  int _currentStep = 1;

  @override
  Widget build(BuildContext context) {
    final bool canPop = Navigator.canPop(context);

    Widget content;
    if (widget.orders != null) {
      content = _buildBody(context, widget.orders!);
    } else {
      content = BlocBuilder<OrdersCubit, OrdersState>(
        builder: (context, ordersState) {
          if (ordersState is OrdersLoading) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            );
          }

          final liveOrders =
              ordersState is OrdersLoaded ? ordersState.orders : <PartnerOrder>[];
          return _buildBody(context, liveOrders);
        },
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: canPop
          ? AppBar(
              backgroundColor: Colors.white,
              elevation: 0,
              leading: IconButton(
                icon: const Icon(
                  Icons.arrow_back_ios_new,
                  color: Color(0xFF0F172A),
                  size: 20,
                ),
                onPressed: () {
                  if (_currentStep == 2) {
                    setState(() => _currentStep = 1);
                  } else {
                    Navigator.pop(context);
                  }
                },
              ),
              title: Text(
                _currentStep == 1
                    ? 'Step 1: Diagnostics & QA'
                    : 'Step 2: Photos & Lock',
                style: TextStyle(
                  color: const Color(0xFF0F172A),
                  fontSize: 16.sp,
                  fontWeight: FontWeight.bold,
                ),
              ),
              bottom: PreferredSize(
                preferredSize: const Size.fromHeight(1),
                child: Container(color: const Color(0xFFE2E8F0), height: 1),
              ),
            )
          : null,
      body: SafeArea(child: content),
    );
  }

  Widget _buildBody(BuildContext context, List<PartnerOrder> availableOrders) {
    final pendingOrders =
        availableOrders.where((o) => o.status != 'completed').toList();
    final inspectionOrders =
        pendingOrders.isNotEmpty ? pendingOrders : availableOrders;

    if (inspectionOrders.isEmpty) {
      return Center(
        child: Padding(
          padding: EdgeInsets.all(6.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: Color(0xFFF1F5F9),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.fact_check_outlined,
                  size: 44,
                  color: Color(0xFF64748B),
                ),
              ),
              SizedBox(height: 2.h),
              Text(
                'No orders ready for QA inspection',
                style: TextStyle(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF0F172A),
                ),
              ),
              SizedBox(height: 0.8.h),
              Text(
                'Assigned doorstep and hub intake devices will appear here.',
                style: TextStyle(
                  fontSize: 14.sp,
                  color: const Color(0xFF64748B),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return _WebInspectionForm(
      orders: inspectionOrders,
      currentStep: _currentStep,
      onStepChanged: (step) => setState(() => _currentStep = step),
      onOrderUpdated: () async {
        if (widget.onOrderUpdated != null) {
          await widget.onOrderUpdated!();
        } else {
          context.read<OrdersCubit>().loadOrders();
        }
      },
    );
  }
}

class _WebInspectionForm extends StatefulWidget {
  final List<PartnerOrder> orders;
  final int currentStep;
  final ValueChanged<int> onStepChanged;
  final Future<void> Function() onOrderUpdated;

  const _WebInspectionForm({
    required this.orders,
    required this.currentStep,
    required this.onStepChanged,
    required this.onOrderUpdated,
  });

  @override
  State<_WebInspectionForm> createState() => _WebInspectionFormState();
}

class _WebInspectionFormState extends State<_WebInspectionForm> {
  final InspectionRepository _inspectionRepo = InspectionRepositoryImpl();

  late PartnerOrder _selectedOrder;
  // NO BY-DEFAULT PASS! Only what the user clicks is selected.
  final Map<String, String> _results = {}; // itemId -> 'pass' | 'fail' | 'na'
  final Map<String, String> _photos = {}; // angleId -> status/preview tag
  final TextEditingController _imeiController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  final TextEditingController _overridePriceController = TextEditingController();

  bool _isCustomPrice = false;
  bool _isVerifyingImei = false;
  DeviceVerificationReportModel? _verificationReport;
  bool _isSubmitting = false;
  bool _submitted = false;
  bool _payoutDisbursed = false;

  @override
  void initState() {
    super.initState();
    _selectedOrder = widget.orders.first;
    _initInspectionDefaults();
  }

  void _initInspectionDefaults() {
    // Requirements: Bydefault PASS nahi hoga. User jo choose kare wahi select hoga.
    _results.clear();
    _photos.clear();
    _imeiController.clear();
    _notesController.clear();
    _overridePriceController.clear();
    _isCustomPrice = false;
    _verificationReport = null;
    _submitted = false;
    _payoutDisbursed = false;
  }

  void _selectOrder(PartnerOrder order) {
    setState(() {
      _selectedOrder = order;
      _initInspectionDefaults();
      widget.onStepChanged(1);
    });
  }

  @override
  void dispose() {
    _imeiController.dispose();
    _notesController.dispose();
    _overridePriceController.dispose();
    super.dispose();
  }

  // --- Dynamic Scoring & Price Calculations (Category Aware) ---
  CategoryInspectionConfig get _categoryConfig => getInspectionConfigForOrder(_selectedOrder);
  List<InspectionCheckItem> get _currentItems => _categoryConfig.items;
  List<PhotoAngle> get _currentPhotoAngles => _categoryConfig.photoAngles;

  int get _totalItems => _currentItems.length;
  int get _answeredCount => _results.length;
  int get _passedCount => _results.values.where((v) => v == 'pass').length;
  int get _failedCount => _results.values.where((v) => v == 'fail').length;

  int get _scorePercent {
    if (_answeredCount == 0) return 100;
    return ((_passedCount / _totalItems) * 100).round();
  }

  double get _quotedPrice => _selectedOrder.quotedPrice;

  List<InspectionCheckItem> get _failedItems =>
      _currentItems.where((item) => _results[item.id] == 'fail').toList();

  int get _totalDeductionPct {
    final sum = _failedItems.fold<int>(0, (acc, item) => acc + item.deductionPct);
    return min(sum, 75); // Cap max deduction at 75%
  }

  int get _totalDeductionAmount =>
      (_quotedPrice * (_totalDeductionPct / 100.0)).round();

  int get _calculatedExactPayout {
    final deducted = (_quotedPrice - _totalDeductionAmount).round();
    final floor = (_quotedPrice * 0.25).round();
    return max(deducted, floor);
  }

  double get _finalPayoutToUser {
    if (_isCustomPrice && _overridePriceController.text.trim().isNotEmpty) {
      final parsed = double.tryParse(_overridePriceController.text.trim());
      if (parsed != null && parsed > 0) return parsed;
    }
    return _calculatedExactPayout.toDouble();
  }

  bool get _isAllocatedToRider {
    final agentId = _selectedOrder.deliveryAgentId ?? '';
    final agentName = (_selectedOrder.deliveryAgentName ?? '').toLowerCase();
    return agentId.isNotEmpty &&
        !agentName.contains('direct') &&
        !agentName.contains('store partner');
  }

  // --- GSMA IMEI Verification ---
  Future<void> _verifyImei() async {
    final imei = _imeiController.text.trim();
    if (imei.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter 15-digit physical IMEI number first'),
          backgroundColor: Color(0xFFEF4444),
        ),
      );
      return;
    }

    setState(() => _isVerifyingImei = true);
    final report = await _inspectionRepo.validateImei(
      imei: imei,
      brand: _selectedOrder.deviceBrand.isNotEmpty ? _selectedOrder.deviceBrand : 'Apple',
      model: _selectedOrder.deviceModel.isNotEmpty ? _selectedOrder.deviceModel : _selectedOrder.deviceName,
      variant: _selectedOrder.deviceStorage,
    );

    if (mounted) {
      setState(() {
        _isVerifyingImei = false;
        _verificationReport = report;
      });

      if (report != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: report.blacklisted ? const Color(0xFFEF4444) : const Color(0xFF059669),
            content: Text(
              report.blacklisted
                  ? '⚠️ Warning: IMEI flagged on GSMA Blacklist!'
                  : '✅ GSMA Verified Clean: ${report.brand} ${report.model}',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp),
            ),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFFEF4444),
            content: Text('Could not reach GSMA verification service.'),
          ),
        );
      }
    }
  }

  // --- Photo Capture / Upload Simulated for 8 Angles ---
  void _togglePhoto(String angleId, String label) {
    setState(() {
      if (_photos.containsKey(angleId)) {
        _photos.remove(angleId);
      } else {
        _photos[angleId] = 'captured_${DateTime.now().millisecondsSinceEpoch}';
      }
    });
  }

  void _uploadAllPhotos() {
    setState(() {
      for (final a in _currentPhotoAngles) {
        _photos[a.id] = 'captured_${DateTime.now().millisecondsSinceEpoch}';
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('✅ All ${_currentPhotoAngles.length} mandatory ${_categoryConfig.categoryName} photos attached!'),
        backgroundColor: const Color(0xFF059669),
      ),
    );
  }

  // --- Submit QA Report ---
  Future<void> _handleSubmitInspection() async {
    if (_isAllocatedToRider) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Diagnostics Locked: Order #${_selectedOrder.orderNumber} is assigned to Rider ${_selectedOrder.deliveryAgentName}.',
          ),
          backgroundColor: const Color(0xFFD97706),
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final ok = await ApiService.updateOrder(
      orderId: _selectedOrder.id,
      status: 'inspection',
      finalPrice: _finalPayoutToUser,
      inspectionScore: _scorePercent,
      deviceImei: _imeiController.text.trim(),
      notes: _notesController.text.trim().isNotEmpty
          ? _notesController.text.trim()
          : '${_categoryConfig.categoryBadge}: ${_currentItems.length}-Point QA Inspection Certified ($_scorePercent% score). Payout: ₹${_finalPayoutToUser.toStringAsFixed(0)}',
    );

    if (mounted) {
      setState(() => _isSubmitting = false);
      if (ok) {
        setState(() {
          _selectedOrder.finalPrice = _finalPayoutToUser;
          _selectedOrder.inspectionScore = _scorePercent;
          _selectedOrder.status = 'inspection';
          _submitted = true;
          _payoutDisbursed = false;
        });
        await widget.onOrderUpdated();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to save inspection report. Check your network.'),
            backgroundColor: Color(0xFFEF4444),
          ),
        );
      }
    }
  }

  // --- Instant Spot Payout & Settlement ---
  Future<void> _handleInstantPayout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Disburse Spot Payout?',
          style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Disburse immediate spot payout of ₹${CurrencyFormatter.format(_finalPayoutToUser)} to ${_selectedOrder.customerName} via Instant UPI/IMPS and shift order to completed?',
          style: TextStyle(fontSize: 14.sp),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: TextStyle(fontSize: 14.sp)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF059669),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Confirm Payout', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    final partner = SessionService.currentUser;
    final partnerId = partner?.id ?? '';

    // Payout Wallet Guard: partner must have sufficient wallet float before order completion
    final hasFunds = await PayoutWalletGuard.ensureSufficientBalance(
      context,
      requiredAmount: _finalPayoutToUser,
      partnerId: partnerId,
    );
    if (!hasFunds || !mounted) return;

    setState(() => _isSubmitting = true);

    // 1. Create payout record
    await ApiService.createPayout(
      partnerId: partnerId,
      orderId: _selectedOrder.id,
      orderNumber: _selectedOrder.orderNumber,
      amount: _finalPayoutToUser,
      method: 'Instant UPI',
      referenceId: 'CASMIK-PAY-${DateTime.now().millisecondsSinceEpoch}',
      customerName: _selectedOrder.customerName,
      notes: 'Spot payout disbursed after 12-point device inspection',
    );

    // 2. Lock order to completed & paid
    final ok = await ApiService.updateOrder(
      orderId: _selectedOrder.id,
      status: 'completed',
      paymentStatus: 'paid',
      finalPrice: _finalPayoutToUser,
      inspectionScore: _scorePercent,
      notes: '${_selectedOrder.notes} [Partner Spot Payout Disbursed: ₹${_finalPayoutToUser.toStringAsFixed(0)}]',
    );

    if (mounted) {
      setState(() => _isSubmitting = false);
      if (ok) {
        setState(() {
          _selectedOrder.status = 'completed';
          _selectedOrder.paymentStatus = 'paid';
          _payoutDisbursed = true;
        });
        await widget.onOrderUpdated();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFF059669),
              content: Text(
                '💳 Payout Disbursed! Order #${_selectedOrder.orderNumber} successfully completed.',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp),
              ),
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted) {
      return _buildPostInspectionSummary();
    }

    return ListView(
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
      children: [
        // Top 2-Step Indicator Header
        _buildStepIndicator(),

        // Device Picker Bar (Horizontal Cards)
        _buildDevicePickerBar(),

        SizedBox(height: 1.5.h),

        // Rider Lock Warning (if allocated to rider)
        if (_isAllocatedToRider) ...[
          _buildRiderLockedBanner(),
          SizedBox(height: 1.5.h),
        ],

        // STEP 1 CONTENT: 12 Checkpoints + IMEI + Notes + Live Valuation
        if (widget.currentStep == 1) ...[
          // Device Info & Live Condition Score Card
          _buildDeviceScoreHeaderCard(),

          SizedBox(height: 1.8.h),

          // Physical IMEI / Device Serial Input Card
          _buildImeiInputCard(),

          SizedBox(height: 1.8.h),

          // 12-Point Hardware Diagnostic Checklist (No default pass!)
          _buildChecklistSection(),

          SizedBox(height: 1.8.h),

          // Live Valuation & Dynamic Payout Card
          _buildLiveValuationCard(),

          SizedBox(height: 1.8.h),

          // Technician / Inspection Notes
          _buildNotesCard(),

          SizedBox(height: 2.5.h),

          // Step 1 Continue Action Button
          _buildStep1ContinueButton(),

          SizedBox(height: 2.5.h),
        ],

        // STEP 2 CONTENT: Device Photos Grid (8 Angles) + Final Payout Lock
        if (widget.currentStep == 2) ...[
          // Summary Price Header in Step 2
          _buildStep2ValuationHeader(),

          SizedBox(height: 1.8.h),

          // Device Photos Grid (8 Angles)
          _buildPhotoAnglesSection(),

          SizedBox(height: 2.5.h),

          // Step 2 Action Buttons: Back to Step 1 & Final Lock
          _buildStep2ActionButtons(),

          SizedBox(height: 2.5.h),
        ],
      ],
    );
  }

  // --- Top 2-Step Indicator Widget ---
  Widget _buildStepIndicator() {
    return Container(
      margin: EdgeInsets.only(bottom: 1.5.h),
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.2.h),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => widget.onStepChanged(1),
              child: Row(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: widget.currentStep == 1
                          ? AppColors.primary
                          : const Color(0xFF10B981),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: widget.currentStep > 1
                          ? const Icon(Icons.check, color: Colors.white, size: 16)
                          : Text(
                              '1',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 14.sp,
                              ),
                            ),
                    ),
                  ),
                  SizedBox(width: 2.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'STEP 1',
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                            color: widget.currentStep == 1
                                ? AppColors.primary
                                : const Color(0xFF64748B),
                          ),
                        ),
                        Text(
                          'Diagnostics & QA',
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.bold,
                            color: widget.currentStep == 1
                                ? const Color(0xFF0F172A)
                                : const Color(0xFF64748B),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          Container(
            width: 20,
            height: 1,
            color: const Color(0xFFCBD5E1),
            margin: EdgeInsets.symmetric(horizontal: 1.w),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => widget.onStepChanged(2),
              child: Row(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: widget.currentStep == 2
                          ? AppColors.primary
                          : const Color(0xFFE2E8F0),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        '2',
                        style: TextStyle(
                          color: widget.currentStep == 2
                              ? Colors.white
                              : const Color(0xFF64748B),
                          fontWeight: FontWeight.bold,
                          fontSize: 14.sp,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 2.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'STEP 2',
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                            color: widget.currentStep == 2
                                ? AppColors.primary
                                : const Color(0xFF94A3B8),
                          ),
                        ),
                        Text(
                          'Photos & Lock',
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.bold,
                            color: widget.currentStep == 2
                                ? const Color(0xFF0F172A)
                                : const Color(0xFF94A3B8),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDevicePickerBar() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'SELECT QUEUE DEVICE',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
                color: const Color(0xFF64748B),
              ),
            ),
            Text(
              '${widget.orders.length} available',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF94A3B8),
              ),
            ),
          ],
        ),
        SizedBox(height: 1.h),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: widget.orders.map((o) {
              final isSelected = o.id == _selectedOrder.id;
              final catConfig = getInspectionConfigForOrder(o);
              return GestureDetector(
                onTap: () => _selectOrder(o),
                child: Container(
                  width: 62.w,
                  margin: EdgeInsets.only(right: 2.5.w),
                  padding: EdgeInsets.all(3.w),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? AppColors.primary : const Color(0xFFE2E8F0),
                      width: isSelected ? 2 : 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.2.h),
                            decoration: BoxDecoration(
                              color: catConfig.badgeColor.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(catConfig.icon, size: 13, color: catConfig.badgeColor),
                                SizedBox(width: 1.w),
                                Text(
                                  catConfig.categoryName.split(' ').first,
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    fontWeight: FontWeight.bold,
                                    color: catConfig.badgeColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            o.orderNumber,
                            style: TextStyle(
                              fontSize: 14.sp,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 0.6.h),
                      Text(
                        o.deviceName,
                        style: TextStyle(
                          fontSize: 15.sp,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF0F172A),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 0.4.h),
                      Text(
                        'Quote: ${CurrencyFormatter.format(o.quotedPrice)}',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildRiderLockedBanner() {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFCD34D), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF3C7),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.lock_rounded, color: Color(0xFFB45309), size: 18),
              ),
              SizedBox(width: 2.5.w),
              Expanded(
                child: Text(
                  'Diagnostics Locked (Assigned to Delivery Rider)',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14.sp,
                    color: const Color(0xFF78350F),
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 0.8.h),
          Text(
            'Order allocated to Executive ${_selectedOrder.deliveryAgentName ?? "Rider"}. Per company policy, diagnostic intake checklist is carried out by the delivery personnel at the doorstep.',
            style: TextStyle(
              fontSize: 14.sp,
              color: const Color(0xFF92400E),
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceScoreHeaderCard() {
    final score = _scorePercent;
    final color = score >= 80
        ? const Color(0xFF059669)
        : (score >= 60 ? const Color(0xFFD97706) : const Color(0xFFDC2626));

    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.4.h),
                decoration: BoxDecoration(
                  color: _categoryConfig.badgeColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: _categoryConfig.badgeColor.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(_categoryConfig.icon, size: 14, color: _categoryConfig.badgeColor),
                    SizedBox(width: 1.5.w),
                    Text(
                      _categoryConfig.categoryBadge.toUpperCase(),
                      style: TextStyle(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.bold,
                        color: _categoryConfig.badgeColor,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.4.h),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${_currentItems.length} Checkpoints',
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF475569),
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 1.2.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _selectedOrder.deviceName,
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF0F172A),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 0.3.h),
                    Text(
                      'Cust: ${_selectedOrder.customerName} (${_selectedOrder.customerPhone})',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'CONDITION SCORE',
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: const Color(0xFF94A3B8),
                    ),
                  ),
                  SizedBox(height: 0.3.h),
                  Text(
                    _answeredCount == 0 ? '--' : '$score%',
                    style: TextStyle(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w900,
                      color: _answeredCount == 0 ? const Color(0xFF94A3B8) : color,
                    ),
                  ),
                ],
              ),
            ],
          ),
          SizedBox(height: 1.5.h),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: _answeredCount == 0 ? 0.0 : score / 100.0,
              minHeight: 8,
              backgroundColor: const Color(0xFFE2E8F0),
              valueColor: AlwaysStoppedAnimation<Color>(
                _answeredCount == 0 ? const Color(0xFFCBD5E1) : color,
              ),
            ),
          ),
          if (_answeredCount == 0) ...[
            SizedBox(height: 0.8.h),
            Text(
              'Select Pass or Fail on checkpoints below to calculate live grade.',
              style: TextStyle(fontSize: 14.sp, color: const Color(0xFF94A3B8)),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildImeiInputCard() {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
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
                child: Text(
                  _categoryConfig.identifierLabel,
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                    color: const Color(0xFF64748B),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (_verificationReport != null)
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.3.h),
                  decoration: BoxDecoration(
                    color: _verificationReport!.blacklisted
                        ? const Color(0xFFFEE2E2)
                        : const Color(0xFFDCFCE7),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    _verificationReport!.blacklisted ? 'FLAGGED' : 'VERIFIED CLEAN',
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.bold,
                      color: _verificationReport!.blacklisted
                          ? const Color(0xFF991B1B)
                          : const Color(0xFF166534),
                    ),
                  ),
                ),
            ],
          ),
          SizedBox(height: 1.h),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _imeiController,
                  keyboardType: _categoryConfig.isImei ? TextInputType.number : TextInputType.text,
                  maxLength: _categoryConfig.isImei ? 15 : 24,
                  style: TextStyle(fontSize: 14.sp, fontFamily: 'monospace', fontWeight: FontWeight.w600),
                  decoration: InputDecoration(
                    counterText: '',
                    hintText: _categoryConfig.identifierHint,
                    hintStyle: TextStyle(fontSize: 14.sp, color: const Color(0xFF94A3B8)),
                    filled: true,
                    fillColor: const Color(0xFFF8FAFC),
                    contentPadding: EdgeInsets.symmetric(horizontal: 3.5.w, vertical: 1.2.h),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                    ),
                  ),
                ),
              ),
              SizedBox(width: 2.5.w),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: EdgeInsets.symmetric(horizontal: 3.5.w, vertical: 1.3.h),
                ),
                onPressed: _isVerifyingImei ? null : _verifyImei,
                child: _isVerifyingImei
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Text(
                        _categoryConfig.isImei ? 'Verify GSMA' : 'Verify S/N',
                        style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // --- 12 Diagnostic Checklist (No bydefault pass!) ---
  Widget _buildChecklistSection() {
    final pendingCount = _totalItems - _answeredCount;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.all(4.w),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${_categoryConfig.categoryName} QA Checklist',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF0F172A),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 0.3.h),
                      Text(
                        'Tap Pass, Fail, or N/A on each item',
                        style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B)),
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 2.w),
                Text(
                  pendingCount > 0
                      ? '$_passedCount Pass • $_failedCount Fail • $pendingCount Left'
                      : '$_passedCount Pass • $_failedCount Fail',
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                    color: pendingCount > 0 ? const Color(0xFFD97706) : const Color(0xFF059669),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
          ..._currentItems.map((item) {
            final result = _results[item.id]; // null if not chosen yet!
            final isFail = result == 'fail';
            final isPass = result == 'pass';
            final isNa = result == 'na';
            final deductionAmt = (_quotedPrice * (item.deductionPct / 100.0)).round();

            return Container(
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.4.h),
              decoration: BoxDecoration(
                color: isFail
                    ? const Color(0xFFFEF2F2)
                    : (isPass ? const Color(0xFFF0FDF4) : Colors.transparent),
                border: const Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                item.label,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15.sp,
                                  color: const Color(0xFF0F172A),
                                ),
                              ),
                            ),
                            if (isFail)
                              Container(
                                margin: EdgeInsets.only(left: 1.w),
                                padding: EdgeInsets.symmetric(horizontal: 1.8.w, vertical: 0.2.h),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEE2E2),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  '-${item.deductionPct}% (-₹$deductionAmt)',
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFFB91C1C),
                                  ),
                                ),
                              ),
                          ],
                        ),
                        SizedBox(height: 0.3.h),
                        Text(
                          item.subtext,
                          style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B)),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  SizedBox(width: 2.w),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _buildCheckButton(
                        label: 'Pass',
                        selected: isPass,
                        selectedBg: const Color(0xFF059669),
                        onTap: () => setState(() => _results[item.id] = 'pass'),
                      ),
                      SizedBox(width: 1.5.w),
                      _buildCheckButton(
                        label: 'Fail',
                        selected: isFail,
                        selectedBg: const Color(0xFFDC2626),
                        onTap: () => setState(() => _results[item.id] = 'fail'),
                      ),
                      SizedBox(width: 1.5.w),
                      _buildCheckButton(
                        label: 'N/A',
                        selected: isNa,
                        selectedBg: const Color(0xFF334155),
                        onTap: () => setState(() => _results[item.id] = 'na'),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildCheckButton({
    required String label,
    required bool selected,
    required Color selectedBg,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.7.h),
        decoration: BoxDecoration(
          color: selected ? selectedBg : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(8),
          border: selected ? null : Border.all(color: const Color(0xFFCBD5E1)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : const Color(0xFF64748B),
            fontSize: 14.sp,
            fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildLiveValuationCard() {
    return Container(
      padding: EdgeInsets.all(4.5.w),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF020617)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFF334155)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, 6),
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
                  const Icon(Icons.auto_awesome_rounded, color: Color(0xFF34D399), size: 18),
                  SizedBox(width: 2.w),
                  Text(
                    'LIVE VALUATION PAYOUT',
                    style: TextStyle(
                      color: const Color(0xFF34D399),
                      fontSize: 14.sp,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.1,
                    ),
                  ),
                ],
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.4.h),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _failedCount == 0 ? 'Pristine 100%' : '$_failedCount Deductions',
                  style: TextStyle(
                    color: const Color(0xFFCBD5E1),
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 1.5.h),
          Text(
            'Exact Payout to User:',
            style: TextStyle(
              color: const Color(0xFF94A3B8),
              fontSize: 14.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 0.5.h),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                CurrencyFormatter.format(_finalPayoutToUser),
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24.sp,
                  fontWeight: FontWeight.w900,
                ),
              ),
              SizedBox(width: 2.5.w),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.3.h),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                ),
                child: Text(
                  'Live Calculated',
                  style: TextStyle(
                    color: const Color(0xFF6EE7B7),
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 1.5.h),

          // Deduction Breakdown Container
          Container(
            padding: EdgeInsets.all(3.5.w),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Initial Estimated Quote:', style: TextStyle(color: const Color(0xFFCBD5E1), fontSize: 14.sp)),
                    Text(CurrencyFormatter.format(_quotedPrice), style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14.sp)),
                  ],
                ),
                if (_failedItems.isNotEmpty) ...[
                  SizedBox(height: 1.h),
                  Divider(color: Colors.white.withValues(alpha: 0.1), height: 1),
                  SizedBox(height: 1.h),
                  Text(
                    'Condition Deductions ($_totalDeductionPct%):',
                    style: TextStyle(color: const Color(0xFFF87171), fontWeight: FontWeight.bold, fontSize: 14.sp),
                  ),
                  SizedBox(height: 0.6.h),
                  ..._failedItems.map((item) {
                    final amt = (_quotedPrice * (item.deductionPct / 100.0)).round();
                    return Padding(
                      padding: EdgeInsets.only(bottom: 0.4.h),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '• ${item.label}:',
                              style: TextStyle(color: const Color(0xFF94A3B8), fontSize: 14.sp),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            '-₹$amt (${item.deductionPct}%)',
                            style: TextStyle(color: const Color(0xFFF87171), fontWeight: FontWeight.bold, fontSize: 14.sp),
                          ),
                        ],
                      ),
                    );
                  }),
                  SizedBox(height: 0.8.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total Deduction Amount:', style: TextStyle(color: const Color(0xFFFCA5A5), fontWeight: FontWeight.bold, fontSize: 14.sp)),
                      Text('-₹$_totalDeductionAmount', style: TextStyle(color: const Color(0xFFFCA5A5), fontWeight: FontWeight.bold, fontSize: 14.sp)),
                    ],
                  ),
                ] else ...[
                  SizedBox(height: 0.6.h),
                  Text(
                    '✓ Zero deductions! Customer receives full 100% quoted payout.',
                    style: TextStyle(color: const Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 14.sp),
                  ),
                ],
              ],
            ),
          ),

          SizedBox(height: 1.5.h),

          // Custom Negotiated Override Option
          InkWell(
            onTap: () {
              setState(() => _isCustomPrice = !_isCustomPrice);
            },
            child: Row(
              children: [
                Icon(Icons.tune_rounded, size: 16, color: AppColors.primary),
                SizedBox(width: 1.5.w),
                Text(
                  _isCustomPrice ? 'Use Algorithm Calculated Price' : 'Override with Custom Negotiated Payout',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          if (_isCustomPrice) ...[
            SizedBox(height: 1.h),
            TextField(
              controller: _overridePriceController,
              keyboardType: TextInputType.number,
              onChanged: (_) => setState(() {}),
              style: TextStyle(fontSize: 15.sp, color: Colors.white, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                prefixText: '₹ ',
                prefixStyle: TextStyle(color: Colors.white, fontSize: 15.sp, fontWeight: FontWeight.bold),
                hintText: _calculatedExactPayout.toString(),
                hintStyle: TextStyle(color: const Color(0xFF64748B), fontSize: 14.sp),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                contentPadding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNotesCard() {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'TECHNICIAN / INSPECTION NOTES',
            style: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.8,
              color: const Color(0xFF64748B),
            ),
          ),
          SizedBox(height: 0.8.h),
          TextField(
            controller: _notesController,
            maxLines: 2,
            style: TextStyle(fontSize: 14.sp),
            decoration: InputDecoration(
              hintText: 'Mention screen scratches, battery health %, customer conversation...',
              hintStyle: TextStyle(fontSize: 14.sp, color: const Color(0xFF94A3B8)),
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              contentPadding: EdgeInsets.all(3.w),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep1ContinueButton() {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 2,
        ),
        onPressed: () {
          widget.onStepChanged(2);
        },
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Proceed to Step 2: Photos & Lock',
              style: TextStyle(fontSize: 14.5.sp, fontWeight: FontWeight.bold),
            ),
            SizedBox(width: 2.w),
            const Icon(Icons.arrow_forward_rounded, size: 20),
          ],
        ),
      ),
    );
  }

  // --- Step 2 UI Components ---
  Widget _buildStep2ValuationHeader() {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'FINAL SETTLEMENT PAYOUT',
                style: TextStyle(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                  color: const Color(0xFF64748B),
                ),
              ),
              SizedBox(height: 0.4.h),
              Text(
                CurrencyFormatter.format(_finalPayoutToUser),
                style: TextStyle(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF059669),
                ),
              ),
            ],
          ),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.6.h),
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'Score: $_scorePercent%',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF059669),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPhotoAnglesSection() {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
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
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${_categoryConfig.categoryName} Photos',
                      style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 0.3.h),
                    Text('Tap any box to attach angle photo', style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B))),
                  ],
                ),
              ),
              SizedBox(width: 2.w),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.4.h),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${_photos.length} / ${_currentPhotoAngles.length} Photos',
                  style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: const Color(0xFF059669)),
                ),
              ),
            ],
          ),
          SizedBox(height: 1.5.h),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.35,
            ),
            itemCount: _currentPhotoAngles.length,
            itemBuilder: (ctx, idx) {
              final angle = _currentPhotoAngles[idx];
              final hasPhoto = _photos.containsKey(angle.id);

              return GestureDetector(
                onTap: () => _togglePhoto(angle.id, angle.label),
                child: Container(
                  padding: EdgeInsets.all(2.5.w),
                  decoration: BoxDecoration(
                    color: hasPhoto ? const Color(0xFFECFDF5) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: hasPhoto ? const Color(0xFF10B981) : const Color(0xFFE2E8F0),
                      width: hasPhoto ? 1.5 : 1,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        hasPhoto ? Icons.check_circle_rounded : Icons.photo_camera_rounded,
                        color: hasPhoto ? const Color(0xFF059669) : const Color(0xFF94A3B8),
                        size: 24,
                      ),
                      SizedBox(height: 0.6.h),
                      Text(
                        angle.label,
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.bold,
                          color: hasPhoto ? const Color(0xFF065F46) : const Color(0xFF0F172A),
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 0.2.h),
                      Text(
                        hasPhoto ? 'Captured' : 'Tap to Attach',
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                          color: hasPhoto ? const Color(0xFF059669) : const Color(0xFF94A3B8),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          SizedBox(height: 1.5.h),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF334155),
                side: const BorderSide(color: Color(0xFFCBD5E1)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: EdgeInsets.symmetric(vertical: 1.2.h),
              ),
              onPressed: _uploadAllPhotos,
              icon: const Icon(Icons.cloud_upload_outlined, size: 18),
              label: Text(
                'Upload All ${_currentPhotoAngles.length} Angle Photos at Once',
                style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2ActionButtons() {
    final disabled = _isAllocatedToRider || _isSubmitting;

    return Row(
      children: [
        Expanded(
          flex: 2,
          child: SizedBox(
            height: 52,
            child: OutlinedButton(
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF0F172A),
                side: const BorderSide(color: Color(0xFFCBD5E1)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () => widget.onStepChanged(1),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.arrow_back_rounded, size: 18),
                  SizedBox(width: 1.5.w),
                  Text('Step 1', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
        ),
        SizedBox(width: 3.w),
        Expanded(
          flex: 3,
          child: SizedBox(
            height: 52,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: disabled ? const Color(0xFF94A3B8) : const Color(0xFF059669),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: disabled ? 0 : 3,
              ),
              onPressed: disabled ? null : _handleSubmitInspection,
              child: _isSubmitting
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(_isAllocatedToRider ? Icons.lock_rounded : Icons.lock_outline_rounded, size: 19),
                        SizedBox(width: 1.5.w),
                        Text(
                          _isAllocatedToRider
                              ? 'Locked by Rider'
                              : 'Lock Payout (${CurrencyFormatter.format(_finalPayoutToUser)})',
                          style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ],
    );
  }

  // --- Post-Inspection Report Summary View ---
  Widget _buildPostInspectionSummary() {
    return ListView(
      padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 3.h),
      children: [
        Container(
          padding: EdgeInsets.all(5.w),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: _payoutDisbursed ? const Color(0xFFD1FAE5) : const Color(0xFFDBEAFE),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.check_circle_rounded,
                  size: 42,
                  color: _payoutDisbursed ? const Color(0xFF059669) : const Color(0xFF2563EB),
                ),
              ),
              SizedBox(height: 2.h),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.5.h),
                decoration: BoxDecoration(
                  color: _payoutDisbursed ? const Color(0xFFDCFCE7) : const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  _payoutDisbursed ? 'ORDER COMPLETED & LOCKED' : 'INSPECTION COMPLETED · PRICE LOCKED',
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                    color: _payoutDisbursed ? const Color(0xFF166534) : const Color(0xFF1E40AF),
                  ),
                ),
              ),
              SizedBox(height: 1.2.h),
              Text(
                _payoutDisbursed ? 'Payout Complete & Order Finalized!' : 'Inspection Report Generated!',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF0F172A),
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 0.6.h),
              Text(
                'Device: ${_selectedOrder.deviceName} (${_selectedOrder.orderNumber})',
                style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B)),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 2.5.h),

              // Gradient Exact Payout Card
              Container(
                padding: EdgeInsets.all(4.5.w),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF059669), Color(0xFF0D9488)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF059669).withValues(alpha: 0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _payoutDisbursed ? 'DISBURSED PAYOUT' : 'EXACT PAYOUT TO CUSTOMER',
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.8,
                            color: const Color(0xFFA7F3D0),
                          ),
                        ),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.3.h),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Score: $_scorePercent%',
                            style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 0.8.h),
                    Text(
                      CurrencyFormatter.format(_finalPayoutToUser),
                      style: TextStyle(
                        fontSize: 24.sp,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    SizedBox(height: 1.h),
                    Divider(color: Colors.white.withValues(alpha: 0.2), height: 1),
                    SizedBox(height: 0.8.h),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Original Quote: ${CurrencyFormatter.format(_quotedPrice)}', style: TextStyle(fontSize: 14.sp, color: const Color(0xFFD1FAE5))),
                        Text('Deductions: -₹$_totalDeductionAmount ($_totalDeductionPct%)', style: TextStyle(fontSize: 14.sp, color: const Color(0xFFD1FAE5))),
                      ],
                    ),
                  ],
                ),
              ),

              SizedBox(height: 2.5.h),

              if (_payoutDisbursed) ...[
                Container(
                  padding: EdgeInsets.all(3.5.w),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.verified_rounded, color: Color(0xFF059669), size: 20),
                      SizedBox(width: 2.5.w),
                      Expanded(
                        child: Text(
                          'Order shifted to Completed (Permanently Locked). The payout of ${CurrencyFormatter.format(_finalPayoutToUser)} has been disbursed.',
                          style: TextStyle(
                            color: const Color(0xFF065F46),
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ] else ...[
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 2,
                    ),
                    onPressed: _isSubmitting ? null : _handleInstantPayout,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.payments_rounded, size: 20),
                        SizedBox(width: 2.w),
                        Text(
                          'Disburse Spot Payout Now (${CurrencyFormatter.format(_finalPayoutToUser)})',
                          style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: 1.h),
                Text(
                  'Or return to Orders to disburse payout later. The updated price is now active on the order card.',
                  style: TextStyle(fontSize: 14.sp, color: const Color(0xFF94A3B8)),
                  textAlign: TextAlign.center,
                ),
              ],

              SizedBox(height: 2.5.h),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF0F172A),
                        side: const BorderSide(color: Color(0xFFCBD5E1)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: EdgeInsets.symmetric(vertical: 1.3.h),
                      ),
                      onPressed: () {
                        if (Navigator.canPop(context)) {
                          Navigator.pop(context);
                        } else {
                          setState(() {
                            _submitted = false;
                            _payoutDisbursed = false;
                            _initInspectionDefaults();
                            widget.onStepChanged(1);
                          });
                        }
                      },
                      child: Text(
                        'Back to Orders',
                        style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  SizedBox(width: 3.w),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF1F5F9),
                        foregroundColor: const Color(0xFF334155),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: EdgeInsets.symmetric(vertical: 1.3.h),
                      ),
                      onPressed: () {
                        final remaining = widget.orders.where((o) => o.id != _selectedOrder.id && o.status != 'completed').toList();
                        if (remaining.isNotEmpty) {
                          _selectOrder(remaining.first);
                        } else {
                          setState(() {
                            _submitted = false;
                            _payoutDisbursed = false;
                            _initInspectionDefaults();
                            widget.onStepChanged(1);
                          });
                        }
                      },
                      child: Text(
                        'Inspect Next Device',
                        style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
