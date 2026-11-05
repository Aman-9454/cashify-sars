import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/session_service.dart';
import '../data/repositories/riders_repository.dart';

class AddRiderScreen extends StatefulWidget {
  const AddRiderScreen({super.key});

  @override
  State<AddRiderScreen> createState() => _AddRiderScreenState();
}

class _AddRiderScreenState extends State<AddRiderScreen> {
  final _formKey = GlobalKey<FormState>();
  final RidersRepository _ridersRepo = RidersRepositoryImpl();

  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _vehicleCtrl = TextEditingController();
  final _vehicleNoCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _pinCodesCtrl = TextEditingController();

  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final partner = SessionService.currentUser;
    if (partner != null) {
      if (partner.city.isNotEmpty) {
        _cityCtrl.text = partner.city;
      }
      if (partner.pinCodes.isNotEmpty) {
        _pinCodesCtrl.text = partner.pinCodes.join(', ');
      }
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _vehicleCtrl.dispose();
    _vehicleNoCtrl.dispose();
    _cityCtrl.dispose();
    _pinCodesCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitRider() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    final partner = SessionService.currentUser;
    final partnerId = partner?.id ?? '';
    final phone = _phoneCtrl.text.trim();
    final email = _emailCtrl.text.trim().isNotEmpty
        ? _emailCtrl.text.trim()
        : '$phone@camsik.in';

    final success = await _ridersRepo.addRider(
      name: _nameCtrl.text.trim(),
      phone: phone,
      email: email,
      partnerId: partnerId,
      city: _cityCtrl.text.trim(),
      vehicle: _vehicleCtrl.text.trim(),
      vehicleNumber: _vehicleNoCtrl.text.trim(),
      pinCodes: _pinCodesCtrl.text.trim(),
    );

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          content: Text(
            'Rider added to your fleet successfully!',
            style: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
      );
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          content: Text(
            'Failed to add rider. Please check connection and try again.',
            style: TextStyle(fontSize: 14.sp, color: Colors.white),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF0F172A), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Onboard New Rider',
          style: TextStyle(
            fontSize: 17.sp,
            fontWeight: FontWeight.w900,
            color: const Color(0xFF0F172A),
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 2.h),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Info Banner
                Container(
                  padding: EdgeInsets.all(4.w),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.two_wheeler_rounded, color: AppColors.primary, size: 22),
                      ),
                      SizedBox(width: 3.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Private Store Fleet',
                              style: TextStyle(
                                fontSize: 14.sp,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryDark,
                              ),
                            ),
                            SizedBox(height: 0.2.h),
                            Text(
                              'This rider will strictly be linked to your store. You can directly assign doorstep pickup orders to them.',
                              style: TextStyle(
                                fontSize: 14.sp,
                                color: const Color(0xFF334155),
                                height: 1.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                SizedBox(height: 2.5.h),

                // Form Fields
                _buildLabel('Rider Full Name *'),
                SizedBox(height: 0.8.h),
                TextFormField(
                  controller: _nameCtrl,
                  style: TextStyle(fontSize: 15.sp, color: const Color(0xFF0F172A)),
                  decoration: _buildInputDecoration(
                    hint: 'e.g. Ramesh Kumar',
                    icon: Icons.person_outline_rounded,
                  ),
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) {
                      return 'Please enter rider full name';
                    }
                    return null;
                  },
                ),

                SizedBox(height: 2.h),

                _buildLabel('Phone Number (10 Digits) *'),
                SizedBox(height: 0.8.h),
                TextFormField(
                  controller: _phoneCtrl,
                  keyboardType: TextInputType.phone,
                  style: TextStyle(fontSize: 15.sp, color: const Color(0xFF0F172A)),
                  decoration: _buildInputDecoration(
                    hint: 'e.g. 9876543210',
                    icon: Icons.phone_android_rounded,
                  ),
                  validator: (val) {
                    if (val == null || val.trim().length < 10) {
                      return 'Please enter valid 10-digit mobile number';
                    }
                    return null;
                  },
                ),

                SizedBox(height: 2.h),

                _buildLabel('Email Address (Optional)'),
                SizedBox(height: 0.8.h),
                TextFormField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  style: TextStyle(fontSize: 15.sp, color: const Color(0xFF0F172A)),
                  decoration: _buildInputDecoration(
                    hint: 'e.g. ramesh@camsik.in',
                    icon: Icons.email_outlined,
                  ),
                ),

                SizedBox(height: 2.h),

                _buildLabel('Vehicle Model'),
                SizedBox(height: 0.8.h),
                TextFormField(
                  controller: _vehicleCtrl,
                  style: TextStyle(fontSize: 15.sp, color: const Color(0xFF0F172A)),
                  decoration: _buildInputDecoration(
                    hint: 'e.g. Bike (Hero Splendor)',
                    icon: Icons.directions_bike_rounded,
                  ),
                ),

                SizedBox(height: 2.h),

                _buildLabel('Vehicle Registration Number'),
                SizedBox(height: 0.8.h),
                TextFormField(
                  controller: _vehicleNoCtrl,
                  textCapitalization: TextCapitalization.characters,
                  style: TextStyle(fontSize: 15.sp, color: const Color(0xFF0F172A)),
                  decoration: _buildInputDecoration(
                    hint: 'e.g. MH02AB1234',
                    icon: Icons.pin_rounded,
                  ),
                ),

                SizedBox(height: 2.h),

                _buildLabel('Service City'),
                SizedBox(height: 0.8.h),
                TextFormField(
                  controller: _cityCtrl,
                  style: TextStyle(fontSize: 15.sp, color: const Color(0xFF0F172A)),
                  decoration: _buildInputDecoration(
                    hint: 'e.g. Mumbai',
                    icon: Icons.location_city_rounded,
                  ),
                ),

                SizedBox(height: 2.h),

                _buildLabel('Covered Pin Codes (Comma Separated)'),
                SizedBox(height: 0.8.h),
                TextFormField(
                  controller: _pinCodesCtrl,
                  style: TextStyle(fontSize: 15.sp, color: const Color(0xFF0F172A)),
                  decoration: _buildInputDecoration(
                    hint: 'e.g. 400001, 400050, 400072',
                    icon: Icons.map_rounded,
                  ),
                ),

                SizedBox(height: 3.5.h),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    onPressed: _isSubmitting ? null : _submitRider,
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: Colors.white,
                            ),
                          )
                        : Text(
                            'Add Rider to Fleet',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.3,
                            ),
                          ),
                  ),
                ),
                SizedBox(height: 2.h),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 14.sp,
        fontWeight: FontWeight.bold,
        color: const Color(0xFF334155),
      ),
    );
  }

  InputDecoration _buildInputDecoration({required String hint, required IconData icon}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(fontSize: 14.sp, color: const Color(0xFF94A3B8)),
      prefixIcon: Icon(icon, color: const Color(0xFF64748B), size: 20),
      filled: true,
      fillColor: Colors.white,
      contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
    );
  }
}
