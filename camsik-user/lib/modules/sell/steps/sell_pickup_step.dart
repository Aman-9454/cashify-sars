import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/session_service.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../models/user_address.dart';
import '../../../models/user_profile.dart';
import '../../../widgets/camsik_smart_image.dart';
import '../../profile/screens/add_edit_address_screen.dart';
import '../../profile/screens/saved_addresses_screen.dart';

class SellPickupStep extends StatefulWidget {
  final Map<String, dynamic>? selectedModel;
  final String selectedStorage;
  final String selectedColor;
  final int calculatedPrice;
  final UserProfile userProfile;
  final String selectedDate;
  final String selectedSlot;
  final TextEditingController addressController;
  final TextEditingController upiController;
  final Function(String date) onDateChanged;
  final Function(String slot) onSlotChanged;
  final VoidCallback onConfirmOrder;
  final Function(UserProfile)? onProfileUpdate;

  const SellPickupStep({
    super.key,
    this.selectedModel,
    this.selectedStorage = 'Body Only',
    this.selectedColor = 'Black',
    this.calculatedPrice = 0,
    required this.userProfile,
    required this.selectedDate,
    required this.selectedSlot,
    required this.addressController,
    required this.upiController,
    required this.onDateChanged,
    required this.onSlotChanged,
    required this.onConfirmOrder,
    this.onProfileUpdate,
  });

  @override
  State<SellPickupStep> createState() => _SellPickupStepState();
}

class _SellPickupStepState extends State<SellPickupStep> {
  List<UserAddress> _savedAddresses = [];
  bool _isLoadingAddresses = true;

  final List<String> _slots = const [
    '9:00 AM – 11:00 AM',
    '11:00 AM – 1:00 PM',
    '1:00 PM – 3:00 PM',
    '3:00 PM – 5:00 PM',
    '5:00 PM – 7:00 PM',
  ];

  final List<String> _upiHandles = const [
    '@okhdfcbank',
    '@okaxis',
    '@oksbi',
    '@paytm',
    '@ybl',
  ];

  @override
  void initState() {
    super.initState();
    _initData();
  }

  void _initData() {
    // 1. Load saved addresses from session or profile fallback
    final rawList = SessionService.getSavedAddresses(fallbackAddress: widget.userProfile.address);
    _savedAddresses = rawList.map((m) => UserAddress.fromJson(m)).toList();
    _isLoadingAddresses = false;

    // 2. Pre-fill address controller if empty and saved addresses exist
    if (widget.addressController.text.trim().isEmpty && _savedAddresses.isNotEmpty) {
      final defaultAddr = _savedAddresses.firstWhere(
        (a) => a.isDefault,
        orElse: () => _savedAddresses.first,
      );
      widget.addressController.text = defaultAddr.formattedAddress;
    }

    // 3. Pre-fill UPI controller if empty and profile has UPI ID
    if (widget.upiController.text.trim().isEmpty && widget.userProfile.upiId.isNotEmpty) {
      widget.upiController.text = widget.userProfile.upiId;
    }
  }

