import 'package:flutter/material.dart';
import '../../models/user_order.dart';
import '../../models/user_profile.dart';
import 'screens/customer_support_screen.dart';
import 'screens/faq_screen.dart';
import 'screens/notifications_screen.dart';
import 'screens/payout_settings_screen.dart';
import 'screens/policy_details_screen.dart';
import 'screens/saved_addresses_screen.dart';
import 'screens/serviceable_cities_screen.dart';
import 'widgets/order_card_widget.dart';

class UserProfileWidget extends StatelessWidget {
  final UserProfile profile;
  final List<UserOrder> orders;
  final Function(UserProfile) onProfileUpdate;
  final VoidCallback onLogout;
  final VoidCallback onNavigateToSell;
  final VoidCallback onNavigateToBuy;
  final Future<void> Function()? onRefreshOrders;

  const UserProfileWidget({
    super.key,
    required this.profile,
    required this.orders,
    required this.onProfileUpdate,
    required this.onLogout,
    required this.onNavigateToSell,
    required this.onNavigateToBuy,
    this.onRefreshOrders,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefreshOrders ?? () async {},
      color: const Color(0xFF059669),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Header
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: const Color(0xFF059669),
                    child: Text(
                      profile.name.isNotEmpty
                          ? profile.name.substring(0, 1).toUpperCase()
                          : 'C',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          profile.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          profile.phone,
                          style: const TextStyle(
                            color: Color(0xFF34D399),
                            fontSize: 12,
                          ),
                        ),
                        Text(
                          profile.email,
                          style: const TextStyle(
                            color: Colors.white60,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // MY ORDERS SECTION
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'My Orders',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${orders.length} Active',
                      style: const TextStyle(
                        color: Color(0xFF059669),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                    if (onRefreshOrders != null) ...[
                      const SizedBox(width: 6),
                      InkWell(
                        onTap: onRefreshOrders,
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF059669).withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.refresh_rounded,
                            size: 14,
                            color: Color(0xFF059669),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),
            if (orders.isEmpty)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: const Center(
                  child: Column(
                    children: [
                      Icon(Icons.shopping_bag_outlined,
                          size: 40, color: Color(0xFF94A3B8)),
                      SizedBox(height: 8),
                      Text(
                        'No orders yet',
                        style: TextStyle(
                          color: Color(0xFF64748B),
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                      Text(
                        'Sell, buy, or exchange devices to see your orders here.',
                        style:
                            TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                      ),
                    ],
                  ),
                ),
              )
            else
              ...orders.map((o) => OrderCardWidget(order: o, onOrderUpdated: onRefreshOrders)),

          const SizedBox(height: 24),
          const Text(
            'Account & Support',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 10),
          _buildSettingsTile(
            context,
            icon: Icons.location_on_outlined,
            title: 'Saved Doorstep Addresses',
            subtitle: profile.address.isNotEmpty
                ? profile.address
                : 'Add pickup and delivery address',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (ctx) => SavedAddressesScreen(
                    profile: profile,
                    onAddressSelected: (selectedAddress) {
                      onProfileUpdate(profile.copyWith(address: selectedAddress));
                    },
                  ),
                ),
              );
            },
          ),
          _buildSettingsTile(
            context,
            icon: Icons.account_balance_wallet_outlined,
            title: 'Payout UPI & Bank Account',
            subtitle: profile.upiId.isNotEmpty
                ? profile.upiId
                : 'Configure instant bank / UPI payout',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (ctx) => PayoutSettingsScreen(
                    profile: profile,
                    onProfileUpdate: onProfileUpdate,
                  ),
                ),
              );
            },
          ),
          _buildSettingsTile(
            context,
            icon: Icons.location_city_outlined,
            title: 'Serviceable Cities & Pincodes',
            subtitle: 'Check instant doorstep pickup in your area',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (ctx) => const ServiceableCitiesScreen(),
                ),
              );
            },
          ),
          _buildSettingsTile(
            context,
            icon: Icons.notifications_none_outlined,
            title: 'Notifications & Alerts',
            subtitle: 'Offers, pickup updates & transaction alerts',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (ctx) => NotificationsScreen(phone: profile.phone),
                ),
              );
            },
          ),
          _buildSettingsTile(
            context,
            icon: Icons.help_outline_rounded,
            title: 'Frequently Asked Questions (FAQs)',
            subtitle: 'Device valuation, payout, pickup & warranty answers',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (ctx) => const FaqScreen(),
                ),
              );
            },
          ),
          _buildSettingsTile(
            context,
            icon: Icons.support_agent_outlined,
            title: 'Customer Support',
            subtitle: 'WhatsApp: +91 8976000010',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (ctx) => const CustomerSupportScreen(),
                ),
              );
            },
          ),
          _buildSettingsTile(
            context,
            icon: Icons.verified_outlined,
            title: 'Warranty & Data Protection Policy',
            subtitle: 'DoD 5220.22-M Wipe Certificate',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (ctx) => PolicyDetailsScreen.warranty(),
                ),
              );
            },
          ),
          _buildSettingsTile(
            context,
            icon: Icons.privacy_tip_outlined,
            title: 'Privacy Policy & Terms',
            subtitle: 'Camsik ReCommerce terms',
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (ctx) => PolicyDetailsScreen.privacyTerms(),
                ),
              );
            },
          ),

          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFFEF4444),
                side: const BorderSide(color: Color(0xFFEF4444)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              onPressed: onLogout,
              child: const Text(
                'Log Out of Camsik',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
      )
    );
  }

  Widget _buildSettingsTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              Icon(icon, color: const Color(0xFF059669), size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 11,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios,
                  size: 12, color: Color(0xFF94A3B8)),
            ],
          ),
        ),
      ),
    );
  }
}
