import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../models/user_address.dart';

class AddEditAddressScreen extends StatefulWidget {
  final UserAddress? initialAddress;
  final String defaultName;
  final String defaultPhone;

  const AddEditAddressScreen({
    super.key,
    this.initialAddress,
    this.defaultName = '',
    this.defaultPhone = '',
  });

  @override
  State<AddEditAddressScreen> createState() => _AddEditAddressScreenState();
}

class _AddEditAddressScreenState extends State<AddEditAddressScreen> {
  final _formKey = GlobalKey<FormState>();

  late String _selectedTag;
  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _flatController;
  late final TextEditingController _streetController;
  late final TextEditingController _cityController;
  late final TextEditingController _pincodeController;
  late bool _isDefault;

  bool _isCheckingPincode = false;
  String? _pincodeMessage;
  bool _pincodeValid = true;

  @override
  void initState() {
    super.initState();
    final a = widget.initialAddress;
    _selectedTag = a?.tag ?? 'Home';
    _nameController = TextEditingController(text: a?.contactName.isNotEmpty == true ? a!.contactName : widget.defaultName);
    _phoneController = TextEditingController(text: a?.contactPhone.isNotEmpty == true ? a!.contactPhone : widget.defaultPhone);
    _flatController = TextEditingController(text: a?.flat ?? '');
    _streetController = TextEditingController(text: a?.street ?? '');
    _cityController = TextEditingController(text: a?.city.isNotEmpty == true ? a!.city : 'Mumbai');
    _pincodeController = TextEditingController(text: a?.pincode ?? '');
    _isDefault = a?.isDefault ?? true;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _flatController.dispose();
    _streetController.dispose();
    _cityController.dispose();
    _pincodeController.dispose();
    super.dispose();
  }

  Future<void> _verifyPincode(String pincode) async {
    if (pincode.length != 6) {
      setState(() {
        _pincodeMessage = null;
        _pincodeValid = true;
      });
      return;
    }

    setState(() => _isCheckingPincode = true);
    final res = await ApiService.checkPincodeServiceability(pincode);
    if (!mounted) return;

    setState(() {
      _isCheckingPincode = false;
      _pincodeValid = res['serviceable'] == true;
      _pincodeMessage = res['message']?.toString();
      if (res['city'] != null && _cityController.text.isEmpty) {
        _cityController.text = res['city'].toString();
      }
    });
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    final address = UserAddress(
      id: widget.initialAddress?.id ?? 'addr-${DateTime.now().millisecondsSinceEpoch}',
      tag: _selectedTag,
      contactName: _nameController.text.trim(),
      contactPhone: _phoneController.text.trim(),
      flat: _flatController.text.trim(),
      street: _streetController.text.trim(),
      city: _cityController.text.trim(),
      pincode: _pincodeController.text.trim(),
      isDefault: _isDefault,
    );

    Navigator.pop(context, address);
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.initialAddress != null;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        elevation: 0,
        title: Text(
          isEditing ? 'Edit Address' : 'Add New Address',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Tag Selection
                      const Text(
                        'Save Address As',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0F172A),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          _buildTagChip('Home', Icons.home_outlined),
                          const SizedBox(width: 10),
                          _buildTagChip('Office', Icons.business_outlined),
                          const SizedBox(width: 10),
                          _buildTagChip('Other', Icons.location_on_outlined),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Contact Info Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Contact Person Details',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _nameController,
                              decoration: _inputDecoration(
                                label: 'Full Name',
                                icon: Icons.person_outline,
                                hint: 'e.g. Rahul Sharma',
                              ),
                              validator: (val) {
                                if (val == null || val.trim().isEmpty) return 'Enter full name';
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                              maxLength: 10,
                              decoration: _inputDecoration(
                                label: 'Mobile Number',
                                icon: Icons.phone_outlined,
                                hint: '10-digit mobile number',
                                counterText: '',
                              ),
                              validator: (val) {
                                if (val == null || val.trim().length != 10) return 'Enter valid 10-digit mobile number';
                                return null;
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Address Fields Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Doorstep Address Details',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _flatController,
                              decoration: _inputDecoration(
                                label: 'House / Flat / Floor / Building',
                                icon: Icons.apartment_outlined,
                                hint: 'e.g. Flat 402, Green Heights',
                              ),
                              validator: (val) {
                                if (val == null || val.trim().isEmpty) return 'Enter flat / building details';
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _streetController,
                              decoration: _inputDecoration(
                                label: 'Street / Road / Landmark',
                                icon: Icons.map_outlined,
                                hint: 'e.g. Link Road, Near Metro Station',
                              ),
                              validator: (val) {
                                if (val == null || val.trim().isEmpty) return 'Enter street & landmark';
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  flex: 3,
                                  child: TextFormField(
                                    controller: _cityController,
                                    decoration: _inputDecoration(
                                      label: 'City',
                                      icon: Icons.location_city_outlined,
                                      hint: 'Mumbai',
                                    ),
                                    validator: (val) {
                                      if (val == null || val.trim().isEmpty) return 'Enter city';
                                      return null;
                                    },
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  flex: 2,
                                  child: TextFormField(
                                    controller: _pincodeController,
                                    keyboardType: TextInputType.number,
                                    maxLength: 6,
                                    onChanged: _verifyPincode,
                                    decoration: _inputDecoration(
                                      label: 'Pincode',
                                      icon: Icons.pin_drop_outlined,
                                      hint: '401107',
                                      counterText: '',
                                    ),
                                    validator: (val) {
                                      if (val == null || val.trim().length != 6) return '6 digits';
                                      return null;
                                    },
                                  ),
                                ),
                              ],
                            ),
                            if (_isCheckingPincode) ...[
                              const SizedBox(height: 8),
                              const Row(
                                children: [
                                  SizedBox(
                                    width: 12,
                                    height: 12,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF059669)),
                                  ),
                                  SizedBox(width: 8),
                                  Text('Checking doorstep serviceability...', style: TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                                ],
                              ),
                            ] else if (_pincodeMessage != null) ...[
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(
                                    _pincodeValid ? Icons.check_circle : Icons.info_outline,
                                    size: 14,
                                    color: _pincodeValid ? const Color(0xFF059669) : const Color(0xFFE11D48),
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      _pincodeMessage!,
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: _pincodeValid ? const Color(0xFF059669) : const Color(0xFFE11D48),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Set as default switch
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text(
                            'Make this my default address',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                          subtitle: const Text(
                            'Used automatically for instant doorstep pickup & delivery',
                            style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                          ),
                          activeTrackColor: const Color(0xFF059669),
                          value: _isDefault,
                          onChanged: (val) {
                            setState(() => _isDefault = val);
                          },
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ),

            // Bottom action button
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  onPressed: _submit,
                  child: Text(
                    isEditing ? 'Update Address' : 'Save Address',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTagChip(String tag, IconData icon) {
    final isSelected = _selectedTag == tag;
    return InkWell(
      onTap: () => setState(() => _selectedTag = tag),
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF059669) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
            width: isSelected ? 1.5 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF059669).withValues(alpha: 0.25),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  )
                ]
              : null,
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: isSelected ? Colors.white : const Color(0xFF64748B)),
            const SizedBox(width: 6),
            Text(
              tag,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecoration({
    required String label,
    required IconData icon,
    String? hint,
    String? counterText,
  }) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      counterText: counterText,
      labelStyle: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
      hintStyle: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
      prefixIcon: Icon(icon, size: 20, color: const Color(0xFF059669)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF059669), width: 1.5),
      ),
    );
  }
}
