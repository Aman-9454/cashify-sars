import 'package:flutter/material.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../models/user_order.dart';
import '../../../models/user_profile.dart';
import '../../../core/services/api_service.dart';
import '../../../widgets/camsik_smart_image.dart';

class RentalCheckoutView extends StatefulWidget {
  final Map<String, dynamic> camera;
  final int rentalDays;
  final Map<String, dynamic> priceCalc;
  final UserProfile userProfile;
  final Function(UserProfile) onProfileUpdate;
  final Function(UserOrder) onOrderCreated;
  final VoidCallback onBack;

  const RentalCheckoutView({
    super.key,
    required this.camera,
    required this.rentalDays,
    required this.priceCalc,
    required this.userProfile,
    required this.onProfileUpdate,
    required this.onOrderCreated,
    required this.onBack,
  });

  @override
  State<RentalCheckoutView> createState() => _RentalCheckoutViewState();
}

class _RentalCheckoutViewState extends State<RentalCheckoutView> {
  bool _isSubmitting = false;

  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _cityController;
  late TextEditingController _pincodeController;
  final String _shootDate = 'Tomorrow';
  String _idProofType = 'Aadhaar Card';
  String _shootPurpose = 'Wedding / Event';
  final String _paymentMode = 'Pay on Delivery (Doorstep Cash)';

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.userProfile.name);
    _phoneController = TextEditingController(text: widget.userProfile.phone);
    _addressController = TextEditingController(text: widget.userProfile.address);
    _cityController = TextEditingController(text: 'Mumbai');
    _pincodeController = TextEditingController(text: '401107');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _pincodeController.dispose();
    super.dispose();
  }

  Widget _buildCalcRow(String label, String value, {bool isHighlight = false, bool isDeposit = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 11, color: isHighlight ? const Color(0xFF0F172A) : const Color(0xFF64748B), fontWeight: isHighlight ? FontWeight.bold : FontWeight.normal)),
          Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isHighlight ? FontWeight.w900 : FontWeight.bold,
              color: isDeposit ? const Color(0xFF4F46E5) : const Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }

  void _handleRentalOrderSubmit() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    final address = _addressController.text.trim();

    if (name.isEmpty || phone.isEmpty || address.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill Name, Phone and Delivery Address.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final c = widget.camera;
    final cameraName = c['model'] as String? ?? 'Camera';
    final dailyPrice = (c['dailyPrice'] as num?)?.toInt() ?? 0;
    final deposit = (c['securityDeposit'] as num?)?.toInt() ?? 0;
    final calc = widget.priceCalc;

    final orderData = {
      'type': 'rent',
      'customerName': name,
      'customerPhone': phone,
      'customerAddress': address,
      'city': _cityController.text.trim(),
      'pincode': _pincodeController.text.trim(),
      'amount': calc['grandTotal'],
      'finalPrice': calc['grandTotal'],
      'quotedPrice': calc['grandTotal'],
      'deviceName': 'Rental: $cameraName (${widget.rentalDays} Days)',
      'deviceBrand': c['brand'] ?? '',
      'deviceModel': c['model'] ?? '',
      'status': 'Rental Confirmed',
      'paymentMethod': _paymentMode,
      'rentalDays': widget.rentalDays,
      'dailyRate': dailyPrice,
      'securityDeposit': deposit,
      'idProofType': _idProofType,
      'shootPurpose': _shootPurpose,
      'pickupDate': _shootDate,
      'pickupSlot': '10:00 AM – 1:00 PM',
      'notes': 'Rental booking for ${widget.rentalDays} days. Deposit: ${formatCurrency(deposit)}. Shoot: $_shootPurpose.',
    };

    final pinRes = await ApiService.checkPincodeServiceability(_pincodeController.text.trim());
    if (pinRes['serviceable'] == false) {
      final unserviceableData = {
        ...orderData,
        'status': 'unserviceable',
        'notes': 'Unserviceable Area Rental Request. PIN: ${_pincodeController.text.trim()}',
      };
      await ApiService.createOrder(unserviceableData);

      if (!mounted) return;
      setState(() => _isSubmitting = false);

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
      return;
    }

    final created = await ApiService.createOrder(orderData);
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (created != null) {
      final userOrder = UserOrder.fromJson(created);
      widget.onOrderCreated(userOrder);

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (dialogCtx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: Color(0xFFFFE4E6),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle, color: Color(0xFFE11D48), size: 40),
              ),
              const SizedBox(height: 16),
              const Text('Rental Booking Placed!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(
                'Your camera kit will be calibrated and delivered to $address.',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Order: ${userOrder.orderNumber}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                    Text('OTP: ${userOrder.otp}', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFE11D48), fontSize: 12)),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE11D48),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    Navigator.pop(dialogCtx);
                    Navigator.pop(context);
                  },
                  child: const Text('View in My Bookings', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.camera;
    final name = c['model'] as String? ?? 'Camera';
    final dailyPrice = (c['dailyPrice'] as num?)?.toInt() ?? 0;
    final deposit = (c['securityDeposit'] as num?)?.toInt() ?? 0;
    final calc = widget.priceCalc;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 1,
        title: const Text('Rental Checkout', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBack,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Selected Equipment Card
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFFECDD3)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
                    child: CamsikSmartImage(image: c['image'], fit: BoxFit.contain, iconSize: 26, iconColor: const Color(0xFFE11D48)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        Text('Duration: ${widget.rentalDays} Days · Multiplier: ${formatCurrency(dailyPrice)}/day', style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                      ],
                    ),
                  ),
                  Text(
                    formatCurrency(calc['grandTotal']),
                    style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFFE11D48), fontSize: 14),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),
            const Text('Customer & Delivery Information', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFF0F172A))),
            const SizedBox(height: 12),

            // Form inputs
            TextField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Full Name *',
                prefixIcon: const Icon(Icons.person_outline, size: 20),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: 'Contact Phone Number *',
                prefixIcon: const Icon(Icons.phone_outlined, size: 20),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _addressController,
              maxLines: 2,
              decoration: InputDecoration(
                labelText: 'Delivery / Shoot Location Address *',
                prefixIcon: const Icon(Icons.location_on_outlined, size: 20),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _cityController,
                    decoration: InputDecoration(
                      labelText: 'City',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _pincodeController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'Pincode',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),
            const Text('Verification ID Proof (Required for Rental)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['Aadhaar Card', 'Driving License', 'Passport', 'Voter ID'].map((idType) {
                  final isSel = _idProofType == idType;
                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(
                      label: Text(idType),
                      selected: isSel,
                      onSelected: (s) => setState(() => _idProofType = idType),
                      selectedColor: const Color(0xFF0F172A),
                      labelStyle: TextStyle(color: isSel ? Colors.white : const Color(0xFF0F172A), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 16),
            const Text('Shoot Purpose', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['Wedding / Event', 'Commercial / Ad', 'Short Film', 'Travel / Documentary', 'Personal'].map((purpose) {
                  final isSel = _shootPurpose == purpose;
                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(
                      label: Text(purpose),
                      selected: isSel,
                      onSelected: (s) => setState(() => _shootPurpose = purpose),
                      selectedColor: const Color(0xFFE11D48),
                      labelStyle: TextStyle(color: isSel ? Colors.white : const Color(0xFF0F172A), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 20),
            // Price Summary Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  _buildCalcRow('Equipment Rental (${calc["basePrice"]} - ${calc["discountAmount"]})', formatCurrency(calc['subtotal'])),
                  _buildCalcRow('Refundable Security Deposit', formatCurrency(deposit), isDeposit: true),
                  const Divider(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Amount Payable', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                      Text(formatCurrency(calc['grandTotal']), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFFE11D48))),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE11D48),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 4,
                ),
                onPressed: _isSubmitting ? null : _handleRentalOrderSubmit,
                child: _isSubmitting
                    ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                    : const Text('Confirm & Place Rental Order', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
