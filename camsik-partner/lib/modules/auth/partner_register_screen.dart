import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sizer/sizer.dart';
import '../../core/constants/app_colors.dart';
import '../../core/routes/app_routes.dart';
import 'bloc/auth_cubit.dart';
import 'bloc/auth_state.dart';
import 'data/models/requests/partner_register_request.dart';

class UpperCaseTextFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    return TextEditingValue(
      text: newValue.text.toUpperCase(),
      selection: newValue.selection,
    );
  }
}

class PartnerRegisterScreen extends StatefulWidget {
  const PartnerRegisterScreen({super.key});

  @override
  State<PartnerRegisterScreen> createState() => _PartnerRegisterScreenState();
}

class _PartnerRegisterScreenState extends State<PartnerRegisterScreen> {
  int _currentStep = 1;

  // Step 1: Personal Info
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  // Step 2: Store Details
  final _storeNameController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController(text: 'Karnataka');
  final _pinCodeController = TextEditingController();
  final _addressController = TextEditingController();

  // Step 3: Bank & KYC
  final _panController = TextEditingController();
  final _gstController = TextEditingController();
  final _bankAccountController = TextEditingController();
  final _ifscController = TextEditingController();
  bool _agreeTerms = true;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _storeNameController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pinCodeController.dispose();
    _addressController.dispose();
    _panController.dispose();
    _gstController.dispose();
    _bankAccountController.dispose();
    _ifscController.dispose();
    super.dispose();
  }

  void _onNextStep(BuildContext context) {
    FocusScope.of(context).unfocus();

    if (_currentStep == 1) {
      final name = _nameController.text.trim();
      if (name.isEmpty) {
        _showErrorSnackBar(context, 'Please enter your full name');
        return;
      }
      if (name.length < 3) {
        _showErrorSnackBar(context, 'Full name must be at least 3 characters long');
        return;
      }

      final phone = _phoneController.text.trim();
      if (phone.isEmpty) {
        _showErrorSnackBar(context, 'Please enter mobile number');
        return;
      }
      if (phone.length != 10 || !RegExp(r'^[6-9]\d{9}$').hasMatch(phone)) {
        _showErrorSnackBar(context, 'Mobile number must be exactly 10 digits starting with 6, 7, 8 or 9');
        return;
      }

      final email = _emailController.text.trim().toLowerCase();
      final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
      if (email.isEmpty) {
        _showErrorSnackBar(context, 'Please enter email address');
        return;
      }
      if (!emailRegex.hasMatch(email)) {
        _showErrorSnackBar(context, 'Please enter a valid email address (e.g. partner@gmail.com)');
        return;
      }

      final password = _passwordController.text;
      if (password.isEmpty) {
        _showErrorSnackBar(context, 'Please enter account password');
        return;
      }
      if (password.length < 6) {
        _showErrorSnackBar(context, 'Password must be at least 6 characters long');
        return;
      }
      if (password != _confirmPasswordController.text) {
        _showErrorSnackBar(context, 'Passwords do not match');
        return;
      }
      setState(() => _currentStep = 2);
    } else if (_currentStep == 2) {
      final storeName = _storeNameController.text.trim();
      if (storeName.isEmpty) {
        _showErrorSnackBar(context, 'Please enter store or business name');
        return;
      }
      if (storeName.length < 3) {
        _showErrorSnackBar(context, 'Store name must be at least 3 characters long');
        return;
      }

      final city = _cityController.text.trim();
      if (city.isEmpty) {
        _showErrorSnackBar(context, 'Please enter city');
        return;
      }
      if (city.length < 2) {
        _showErrorSnackBar(context, 'Please enter a valid city name');
        return;
      }

      final state = _stateController.text.trim();
      if (state.isEmpty) {
        _showErrorSnackBar(context, 'Please enter state');
        return;
      }

      final pin = _pinCodeController.text.trim();
      if (pin.isEmpty) {
        _showErrorSnackBar(context, 'Please enter 6-digit PIN code');
        return;
      }
      if (pin.length != 6 || !RegExp(r'^[1-9]\d{5}$').hasMatch(pin)) {
        _showErrorSnackBar(context, 'PIN Code must be exactly 6 digits');
        return;
      }

      final address = _addressController.text.trim();
      if (address.isEmpty) {
        _showErrorSnackBar(context, 'Please enter complete store address');
        return;
      }
      if (address.length < 5) {
        _showErrorSnackBar(context, 'Store address must be at least 5 characters long');
        return;
      }
      setState(() => _currentStep = 3);
    } else if (_currentStep == 3) {
      final pan = _panController.text.trim().toUpperCase();
      final panRegex = RegExp(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$');
      if (pan.isEmpty) {
        _showErrorSnackBar(context, 'Please enter Business PAN number');
        return;
      }
      if (pan.length != 10 || !panRegex.hasMatch(pan)) {
        _showErrorSnackBar(context, 'Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F)');
        return;
      }

      final gst = _gstController.text.trim().toUpperCase();
      if (gst.isNotEmpty) {
        final gstRegex = RegExp(r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');
        if (gst.length != 15 || !gstRegex.hasMatch(gst)) {
          _showErrorSnackBar(context, 'Invalid GSTIN format. Must be 15 characters (e.g. 29ABCDE1234F1Z5)');
          return;
        }
      }

      final accountNo = _bankAccountController.text.trim();
      if (accountNo.isEmpty) {
        _showErrorSnackBar(context, 'Please enter settlement bank account number');
        return;
      }
      if (accountNo.length < 9 || accountNo.length > 18 || !RegExp(r'^\d{9,18}$').hasMatch(accountNo)) {
        _showErrorSnackBar(context, 'Bank account number must be between 9 and 18 digits');
        return;
      }

      final ifsc = _ifscController.text.trim().toUpperCase();
      final ifscRegex = RegExp(r'^[A-Z]{4}0[A-Z0-9]{6}$');
      if (ifsc.isEmpty) {
        _showErrorSnackBar(context, 'Please enter bank IFSC code');
        return;
      }
      if (ifsc.length != 11 || !ifscRegex.hasMatch(ifsc)) {
        _showErrorSnackBar(context, 'Invalid IFSC format. Must be 11 characters (e.g. HDFC0001234)');
        return;
      }

      if (!_agreeTerms) {
        _showErrorSnackBar(context, 'Please accept Partner Terms & Conditions to proceed');
        return;
      }

      // Submit registration
      final request = PartnerRegisterRequest(
        name: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        email: _emailController.text.trim().toLowerCase(),
        password: _passwordController.text.trim(),
        storeName: _storeNameController.text.trim(),
        city: _cityController.text.trim(),
        state: _stateController.text.trim().isNotEmpty ? _stateController.text.trim() : 'Karnataka',
        pinCode: _pinCodeController.text.trim(),
        address: _addressController.text.trim(),
        panNumber: _panController.text.trim().toUpperCase(),
        gstNumber: _gstController.text.trim().isNotEmpty ? _gstController.text.trim().toUpperCase() : null,
        accountNumber: _bankAccountController.text.trim(),
        ifscCode: _ifscController.text.trim().toUpperCase(),
      );

      context.read<AuthCubit>().register(request);
    }
  }

  void _showErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: TextStyle(fontSize: 14.sp, color: Colors.white),
        ),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => AuthCubit(),
      child: Scaffold(
        backgroundColor: const Color(0xFF090D16),
        body: SafeArea(
          child: Stack(
            children: [
              // Ambient Background Glows
              Positioned(
                top: -10.h,
                left: -20.w,
                child: Container(
                  width: 70.w,
                  height: 70.w,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        AppColors.primary.withValues(alpha: 0.22),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                bottom: -15.h,
                right: -20.w,
                child: Container(
                  width: 80.w,
                  height: 80.w,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        const Color(0xFF6366F1).withValues(alpha: 0.16),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),

              BlocConsumer<AuthCubit, AuthState>(
                listener: (context, state) {
                  if (state is AuthRegisterSuccess) {
                    Navigator.of(context).pushReplacementNamed(
                      AppRoutes.pendingApproval,
                      arguments: state.partnerData,
                    );
                  } else if (state is AuthFailure) {
                    _showErrorSnackBar(context, state.error);
                  }
                },
                builder: (context, state) {
                  final isLoading = state is AuthLoading;

                  return Center(
                    child: SingleChildScrollView(
                      padding: EdgeInsets.symmetric(horizontal: 5.5.w, vertical: 2.5.h),
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 480),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Header & Back Button
                            Row(
                              children: [
                                IconButton(
                                  onPressed: () {
                                    if (_currentStep > 1) {
                                      setState(() => _currentStep--);
                                    } else {
                                      Navigator.of(context).pushReplacementNamed(AppRoutes.login);
                                    }
                                  },
                                  icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white70, size: 20),
                                  style: IconButton.styleFrom(
                                    backgroundColor: Colors.white.withValues(alpha: 0.05),
                                    padding: const EdgeInsets.all(10),
                                  ),
                                ),
                                SizedBox(width: 3.w),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Partner Registration',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 17.sp,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      'Step $_currentStep of 3 • ${_getStepTitle(_currentStep)}',
                                      style: TextStyle(
                                        color: AppColors.primary,
                                        fontSize: 14.sp,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),

                            SizedBox(height: 2.2.h),

                            // Step Progress Indicator
                            Row(
                              children: [1, 2, 3].map((step) {
                                final isPassed = step <= _currentStep;
                                return Expanded(
                                  child: Container(
                                    margin: EdgeInsets.symmetric(horizontal: 1.w),
                                    height: 4.5,
                                    decoration: BoxDecoration(
                                      color: isPassed ? AppColors.primary : Colors.white.withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),

                            SizedBox(height: 2.5.h),

                            // Main Step Form Card
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 3.h),
                              decoration: BoxDecoration(
                                color: const Color(0xFF131A29).withValues(alpha: 0.90),
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.08),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  if (_currentStep == 1) _buildStep1Personal(),
                                  if (_currentStep == 2) _buildStep2Store(),
                                  if (_currentStep == 3) _buildStep3BankAndKyc(),

                                  SizedBox(height: 3.h),

                                  // Next / Submit Button
                                  FilledButton(
                                    onPressed: isLoading ? null : () => _onNextStep(context),
                                    style: FilledButton.styleFrom(
                                      backgroundColor: AppColors.primary,
                                      padding: EdgeInsets.symmetric(vertical: 1.8.h),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                    ),
                                    child: isLoading
                                        ? const SizedBox(
                                            height: 20,
                                            width: 20,
                                            child: CircularProgressIndicator(
                                              strokeWidth: 2.2,
                                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                            ),
                                          )
                                        : Row(
                                            mainAxisAlignment: MainAxisAlignment.center,
                                            children: [
                                              Text(
                                                _currentStep < 3 ? 'Continue to Next Step' : 'Submit Application',
                                                style: TextStyle(
                                                  fontSize: 15.sp,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.white,
                                                ),
                                              ),
                                              SizedBox(width: 2.w),
                                              Icon(
                                                _currentStep < 3 ? Icons.arrow_forward_rounded : Icons.check_circle_outline_rounded,
                                                size: 18,
                                                color: Colors.white,
                                              ),
                                            ],
                                          ),
                                  ),
                                ],
                              ),
                            ),

                            SizedBox(height: 2.5.h),

                            // Footer: Already have an account?
                            Center(
                              child: TextButton(
                                onPressed: () {
                                  Navigator.of(context).pushReplacementNamed(AppRoutes.login);
                                },
                                child: RichText(
                                  text: TextSpan(
                                    text: 'Already registered as partner? ',
                                    style: TextStyle(
                                      color: const Color(0xFF94A3B8),
                                      fontSize: 14.sp,
                                    ),
                                    children: [
                                      TextSpan(
                                        text: 'Sign In',
                                        style: TextStyle(
                                          color: AppColors.primary,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14.5.sp,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getStepTitle(int step) {
    switch (step) {
      case 1:
        return 'Personal Info';
      case 2:
        return 'Store Details';
      case 3:
        return 'Documents & Bank';
      default:
        return '';
    }
  }

  Widget _buildStep1Personal() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Personal Information', 'Primary contact for store notifications & payouts'),
        SizedBox(height: 2.h),

        _buildTextField(
          controller: _nameController,
          label: 'Partner Full Name',
          hint: 'e.g. Aman Sharma',
          icon: Icons.person_outline_rounded,
          textCapitalization: TextCapitalization.words,
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r"[a-zA-Z\s\.\-']")),
            LengthLimitingTextInputFormatter(50),
          ],
        ),
        SizedBox(height: 1.8.h),

        _buildTextField(
          controller: _phoneController,
          label: 'Mobile Number (Exactly 10 Digits)',
          hint: '9876543210',
          icon: Icons.phone_outlined,
          keyboardType: TextInputType.phone,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(10),
          ],
        ),
        SizedBox(height: 1.8.h),

        _buildTextField(
          controller: _emailController,
          label: 'Email Address',
          hint: 'partner@camsikstore.in',
          icon: Icons.mail_outline_rounded,
          keyboardType: TextInputType.emailAddress,
          inputFormatters: [
            FilteringTextInputFormatter.deny(RegExp(r'\s')),
            LengthLimitingTextInputFormatter(60),
          ],
        ),
        SizedBox(height: 1.8.h),

        _buildTextField(
          controller: _passwordController,
          label: 'Account Password',
          hint: 'Min. 6 characters',
          icon: Icons.lock_outline_rounded,
          obscureText: _obscurePassword,
          inputFormatters: [
            LengthLimitingTextInputFormatter(32),
          ],
          suffixIcon: IconButton(
            icon: Icon(
              _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
              color: Colors.white54,
              size: 20,
            ),
            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
          ),
        ),
        SizedBox(height: 1.8.h),

        _buildTextField(
          controller: _confirmPasswordController,
          label: 'Confirm Password',
          hint: 'Re-enter password',
          icon: Icons.lock_outline_rounded,
          obscureText: _obscureConfirmPassword,
          inputFormatters: [
            LengthLimitingTextInputFormatter(32),
          ],
          suffixIcon: IconButton(
            icon: Icon(
              _obscureConfirmPassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
              color: Colors.white54,
              size: 20,
            ),
            onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
          ),
        ),
      ],
    );
  }

  Widget _buildStep2Store() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Store & Location Details', 'Physical store details where stock liquidations occur'),
        SizedBox(height: 2.h),

        _buildTextField(
          controller: _storeNameController,
          label: 'Store / Business Name',
          hint: 'e.g. Camsik Certified Hub - MG Road',
          icon: Icons.storefront_outlined,
          textCapitalization: TextCapitalization.words,
          inputFormatters: [
            LengthLimitingTextInputFormatter(60),
          ],
        ),
        SizedBox(height: 1.8.h),

        Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: _cityController,
                label: 'City',
                hint: 'e.g. Bengaluru',
                icon: Icons.location_city_rounded,
                textCapitalization: TextCapitalization.words,
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r"[a-zA-Z\s\.\-']")),
                  LengthLimitingTextInputFormatter(35),
                ],
              ),
            ),
            SizedBox(width: 3.w),
            Expanded(
              child: _buildTextField(
                controller: _stateController,
                label: 'State',
                hint: 'e.g. Karnataka',
                icon: Icons.map_outlined,
                textCapitalization: TextCapitalization.words,
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r"[a-zA-Z\s\.\-']")),
                  LengthLimitingTextInputFormatter(35),
                ],
              ),
            ),
          ],
        ),
        SizedBox(height: 1.8.h),

        _buildTextField(
          controller: _pinCodeController,
          label: 'Service PIN Code (6 Digits)',
          hint: 'e.g. 560001',
          icon: Icons.pin_drop_outlined,
          keyboardType: TextInputType.number,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(6),
          ],
        ),
        SizedBox(height: 1.8.h),

        _buildTextField(
          controller: _addressController,
          label: 'Full Store Address',
          hint: 'Shop #, Street, Commercial complex, Landmark...',
          icon: Icons.home_work_outlined,
          maxLines: 2,
          inputFormatters: [
            LengthLimitingTextInputFormatter(150),
          ],
        ),
      ],
    );
  }

  Widget _buildStep3BankAndKyc() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Business Documents & Bank Details', 'Required for instant wallet payouts & verification'),
        SizedBox(height: 2.h),

        _buildTextField(
          controller: _panController,
          label: 'Business PAN Number (10 Digits)',
          hint: 'ABCDE1234F',
          icon: Icons.credit_card_rounded,
          textCapitalization: TextCapitalization.characters,
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9]')),
            LengthLimitingTextInputFormatter(10),
            UpperCaseTextFormatter(),
          ],
        ),
        SizedBox(height: 1.8.h),

        _buildTextField(
          controller: _gstController,
          label: 'GST Number (Optional, 15 Digits)',
          hint: '29ABCDE1234F1Z5',
          icon: Icons.receipt_long_outlined,
          textCapitalization: TextCapitalization.characters,
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9]')),
            LengthLimitingTextInputFormatter(15),
            UpperCaseTextFormatter(),
          ],
        ),
        SizedBox(height: 1.8.h),

        _buildTextField(
          controller: _bankAccountController,
          label: 'Settlement Bank Account Number',
          hint: 'e.g. 50100234567890 (9 to 18 digits)',
          icon: Icons.account_balance_outlined,
          keyboardType: TextInputType.number,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(18),
          ],
        ),
        SizedBox(height: 1.8.h),

        _buildTextField(
          controller: _ifscController,
          label: 'Bank IFSC Code (11 Characters)',
          hint: 'HDFC0001234',
          icon: Icons.domain_rounded,
          textCapitalization: TextCapitalization.characters,
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9]')),
            LengthLimitingTextInputFormatter(11),
            UpperCaseTextFormatter(),
          ],
        ),
        SizedBox(height: 2.2.h),

        // Terms and conditions checkbox
        InkWell(
          onTap: () => setState(() => _agreeTerms = !_agreeTerms),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.2.h),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.04),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Checkbox(
                  value: _agreeTerms,
                  activeColor: AppColors.primary,
                  onChanged: (v) => setState(() => _agreeTerms = v ?? false),
                ),
                Expanded(
                  child: Text(
                    'I confirm that all store, KYC and bank information provided is accurate and agree to Camsik Partner Terms.',
                    style: TextStyle(color: const Color(0xFF94A3B8), fontSize: 14.sp),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title, String subtitle) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            color: Colors.white,
            fontSize: 16.5.sp,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 0.4.h),
        Text(
          subtitle,
          style: TextStyle(
            color: const Color(0xFF94A3B8),
            fontSize: 14.sp,
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    bool obscureText = false,
    Widget? suffixIcon,
    TextInputType keyboardType = TextInputType.text,
    TextCapitalization textCapitalization = TextCapitalization.none,
    List<TextInputFormatter>? inputFormatters,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: const Color(0xFFCBD5E1),
            fontSize: 14.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 0.8.h),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          textCapitalization: textCapitalization,
          inputFormatters: inputFormatters,
          maxLines: maxLines,
          style: TextStyle(
            color: Colors.white,
            fontSize: 14.5.sp,
          ),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
              color: Colors.white.withValues(alpha: 0.28),
              fontSize: 14.sp,
            ),
            prefixIcon: Icon(icon, color: AppColors.primary.withValues(alpha: 0.8), size: 20),
            suffixIcon: suffixIcon,
            filled: true,
            fillColor: Colors.white.withValues(alpha: 0.04),
            contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: maxLines > 1 ? 1.4.h : 1.6.h),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}

