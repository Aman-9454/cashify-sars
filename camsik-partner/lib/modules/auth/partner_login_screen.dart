import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sizer/sizer.dart';
import '../../core/constants/app_colors.dart';
import '../../core/routes/app_routes.dart';
import 'bloc/auth_cubit.dart';
import 'bloc/auth_state.dart';

class PartnerLoginScreen extends StatefulWidget {
  const PartnerLoginScreen({super.key});

  @override
  State<PartnerLoginScreen> createState() => _PartnerLoginScreenState();
}

class _PartnerLoginScreenState extends State<PartnerLoginScreen> {
  final _identifierController = TextEditingController(text: 'partner@camsik.com');
  final _passwordController = TextEditingController(text: 'partner123');
  bool _obscurePassword = true;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onLoginPressed(BuildContext context) {
    FocusScope.of(context).unfocus();
    context.read<AuthCubit>().login(
          identifier: _identifierController.text,
          password: _passwordController.text,
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
              // Subtle background ambient glow
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
                        AppColors.primary.withValues(alpha: 0.25),
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
                        const Color(0xFF6366F1).withValues(alpha: 0.18),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),

              Center(
                child: SingleChildScrollView(
                  padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 3.h),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 440),
                    child: BlocConsumer<AuthCubit, AuthState>(
                      listener: (context, state) {
                        if (state is AuthSuccess) {
                          Navigator.of(context).pushReplacementNamed(AppRoutes.mainNav);
                        } else if (state is AuthPendingApproval) {
                          Navigator.of(context).pushNamed(
                            AppRoutes.pendingApproval,
                            arguments: state.partnerData,
                          );
                        } else if (state is AuthFailure) {
                          ScaffoldMessenger.of(context).hideCurrentSnackBar();
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                state.error,
                                style: TextStyle(fontSize: 14.sp),
                              ),
                              backgroundColor: AppColors.error,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          );
                        }
                      },
                      builder: (context, state) {
                        final isLoading = state is AuthLoading;

                        return Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Brand Icon with glowing ring
                            Center(
                              child: Container(
                                width: 18.w > 76 ? 76 : 18.w,
                                height: 18.w > 76 ? 76 : 18.w,
                                decoration: BoxDecoration(
                                  gradient: AppColors.primaryGradient,
                                  borderRadius: BorderRadius.circular(22),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.primary.withValues(alpha: 0.45),
                                      blurRadius: 24,
                                      offset: const Offset(0, 8),
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  Icons.storefront_rounded,
                                  color: Colors.white,
                                  size: 10.w > 38 ? 38 : 10.w,
                                ),
                              ),
                            ),
                            SizedBox(height: 2.h),

                            Text(
                              'CAMSIK PARTNER',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 18.sp,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.5,
                              ),
                            ),
                            SizedBox(height: 0.8.h),
                            Text(
                              'Authorized Merchant & QA Hub Portal',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: const Color(0xFF94A3B8),
                                fontSize: 14.sp,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            SizedBox(height: 3.5.h),

                            // Main Login Card
                            Container(
                              padding: EdgeInsets.all(5.w > 24 ? 24 : 5.w),
                              decoration: BoxDecoration(
                                color: const Color(0xFF131B2E),
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.08),
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.35),
                                    blurRadius: 20,
                                    offset: const Offset(0, 10),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  if (state is AuthFailure) ...[
                                    Container(
                                      margin: EdgeInsets.only(bottom: 2.h),
                                      padding: EdgeInsets.all(3.w),
                                      decoration: BoxDecoration(
                                        color: AppColors.error.withValues(alpha: 0.12),
                                        border: Border.all(
                                          color: AppColors.error.withValues(alpha: 0.3),
                                        ),
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.error_outline_rounded,
                                              color: Color(0xFFF87171), size: 20),
                                          SizedBox(width: 2.5.w),
                                          Expanded(
                                            child: Text(
                                              state.error,
                                              style: TextStyle(
                                                color: const Color(0xFFF87171),
                                                fontSize: 14.sp,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],

                                  Text(
                                    'Registered Phone or Email',
                                    style: TextStyle(
                                      color: const Color(0xFFCBD5E1),
                                      fontSize: 14.5.sp,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  SizedBox(height: 1.h),
                                  TextField(
                                    controller: _identifierController,
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 15.sp,
                                    ),
                                    decoration: InputDecoration(
                                      filled: true,
                                      fillColor: const Color(0xFF0F172A),
                                      prefixIcon: const Icon(
                                        Icons.mail_outline_rounded,
                                        color: Color(0xFF64748B),
                                        size: 20,
                                      ),
                                      hintText: 'e.g. partner@camsik.com or 9876543210',
                                      hintStyle: TextStyle(
                                        color: Colors.white.withValues(alpha: 0.25),
                                        fontSize: 14.sp,
                                      ),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(14),
                                        borderSide: BorderSide(
                                          color: Colors.white.withValues(alpha: 0.08),
                                        ),
                                      ),
                                      enabledBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(14),
                                        borderSide: BorderSide(
                                          color: Colors.white.withValues(alpha: 0.08),
                                        ),
                                      ),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(14),
                                        borderSide: const BorderSide(
                                          color: AppColors.primary,
                                          width: 1.8,
                                        ),
                                      ),
                                      contentPadding: EdgeInsets.symmetric(
                                        horizontal: 4.w,
                                        vertical: 1.8.h,
                                      ),
                                    ),
                                  ),

                                  SizedBox(height: 2.2.h),

                                  Text(
                                    'Secure Password',
                                    style: TextStyle(
                                      color: const Color(0xFFCBD5E1),
                                      fontSize: 14.5.sp,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  SizedBox(height: 1.h),
                                  TextField(
                                    controller: _passwordController,
                                    obscureText: _obscurePassword,
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 15.sp,
                                    ),
                                    decoration: InputDecoration(
                                      filled: true,
                                      fillColor: const Color(0xFF0F172A),
                                      prefixIcon: const Icon(
                                        Icons.lock_outline_rounded,
                                        color: Color(0xFF64748B),
                                        size: 20,
                                      ),
                                      suffixIcon: IconButton(
                                        icon: Icon(
                                          _obscurePassword
                                              ? Icons.visibility_off_rounded
                                              : Icons.visibility_rounded,
                                          color: const Color(0xFF64748B),
                                          size: 20,
                                        ),
                                        onPressed: () => setState(
                                            () => _obscurePassword = !_obscurePassword),
                                      ),
                                      hintText: 'Enter password',
                                      hintStyle: TextStyle(
                                        color: Colors.white.withValues(alpha: 0.25),
                                        fontSize: 14.sp,
                                      ),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(14),
                                        borderSide: BorderSide(
                                          color: Colors.white.withValues(alpha: 0.08),
                                        ),
                                      ),
                                      enabledBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(14),
                                        borderSide: BorderSide(
                                          color: Colors.white.withValues(alpha: 0.08),
                                        ),
                                      ),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(14),
                                        borderSide: const BorderSide(
                                          color: AppColors.primary,
                                          width: 1.8,
                                        ),
                                      ),
                                      contentPadding: EdgeInsets.symmetric(
                                        horizontal: 4.w,
                                        vertical: 1.8.h,
                                      ),
                                    ),
                                  ),

                                  SizedBox(height: 3.h),

                                  // Submit button
                                  Container(
                                    height: 54,
                                    decoration: BoxDecoration(
                                      gradient: AppColors.primaryGradient,
                                      borderRadius: BorderRadius.circular(14),
                                      boxShadow: [
                                        BoxShadow(
                                          color: AppColors.primary.withValues(alpha: 0.35),
                                          blurRadius: 16,
                                          offset: const Offset(0, 6),
                                        ),
                                      ],
                                    ),
                                    child: ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.transparent,
                                        shadowColor: Colors.transparent,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(14),
                                        ),
                                      ),
                                      onPressed: isLoading
                                          ? null
                                          : () => _onLoginPressed(context),
                                      child: isLoading
                                          ? const SizedBox(
                                              width: 22,
                                              height: 22,
                                              child: CircularProgressIndicator(
                                                strokeWidth: 2.2,
                                                color: Colors.white,
                                              ),
                                            )
                                          : Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                const Icon(Icons.login_rounded, size: 20),
                                                SizedBox(width: 2.w),
                                                Flexible(
                                                  child: Text(
                                                    'Sign In to Partner Hub',
                                                    style: TextStyle(
                                                      fontSize: 14.5.sp,
                                                      fontWeight: FontWeight.bold,
                                                    ),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ),
                                              ],
                                            ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            SizedBox(height: 2.5.h),

