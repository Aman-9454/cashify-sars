import 'package:flutter/material.dart';
import '../../core/constants/api_constants.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/session_service.dart';
import '../fleet/admin_fleet_screen.dart';
import '../partners/admin_partners_screen.dart';
import '../profile/admin_profile_screen.dart';
import 'screens/admin_coupons_screen.dart';
import 'screens/admin_customers_screen.dart';
import 'screens/admin_diagnostic_questions_screen.dart';
import 'screens/admin_payouts_screen.dart';
import 'screens/admin_pincodes_screen.dart';
import 'screens/admin_push_notifications_screen.dart';
import 'screens/admin_server_settings_screen.dart';
import 'screens/admin_support_tickets_screen.dart';

class AdminOperationsHubScreen extends StatelessWidget {
  const AdminOperationsHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = SessionService.currentUser;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Admin Identity Hero Banner
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 12, offset: const Offset(0, 4)),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.25),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.primary, width: 2),
                    ),
                    child: const Icon(Icons.shield_rounded, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user?.name ?? 'Super Administrator',
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Colors.white),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?.email ?? 'admin@camsik.com',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('FULL SYSTEM ACCESS', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Active Server Status Ribbon
            InkWell(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminServerSettingsScreen()));
              },
              borderRadius: BorderRadius.circular(14),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 10,
                      height: 10,
                      decoration: const BoxDecoration(color: AppColors.success, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Active Target Server', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                          Text(ApiConstants.serverUrl, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                        ],
                      ),
                    ),
                    const Text('Change', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary)),
                    const Icon(Icons.chevron_right, size: 18, color: AppColors.primary),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'PEOPLE & FIELD LOGISTICS',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 10),

            _buildHubTile(
              context,
              icon: Icons.storefront_rounded,
              iconColor: AppColors.primary,
              title: 'Partner Stores Network',
              subtitle: 'Manage partner store hubs, KYC verification & commissions',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const Scaffold(body: AdminPartnersScreen()))),
            ),
            const SizedBox(height: 10),

            _buildHubTile(
              context,
              icon: Icons.two_wheeler_rounded,
              iconColor: AppColors.warning,
              title: 'Delivery Fleet Logistics',
              subtitle: 'Field executive riders, active duty status & dispatch assignments',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const Scaffold(body: AdminFleetScreen()))),
            ),
            const SizedBox(height: 10),

            _buildHubTile(
              context,
              icon: Icons.people_alt_rounded,
              iconColor: const Color(0xFF6366F1),
              title: 'Customer Directory',
              subtitle: 'Registered buyers and sellers, order volume & contact links',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminCustomersScreen())),
            ),
            const SizedBox(height: 24),

            const Text(
              'FINANCE & LOGISTICS CONTROL',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 10),

            _buildHubTile(
              context,
              icon: Icons.account_balance_wallet_rounded,
              iconColor: AppColors.success,
              title: 'Wallet & Payouts',
              subtitle: 'Review & approve partner & rider payout withdrawals',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminPayoutsScreen())),
            ),
            const SizedBox(height: 10),

            _buildHubTile(
              context,
              icon: Icons.percent_rounded,
              iconColor: const Color(0xFFEC4899),
              title: 'Coupons & Promo Offers',
              subtitle: 'Create promotional discount codes & manage active vouchers',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminCouponsScreen())),
            ),
            const SizedBox(height: 10),

            _buildHubTile(
              context,
              icon: Icons.pin_drop_rounded,
              iconColor: const Color(0xFF0EA5E9),
              title: 'Serviceable Pincodes',
              subtitle: 'Add or remove serviceable doorstep delivery pin zones',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminPincodesScreen())),
            ),
            const SizedBox(height: 10),

            _buildHubTile(
              context,
              icon: Icons.psychology_alt_rounded,
              iconColor: const Color(0xFF6366F1),
              title: 'Pricing & Diagnostic Questions',
              subtitle: 'Diagnostic condition questions, options & valuation deduction rules',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminDiagnosticQuestionsScreen())),
            ),
            const SizedBox(height: 24),

            const Text(
              'SUPPORT & BROADCAST TOOLS',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 10),

            _buildHubTile(
              context,
              icon: Icons.support_agent_rounded,
              iconColor: const Color(0xFFF97316),
              title: 'Support Tickets',
              subtitle: 'Customer & partner support tickets, resolutions & chat replies',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminSupportTicketsScreen())),
            ),
            const SizedBox(height: 10),

            _buildHubTile(
              context,
              icon: Icons.campaign_rounded,
              iconColor: const Color(0xFF8B5CF6),
              title: 'Push Notifications',
              subtitle: 'Broadcast alerts to Customers, Partners, or Delivery riders',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminPushNotificationsScreen())),
            ),
            const SizedBox(height: 10),

            _buildHubTile(
              context,
              icon: Icons.settings_rounded,
              iconColor: const Color(0xFF64748B),
              title: 'System & Admin Profile',
              subtitle: 'Security credentials, platform configuration & logout',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => Scaffold(body: AdminProfileScreen(user: user)))),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildHubTile(
    BuildContext context, {
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2)),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: iconColor, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}
