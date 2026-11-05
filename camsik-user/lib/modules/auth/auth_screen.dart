import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../models/user_profile.dart';
import '../../widgets/auth_input_field.dart';
import 'bloc/auth_cubit.dart';
import 'bloc/auth_state.dart';

class CamsikAuthScreen extends StatefulWidget {
  final Function(UserProfile) onAuthSuccess;
  final UserProfile initialProfile;

  const CamsikAuthScreen({
    super.key,
    required this.onAuthSuccess,
    required this.initialProfile,
  });

  @override
  State<CamsikAuthScreen> createState() => _CamsikAuthScreenState();
}

class _CamsikAuthScreenState extends State<CamsikAuthScreen> {
  final TextEditingController _loginIdController = TextEditingController();
  final TextEditingController _loginPasswordController = TextEditingController();

  final TextEditingController _regNameController = TextEditingController();
  final TextEditingController _regPhoneController = TextEditingController();
  final TextEditingController _regEmailController = TextEditingController();
  final TextEditingController _regPasswordController = TextEditingController();
  final TextEditingController _regConfirmController = TextEditingController();

  final FocusNode _regNameFocus = FocusNode();

  @override
  void initState() {
    super.initState();
    if (widget.initialProfile.phone.isNotEmpty) {
      _loginIdController.text = widget.initialProfile.phone;
    }
  }

