import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/services/session_service.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../models/user_address.dart';
import '../../../models/user_profile.dart';
import '../../profile/screens/add_edit_address_screen.dart';
import '../../profile/screens/saved_addresses_screen.dart';

class ExchangeCheckoutStep extends StatefulWidget {
  final int adjustedPrice;
  final String selectedCondition;
  final int calculatedOldValue;
  final int exchangeBonus;
  final String? appliedCouponCode;
  final int couponDiscount;
  final TextEditingController couponController;
  final ValueChanged<String> onApplyCoupon;
  final String selectedDate;
  final String selectedSlot;
  final ValueChanged<String> onDateSelected;
  final ValueChanged<String> onSlotSelected;
  final TextEditingController nameController;
  final TextEditingController phoneController;
  final TextEditingController addressController;
  final TextEditingController cityController;
  final TextEditingController pincodeController;
  final bool isPlacingOrder;
  final VoidCallback onConfirmExchange;
  final UserProfile userProfile;
  final Function(UserProfile)? onProfileUpdate;

  const ExchangeCheckoutStep({
    super.key,
    required this.adjustedPrice,
    required this.selectedCondition,
    required this.calculatedOldValue,
    required this.exchangeBonus,
    required this.appliedCouponCode,
    required this.couponDiscount,
    required this.couponController,
    required this.onApplyCoupon,
    required this.selectedDate,
    required this.selectedSlot,
    required this.onDateSelected,
    required this.onSlotSelected,
    required this.nameController,
    required this.phoneController,
    required this.addressController,
    required this.cityController,
    required this.pincodeController,
    required this.isPlacingOrder,
    required this.onConfirmExchange,
    required this.userProfile,
    this.onProfileUpdate,
  });

  @override
  State<ExchangeCheckoutStep> createState() => _ExchangeCheckoutStepState();
}

class _ExchangeCheckoutStepState extends State<ExchangeCheckoutStep> {
  List<UserAddress> _savedAddresses = [];
  UserAddress? _selectedAddress;
  bool _isLoadingAddresses = true;

  final List<String> _dateOptions = ['Tomorrow', 'Day After', 'In 3 Days'];
  final List<String> _slotOptions = [
    '10:00 AM – 1:00 PM',
    '2:00 PM – 5:00 PM',
    '5:00 PM – 8:00 PM',
  ];

  @override
  void initState() {
    super.initState();
    _loadAddresses();
  }

  void _loadAddresses() {
    final rawList = SessionService.getSavedAddresses(fallbackAddress: widget.userProfile.address);
    _savedAddresses = rawList.map((m) => UserAddress.fromJson(m)).toList();
    _isLoadingAddresses = false;

    if (_savedAddresses.isNotEmpty) {
      _selectedAddress = _savedAddresses.firstWhere(
        (a) => a.isDefault,
        orElse: () => _savedAddresses.first,
      );
      _syncControllers(_selectedAddress!);
    } else {
      // Pre-fill from controllers or userProfile
      if (widget.nameController.text.trim().isEmpty) {
        widget.nameController.text = widget.userProfile.name;
      }
      if (widget.phoneController.text.trim().isEmpty) {
        widget.phoneController.text = widget.userProfile.phone;
      }
      if (widget.addressController.text.trim().isEmpty && widget.userProfile.address.isNotEmpty) {
        widget.addressController.text = widget.userProfile.address;
      }
    }
  }

