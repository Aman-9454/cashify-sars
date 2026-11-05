import 'package:flutter/material.dart';

class PolicyDetailsSheet extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color iconColor;
  final List<Map<String, String>> sections;

  const PolicyDetailsSheet({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconColor,
    required this.sections,
  });

  static Future<void> showWarranty(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const PolicyDetailsSheet(
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
      ),
    );
  }

  static Future<void> showPrivacyTerms(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const PolicyDetailsSheet(
        title: 'Privacy Policy & Terms of Service',
        subtitle: 'Camsik ReCommerce Fair Practices & Legal Terms',
        icon: Icons.privacy_tip_outlined,
        iconColor: Color(0xFF4F46E5),
        sections: [
          {
            'title': 'ReCommerce Ownership & KYC Verification',
            'body':
                'To prevent illicit device trafficking, all sellers must furnish a valid government-issued photo identity proof (Aadhaar, Driving License, Voter ID, or Passport) alongside a digital signature confirming rightful device ownership.',
          },
          {
            'title': 'Transparent Valuation & Zero Deductions',
            'body':
                'Valuation quotes generated in the app are based on real-time market indices. Our doorstep camera technicians conduct objective physical inspection without arbitrary deductions. Payout is transferred instantly before device leaves your possession.',
          },
          {
            'title': 'Data Privacy & DPDP Act 2023 Compliance',
            'body':
                'Your personal details (phone number, address, payment accounts) are stored using AES-256 bank-grade encryption. We never sell, rent, or monetize your contact information with external marketing agencies or ad brokers.',
          },
          {
            'title': 'Governing Law & Dispute Resolution',
            'body':
                'These terms are governed by the laws of India and subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra.',
          },
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.only(top: 16, left: 20, right: 20, bottom: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: iconColor, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      subtitle,
                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
          const SizedBox(height: 12),
          Expanded(
            child: ListView.separated(
              itemCount: sections.length,
              separatorBuilder: (context, index) => const SizedBox(height: 14),
              itemBuilder: (ctx, idx) {
                final s = sections[idx];
                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.check_circle, size: 16, color: iconColor),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              s['title']!,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        s['body']!,
                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF475569), height: 1.45),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F172A),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text('Understood & Agree', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            ),
          ),
        ],
      ),
    );
  }
}
