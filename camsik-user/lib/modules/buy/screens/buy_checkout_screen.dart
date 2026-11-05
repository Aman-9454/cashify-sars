import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/session_service.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../models/user_address.dart';
import '../../../models/user_order.dart';
import '../../../models/user_profile.dart';
import '../../../widgets/camsik_smart_image.dart';
import '../../profile/screens/add_edit_address_screen.dart';
import '../../profile/screens/saved_addresses_screen.dart';

class BuyCheckoutScreen extends StatefulWidget {
  final Map<String, dynamic> product;
  final int selectedPrice;
  final String selectedCondition;
  final String selectedStorage;
  final String selectedColor;
  final UserProfile userProfile;
  final Function(UserProfile) onProfileUpdate;
  final Function(UserOrder) onOrderCreated;
  final VoidCallback onBack;

  const BuyCheckoutScreen({
    super.key,
    required this.product,
    required this.selectedPrice,
    required this.selectedCondition,
    required this.selectedStorage,
    required this.selectedColor,
    required this.userProfile,
    required this.onProfileUpdate,
    required this.onOrderCreated,
    required this.onBack,
  });

  @override
  State<BuyCheckoutScreen> createState() => _BuyCheckoutScreenState();
}

class _BuyCheckoutScreenState extends State<BuyCheckoutScreen> {
  // Address System (Unified with Sell module)
  List<UserAddress> _savedAddresses = [];
  bool _isLoadingAddresses = true;
  UserAddress? _selectedAddress;

  // Coupon System
  final TextEditingController _couponController = TextEditingController();
  String? _appliedCoupon;
  int _couponDiscount = 0;
  String? _couponError;

  // Delivery Scheduling
  late String _selectedDate;
  String _selectedSlot = '10:00 AM – 1:00 PM';
  final List<String> _dateOptions = ['Tomorrow', 'Day After', 'In 3 Days'];
  final List<String> _slotOptions = [
    '10:00 AM – 1:00 PM',
    '2:00 PM – 5:00 PM',
    '5:00 PM – 8:00 PM',
  ];

  // Payment Selection - COD Only as requested
  String _selectedPaymentMethod = 'pod';
  bool _isPlacingOrder = false;

  @override
  void initState() {
    super.initState();
    _loadSavedAddresses();
    _selectedDate = _dateOptions.first;
  }

  void _loadSavedAddresses() {
    final rawList = SessionService.getSavedAddresses(fallbackAddress: widget.userProfile.address);
    _savedAddresses = rawList.map((m) => UserAddress.fromJson(m)).toList();
    _isLoadingAddresses = false;
    if (_savedAddresses.isNotEmpty) {
      _selectedAddress = _savedAddresses.firstWhere(
        (a) => a.isDefault,
        orElse: () => _savedAddresses.first,
      );
    }
  }

