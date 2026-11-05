import 'package:flutter/material.dart';
import '../../models/user_order.dart';
import '../../models/user_profile.dart';
import '../../core/services/api_service.dart';
import 'steps/exchange_checkout_step.dart';
import 'steps/exchange_confirmed_step.dart';
import 'steps/exchange_product_detail_step.dart';
import 'steps/exchange_questions_step.dart';
import 'steps/exchange_select_new_step.dart';
import 'steps/exchange_select_old_step.dart';

class ExchangeWorkflowWidget extends StatefulWidget {
  final List<Map<String, dynamic>> refurbishedProducts;
  final UserProfile userProfile;
  final Function(UserProfile) onProfileUpdate;
  final Function(UserOrder) onOrderCreated;

  const ExchangeWorkflowWidget({
    super.key,
    required this.refurbishedProducts,
    required this.userProfile,
    required this.onProfileUpdate,
    required this.onOrderCreated,
  });

  @override
  State<ExchangeWorkflowWidget> createState() => _ExchangeWorkflowWidgetState();
}

class _ExchangeWorkflowWidgetState extends State<ExchangeWorkflowWidget> {
  // Steps: 0: select-old, 1: condition, 2: select-new, 3: product-detail, 4: checkout, 5: confirmed
  int _step = 0;

  // Step 0: Trade-in Old Device
  String _oldCategoryFilter = 'all';
  String _oldSearchQuery = '';
  List<Map<String, dynamic>> _tradeInDevices = [];
  Map<String, dynamic>? _selectedOldDevice;

  // Step 1: Diagnostics & Valuation
  List<Map<String, dynamic>> _questions = [];
  final Map<int, int> _selectedAnswers = {};
  int _oldBaseValue = 48000;
  int _calculatedOldValue = 45000;
  final int _exchangeBonus = 5000; // Guaranteed Camsik exchange bonus

  // Step 2: Browse Upgrade Catalog
  String _newCategoryFilter = 'all';
  String _newSearchQuery = '';

  // Step 3: Product Detail View
  Map<String, dynamic>? _selectedNewDevice;
  String _selectedCondition = 'Superb';
  int _selectedUnitIndex = 0;

  // Step 4: Checkout, Coupons & Address
  String? _appliedCouponCode;
  int _couponDiscount = 0;
  final TextEditingController _couponController = TextEditingController();
  String _selectedDate = 'Tomorrow';
  String _selectedSlot = '10:00 AM – 1:00 PM';
  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _addressController;
  late final TextEditingController _cityController;
  late final TextEditingController _pincodeController;
  bool _isPlacingOrder = false;