  String _formatDateSubtitle(int daysFromNow) {
    final dt = DateTime.now().add(Duration(days: daysFromNow));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final monthName = months[dt.month - 1];
    final dayName = days[dt.weekday - 1];
    return '$dayName, ${dt.day} $monthName';
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
      });

      await SessionService.saveAddressesList(updatedList.map((a) => a.toJson()).toList());
      widget.addressController.text = newAddress.formattedAddress;

      // Sync with profile
      try {
        await ApiService.updateUserProfile(
          phone: widget.userProfile.phone,
          address: newAddress.formattedAddress,
        );
        widget.onProfileUpdate?.call(widget.userProfile.copyWith(address: newAddress.formattedAddress));
      } catch (_) {}

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Address "${newAddress.tag}" added & selected!'),
            backgroundColor: const Color(0xFF059669),
            behavior: SnackBarBehavior.floating,
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
      });

      await SessionService.saveAddressesList(updatedList.map((a) => a.toJson()).toList());
      widget.addressController.text = edited.formattedAddress;

      try {
        await ApiService.updateUserProfile(
          phone: widget.userProfile.phone,
          address: edited.formattedAddress,
        );
        widget.onProfileUpdate?.call(widget.userProfile.copyWith(address: edited.formattedAddress));
      } catch (_) {}

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Pickup address updated successfully'),
            backgroundColor: Color(0xFF059669),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _navigateToSavedAddresses() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SavedAddressesScreen(
          profile: widget.userProfile,
          onAddressSelected: (selectedFormattedAddress) {
            widget.addressController.text = selectedFormattedAddress;
            widget.onProfileUpdate?.call(widget.userProfile.copyWith(address: selectedFormattedAddress));
            setState(() {});
          },
        ),
      ),
    );

    // Refresh saved addresses when returning
    final rawList = SessionService.getSavedAddresses(fallbackAddress: widget.userProfile.address);
    if (mounted) {
      setState(() {
        _savedAddresses = rawList.map((m) => UserAddress.fromJson(m)).toList();
        if (_savedAddresses.isNotEmpty && widget.addressController.text.trim().isEmpty) {
          final def = _savedAddresses.firstWhere((a) => a.isDefault, orElse: () => _savedAddresses.first);
          widget.addressController.text = def.formattedAddress;
        }
      });
    }
  }

  void _validateAndConfirm() {
    final addressText = widget.addressController.text.trim();
    if (addressText.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please add or select a pickup address to continue'),
          backgroundColor: const Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
          action: SnackBarAction(
            label: 'Add Address',
            textColor: Colors.white,
            onPressed: _navigateToAddAddress,
          ),
        ),
      );
      return;
    }

    final upiText = widget.upiController.text.trim();
    if (upiText.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your UPI ID for instant payout transfer'),
          backgroundColor: Color(0xFFE11D48),
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    widget.onConfirmOrder();
  }

  @override
  Widget build(BuildContext context) {
    final modelName = widget.selectedModel?['name'] as String? ?? 'Camera Device';
    final modelImage = widget.selectedModel?['image'] as String? ?? 'assets/images/categories/dslr.png';
    final currentAddress = widget.addressController.text.trim();
    final hasAddress = currentAddress.isNotEmpty;
    UserAddress? activeAddressObj;
    if (hasAddress && _savedAddresses.isNotEmpty) {
      try {
        activeAddressObj = _savedAddresses.firstWhere(
          (a) => a.formattedAddress.trim() == currentAddress,
        );
      } catch (_) {
        activeAddressObj = _savedAddresses.first;
      }
    }

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── 1. CHOSEN DEVICE & VALUATION PAYOUT CARD ──
          _buildChosenDeviceHeroCard(modelName, modelImage),

          const SizedBox(height: 20),

          // ── 2. PICKUP DATE SECTION ──
          _buildSectionHeader(
            icon: Icons.calendar_today_rounded,
            title: 'Preferred Pickup Date',
            badge: 'Free Doorstep Visit',
          ),
          const SizedBox(height: 10),
          _buildDateSelector(),

          const SizedBox(height: 22),

          // ── 3. PREFERRED TIME SLOT SECTION ──
          _buildSectionHeader(
            icon: Icons.access_time_filled_rounded,
            title: 'Preferred Time Slot',
            badge: '2-Hr Window',
          ),
          const SizedBox(height: 10),
          _buildTimeSlotSelector(),

          const SizedBox(height: 22),

          // ── 4. PICKUP ADDRESS SECTION (SAVED ADDRESS VS + ADD ADDRESS) ──
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildSectionHeader(
                icon: Icons.location_on_rounded,
                title: 'Doorstep Pickup Address',
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
          _buildAddressDisplay(hasAddress, activeAddressObj, currentAddress),

          const SizedBox(height: 22),

          // ── 5. PAYMENT SECTION (CASH ON HANDOVER / SPOT PAYOUT) ──
          _buildSectionHeader(
            icon: Icons.payments_rounded,
            title: 'Doorstep Cash / Spot Handover Payout',
            badge: '100% Guaranteed Cash',
          ),
          const SizedBox(height: 10),
          _buildUpiInputSection(),

          const SizedBox(height: 28),

          // ── 6. CONFIRM DOORSTEP PICKUP BUTTON ──
          _buildConfirmButton(),

          const SizedBox(height: 12),

          // ── 7. TRUST & SAFETY BADGES ──
          _buildTrustFooter(),
        ],
      ),
    );
  }

  // ── HERO CHOSEN DEVICE CARD ──
  Widget _buildChosenDeviceHeroCard(String modelName, String modelImage) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B), Color(0xFF0F172A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.12), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF059669).withValues(alpha: 0.18),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Top Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF059669).withValues(alpha: 0.22),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFF34D399).withValues(alpha: 0.4), width: 0.8),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.camera_alt_rounded, size: 11, color: Color(0xFF34D399)),
                      SizedBox(width: 4),
                      Text(
                        'CHOSEN DEVICE FOR PICKUP',
                        style: TextStyle(
                          color: Color(0xFF34D399),
                          fontSize: 9.5,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(5),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.15), width: 0.8),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.verified_rounded, size: 11, color: Color(0xFF38BDF8)),
                      SizedBox(width: 3),
                      Text(
                        'Step 6 of 6',
                        style: TextStyle(
                          color: Color(0xFFE0F2FE),
                          fontSize: 9.5,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Middle Device Info
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
            child: Row(
              children: [
                Container(
                  width: 58,
                  height: 58,
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.2),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: CamsikSmartImage(
                    image: modelImage,
                    fit: BoxFit.contain,
                    iconSize: 28,
                    iconColor: const Color(0xFF94A3B8),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        modelName,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: -0.3,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(5),
                        ),
                        child: Text(
                          '${widget.selectedStorage} • ${widget.selectedColor}',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFFCBD5E1),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Bottom Connected Guaranteed Payout Strip
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.28),
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
              border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.08))),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Guaranteed Doorstep Payout',
                      style: TextStyle(
                        fontSize: 10.5,
                        color: Color(0xFF94A3B8),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Row(
                      children: [
                        Icon(Icons.bolt_rounded, size: 12, color: Color(0xFF34D399)),
                        SizedBox(width: 2),
                        Text(
                          'Instant Bank/UPI Transfer',
                          style: TextStyle(
                            fontSize: 10,
                            color: Color(0xFF34D399),
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Text(
                  formatCurrency(widget.calculatedPrice),
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF34D399),
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── SECTION HEADER ──
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

  // ── DATE SELECTOR ──
  Widget _buildDateSelector() {
    final dates = [
      {'id': 'Today', 'label': 'Today', 'sub': _formatDateSubtitle(0)},
      {'id': 'Tomorrow', 'label': 'Tomorrow', 'sub': _formatDateSubtitle(1)},
      {'id': 'Day After Tomorrow', 'label': 'Day After', 'sub': _formatDateSubtitle(2)},
    ];

    return Row(
      children: dates.map((d) {
        final id = d['id']!;
        final label = d['label']!;
        final sub = d['sub']!;
        final isSelected = widget.selectedDate == id;

        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(
              left: id == 'Today' ? 0 : 4,
              right: id == 'Day After Tomorrow' ? 0 : 4,
            ),
            child: InkWell(
              onTap: () => widget.onDateChanged(id),
              borderRadius: BorderRadius.circular(14),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                decoration: BoxDecoration(
                  gradient: isSelected
                      ? const LinearGradient(
                          colors: [Color(0xFF059669), Color(0xFF047857)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        )
                      : null,
                  color: isSelected ? null : Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                    width: isSelected ? 1.8 : 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: isSelected
                          ? const Color(0xFF059669).withValues(alpha: 0.25)
                          : Colors.black.withValues(alpha: 0.03),
                      blurRadius: isSelected ? 8 : 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (isSelected) ...[
                          const Icon(Icons.check_circle_rounded, size: 13, color: Colors.white),
                          const SizedBox(width: 4),
                        ],
                        Text(
                          label,
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w900,
                            color: isSelected ? Colors.white : const Color(0xFF0F172A),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      sub,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: isSelected ? const Color(0xFFD1FAE5) : const Color(0xFF64748B),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  // ── TIME SLOT SELECTOR ──
  Widget _buildTimeSlotSelector() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _slots.map((s) {
        final isSelected = widget.selectedSlot == s;

        return InkWell(
          onTap: () => widget.onSlotChanged(s),
          borderRadius: BorderRadius.circular(12),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 160),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
            decoration: BoxDecoration(
              color: isSelected ? const Color(0xFFECFDF5) : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                width: isSelected ? 1.6 : 1,
              ),
              boxShadow: [
                BoxShadow(
                  color: isSelected
                      ? const Color(0xFF059669).withValues(alpha: 0.12)
                      : Colors.black.withValues(alpha: 0.02),
                  blurRadius: 4,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isSelected ? Icons.check_circle_rounded : Icons.schedule_rounded,
                  size: 14,
                  color: isSelected ? const Color(0xFF059669) : const Color(0xFF94A3B8),
                ),
                const SizedBox(width: 6),
                Text(
                  s,
                  style: TextStyle(
                    fontSize: 11.5,
                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                    color: isSelected ? const Color(0xFF065F46) : const Color(0xFF334155),
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  // ── PICKUP ADDRESS DISPLAY (SAVED CARD vs EMPTY ADD BUTTON) ──
  Widget _buildAddressDisplay(bool hasAddress, UserAddress? activeObj, String currentAddress) {
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

    // CASE 1: No address saved and text is empty -> Show "+ Add Address" Prominent Button
    if (!hasAddress && _savedAddresses.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFCBD5E1), style: BorderStyle.solid),
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
              'No Pickup Address Added',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Add your doorstep address for technician inspection and instant cash handover.',
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
                  '+ Add Pickup Address',
                  style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ],
        ),
      );
    }

    // CASE 2: Address is available -> Show interactive Saved Address Card
    final tag = activeObj?.tag ?? 'Home';
    final contactName = activeObj?.contactName.isNotEmpty == true
        ? activeObj!.contactName
        : widget.userProfile.name;
    final contactPhone = activeObj?.contactPhone.isNotEmpty == true
        ? activeObj!.contactPhone
        : widget.userProfile.phone;

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
            // Top Row: Tag badge + Actions
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
                    'VERIFIED DOORSTEP',
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF64748B),
                    ),
                  ),
                ),
                const Spacer(),
                // Edit action if UserAddress is available
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

            // Contact Name & Phone
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

            // Formatted address text
            Text(
              currentAddress,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Color(0xFF334155),
                height: 1.4,
              ),
            ),

            const SizedBox(height: 12),

            // Action row: "+ Add Another" or "Change Address"
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
                      Icon(Icons.add_circle_outline_rounded, size: 14, color: Color(0xFF64748B)),
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

  // ── UPI INPUT SECTION ──
  Widget _buildUpiInputSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: widget.upiController,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: Color(0xFF0F172A),
            ),
            decoration: InputDecoration(
              hintText: 'e.g. mobile@upi or username@okhdfcbank',
              hintStyle: const TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 13,
                fontWeight: FontWeight.normal,
              ),
              prefixIcon: const Icon(Icons.account_balance_wallet_rounded, color: Color(0xFF059669), size: 20),
              suffixIcon: ValueListenableBuilder<TextEditingValue>(
                valueListenable: widget.upiController,
                builder: (context, val, child) {
                  if (val.text.trim().isNotEmpty) {
                    return const Icon(Icons.verified_rounded, color: Color(0xFF059669), size: 20);
                  }
                  return const SizedBox.shrink();
                },
              ),
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Color(0xFF059669), width: 1.8),
              ),
            ),
          ),
          const SizedBox(height: 10),
          // Quick UPI handles
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _upiHandles.map((handle) {
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: InkWell(
                    onTap: () {
                      final current = widget.upiController.text.trim();
                      if (current.contains('@')) {
                        final prefix = current.split('@').first;
                        widget.upiController.text = '$prefix$handle';
                      } else if (current.isNotEmpty) {
                        widget.upiController.text = '$current$handle';
                      } else {
                        widget.upiController.text = handle;
                      }
                      setState(() {});
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Text(
                        handle,
                        style: const TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF475569),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 8),
          const Row(
            children: [
              Icon(Icons.bolt_rounded, size: 13, color: Color(0xFF059669)),
              SizedBox(width: 4),
              Expanded(
                child: Text(
                  'Instant Doorstep Payment: Cash/UPI transferred directly to your bank account after physical inspection.',
                  style: TextStyle(
                    fontSize: 10.5,
                    color: Color(0xFF64748B),
                    fontWeight: FontWeight.w500,
                    height: 1.3,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── CONFIRM DOORSTEP PICKUP BUTTON ──
  Widget _buildConfirmButton() {
    return Container(
      width: double.infinity,
      height: 56,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: const LinearGradient(
          colors: [Color(0xFF059669), Color(0xFF047857)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF059669).withValues(alpha: 0.38),
            blurRadius: 14,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: _validateAndConfirm,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: Colors.white,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          padding: const EdgeInsets.symmetric(horizontal: 18),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Row(
              children: [
                Icon(Icons.verified_rounded, size: 22, color: Colors.white),
                SizedBox(width: 10),
                Text(
                  'Confirm Doorstep Pickup',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.2,
                  ),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4.5),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                formatCurrency(widget.calculatedPrice),
                style: const TextStyle(
                  fontSize: 13.5,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── TRUST FOOTER ──
  Widget _buildTrustFooter() {
    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.lock_rounded, size: 12, color: Color(0xFF059669)),
            SizedBox(width: 4),
            Text(
              'Zero Cancellation Fee • Free Rescheduling Anytime',
              style: TextStyle(
                fontSize: 10.5,
                fontWeight: FontWeight.w700,
                color: Color(0xFF64748B),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
