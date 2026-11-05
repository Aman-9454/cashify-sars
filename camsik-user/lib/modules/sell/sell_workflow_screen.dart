import 'package:flutter/material.dart';
import '../../models/user_order.dart';
import '../../models/user_profile.dart';
import '../../core/services/api_service.dart';
import 'steps/sell_brand_step.dart';
import 'steps/sell_category_step.dart';
import 'steps/sell_model_step.dart';
import 'steps/sell_pickup_step.dart';
import 'steps/sell_questions_step.dart';
import 'steps/sell_summary_step.dart';
import 'steps/sell_variant_step.dart';

class SellWorkflowWidget extends StatefulWidget {
  final List<Map<String, dynamic>> categories;
  final String? preselectedCategory;
  final UserProfile userProfile;
  final Function(UserProfile) onProfileUpdate;
  final Function(UserOrder) onOrderCreated;

  const SellWorkflowWidget({
    super.key,
    required this.categories,
    this.preselectedCategory,
    required this.userProfile,
    required this.onProfileUpdate,
    required this.onOrderCreated,
  });

  @override
  State<SellWorkflowWidget> createState() => _SellWorkflowWidgetState();
}

class _SellWorkflowWidgetState extends State<SellWorkflowWidget> {
  // Steps: 0: Category, 1: Brand, 2: Model, 3: Variant, 4: Questions, 5: Summary, 6: Pickup Slot
  int _step = 0;
  late Map<String, dynamic> _selectedCategory;

  // Brands state
  List<Map<String, dynamic>> _brands = [];
  bool _loadingBrands = false;
  Map<String, dynamic>? _selectedBrand;

  // Models state
  List<Map<String, dynamic>> _models = [];
  bool _loadingModels = false;
  Map<String, dynamic>? _selectedModel;
  String _selectedStorage = 'Body Only';
  String _selectedColor = 'Black';
  List<Map<String, dynamic>> _selectedLenses = [];

  // Dynamic Questions from backend
  List<Map<String, dynamic>> _questions = [];
  final Map<int, int> _selectedAnswers = {}; // questionIndex -> optionIndex

