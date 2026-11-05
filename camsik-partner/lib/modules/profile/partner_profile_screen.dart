import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sizer/sizer.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/routes/app_routes.dart';
import '../../models/partner_models.dart';
import 'bloc/profile_cubit.dart';
import 'bloc/profile_state.dart';

class PartnerProfileScreen extends StatelessWidget {
  final PartnerUser? user;

  const PartnerProfileScreen({super.key, this.user});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ProfileCubit()..loadProfile(),
      child: _ProfileView(initialUser: user),
    );
  }
}

class _ProfileView extends StatelessWidget {
  final PartnerUser? initialUser;

  const _ProfileView({this.initialUser});

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.logout_rounded, color: AppColors.error, size: 22),
            SizedBox(width: 2.w),
            Text(
              'Sign Out',
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF0F172A),
              ),
            ),
          ],
        ),
        content: Text(
          'Are you sure you want to log out of your Camsik Partner portal session?',
          style: TextStyle(
            fontSize: 15.sp,
            color: const Color(0xFF64748B),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Cancel',
              style: TextStyle(
                color: const Color(0xFF64748B),
                fontSize: 15.sp,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<ProfileCubit>().logout();
              if (context.mounted) {
                Navigator.of(context).pushNamedAndRemoveUntil(
                  AppRoutes.login,
                  (route) => false,
                );
              }
            },
            child: Text(
              'Confirm Log Out',
              style: TextStyle(
                fontSize: 14.5.sp,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ProfileCubit, ProfileState>(
      builder: (context, state) {
        PartnerUser? activeUser;
        if (state is ProfileLoaded) {
          activeUser = state.user ?? initialUser;
        } else {
          activeUser = initialUser;
        }

        return ListView(
          padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
          children: [
            // Store Identity Hero Card
            Container(
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 3.h),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    width: 18.w > 72 ? 72 : 18.w,
                    height: 18.w > 72 ? 72 : 18.w,
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.3),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.storefront_rounded,
                      size: 34,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 1.5.h),
                  Text(
                    activeUser?.storeName ?? 'Tech Store Hub',
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 17.sp,
                      color: const Color(0xFF0F172A),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 0.3.h),
                  Text(
                    activeUser?.name ?? 'Partner Owner',
                    style: TextStyle(
                      color: const Color(0xFF64748B),
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  SizedBox(height: 1.2.h),
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 3.w,
                      vertical: 0.6.h,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFA7F3D0)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.verified_rounded,
                          size: 16,
                          color: Color(0xFF059669),
                        ),
                        SizedBox(width: 1.5.w),
                        Text(
                          'Verified Camsik Partner Hub',
                          style: TextStyle(
                            color: const Color(0xFF059669),
                            fontSize: 14.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: 2.h),

            // Contact & Location Card
            _buildInfoCard(
              'Contact & Registered Location',
              Icons.location_on_outlined,
              [
                _buildInfoRow(
                  'Phone',
                  activeUser?.phone.isNotEmpty == true
                      ? activeUser!.phone
                      : 'Not provided',
                ),
                _buildInfoRow(
                  'Email',
                  activeUser?.email.isNotEmpty == true
                      ? activeUser!.email
                      : 'partner@camsik.com',
                ),
                _buildInfoRow(
                  'City & State',
                  '${activeUser?.city.isNotEmpty == true ? activeUser!.city : "All Hubs"}, ${activeUser?.state.isNotEmpty == true ? activeUser!.state : "India"}',
                ),
              ],
            ),

            SizedBox(height: 1.5.h),

            // Operating Parameters
            _buildInfoCard(
              'Operating Parameters',
              Icons.tune_rounded,
              [
                _buildInfoRow(
                  'Commission Rate',
                  '${activeUser?.commission ?? 5.0}% per unit liquidated',
                ),
                _buildInfoRow(
                  'Store Rating',
                  '★ ${activeUser?.rating ?? 4.9} / 5.0 (Top Merchant)',
                ),
                _buildInfoRow(
                  'Operating Pin Codes',
                  activeUser?.pinCodes.isNotEmpty == true
                      ? activeUser!.pinCodes.join(', ')
                      : 'All Serviced Hubs',
                ),
              ],
            ),

            SizedBox(height: 1.5.h),

            // Bank & Settlement Account
            _buildInfoCard(
              'Settlement Bank Account',
              Icons.account_balance_rounded,
              [
                _buildInfoRow(
                  'Bank Name',
                  activeUser?.bankName.isNotEmpty == true
                      ? activeUser!.bankName
                      : 'HDFC Bank',
                ),
                _buildInfoRow(
                  'Account Number',
                  activeUser?.accountNumber.isNotEmpty == true
                      ? activeUser!.accountNumber
                      : '•••• 4892',
                ),
                _buildInfoRow(
                  'IFSC Code',
                  activeUser?.ifscCode.isNotEmpty == true
                      ? activeUser!.ifscCode
                      : 'HDFC0001234',
                ),
                _buildInfoRow(
                  'Verification Status',
                  activeUser?.isBankVerified == true
                      ? 'Verified Merchant (IMPS)'
                      : 'Verification Pending',
                ),
              ],
            ),

            SizedBox(height: 1.5.h),

            // Legal & Data Protection Card
            Container(
              padding: EdgeInsets.all(4.w),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.shield_outlined,
                        size: 18,
                        color: Color(0xFF64748B),
                      ),
                      SizedBox(width: 2.w),
                      Text(
                        'Legal & Data Protection',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15.sp,
                          color: const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 1.2.h),
                  InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () async {
                      final url = Uri.parse(
                        'https://casmik-one.vercel.app/partner/privacy',
                      );
                      try {
                        await launchUrl(
                          url,
                          mode: LaunchMode.externalApplication,
                        );
                      } catch (_) {}
                    },
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 0.8.h),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.privacy_tip_outlined,
                              size: 20,
                              color: AppColors.primary,
                            ),
                          ),
                          SizedBox(width: 3.w),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Partner Privacy Policy',
                                  style: TextStyle(
                                    fontSize: 15.sp,
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFF0F172A),
                                  ),
                                ),
                                SizedBox(height: 0.2.h),
                                Text(
                                  'DPDP Act 2023 & B2B Data Confidentiality',
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    color: const Color(0xFF64748B),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(
                            Icons.arrow_forward_ios_rounded,
                            size: 14,
                            color: Color(0xFF94A3B8),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: 3.h),

            // Logout Button
            Container(
              height: 50,
              decoration: BoxDecoration(
                color: const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFECACA)),
              ),
              child: InkWell(
                onTap: () => _confirmLogout(context),
                borderRadius: BorderRadius.circular(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.logout_rounded,
                      size: 20,
                      color: AppColors.error,
                    ),
                    SizedBox(width: 2.w),
                    Text(
                      'Sign Out from Partner App',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 15.sp,
                        color: AppColors.error,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 2.h),
          ],
        );
      },
    );
  }

  Widget _buildInfoCard(String title, IconData icon, List<Widget> children) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: const Color(0xFF64748B)),
              SizedBox(width: 2.w),
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 15.sp,
                  color: const Color(0xFF64748B),
                ),
              ),
            ],
          ),
          SizedBox(height: 1.5.h),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 1.2.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 14.sp,
              color: const Color(0xFF64748B),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14.5.sp,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }
}
