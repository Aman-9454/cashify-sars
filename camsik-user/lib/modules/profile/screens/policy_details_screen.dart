import 'package:flutter/material.dart';

class PolicyDetailsScreen extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color iconColor;
  final List<Map<String, String>> sections;

  const PolicyDetailsScreen({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconColor,
    required this.sections,
  });

  factory PolicyDetailsScreen.warranty() {
    return const PolicyDetailsScreen(
      title: 'Warranty & Data Protection Policy',
      subtitle: 'DoD 5220.22-M Certified Wipe & Warranty Terms',
      icon: Icons.verified_user_outlined,
      iconColor: Color(0xFF059669),
      sections: [
        {
          'title': 'DoD 5220.22-M Data Sanitization Standard',
          'body':
              'Every device sold, traded, or exchanged through Camsik undergoes certified 3-pass hardware sanitization in compliance with US Department of Defense DoD 5220.22-M specifications. All user partitions, NAND flash blocks, and cache sectors are permanently overwritten, making personal data 100% forensically unrecoverable.',
        },
        {
          'title': '45-Point Hardware Quality Assurance',
          'body':
              'All certified refurbished cameras, smartphones, lenses, and MacBooks are tested on 45 distinct diagnostic parameters including optical sensor alignment, shutter cycle count, lens autofocus motors, display touchscreen response, and battery health (guaranteed >= 85%).',
        },
        {
          'title': '6 to 12 Months Comprehensive Warranty',
          'body':
              'Purchased refurbished hardware is backed by our comprehensive warranty protecting against manufacturing defects, electronic faults, and sensor failure. Claiming warranty is seamless with doorstep inspection and free pickup.',
        },
        {
          'title': '7-Day Replacement Guarantee',
          'body':
              'If your refurbished camera or device fails to meet specifications or develops any functional glitch within 7 days of delivery, Camsik offers an immediate free replacement or full refund.',
        },
      ],
    );
  }

  factory PolicyDetailsScreen.privacyTerms() {
    return const PolicyDetailsScreen(
      title: 'Privacy Policy & Terms of Service',
      subtitle: 'Customer Rights, Data Confidentiality & Fair Trade',
      icon: Icons.shield_outlined,
      iconColor: Color(0xFF0284C7),
      sections: [
        {
          'title': 'Zero Data Retention Pledge',
          'body':
              'Camsik does not sell, license, or store sensitive customer credentials. Identification documents collected for doorstep device ownership verification are securely encrypted using SHA-256 and purged in accordance with Indian IT Act provisions.',
        },
        {
          'title': 'Accurate Device Ownership & Declaration',
          'body':
              'By booking a sell or exchange order, the customer affirms lawful sole ownership of the camera/device. Camsik cross-references serial and IMEI numbers with national equipment registers to ensure zero stolen or disputed inventory.',
        },
        {
          'title': 'Fair Doorstep Valuation Guarantee',
          'body':
              'Our AI valuation algorithms provide realistic market quotes based on device physical grade and functional optics. In the rare event of price revision during doorstep technical inspection, customers retain full freedom to decline with zero cancellation fee.',
        },
        {
          'title': 'Instant Electronic Payouts',
          'body':
              'Upon technical confirmation and agreement of device handover, payments are initiated instantly via IMPS / UPI transfer before the technician departs your doorstep.',
        },
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: Color(0xFF0F172A)),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Badge Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: iconColor.withValues(alpha: 0.15),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: iconColor.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(icon, color: iconColor, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 15,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          subtitle,
                          style: const TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 11.5,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Policy Sections
            ...sections.asMap().entries.map((entry) {
              final idx = entry.key + 1;
              final sec = entry.value;

              return Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.02),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 24,
                          height: 24,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: iconColor.withValues(alpha: 0.12),
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            '$idx',
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w900,
                              color: iconColor,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            sec['title'] ?? '',
                            style: const TextStyle(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      sec['body'] ?? '',
                      style: const TextStyle(
                        fontSize: 12.5,
                        color: Color(0xFF475569),
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              );
            }),

            const SizedBox(height: 16),

            // Security note
            Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.verified_rounded, size: 14, color: Color(0xFF059669)),
                    SizedBox(width: 6),
                    Text(
                      'Official Camsik ReCommerce Compliance Standard',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