  int _basePrice = 58000;
  int _calculatedPrice = 58000;

  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _upiController = TextEditingController();
  String _selectedSlot = '11:00 AM – 1:00 PM';
  String _selectedDate = 'Tomorrow';
  String? _verifiedImei;

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.categories.firstWhere(
      (c) => c['id'] == widget.preselectedCategory,
      orElse: () => widget.categories.isNotEmpty ? widget.categories.first : {'id': 'cat-dslr', 'name': 'DSLR & Mirrorless'},
    );
    _addressController.text = widget.userProfile.address;
    _upiController.text = widget.userProfile.upiId;
    final catId = _selectedCategory['id'] as String;
    _loadBrandsForCategory(catId);
    _loadQuestionsForCategory(catId);
  }

  @override
  void dispose() {
    _addressController.dispose();
    _upiController.dispose();
    super.dispose();
  }

  void _loadBrandsForCategory(String catId) {
    setState(() {
      _brands = [];
      _loadingBrands = true;
      _selectedBrand = null;
      _models = [];
      _selectedModel = null;
    });

    ApiService.fetchBrands(categoryId: catId).then((brands) {
      if (mounted) {
        setState(() {
          _brands = brands;
          _loadingBrands = false;
        });
      }
    }).catchError((_) {
      if (mounted) setState(() => _loadingBrands = false);
    });
  }

  void _loadModelsForBrand(String catId, String brandId) {
    setState(() {
      _models = [];
      _loadingModels = true;
      _selectedModel = null;
    });

    ApiService.fetchModels(categoryId: catId, brandId: brandId).then((models) {
      if (mounted) {
        setState(() {
          _models = models;
          _loadingModels = false;
        });
      }
    }).catchError((_) {
      if (mounted) setState(() => _loadingModels = false);
    });
  }

  void _loadQuestionsForCategory(String catId) {
    setState(() {
      _questions = [];
      _selectedAnswers.clear();
    });
    _recalculatePrice();

    ApiService.fetchQuestions(categoryId: catId).then((questions) {
      if (mounted && questions.isNotEmpty) {
        setState(() {
          _questions = questions;
          _selectedAnswers.clear(); // Starts empty so user explicitly answers all questions
        });
        _recalculatePrice();
      }
    });
  }

  void _recalculatePrice() {
    int price = _basePrice;
    for (int qIdx = 0; qIdx < _questions.length; qIdx++) {
      final optIdx = _selectedAnswers[qIdx];
      if (optIdx != null) {
        final options = _questions[qIdx]['options'] as List?;
        if (options != null && optIdx < options.length) {
          final adj = (options[optIdx]['adj'] as num?)?.toInt() ?? 0;
          price += adj;
        }
      }
    }
    final lensBonus = _selectedLenses.fold<int>(
      0,
      (sum, l) => sum + ((l['price'] as num?)?.toInt() ?? 0),
    );
    price += lensBonus;
    setState(() {
      _calculatedPrice = price > 3000 ? price : 3000;
    });
  }

  void _handleConfirmSellOrder() async {
    final addressText = _addressController.text.trim();
    final pinMatch = RegExp(r'\b\d{6}\b').firstMatch(addressText);
    final pinCode = pinMatch?.group(0) ?? '401107';

    final lensSummary = _selectedLenses.isNotEmpty
        ? ' + ${_selectedLenses.length} Lens (${_selectedLenses.map((l) => l['name']).join(', ')})'
        : '';
    final orderData = {
      'type': 'sell',
      'customerName': widget.userProfile.name,
      'customerPhone': widget.userProfile.phone,
      'customerAddress': addressText,
      'pinCode': pinCode,
      'pickupDate': _selectedDate,
      'pickupSlot': _selectedSlot,
      'paymentMethod': 'Doorstep Cash / Handover Payout',
      'amount': _calculatedPrice,
      'quotedPrice': _calculatedPrice,
      'finalPrice': _calculatedPrice,
      'deviceName': '${_selectedModel?['name'] ?? 'Device'} ($_selectedStorage)$lensSummary',
      'status': 'created',
      if (_verifiedImei != null && _verifiedImei!.isNotEmpty) 'deviceImei': _verifiedImei,
    };

    // Verify PIN serviceability
    final pinRes = await ApiService.checkPincodeServiceability(pinCode);
    if (pinRes['serviceable'] == false) {
      final unserviceableData = {
        ...orderData,
        'status': 'unserviceable',
        'notes': 'Unserviceable Area Sell Order Request. PIN: $pinCode',
      };
      await ApiService.createOrder(unserviceableData);

      if (mounted) {
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
                  setState(() {
                    _step = 0;
                    _selectedBrand = null;
                    _selectedModel = null;
                    _selectedAnswers.clear();
                    _selectedLenses.clear();
                  });
                },
                child: const Text('OK', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );
      }
      return;
    }

    final created = await ApiService.createOrder(orderData);
    if (created != null && mounted) {
      final userOrder = UserOrder.fromJson(created);
      setState(() {
        _step = 0;
        _selectedBrand = null;
        _selectedModel = null;
        _selectedAnswers.clear();
        _selectedLenses.clear();
      });
      widget.onOrderCreated(userOrder);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: _step > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                onPressed: () => setState(() => _step--),
              )
            : null,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _getStepTitle(),
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
            ),
            Text(
              _step > 0
                  ? '${_selectedCategory['name']}${_selectedBrand != null ? ' > ${_selectedBrand!['name']}' : ''}${_selectedModel != null ? ' > ${_selectedModel!['name']}' : ''}'
                  : 'Instant AI Valuation • Free Doorstep Pickup',
              style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
            ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(6),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
            child: Row(
              children: List.generate(7, (idx) {
                final isPassedOrCurrent = idx <= _step;
                return Expanded(
                  child: Container(
                    height: 3.5,
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(
                      color: isPassedOrCurrent ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
      body: _buildStepContent(),
    );
  }

  String _getStepTitle() {
    switch (_step) {
      case 0:
        return 'Step 1 of 7: Select Category';
      case 1:
        return 'Step 2 of 7: Select Brand';
      case 2:
        return 'Step 3 of 7: Select Device Model';
      case 3:
        return 'Step 4 of 7: Storage & Variant';
      case 4:
        return 'Step 5 of 7: Device Condition';
      case 5:
        return 'Step 6 of 7: Valuation Summary';
      case 6:
        return 'Step 7 of 7: Schedule Pickup';
      default:
        return 'Sell Device';
    }
  }

  Widget _buildStepContent() {
    switch (_step) {
      case 0:
        return SellCategoryStep(
          categories: widget.categories,
          onSelectCategory: (cat) {
            setState(() {
              _selectedCategory = cat;
              _step = 1;
            });
            final catId = cat['id'] as String;
            _loadBrandsForCategory(catId);
            _loadQuestionsForCategory(catId);
          },
        );
      case 1:
        return SellBrandStep(
          categoryName: _selectedCategory['name'] as String? ?? 'Device',
          categoryId: _selectedCategory['id'] as String,
          brands: _brands,
          isLoading: _loadingBrands,
          onSelectBrand: (brand) {
            setState(() {
              _selectedBrand = brand;
              _step = 2;
            });
            _loadModelsForBrand(_selectedCategory['id'] as String, brand['id'] as String);
          },
        );
      case 2:
        return SellModelStep(
          models: _models,
          brandName: _selectedBrand?['name'] as String?,
          isLoading: _loadingModels,
          onSelectModel: (m) {
            setState(() {
              _selectedModel = m;
              _basePrice = (m['basePrice'] as num?)?.toInt() ?? 50000;
              final storages = m['storages'] as List?;
              if (storages != null && storages.isNotEmpty) {
                _selectedStorage = storages.first as String;
              }
              final colors = m['colors'] as List?;
              if (colors != null && colors.isNotEmpty) {
                _selectedColor = colors.first as String;
              }
              _step = 3;
            });
            _recalculatePrice();
          },
        );
      case 3:
        return SellVariantStep(
          selectedModel: _selectedModel,
          selectedBrand: _selectedBrand?['name'] as String?,
          categoryId: _selectedCategory['id'] as String?,
          categoryName: _selectedCategory['name'] as String?,
          basePrice: _basePrice,
          selectedStorage: _selectedStorage,
          selectedColor: _selectedColor,
          selectedLenses: _selectedLenses,
          verifiedImei: _verifiedImei,
          onImeiVerified: (imei) => setState(() => _verifiedImei = imei),
          onStorageChanged: (s) => setState(() => _selectedStorage = s),
          onColorChanged: (c) => setState(() => _selectedColor = c),
          onLensesChanged: (lenses) {
            setState(() => _selectedLenses = lenses);
            _recalculatePrice();
          },
          onProceed: () => setState(() => _step = 4),
        );
      case 4:
        return SellQuestionsStep(
          selectedModel: _selectedModel,
          selectedStorage: _selectedStorage,
          selectedColor: _selectedColor,
          basePrice: _basePrice,
          calculatedPrice: _calculatedPrice,
          questions: _questions,
          selectedAnswers: _selectedAnswers,
          onAnswerSelected: (qIdx, optIdx) {
            setState(() {
              _selectedAnswers[qIdx] = optIdx;
            });
            _recalculatePrice();
          },
          onProceed: () => setState(() => _step = 5),
        );
      case 5:
        return SellSummaryStep(
          selectedModel: _selectedModel,
          categoryId: _selectedCategory['id'] as String?,
          categoryName: _selectedCategory['name'] as String?,
          selectedStorage: _selectedStorage,
          selectedColor: _selectedColor,
          selectedLenses: _selectedLenses,
          basePrice: _basePrice,
          calculatedPrice: _calculatedPrice,
          questions: _questions,
          selectedAnswers: _selectedAnswers,
          verifiedImei: _verifiedImei,
          onProceed: (imei) {
            setState(() {
              _verifiedImei = imei ?? _verifiedImei;
              _step = 6;
            });
          },
        );
      case 6:
        return SellPickupStep(
          selectedModel: _selectedModel,
          selectedStorage: _selectedStorage,
          selectedColor: _selectedColor,
          calculatedPrice: _calculatedPrice,
          userProfile: widget.userProfile,
          selectedDate: _selectedDate,
          selectedSlot: _selectedSlot,
          addressController: _addressController,
          upiController: _upiController,
          onDateChanged: (d) => setState(() => _selectedDate = d),
          onSlotChanged: (s) => setState(() => _selectedSlot = s),
          onConfirmOrder: _handleConfirmSellOrder,
          onProfileUpdate: widget.onProfileUpdate,
        );
      default:
        return const SizedBox.shrink();
    }
  }
}
