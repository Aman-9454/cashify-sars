import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../../core/constants/api_constants.dart';
import '../../core/constants/app_colors.dart';
import '../../core/routes/app_routes.dart';
import '../../core/services/api_service.dart';
import '../../core/services/session_service.dart';
import '../../models/partner_models.dart';

class PartnerPendingApprovalScreen extends StatefulWidget {
  final Map<String, dynamic> partnerData;

  const PartnerPendingApprovalScreen({
    super.key,
    this.partnerData = const {},
  });

  @override
  State<PartnerPendingApprovalScreen> createState() => _PartnerPendingApprovalScreenState();
}

class _PartnerPendingApprovalScreenState extends State<PartnerPendingApprovalScreen> {
  bool _isChecking = false;

  Future<void> _checkApprovalStatus() async {
    setState(() => _isChecking = true);
    final partnerId = widget.partnerData['id']?.toString() ?? '';
    final phone = widget.partnerData['phone']?.toString() ?? '';
    final email = widget.partnerData['email']?.toString() ?? '';

    try {
      final res = await ApiService.dio.get(
        ApiConstants.partners,
        queryParameters: {
          if (partnerId.isNotEmpty) 'id': partnerId,
          if (phone.isNotEmpty) 'search': phone,
        },
      );

      final data = res.data;
      if (data != null && data['success'] == true) {
        final partners = data['partners'] as List?;
        if (partners != null && partners.isNotEmpty) {
          final matched = partners.firstWhere(
            (p) =>
                p['id'] == partnerId ||
                p['phone'] == phone ||
                (email.isNotEmpty && p['email'] == email),
            orElse: () => null,
          );

          if (matched != null && matched['status'] == 'active') {
            final partnerUser = PartnerUser.fromJson(Map<String, dynamic>.from(matched));
            await SessionService.saveSession(partnerUser);

            if (!mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  'Congratulations! Your account has been approved by Super Admin.',
                  style: TextStyle(fontSize: 14.sp, color: Colors.white),
                ),
                backgroundColor: AppColors.success,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            );

            Navigator.of(context).pushNamedAndRemoveUntil(
              AppRoutes.mainNav,
              (route) => false,
            );
            return;
          }
        }
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Application still under review. Super Admin will approve your account soon.',
            style: TextStyle(fontSize: 14.sp, color: Colors.white),
          ),
          backgroundColor: const Color(0xFFF59E0B),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Unable to reach server. Please check your internet connection and try again.',
            style: TextStyle(fontSize: 14.sp, color: Colors.white),
          ),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } finally {
      if (mounted) setState(() => _isChecking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final id = widget.partnerData['id']?.toString() ?? 'partner-pending';
    final storeName = widget.partnerData['storeName']?.toString() ?? 'Partner Store';
    final name = widget.partnerData['name']?.toString() ?? 'Partner';
    final phone = widget.partnerData['phone']?.toString() ?? '';
    final email = widget.partnerData['email']?.toString() ?? '';
    final city = widget.partnerData['city']?.toString() ?? 'Bengaluru';
    final state = widget.partnerData['state']?.toString() ?? 'Karnataka';

    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      body: SafeArea(
        child: Stack(
          children: [
            // Ambient glows
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
                      const Color(0xFFF59E0B).withValues(alpha: 0.18),
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
                      AppColors.primary.withValues(alpha: 0.16),
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
                  constraints: const BoxConstraints(maxWidth: 480),
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 5.5.w, vertical: 3.5.h),
                    decoration: BoxDecoration(
                      color: const Color(0xFF131A29),
                      borderRadius: BorderRadius.circular(28),
                      border: Border.all(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.35),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFF59E0B).withValues(alpha: 0.12),
                          blurRadius: 30,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Animated pulsing badge icon
                        Container(
                          width: 74,
                          height: 74,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: const Color(0xFFF59E0B).withValues(alpha: 0.45),
                            ),
                          ),
                          child: const Icon(
                            Icons.hourglass_top_rounded,
                            color: Color(0xFFF59E0B),
                            size: 38,
                          ),
                        ),
                        SizedBox(height: 2.h),

                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: const Color(0xFFF59E0B).withValues(alpha: 0.35),
                            ),
                          ),
                          child: Text(
                            'PENDING SUPER ADMIN APPROVAL',
                            style: TextStyle(
                              color: const Color(0xFFFBBF24),
                              fontSize: 14.sp,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.6,
                            ),
                          ),
                        ),
                        SizedBox(height: 1.6.h),

                        Text(
                          'Application Under Review',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 1.h),

                        Text(
                          'Hello $name, your partner registration for "$storeName" has been submitted. Camsik Super Admin is currently reviewing your store documents.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: const Color(0xFF94A3B8),
                            fontSize: 14.sp,
                            height: 1.4,
                          ),
                        ),
                        SizedBox(height: 2.5.h),

                        // Partner details summary card
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.8.h),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.03),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
                          ),
                          child: Column(
                            children: [
                              _buildDetailRow('Partner ID', id),
                              const Divider(color: Colors.white12, height: 16),
                              _buildDetailRow('Store Name', storeName),
                              const Divider(color: Colors.white12, height: 16),
                              if (phone.isNotEmpty) ...[
                                _buildDetailRow('Phone', phone),
                                const Divider(color: Colors.white12, height: 16),
                              ],
                              if (email.isNotEmpty) ...[
                                _buildDetailRow('Email', email),
                                const Divider(color: Colors.white12, height: 16),
                              ],
                              _buildDetailRow('Location', '$city, $state'),
                            ],
                          ),
                        ),
                        SizedBox(height: 2.h),

                        // Info Banner
                        Container(
                          padding: EdgeInsets.all(3.w),
                          decoration: BoxDecoration(
                            color: Colors.blue.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.blue.withValues(alpha: 0.2)),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.info_outline_rounded, color: Color(0xFF60A5FA), size: 18),
                              SizedBox(width: 2.5.w),
                              Expanded(
                                child: Text(
                                  'Verification usually completes within 24-48 business hours. Tap "Refresh Status" once approved to enter the portal.',
                                  style: TextStyle(
                                    color: const Color(0xFF93C5FD),
                                    fontSize: 14.sp,
                                    height: 1.4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: 3.h),

                        // Refresh Status Button
                        FilledButton.icon(
                          onPressed: _isChecking ? null : _checkApprovalStatus,
                          icon: _isChecking
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                  ),
                                )
                              : const Icon(Icons.refresh_rounded, size: 20),
                          label: Text(
                            _isChecking ? 'Checking Status...' : 'Refresh Status',
                            style: TextStyle(
                              fontSize: 15.sp,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            minimumSize: const Size.fromHeight(48),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                        ),
                        SizedBox(height: 1.5.h),

                        // Back to Sign In
                        OutlinedButton(
                          onPressed: () {
                            Navigator.of(context).pushNamedAndRemoveUntil(
                              AppRoutes.login,
                              (route) => false,
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF94A3B8),
                            side: BorderSide(color: Colors.white.withValues(alpha: 0.12)),
                            minimumSize: const Size.fromHeight(46),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: Text(
                            'Back to Partner Sign In',
                            style: TextStyle(
                              fontSize: 14.5.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(color: const Color(0xFF64748B), fontSize: 14.sp),
        ),
        Text(
          value,
          style: TextStyle(color: Colors.white, fontSize: 14.5.sp, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