  @override
  void dispose() {
    _loginIdController.dispose();
    _loginPasswordController.dispose();
    _regNameController.dispose();
    _regPhoneController.dispose();
    _regEmailController.dispose();
    _regPasswordController.dispose();
    _regConfirmController.dispose();
    _regNameFocus.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    FocusScope.of(context).unfocus();
    final cubit = context.read<AuthCubit>();

    if (cubit.state.isRegister) {
      cubit.register(
        name: _regNameController.text,
        phone: _regPhoneController.text,
        email: _regEmailController.text,
        password: _regPasswordController.text,
        confirmPassword: _regConfirmController.text,
      );
    } else {
      cubit.login(
        identifier: _loginIdController.text,
        password: _loginPasswordController.text,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthCubit, AuthState>(
      listener: (context, state) {
        if (state.isAuthenticated && state.user != null) {
          widget.onAuthSuccess(UserProfile(
            name: state.user!.name,
            phone: state.user!.phone,
            email: state.user!.email,
            avatarIndex: 0,
            upiId: '',
            bankAccount: '',
            address: '',
          ));
        } else if (state.isFailure && state.errorMessage != null) {
          ScaffoldMessenger.of(context).hideCurrentSnackBar();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                state.errorMessage!,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              backgroundColor: const Color(0xFFDC2626),
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      },
      builder: (context, state) {
        final cubit = context.read<AuthCubit>();

        return Scaffold(
          backgroundColor: const Color(0xFF0F172A),
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Column(
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF7C3AED), Color(0xFF4F46E5), Color(0xFF2563EB)],
                              begin: Alignment.bottomLeft,
                              end: Alignment.topRight,
                            ),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF7C3AED).withValues(alpha: 0.4),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: const Center(
                            child: Icon(Icons.camera_alt_rounded, color: Colors.white, size: 32),
                          ),
                        ),
                        const SizedBox(height: 12),
                        RichText(
                          text: const TextSpan(
                            children: [
                              TextSpan(
                                text: 'CAM',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 28, letterSpacing: -0.5),
                              ),
                              TextSpan(
                                text: 'SIK',
                                style: TextStyle(
                                  color: Color(0xFF818CF8),
                                  fontWeight: FontWeight.w900,
                                  fontSize: 28,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Text(
                          "India's #1 Camera & Tech ReCommerce Platform",
                          style: TextStyle(color: Colors.white54, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Segmented Mode Selector (Driven by BLoC state)
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: state.isLoading ? null : () => cubit.switchMode(false),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: !state.isRegister ? const Color(0xFF059669) : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(
                                  'Sign In',
                                  style: TextStyle(
                                    color: !state.isRegister ? Colors.white : Colors.white60,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: state.isLoading ? null : () {
                              cubit.switchMode(true);
                              Future.delayed(const Duration(milliseconds: 150), () {
                                if (mounted) _regNameFocus.requestFocus();
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: state.isRegister ? const Color(0xFF059669) : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Center(
                                child: Text(
                                  'Create Account',
                                  style: TextStyle(
                                    color: state.isRegister ? Colors.white : Colors.white60,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  Text(
                    state.isRegister ? 'Create Camsik Account' : 'Welcome to Camsik',
                    style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    state.isRegister
                        ? 'Enter your details to start buying, selling & exchanging.'
                        : 'Sign in with your phone or email to access your orders.',
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                  ),
                  const SizedBox(height: 24),

                  if (state.isRegister) ...[
                    // Registration Form
                    AuthInputField(
                      label: 'Full Name',
                      controller: _regNameController,
                      focusNode: _regNameFocus,
                      icon: Icons.person_outline,
                      hint: 'Enter your full name',
                      keyboardType: TextInputType.name,
                      textCapitalization: TextCapitalization.words,
                    ),
                    const SizedBox(height: 16),
                    AuthInputField(
                      label: 'Mobile Number',
                      controller: _regPhoneController,
                      icon: Icons.phone_android,
                      hint: '10-digit mobile number',
                      keyboardType: TextInputType.phone,
                      maxLength: 10,
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(10),
                      ],
                    ),
                    const SizedBox(height: 16),
                    AuthInputField(
                      label: 'Email Address',
                      controller: _regEmailController,
                      icon: Icons.email_outlined,
                      hint: 'Enter your email address',
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    AuthInputField(
                      label: 'Password',
                      controller: _regPasswordController,
                      icon: Icons.lock_outline,
                      hint: 'Create password (min 6 characters)',
                      isPassword: true,
                      obscureText: state.obscureRegPassword,
                      onToggleVisibility: cubit.toggleRegPasswordVisibility,
                    ),
                    const SizedBox(height: 16),
                    AuthInputField(
                      label: 'Confirm Password',
                      controller: _regConfirmController,
                      icon: Icons.lock_clock_outlined,
                      hint: 'Re-enter your password',
                      isPassword: true,
                      obscureText: state.obscureRegConfirm,
                      onToggleVisibility: cubit.toggleRegConfirmVisibility,
                    ),
                  ] else ...[
                    // Login Form
                    AuthInputField(
                      label: 'Mobile Number or Email',
                      controller: _loginIdController,
                      icon: Icons.person_outline,
                      hint: 'Enter 10-digit phone or email',
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    AuthInputField(
                      label: 'Password',
                      controller: _loginPasswordController,
                      icon: Icons.lock_outline,
                      hint: 'Enter your password',
                      isPassword: true,
                      obscureText: state.obscureLoginPassword,
                      onToggleVisibility: cubit.toggleLoginPasswordVisibility,
                    ),
                  ],

                  const SizedBox(height: 28),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF059669),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 4,
                      ),
                      onPressed: state.isLoading ? null : _handleSubmit,
                      child: state.isLoading
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
                            )
                          : Text(
                              state.isRegister ? 'Create Account & Continue' : 'Sign In to Camsik',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Center(
                    child: TextButton(
                      onPressed: state.isLoading ? null : () => cubit.switchMode(!state.isRegister),
                      child: RichText(
                        text: TextSpan(
                          text: state.isRegister ? 'Already have an account? ' : "Don't have an account? ",
                          style: const TextStyle(color: Colors.white60, fontSize: 13),
                          children: [
                            TextSpan(
                              text: state.isRegister ? 'Sign In' : 'Create One Now',
                              style: const TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold),
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
    );
  }
}