                            // Demo Credentials Pill
                            Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 4.w,
                                vertical: 1.6.h,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.04),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.06),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(
                                        Icons.info_outline_rounded,
                                        color: Color(0xFF60A5FA),
                                        size: 16,
                                      ),
                                      SizedBox(width: 1.5.w),
                                      Text(
                                        'Verified Test Account',
                                        style: TextStyle(
                                          color: const Color(0xFF93C5FD),
                                          fontSize: 14.sp,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                  SizedBox(height: 0.8.h),
                                  Text(
                                    'Email: partner@camsik.com  •  Pass: partner123',
                                    style: TextStyle(
                                      color: const Color(0xFF94A3B8),
                                      fontSize: 14.sp,
                                    ),
                                  ),
                                  SizedBox(height: 0.8.h),
                                  InkWell(
                                    onTap: () {
                                      _identifierController.text = 'partner@camsik.com';
                                      _passwordController.text = 'partner123';
                                    },
                                    borderRadius: BorderRadius.circular(8),
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 2),
                                      child: Text(
                                        '⚡ Tap to auto-fill credentials',
                                        style: TextStyle(
                                          color: const Color(0xFF38BDF8),
                                          fontSize: 14.sp,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            SizedBox(height: 2.2.h),

                            // Register Partner Section
                            Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 4.w,
                                vertical: 1.8.h,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.08),
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(
                                  color: AppColors.primary.withValues(alpha: 0.22),
                                ),
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(7),
                                        decoration: BoxDecoration(
                                          color: AppColors.primary.withValues(alpha: 0.2),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(
                                          Icons.storefront_rounded,
                                          color: AppColors.primary,
                                          size: 18,
                                        ),
                                      ),
                                      SizedBox(width: 3.w),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'Want to become a Partner?',
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontSize: 14.5.sp,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            Text(
                                              'Register your store & earn liquidation margins',
                                              style: TextStyle(
                                                color: const Color(0xFF94A3B8),
                                                fontSize: 14.sp,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  SizedBox(height: 1.5.h),
                                  OutlinedButton.icon(
                                    onPressed: () {
                                      Navigator.of(context).pushNamed(AppRoutes.register);
                                    },
                                    icon: const Icon(Icons.app_registration_rounded, size: 18),
                                    label: Text(
                                      'Register as Partner Store',
                                      style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
                                    ),
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: AppColors.primary,
                                      side: const BorderSide(color: AppColors.primary, width: 1.2),
                                      minimumSize: const Size.fromHeight(44),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