  // Step 5: Confirmed Order
  UserOrder? _confirmedOrder;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.userProfile.name);
    _phoneController = TextEditingController(text: widget.userProfile.phone);
    _addressController =
        TextEditingController(text: widget.userProfile.address);
    _cityController = TextEditingController(text: 'Mumbai');
    _pincodeController = TextEditingController(text: '401107');
    _loadTradeInDevices();
  }

  @override
  void dispose() {
    _couponController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _pincodeController.dispose();
    super.dispose();
  }

  void _loadTradeInDevices() {
    // Static fallback models commented out as requested - live API models fetched directly
    /*
    final allModels = ApiService.getFallbackModelsSync();
    */
    ApiService.fetchModels().then((models) {
      if (mounted && models.isNotEmpty) {
        setState(() {
          _tradeInDevices = models;
        });
      }
    });
  }

  void _recalcOldValue() {
    int val = _oldBaseValue;
    for (int qIdx = 0; qIdx < _questions.length; qIdx++) {
      final optIdx = _selectedAnswers[qIdx] ?? 0;
      final options = _questions[qIdx]['options'] as List?;
      if (options != null && optIdx < options.length) {
        final adj = (options[optIdx]['adj'] as num?)?.toInt() ?? 0;
        val += adj;
      }
    }
    setState(() {
      _calculatedOldValue = val > 4000 ? val : 4000;
    });
  }

  int _getAdjustedNewDevicePrice() {
    final basePrice =
        (_selectedNewDevice?['sellingPrice'] as int?) ?? 70000;
    if (_selectedCondition == 'Good') return (basePrice * 0.92).toInt();
    if (_selectedCondition == 'Fair') return (basePrice * 0.85).toInt();
    return basePrice;
  }

  void _applyCoupon(String code) {
    final c = code.trim().toUpperCase();
    if (c == 'CAMSIK500') {
      setState(() {
        _appliedCouponCode = c;
        _couponDiscount = 500;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Coupon CAMSIK500 applied! \u20B9500 extra discount.'),
          backgroundColor: Color(0xFF059669),
        ),
      );
    } else if (c == 'UPGRADE1000') {
      setState(() {
        _appliedCouponCode = c;
        _couponDiscount = 1000;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text('Coupon UPGRADE1000 applied! \u20B91,000 extra discount.'),
          backgroundColor: Color(0xFF059669),
        ),
      );
    } else if (c == 'FESTIVE1500') {
      setState(() {
        _appliedCouponCode = c;
        _couponDiscount = 1500;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text('Coupon FESTIVE1500 applied! \u20B91,500 extra discount.'),
          backgroundColor: Color(0xFF059669),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Invalid coupon code. Try CAMSIK500 or UPGRADE1000.'),
          backgroundColor: Color(0xFFDC2626),
        ),
      );
    }
  }

  void _handleConfirmExchange() async {
    final newPrice = _getAdjustedNewDevicePrice();
    final totalTradeIn = _calculatedOldValue + _exchangeBonus;
    final netDiff = newPrice - totalTradeIn - _couponDiscount;
    final netPayable = netDiff > 0 ? netDiff : 0;

    setState(() => _isPlacingOrder = true);

    final orderData = {
      'type': 'exchange',
      'customerName': _nameController.text.trim().isNotEmpty
          ? _nameController.text.trim()
          : widget.userProfile.name,
      'customerPhone': _phoneController.text.trim().isNotEmpty
          ? _phoneController.text.trim()
          : widget.userProfile.phone,
      'customerAddress':
          '${_addressController.text.trim()}, ${_cityController.text.trim()} - ${_pincodeController.text.trim()}',
      'pickupDate': _selectedDate,
      'pickupSlot': _selectedSlot,
      'amount': netPayable,
      'deviceName':
          '${_selectedOldDevice?['name']} ➔ ${_selectedNewDevice?['model']}',
      'status': 'Exchange Confirmed',
      'paymentMethod': netDiff <= 0
          ? 'Cashback Disbursal via UPI'
          : 'Doorstep Swap (Cash / UPI)',
    };

    final pinRes = await ApiService.checkPincodeServiceability(_pincodeController.text.trim());
    if (pinRes['serviceable'] == false) {
      final unserviceableData = {
        ...orderData,
        'status': 'unserviceable',
        'notes': 'Unserviceable Area Exchange Request. PIN: ${_pincodeController.text.trim()}',
      };
      await ApiService.createOrder(unserviceableData);

      if (!mounted) return;
      setState(() => _isPlacingOrder = false);

      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          icon: const Icon(Icons.location_off_rounded, color: Colors.orange, size: 48),
          title: const Text('Coverage Notice', style: TextStyle(fontWeight: FontWeight.w900)),
          content: const Text(
            'Thanks for your request, we will soon come and start servicing in your area.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                setState(() => _step = 0);
              },
              child: const Text('OK', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
      return;
    }

    final created = await ApiService.createOrder(orderData);
    if (!mounted) return;
    setState(() => _isPlacingOrder = false);

    final order = UserOrder.fromJson(created ?? orderData);
    widget.onOrderCreated(order);

    setState(() {
      _confirmedOrder = order;
      _step = 5;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        scrolledUnderElevation: 0,
        titleSpacing: _step > 0 && _step < 5 ? 0 : 16,
        leading: _step > 0 && _step < 5
            ? IconButton(
                icon: const Icon(
                  Icons.arrow_back_ios_new_rounded,
                  size: 18,
                  color: Color(0xFF0F172A),
                ),
                onPressed: () => setState(() => _step--),
              )
            : null,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Text(
                  _getStepShortName(),
                  style: const TextStyle(
                    fontSize: 15.5,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.2,
                  ),
                ),
                if (_step < 5) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 7,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEDE9FE),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Step ${_step + 1} of 5',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF7C3AED),
                      ),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 1.5),
            Text(
              _getStepSubtitle(),
              style: const TextStyle(
                fontSize: 10.5,
                color: Color(0xFF64748B),
                fontWeight: FontWeight.w500,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(8),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: List.generate(5, (index) {
                    final isFilled = index <= _step && _step < 5;
                    return Expanded(
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        height: 3.5,
                        margin: EdgeInsets.only(right: index < 4 ? 4 : 0),
                        decoration: BoxDecoration(
                          color: isFilled
                              ? const Color(0xFF7C3AED)
                              : const Color(0xFFE2E8F0),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    );
                  }),
                ),
              ),
              const SizedBox(height: 5),
            ],
          ),
        ),
      ),
      body: _buildStepContent(),
    );
  }

  String _getStepShortName() {
    switch (_step) {
      case 0:
        return 'Select Old Device';
      case 1:
        return 'Device Condition';
      case 2:
        return 'Select Upgrade';
      case 3:
        return 'Upgrade Details';
      case 4:
        return 'Exchange Checkout';
      case 5:
        return 'Exchange Confirmed';
      default:
        return 'Device Exchange';
    }
  }

  String _getStepSubtitle() {
    switch (_step) {
      case 0:
        return 'Choose your camera, lens, or phone to trade-in';
      case 1:
        return 'Quick diagnostic questions for instant valuation';
      case 2:
        return 'Pick certified refurbished gear from Camsik Store';
      case 3:
        return 'Inspect specifications, condition & warranty';
      case 4:
        return 'Review doorstep swap slot, coupon & final pay';
      case 5:
        return 'Order placed! Our technician will visit for doorstep swap';
      default:
        return 'Camsik 1-Step Exchange';
    }
  }

  Widget _buildStepContent() {
    switch (_step) {
      case 0:
        return ExchangeSelectOldStep(
          tradeInDevices: _tradeInDevices,
          categoryFilter: _oldCategoryFilter,
          searchQuery: _oldSearchQuery,
          onSearchChanged: (v) => setState(() => _oldSearchQuery = v),
          onCategoryChanged: (catId) =>
              setState(() => _oldCategoryFilter = catId),
          onDeviceSelected: (d) async {
            final rawCat = (d['categoryId'] as String? ?? '').toLowerCase();
            String catId = 'cat-dslr';
            if (rawCat.contains('phone') || rawCat.contains('mobile') || rawCat.contains('smart')) {
              catId = 'cat-smartphone';
            } else if (rawCat.contains('laptop')) {
              catId = 'cat-laptop';
            } else if (rawCat.contains('lens')) {
              catId = 'cat-lens';
            } else if (rawCat.isNotEmpty) {
              catId = rawCat;
            }

            var questions = await ApiService.fetchQuestions(categoryId: catId);
            if (questions.isEmpty && catId != 'cat-dslr') {
              questions = await ApiService.fetchQuestions(categoryId: 'cat-dslr');
            }

            if (!mounted) return;
            setState(() {
              _selectedOldDevice = d;
              _oldBaseValue = (d['basePrice'] as num?)?.toInt() ?? 45000;
              _questions = questions;
              _selectedAnswers.clear();
              for (int i = 0; i < _questions.length; i++) {
                _selectedAnswers[i] = 0;
              }
              _step = 1;
            });
            _recalcOldValue();
          },
        );
      case 1:
        return ExchangeQuestionsStep(
          selectedOldDevice: _selectedOldDevice,
          questions: _questions,
          selectedAnswers: _selectedAnswers,
          calculatedOldValue: _calculatedOldValue,
          exchangeBonus: _exchangeBonus,
          onAnswerSelected: (qIdx, optIdx) {
            setState(() => _selectedAnswers[qIdx] = optIdx);
            _recalcOldValue();
          },
          onNext: () => setState(() => _step = 2),
        );
      case 2:
        return ExchangeSelectNewStep(
          refurbishedProducts: widget.refurbishedProducts,
          categoryFilter: _newCategoryFilter,
          searchQuery: _newSearchQuery,
          totalTradeIn: _calculatedOldValue + _exchangeBonus,
          onSearchChanged: (v) => setState(() => _newSearchQuery = v),
          onCategoryChanged: (catId) =>
              setState(() => _newCategoryFilter = catId),
          onProductSelected: (p) {
            setState(() {
              _selectedNewDevice = p;
              _selectedCondition = 'Superb';
              _selectedUnitIndex = 0;
              _step = 3;
            });
          },
        );
      case 3:
        return ExchangeProductDetailStep(
          selectedNewDevice: _selectedNewDevice,
          selectedCondition: _selectedCondition,
          selectedUnitIndex: _selectedUnitIndex,
          calculatedOldValue: _calculatedOldValue,
          exchangeBonus: _exchangeBonus,
          onConditionChanged: (c) => setState(() => _selectedCondition = c),
          onUnitSelected: (uIdx) => setState(() => _selectedUnitIndex = uIdx),
          onProceedToCheckout: () => setState(() => _step = 4),
        );
      case 4:
        return ExchangeCheckoutStep(
          adjustedPrice: _getAdjustedNewDevicePrice(),
          selectedCondition: _selectedCondition,
          calculatedOldValue: _calculatedOldValue,
          exchangeBonus: _exchangeBonus,
          appliedCouponCode: _appliedCouponCode,
          couponDiscount: _couponDiscount,
          couponController: _couponController,
          onApplyCoupon: _applyCoupon,
          selectedDate: _selectedDate,
          selectedSlot: _selectedSlot,
          onDateSelected: (d) => setState(() => _selectedDate = d),
          onSlotSelected: (s) => setState(() => _selectedSlot = s),
          nameController: _nameController,
          phoneController: _phoneController,
          addressController: _addressController,
          cityController: _cityController,
          pincodeController: _pincodeController,
          isPlacingOrder: _isPlacingOrder,
          onConfirmExchange: _handleConfirmExchange,
          userProfile: widget.userProfile,
          onProfileUpdate: widget.onProfileUpdate,
        );
      case 5:
        return ExchangeConfirmedStep(
          confirmedOrder: _confirmedOrder,
          selectedDate: _selectedDate,
          selectedSlot: _selectedSlot,
          onExchangeAnother: () => setState(() => _step = 0),
        );
      default:
        return const SizedBox.shrink();
    }
  }
}