  Future<void> _navigateToAddAddress() async {
    final newAddress = await Navigator.push<UserAddress>(
      context,
      MaterialPageRoute(
        builder: (_) => AddEditAddressScreen(
          defaultName: widget.userProfile.name,
          defaultPhone: widget.userProfile.phone,
        ),
      ),
    );

    if (newAddress != null) {
      final updatedList = [
        ..._savedAddresses.map((a) => a.copyWith(isDefault: false)),
        newAddress.copyWith(isDefault: true),
      ];

      setState(() {
        _savedAddresses = updatedList;
        _selectedAddress = newAddress;
      });

      await SessionService.saveAddressesList(updatedList.map((a) => a.toJson()).toList());
      widget.onProfileUpdate(widget.userProfile.copyWith(address: newAddress.formattedAddress));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF059669),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            content: Text('Delivery address "${newAddress.tag}" added & selected!'),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  Future<void> _navigateToEditAddress(UserAddress address) async {
    final edited = await Navigator.push<UserAddress>(
      context,
      MaterialPageRoute(
        builder: (_) => AddEditAddressScreen(
          initialAddress: address,
          defaultName: widget.userProfile.name,
          defaultPhone: widget.userProfile.phone,
        ),
      ),
    );

    if (edited != null) {
      final updatedList = _savedAddresses.map((a) => a.id == edited.id ? edited : a).toList();
      setState(() {
        _savedAddresses = updatedList;
        _selectedAddress = edited;
      });

      await SessionService.saveAddressesList(updatedList.map((a) => a.toJson()).toList());
      widget.onProfileUpdate(widget.userProfile.copyWith(address: edited.formattedAddress));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF059669),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            content: const Text('Delivery address updated successfully'),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  Future<void> _navigateToSavedAddresses() async {
    final selectedFormattedAddress = await Navigator.push<String>(
      context,
      MaterialPageRoute(
        builder: (_) => SavedAddressesScreen(
          profile: widget.userProfile,
          onAddressSelected: (addr) {
            Navigator.pop(context, addr);
          },
        ),
      ),
    );

    final rawList = SessionService.getSavedAddresses(fallbackAddress: widget.userProfile.address);
    setState(() {
      _savedAddresses = rawList.map((m) => UserAddress.fromJson(m)).toList();
      if (selectedFormattedAddress != null && selectedFormattedAddress.isNotEmpty) {
        try {
          _selectedAddress = _savedAddresses.firstWhere(
            (a) => a.formattedAddress.trim() == selectedFormattedAddress.trim(),
          );
        } catch (_) {
          if (_savedAddresses.isNotEmpty) {
            _selectedAddress = _savedAddresses.first;
          }
        }
      } else if (_selectedAddress == null && _savedAddresses.isNotEmpty) {
        _selectedAddress = _savedAddresses.firstWhere(
          (a) => a.isDefault,
          orElse: () => _savedAddresses.first,
        );
      }
    });
  }

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  // Calculate final payable amount
  int get _prepaidDiscount => _selectedPaymentMethod == 'upi' ? 250 : 0;

  int get _finalPayableAmount {
    final net = widget.selectedPrice - _couponDiscount - _prepaidDiscount;
    return net > 0 ? net : 1000;
  }

  void _applyCouponCode(String code) {
    final clean = code.trim().toUpperCase();
    if (clean.isEmpty) return;

    setState(() {
      _couponError = null;
      if (clean == 'CAMSIK500') {
        _appliedCoupon = clean;
        _couponDiscount = 500;
      } else if (clean == 'UPGRADE1000') {
        if (widget.selectedPrice >= 30000) {
          _appliedCoupon = clean;
          _couponDiscount = 1000;
        } else {
          _couponError = 'Valid only on orders above $kRupee 30,000';
          _appliedCoupon = null;
          _couponDiscount = 0;
        }
      } else if (clean == 'FESTIVE1500') {
        if (widget.selectedPrice >= 45000) {
          _appliedCoupon = clean;
          _couponDiscount = 1500;
        } else {
          _couponError = 'Valid only on orders above $kRupee 45,000';
          _appliedCoupon = null;
          _couponDiscount = 0;
        }
      } else {
        _couponError = 'Invalid coupon code. Try CAMSIK500';
        _appliedCoupon = null;
        _couponDiscount = 0;
      }
    });

    if (_appliedCoupon != null) {
      FocusScope.of(context).unfocus();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🎉 Coupon $_appliedCoupon applied! Saved ${formatCurrency(_couponDiscount)}'),
          backgroundColor: const Color(0xFF059669),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
    }
  }

  void _removeCoupon() {
    setState(() {
      _appliedCoupon = null;
      _couponDiscount = 0;
      _couponError = null;
      _couponController.clear();
    });
  }

  Future<void> _handlePlaceOrder() async {
    final activeAddress = _selectedAddress ?? (_savedAddresses.isNotEmpty ? _savedAddresses.first : null);
    final deliveryAddress = activeAddress?.formattedAddress ?? widget.userProfile.address;

    if (deliveryAddress.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please add a delivery address to place your order'),
          backgroundColor: const Color(0xFFDC2626),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          action: SnackBarAction(
            label: 'Add Now',
            textColor: Colors.white,
            onPressed: _navigateToAddAddress,
          ),
        ),
      );
      return;
    }

    final recipientName = (activeAddress?.contactName.isNotEmpty == true)
        ? activeAddress!.contactName
        : (widget.userProfile.name.isNotEmpty ? widget.userProfile.name : 'Customer');
    final recipientPhone = (activeAddress?.contactPhone.isNotEmpty == true)
        ? activeAddress!.contactPhone
        : (widget.userProfile.phone.isNotEmpty ? widget.userProfile.phone : '');

    setState(() => _isPlacingOrder = true);

    final modelName = widget.product['model']?.toString() ?? 'Tech Device';
    final brand = widget.product['brand']?.toString() ?? '';
    final fullDeviceName = 'Refurbished $brand $modelName (${widget.selectedStorage}) - ${widget.selectedCondition}';

    String paymentLabel = 'Prepaid UPI / Instant Online';
    if (_selectedPaymentMethod == 'pod') {
      paymentLabel = 'Pay on Delivery (Doorstep Cash / UPI)';
    } else if (_selectedPaymentMethod == 'card') {
      paymentLabel = 'Credit/Debit Card & Net Banking';
    }

    final orderData = {
      'type': 'buy',
      'customerName': recipientName,
      'customerPhone': recipientPhone,
      'customerAddress': deliveryAddress,
      'city': activeAddress?.city ?? 'Delhi NCR',
      'pincode': activeAddress?.pincode ?? '110001',
      'amount': _finalPayableAmount,
      'deviceName': fullDeviceName,
      'pickupDate': _selectedDate,
      'pickupSlot': _selectedSlot,
      'paymentMethod': paymentLabel,
      'status': 'Order Placed',
      'condition': widget.selectedCondition,
      'storage': widget.selectedStorage,
      'color': widget.selectedColor,
      if (_appliedCoupon != null) 'couponCode': _appliedCoupon,
      if (_couponDiscount > 0) 'couponDiscount': _couponDiscount,
    };

    try {
      final pinToCheck = activeAddress?.pincode ?? '110001';
      final pinRes = await ApiService.checkPincodeServiceability(pinToCheck);
      if (pinRes['serviceable'] == false) {
        setState(() => _isPlacingOrder = false);
        final unserviceableData = {
          ...orderData,
          'status': 'unserviceable',
          'notes': 'Unserviceable Area Buy Request. PIN: $pinToCheck',
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
                    Navigator.pop(context);
                  },
                  child: const Text('OK', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          );
        }
        return;
      }

      final createdOrderMap = await ApiService.createOrder(orderData);
      if (createdOrderMap != null && mounted) {
        final orderObj = UserOrder.fromJson(createdOrderMap);
        setState(() => _isPlacingOrder = false);
        _showOrderSuccessSheet(orderObj);
      } else {
        setState(() => _isPlacingOrder = false);
        _showError('Could not connect to server. Please try again.');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isPlacingOrder = false);
        _showError('Order placement failed: $e');
      }
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Expanded(child: Text(msg)),
          ],
        ),
        backgroundColor: const Color(0xFFDC2626),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _showOrderSuccessSheet(UserOrder order) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      isDismissible: false,
      enableDrag: false,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Success Icon Animation container
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFA7F3D0), width: 2),
                ),
                child: const Center(
                  child: Icon(Icons.check_circle_rounded, color: Color(0xFF059669), size: 48),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Order Confirmed!',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Order #${order.orderNumber}',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 18),

              // Handover OTP Container
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.pin_rounded, color: Color(0xFF059669), size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'DELIVERY VERIFICATION OTP',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF64748B),
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            order.otp,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0F172A),
                              letterSpacing: 4,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Show to Agent',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Delivery details summary
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFA7F3D0)),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.local_shipping_outlined, size: 18, color: Color(0xFF059669)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Expected Delivery: $_selectedDate ($_selectedSlot)',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF065F46)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.verified_user_outlined, size: 18, color: Color(0xFF059669)),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Text(
                            'Open Box Delivery: Inspect before handover',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF065F46)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Action button to track order
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  onPressed: () {
                    Navigator.pop(ctx);
                    widget.onOrderCreated(order);
                  },
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Track Order in My Orders',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                      ),
                      SizedBox(width: 8),
                      Icon(Icons.arrow_forward_rounded, size: 18),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final modelName = widget.product['model']?.toString() ?? 'Device';
    final brand = widget.product['brand']?.toString() ?? '';
    final image = widget.product['image']?.toString() ?? '';
    final originalPrice = (widget.product['originalPrice'] as num?)?.toInt() ?? (widget.selectedPrice * 1.5).toInt();
    final savings = originalPrice - _finalPayableAmount;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Color(0xFF0F172A)),
          onPressed: widget.onBack,
        ),
        titleSpacing: 0,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Order Checkout',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w900,
                color: Color(0xFF0F172A),
                letterSpacing: -0.3,
              ),
            ),
            Text(
              'Step 2 of 2 · Certified Refurbished',
              style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 14, top: 10, bottom: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFA7F3D0)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.lock_rounded, size: 12, color: Color(0xFF059669)),
                SizedBox(width: 4),
                Text(
                  '100% SECURE',
                  style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── 1. SELECTED PRODUCT CARD ──
            _buildProductCard(brand, modelName, image, originalPrice),

            const SizedBox(height: 16),

            // ── 2. DELIVERY ADDRESS CARD ──
            _buildAddressSection(),

            const SizedBox(height: 16),

            // ── 3. DELIVERY SLOT SCHEDULE ──
            _buildDeliveryScheduleSection(),

            const SizedBox(height: 16),

            // ── 4. COUPON CODE SECTION ──
            _buildCouponSection(),

            const SizedBox(height: 16),

            // ── 5. PAYMENT METHOD SELECTION ──
            _buildPaymentMethodSection(),

            const SizedBox(height: 16),

            // ── 6. BILL DETAILS / PRICE BREAKDOWN ──
            _buildBillDetails(originalPrice, savings),

            const SizedBox(height: 16),

            // ── 7. TRUST BADGES ──
            _buildTrustGuarantees(),
          ],
        ),
      ),
      bottomSheet: _buildStickyBottomBar(),
    );
  }

  // ── 1. PRODUCT SUMMARY CARD ──
  Widget _buildProductCard(String brand, String modelName, String image, int originalPrice) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Image Container
              Container(
                width: 76,
                height: 76,
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFF1F5F9)),
                ),
                child: image.isNotEmpty
                    ? CamsikSmartImage(image: image, fit: BoxFit.contain)
                    : const Icon(Icons.devices_rounded, size: 36, color: Color(0xFF64748B)),
              ),
              const SizedBox(width: 14),

              // Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            widget.selectedCondition.toUpperCase(),
                            style: const TextStyle(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.w900),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFFA7F3D0)),
                          ),
                          child: const Text(
                            '✓ 45-Point Certified',
                            style: TextStyle(color: Color(0xFF047857), fontSize: 9.5, fontWeight: FontWeight.w800),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '$brand $modelName',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F172A),
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${widget.selectedStorage} · ${widget.selectedColor}',
                      style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Text(
                          formatCurrency(widget.selectedPrice),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF059669),
                          ),
                        ),
                        const SizedBox(width: 8),
                        if (originalPrice > widget.selectedPrice)
                          Text(
                            formatCurrency(originalPrice),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF94A3B8),
                              decoration: TextDecoration.lineThrough,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 10),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _InclusionBadge(icon: Icons.security_rounded, label: '12M Warranty'),
              _InclusionBadge(icon: Icons.sync_rounded, label: '7-Day Return'),
              _InclusionBadge(icon: Icons.local_shipping_rounded, label: 'Free Delivery'),
            ],
          ),
        ],
      ),
    );
  }

  // ── SECTION HEADER (MATCHING SELL MODULE) ──
  Widget _buildSectionHeader({
    required IconData icon,
    required String title,
    String? badge,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            color: const Color(0xFF059669).withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(7),
          ),
          child: Icon(icon, size: 14, color: const Color(0xFF059669)),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: Color(0xFF0F172A),
            letterSpacing: -0.2,
          ),
        ),
        if (badge != null) ...[
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(5),
              border: Border.all(color: const Color(0xFF059669).withValues(alpha: 0.2)),
            ),
            child: Text(
              badge,
              style: const TextStyle(
                fontSize: 9.5,
                fontWeight: FontWeight.w700,
                color: Color(0xFF059669),
              ),
            ),
          ),
        ],
      ],
    );
  }

  // ── 2. DELIVERY ADDRESS (SAVED ADDRESS CARD VS + ADD ADDRESS) ──
  Widget _buildAddressSection() {
    final hasAddress = _selectedAddress != null || _savedAddresses.isNotEmpty;
    final activeAddressObj = _selectedAddress ?? (_savedAddresses.isNotEmpty ? _savedAddresses.first : null);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildSectionHeader(
              icon: Icons.location_on_rounded,
              title: 'Doorstep Delivery Address',
            ),
            if (hasAddress)
              GestureDetector(
                onTap: _navigateToSavedAddresses,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF059669).withValues(alpha: 0.3)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.swap_horiz_rounded, size: 14, color: Color(0xFF059669)),
                      SizedBox(width: 4),
                      Text(
                        'Switch',
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF059669),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 10),
        _buildAddressCard(hasAddress, activeAddressObj),
      ],
    );
  }

  Widget _buildAddressCard(bool hasAddress, UserAddress? activeObj) {
    if (_isLoadingAddresses) {
      return Container(
        height: 80,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: const SizedBox(
          width: 22,
          height: 22,
          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF059669)),
        ),
      );
    }

    // CASE 1: No address saved -> Show prominent "+ Add Delivery Address"
    if (!hasAddress && _savedAddresses.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFCBD5E1)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF059669).withValues(alpha: 0.2)),
              ),
              child: const Icon(
                Icons.add_location_alt_rounded,
                size: 26,
                color: Color(0xFF059669),
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              'No Delivery Address Added',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Add your doorstep address for verified delivery and handover.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11.5,
                color: Color(0xFF64748B),
                height: 1.35,
              ),
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton.icon(
                onPressed: _navigateToAddAddress,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.add_rounded, size: 20),
                label: const Text(
                  '+ Add Delivery Address',
                  style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ],
        ),
      );
    }

    // CASE 2: Address is available -> Show interactive Verified Saved Address Card
    final tag = activeObj?.tag ?? 'Home';
    final contactName = (activeObj?.contactName.isNotEmpty == true)
        ? activeObj!.contactName
        : (widget.userProfile.name.isNotEmpty ? widget.userProfile.name : 'Customer');
    final contactPhone = (activeObj?.contactPhone.isNotEmpty == true)
        ? activeObj!.contactPhone
        : (widget.userProfile.phone.isNotEmpty ? widget.userProfile.phone : '');
    final addressText = activeObj?.formattedAddress ?? widget.userProfile.address;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF059669), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF059669).withValues(alpha: 0.08),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: tag == 'Home'
                        ? const Color(0xFFDCFCE7)
                        : tag == 'Office'
                            ? const Color(0xFFEDE9FE)
                            : const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        tag == 'Home'
                            ? Icons.home_rounded
                            : tag == 'Office'
                                ? Icons.business_rounded
                                : Icons.location_on_rounded,
                        size: 12,
                        color: tag == 'Home'
                            ? const Color(0xFF059669)
                            : tag == 'Office'
                                ? const Color(0xFF7C3AED)
                                : const Color(0xFFD97706),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        tag.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.4,
                          color: tag == 'Home'
                              ? const Color(0xFF059669)
                              : tag == 'Office'
                                  ? const Color(0xFF7C3AED)
                                  : const Color(0xFFD97706),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(5),
                  ),
                  child: const Text(
                    'VERIFIED DELIVERY',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ),
                const Spacer(),
                if (activeObj != null)
                  InkWell(
                    onTap: () => _navigateToEditAddress(activeObj),
                    borderRadius: BorderRadius.circular(6),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      child: Row(
                        children: [
                          Icon(Icons.edit_outlined, size: 13, color: Color(0xFF64748B)),
                          SizedBox(width: 3),
                          Text(
                            'Edit',
                            style: TextStyle(
                              fontSize: 11,
                              color: Color(0xFF64748B),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            if (contactName.isNotEmpty || contactPhone.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    Text(
                      contactName,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    if (contactPhone.isNotEmpty) ...[
                      const SizedBox(width: 6),
                      Text(
                        '• $contactPhone',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            Text(
              addressText,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Color(0xFF334155),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                InkWell(
                  onTap: _navigateToSavedAddresses,
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.swap_horiz_rounded, size: 14, color: Color(0xFF059669)),
                      SizedBox(width: 4),
                      Text(
                        'Change Address',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF059669),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                InkWell(
                  onTap: _navigateToAddAddress,
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.add_rounded, size: 14, color: Color(0xFF64748B)),
                      SizedBox(width: 4),
                      Text(
                        '+ Add New',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ── 3. DELIVERY SCHEDULE SECTION ──
  Widget _buildDeliveryScheduleSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.schedule_rounded, size: 20, color: Color(0xFF059669)),
              SizedBox(width: 8),
              Text(
                'Delivery Schedule',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Select your preferred doorstep delivery window (Free Express Shipping):',
            style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
          ),
          const SizedBox(height: 12),
          // Date chips
          Row(
            children: _dateOptions.map((d) {
              final isSel = _selectedDate == d;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: InkWell(
                    onTap: () => setState(() => _selectedDate = d),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: isSel ? const Color(0xFFECFDF5) : const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSel ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                          width: isSel ? 1.5 : 1,
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(
                            d == 'Tomorrow' ? '⚡ Tomorrow' : d,
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w800,
                              color: isSel ? const Color(0xFF065F46) : const Color(0xFF334155),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Guaranteed',
                            style: TextStyle(
                              fontSize: 9.5,
                              color: isSel ? const Color(0xFF059669) : const Color(0xFF94A3B8),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 10),

          // Slot chips
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _slotOptions.map((s) {
              final isSel = _selectedSlot == s;
              return ChoiceChip(
                label: Text(s),
                selected: isSel,
                onSelected: (v) => setState(() => _selectedSlot = s),
                selectedColor: const Color(0xFF059669),
                backgroundColor: const Color(0xFFF8FAFC),
                labelStyle: TextStyle(
                  color: isSel ? Colors.white : const Color(0xFF334155),
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(
                    color: isSel ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // ── 4. COUPON CODE SECTION ──
  Widget _buildCouponSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.local_offer_outlined, size: 20, color: Color(0xFF059669)),
              SizedBox(width: 8),
              Text(
                'Apply Promo Code / Coupon',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
              ),
            ],
          ),
          const SizedBox(height: 10),

          if (_appliedCoupon != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle_rounded, color: Color(0xFF059669), size: 18),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '$_appliedCoupon Applied!',
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF065F46)),
                        ),
                        Text(
                          'You saved ${formatCurrency(_couponDiscount)} on this order.',
                          style: const TextStyle(fontSize: 11, color: Color(0xFF047857), fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: _removeCoupon,
                    child: const Text('Remove', style: TextStyle(color: Color(0xFFDC2626), fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            )
          else ...[
            Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: TextField(
                      controller: _couponController,
                      textCapitalization: TextCapitalization.characters,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, letterSpacing: 1),
                      decoration: const InputDecoration(
                        hintText: 'Enter code (e.g. CAMSIK500)',
                        hintStyle: TextStyle(fontSize: 12, color: Color(0xFF94A3B8), letterSpacing: 0),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    elevation: 0,
                  ),
                  onPressed: () => _applyCouponCode(_couponController.text),
                  child: const Text('Apply', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                ),
              ],
            ),
            if (_couponError != null) ...[
              const SizedBox(height: 6),
              Text(
                _couponError!,
                style: const TextStyle(color: Color(0xFFDC2626), fontSize: 11, fontWeight: FontWeight.w600),
              ),
            ],
            const SizedBox(height: 10),

            // Quick coupon suggestions chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildQuickCouponChip('CAMSIK500', 'Flat ₹500 OFF'),
                  const SizedBox(width: 8),
                  _buildQuickCouponChip('UPGRADE1000', '₹1,000 OFF on ₹30k+'),
                  const SizedBox(width: 8),
                  _buildQuickCouponChip('FESTIVE1500', '₹1,500 OFF on ₹45k+'),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildQuickCouponChip(String code, String benefit) {
    return InkWell(
      onTap: () {
        _couponController.text = code;
        _applyCouponCode(code);
      },
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            const Icon(Icons.stars_rounded, color: Color(0xFF059669), size: 14),
            const SizedBox(width: 5),
            Text(
              code,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
            ),
            const SizedBox(width: 4),
            Text(
              '($benefit)',
              style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }

  // ── 5. PAYMENT METHOD SELECTION ──
  Widget _buildPaymentMethodSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.payment_rounded, size: 20, color: Color(0xFF059669)),
              SizedBox(width: 8),
              Text(
                'Payment Mode',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Option: Pay on Delivery (COD Only)
          _buildPaymentOption(
            id: 'pod',
            title: 'Cash on Delivery (Pay on Doorstep)',
            subtitle: 'Inspect device first at your doorstep, then pay Cash or scan QR',
            badge: 'Zero Advance Required • COD',
            badgeColor: const Color(0xFF059669),
            icon: Icons.handshake_rounded,
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption({
    required String id,
    required String title,
    required String subtitle,
    required String badge,
    required Color badgeColor,
    required IconData icon,
  }) {
    final isSelected = _selectedPaymentMethod == id;
    return InkWell(
      onTap: () => setState(() => _selectedPaymentMethod = id),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF0FDF4) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
            width: isSelected ? 1.8 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: isSelected ? Colors.white : const Color(0xFF475569), size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w800,
                          color: isSelected ? const Color(0xFF065F46) : const Color(0xFF0F172A),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: badgeColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: badgeColor.withValues(alpha: 0.3), width: 0.8),
                    ),
                    child: Text(
                      badge,
                      style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: badgeColor),
                    ),
                  ),
                ],
              ),
            ),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? const Color(0xFF059669) : Colors.grey.shade400,
                  width: isSelected ? 6 : 2,
                ),
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── 6. BILL DETAILS / PRICE BREAKDOWN ──
  Widget _buildBillDetails(int originalPrice, int totalSavings) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Price Breakdown',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
          ),
          const SizedBox(height: 12),
          _buildBillRow('Device Market Price (MRP)', formatCurrency(originalPrice), isStrikethrough: true),
          _buildBillRow('Certified Refurbished Price', formatCurrency(widget.selectedPrice)),
          if (_couponDiscount > 0)
            _buildBillRow('Promo Code ($_appliedCoupon)', '-${formatCurrency(_couponDiscount)}', isGreen: true),
          if (_prepaidDiscount > 0)
            _buildBillRow('Instant Prepaid Discount', '-${formatCurrency(_prepaidDiscount)}', isGreen: true),
          _buildBillRow('45-Point Lab Inspection & Packaging', 'FREE', isGreen: true),
          _buildBillRow('Express Doorstep Delivery', 'FREE', isGreen: true),
          const Divider(height: 20, color: Color(0xFFE2E8F0)),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Total Payable',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                  ),
                  Text(
                    'Inclusive of all taxes & warranty',
                    style: TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                  ),
                ],
              ),
              Text(
                formatCurrency(_finalPayableAmount),
                style: const TextStyle(
                  fontSize: 19,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF059669),
                ),
              ),
            ],
          ),
          if (totalSavings > 0) ...[
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '🎉 You are saving ${formatCurrency(totalSavings)} on this purchase!',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF047857)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBillRow(String label, String value, {bool isGreen = false, bool isStrikethrough = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w700,
              decoration: isStrikethrough ? TextDecoration.lineThrough : null,
              color: isGreen
                  ? const Color(0xFF059669)
                  : isStrikethrough
                      ? const Color(0xFF94A3B8)
                      : const Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }

  // ── 7. TRUST GUARANTEES ──
  Widget _buildTrustGuarantees() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.shield_rounded, color: Color(0xFF34D399), size: 24),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Camsik Buyer Protection Shield',
                  style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: Colors.white),
                ),
                SizedBox(height: 2),
                Text(
                  '12 Months Warranty · 7 Days Replacement · Open-Box Delivery. Handover only after you are 100% satisfied.',
                  style: TextStyle(fontSize: 10, color: Color(0xFFCBD5E1), height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── 8. STICKY BOTTOM BAR ──
  Widget _buildStickyBottomBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
        border: const Border(top: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Price column
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'FINAL PAYABLE',
                  style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: Color(0xFF64748B), letterSpacing: 0.5),
                ),
                const SizedBox(height: 1),
                Text(
                  formatCurrency(_finalPayableAmount),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.4,
                  ),
                ),
              ],
            ),
            const SizedBox(width: 16),

            // Confirm Button
            Expanded(
              child: SizedBox(
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  onPressed: _isPlacingOrder ? null : _handlePlaceOrder,
                  child: _isPlacingOrder
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Place Order',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: -0.2),
                            ),
                            SizedBox(width: 8),
                            Icon(Icons.arrow_forward_rounded, size: 20),
                          ],
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InclusionBadge extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InclusionBadge({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: const Color(0xFF059669)),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
        ),
      ],
    );
  }
}