  void _syncControllers(UserAddress addr) {
    widget.nameController.text =
        addr.contactName.isNotEmpty ? addr.contactName : widget.userProfile.name;
    widget.phoneController.text =
        addr.contactPhone.isNotEmpty ? addr.contactPhone : widget.userProfile.phone;
    widget.addressController.text =
        '${addr.flat.isNotEmpty ? '${addr.flat}, ' : ''}${addr.street}';
    widget.cityController.text = addr.city;
    widget.pincodeController.text = addr.pincode;
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

      _syncControllers(newAddress);
      await SessionService.saveAddressesList(updatedList.map((a) => a.toJson()).toList());
      widget.onProfileUpdate?.call(widget.userProfile.copyWith(address: newAddress.formattedAddress));

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

  Future<void> _navigateToSavedAddresses() async {
    final selected = await Navigator.push<UserAddress>(
      context,
      MaterialPageRoute(
        builder: (_) => SavedAddressesScreen(
          profile: widget.userProfile,
          onAddressSelected: (formatted) {
            // Callback handles fallback
          },
        ),
      ),
    );

    // Reload latest addresses list after screen closes
    final rawList = SessionService.getSavedAddresses(fallbackAddress: widget.userProfile.address);
    final updated = rawList.map((m) => UserAddress.fromJson(m)).toList();

    setState(() {
      _savedAddresses = updated;
      if (selected != null) {
        _selectedAddress = selected;
        _syncControllers(selected);
      } else if (updated.isNotEmpty) {
        _selectedAddress = updated.firstWhere((a) => a.isDefault, orElse: () => updated.first);
        _syncControllers(_selectedAddress!);
      }
    });
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

      _syncControllers(edited);
      await SessionService.saveAddressesList(updatedList.map((a) => a.toJson()).toList());
      widget.onProfileUpdate?.call(widget.userProfile.copyWith(address: edited.formattedAddress));
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalTradeIn = widget.calculatedOldValue + widget.exchangeBonus;
    final netDiff = widget.adjustedPrice - totalTradeIn - widget.couponDiscount;
    final netPayable = netDiff > 0 ? netDiff : 0;
    final cashback = netDiff < 0 ? netDiff.abs() : 0;

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── 1. Financial Breakdown Card ──
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.03),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      _buildSummaryLine(
                        'Upgraded Device (${widget.selectedCondition})',
                        formatCurrency(widget.adjustedPrice),
                      ),
                      const SizedBox(height: 10),
                      _buildSummaryLine(
                        'Old Device Trade-In Valuation',
                        formatCurrency(widget.calculatedOldValue),
                      ),
                      const SizedBox(height: 10),
                      _buildSummaryLine(
                        'Guaranteed Camsik Exchange Bonus',
                        '+$kRupee${formatCurrency(widget.exchangeBonus).replaceAll('₹', '')}',
                        isBonus: true,
                      ),
                      if (widget.couponDiscount > 0) ...[
                        const SizedBox(height: 10),
                        _buildSummaryLine(
                          'Exchange Coupon (${widget.appliedCouponCode})',
                          '-${formatCurrency(widget.couponDiscount)}',
                          isBonus: true,
                        ),
                      ],
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Divider(height: 1, color: Color(0xFFF1F5F9)),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                cashback > 0
                                    ? 'Cashback Paid to You on Handover'
                                    : 'Net Doorstep Payable Balance',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                  color: Color(0xFF0F172A),
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                cashback > 0
                                    ? 'Instant UPI transfer at time of doorstep exchange'
                                    : 'Pay via Cash or UPI on successful device swap',
                                style: const TextStyle(
                                  fontSize: 10.5,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                          Text(
                            cashback > 0
                                ? '+${formatCurrency(cashback)}'
                                : formatCurrency(netPayable),
                            style: TextStyle(
                              fontSize: 19,
                              fontWeight: FontWeight.w900,
                              color: cashback > 0
                                  ? const Color(0xFF059669)
                                  : const Color(0xFF4F46E5),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),

                // ── 2. Unified Doorstep Delivery Address (Same to Same Buy & Sell) ──
                _buildUnifiedAddressSection(),
                const SizedBox(height: 18),

                // ── 3. Schedule Doorstep Handover Slot ──
                const Text(
                  'Doorstep Handover Schedule',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 14,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.2,
                  ),
                ),
                const SizedBox(height: 10),

                // Date Pills
                Row(
                  children: _dateOptions.map((d) {
                    final isSel = widget.selectedDate == d;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => widget.onDateSelected(d),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          margin: const EdgeInsets.only(right: 6),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: isSel ? const Color(0xFF4F46E5) : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSel ? const Color(0xFF4F46E5) : const Color(0xFFCBD5E1),
                              width: isSel ? 1.5 : 1,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              d,
                              style: TextStyle(
                                color: isSel ? Colors.white : const Color(0xFF334155),
                                fontWeight: FontWeight.w800,
                                fontSize: 11.5,
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 10),

                // Slot Pills
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _slotOptions.map((s) {
                    final isSel = widget.selectedSlot == s;
                    return GestureDetector(
                      onTap: () => widget.onSlotSelected(s),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                        decoration: BoxDecoration(
                          color: isSel ? const Color(0xFFEEF2FF) : Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSel ? const Color(0xFF4F46E5) : const Color(0xFFE2E8F0),
                            width: isSel ? 1.5 : 1,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.schedule_rounded,
                              size: 13,
                              color: isSel ? const Color(0xFF4F46E5) : const Color(0xFF64748B),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              s,
                              style: TextStyle(
                                color: isSel ? const Color(0xFF4F46E5) : const Color(0xFF0F172A),
                                fontWeight: isSel ? FontWeight.w800 : FontWeight.w600,
                                fontSize: 11.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 18),

                // ── 4. Upgrade Coupon Code ──
                Container(
                  padding: const EdgeInsets.all(14),
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
                          Icon(Icons.discount_outlined, size: 16, color: Color(0xFF059669)),
                          SizedBox(width: 6),
                          Text(
                            'Have an Exchange Coupon?',
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 12.5,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: Container(
                              height: 42,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: TextField(
                                controller: widget.couponController,
                                textCapitalization: TextCapitalization.characters,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                  letterSpacing: 0.8,
                                ),
                                decoration: const InputDecoration(
                                  hintText: 'e.g. CAMSIK500 or UPGRADE1000',
                                  hintStyle: TextStyle(
                                    fontSize: 11.5,
                                    color: Color(0xFF94A3B8),
                                    fontWeight: FontWeight.w500,
                                    letterSpacing: 0,
                                  ),
                                  border: InputBorder.none,
                                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 11),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          SizedBox(
                            height: 42,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF059669),
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                              ),
                              onPressed: () {
                                final text = widget.couponController.text.trim();
                                if (text.isNotEmpty) {
                                  widget.onApplyCoupon(text);
                                }
                              },
                              child: const Text(
                                'Apply',
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 12.5,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // ── 5. Assurance Trust Banner ──
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0FDF4),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFBBF7D0)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.verified_user_rounded, color: Color(0xFF059669), size: 18),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Simultaneous Doorstep Swap: Agent inspects old device & hands over new device together in 1 visit.',
                          style: TextStyle(
                            fontSize: 11,
                            color: Color(0xFF166534),
                            fontWeight: FontWeight.w600,
                            height: 1.35,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),

        // ── Sticky Confirmation Bottom Bar ──
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 16,
                offset: const Offset(0, -4),
              ),
            ],
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: SafeArea(
            top: false,
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  foregroundColor: Colors.white,
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                onPressed: widget.isPlacingOrder ? null : widget.onConfirmExchange,
                child: widget.isPlacingOrder
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: Colors.white,
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.swap_horiz_rounded, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            cashback > 0
                                ? 'Confirm Exchange (Get +${formatCurrency(cashback)})'
                                : 'Confirm Exchange (Pay ${formatCurrency(netPayable)})',
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 14.5,
                              letterSpacing: -0.2,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ── Unified Address Section (Identical to Buy & Sell Modules) ──
  Widget _buildUnifiedAddressSection() {
    final hasAddress = _selectedAddress != null || _savedAddresses.isNotEmpty;
    final activeAddressObj =
        _selectedAddress ?? (_savedAddresses.isNotEmpty ? _savedAddresses.first : null);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Row(
              children: [
                Icon(Icons.location_on_rounded, size: 18, color: Color(0xFF4F46E5)),
                SizedBox(width: 6),
                Text(
                  'Doorstep Handover & Delivery Address',
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 14,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.2,
                  ),
                ),
              ],
            ),
            if (hasAddress)
              GestureDetector(
                onTap: _navigateToSavedAddresses,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEEF2FF),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF4F46E5).withValues(alpha: 0.25)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.swap_horiz_rounded, size: 14, color: Color(0xFF4F46E5)),
                      SizedBox(width: 4),
                      Text(
                        'Switch',
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF4F46E5),
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
          child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF4F46E5)),
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
                color: const Color(0xFFEEF2FF),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF4F46E5).withValues(alpha: 0.2)),
              ),
              child: const Icon(
                Icons.add_location_alt_rounded,
                size: 26,
                color: Color(0xFF4F46E5),
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              'No Handover Address Added',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Add your doorstep address for verified inspection & simultaneous device handover.',
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
                  backgroundColor: const Color(0xFF4F46E5),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.add_rounded, size: 20),
                label: const Text(
                  '+ Add Handover Address',
                  style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ],
        ),
      );
    }

    // CASE 2: Address is available -> Interactive Verified Saved Address Card
    final tag = activeObj?.tag ?? 'Home';
    final contactName = (activeObj?.contactName.isNotEmpty == true)
        ? activeObj!.contactName
        : (widget.userProfile.name.isNotEmpty ? widget.userProfile.name : 'Customer');
    final contactPhone = (activeObj?.contactPhone.isNotEmpty == true)
        ? activeObj!.contactPhone
        : (widget.userProfile.phone.isNotEmpty ? widget.userProfile.phone : '');
    final addressText = activeObj?.formattedAddress ??
        (widget.userProfile.address.isNotEmpty
            ? widget.userProfile.address
            : '${widget.addressController.text.trim()}, ${widget.cityController.text.trim()}');

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF4F46E5), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF4F46E5).withValues(alpha: 0.08),
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
                        tag,
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w800,
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
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEEF2FF),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.check_circle_rounded, size: 12, color: Color(0xFF4F46E5)),
                      SizedBox(width: 4),
                      Text(
                        'Verified Handover Address',
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF4F46E5),
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                if (activeObj != null)
                  GestureDetector(
                    onTap: () => _navigateToEditAddress(activeObj),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.edit_outlined,
                        size: 14,
                        color: Color(0xFF64748B),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),

            // Contact Person Name & Phone
            Row(
              children: [
                const Icon(Icons.person_rounded, size: 14, color: Color(0xFF64748B)),
                const SizedBox(width: 6),
                Text(
                  contactName,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF0F172A),
                  ),
                ),
                if (contactPhone.isNotEmpty) ...[
                  const SizedBox(width: 8),
                  Text(
                    '•  $contactPhone',
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 6),

            // Full Address text
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.only(top: 2),
                  child: Icon(Icons.pin_drop_rounded, size: 14, color: Color(0xFF64748B)),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    addressText,
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF334155),
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Handover Delivery Note
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.lock_clock_rounded, size: 13, color: Color(0xFF059669)),
                  SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Doorstep agent arrives with verified digital scale & test kit. Device swapped with OTP.',
                      style: TextStyle(
                        fontSize: 10.5,
                        color: Color(0xFF475569),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryLine(String title, String value, {bool isBonus = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 12.5,
            color: isBonus ? const Color(0xFF059669) : const Color(0xFF64748B),
            fontWeight: isBonus ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: isBonus ? const Color(0xFF059669) : const Color(0xFF0F172A),
          ),
        ),
      ],
    );
  }
}
