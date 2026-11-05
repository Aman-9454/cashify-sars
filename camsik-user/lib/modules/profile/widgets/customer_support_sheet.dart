import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

class CustomerSupportSheet extends StatelessWidget {
  const CustomerSupportSheet({super.key});

  static Future<void> show(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const CustomerSupportSheet(),
    );
  }

  Future<void> _launchOrCopy(BuildContext context, String urlString, String copyText, String label) async {
    try {
      final uri = Uri.parse(urlString);
      final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
      if (!launched) {
        throw Exception('Could not launch');
      }
    } catch (_) {
      await Clipboard.setData(ClipboardData(text: copyText));
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('$label copied to clipboard: $copyText'),
            backgroundColor: const Color(0xFF0F172A),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(20),
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
                  color: const Color(0xFF059669).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.support_agent, color: Color(0xFF059669), size: 24),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Camsik Customer Support',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    Text(
                      'Available 7 Days a week · 9:00 AM – 9:00 PM IST',
                      style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _buildActionCard(
            context,
            icon: Icons.chat_bubble_outline,
            iconColor: const Color(0xFF25D366),
            bgColor: const Color(0xFFE8F5E9),
            title: 'Chat on WhatsApp',
            subtitle: '+91 8976000010 (Instant response)',
            onTap: () => _launchOrCopy(
              context,
              'https://wa.me/918976000010?text=Hi%20Camsik%20Support,%20I%20need%20help%20with%20my%20order.',
              '+918976000010',
              'WhatsApp Number',
            ),
          ),
          const SizedBox(height: 10),
          _buildActionCard(
            context,
            icon: Icons.phone_in_talk_outlined,
            iconColor: const Color(0xFF4F46E5),
            bgColor: const Color(0xFFEEF2FF),
            title: 'Call Helpline',
            subtitle: '+91 8976000010 (Toll-Free Assistance)',
            onTap: () => _launchOrCopy(
              context,
              'tel:+918976000010',
              '+918976000010',
              'Helpline Number',
            ),
          ),
          const SizedBox(height: 10),
          _buildActionCard(
            context,
            icon: Icons.mail_outline,
            iconColor: const Color(0xFFE11D48),
            bgColor: const Color(0xFFFFE4E6),
            title: 'Email Support',
            subtitle: 'support@camsik.in',
            onTap: () => _launchOrCopy(
              context,
              'mailto:support@camsik.in?subject=Camsik%20App%20Support%20Request',
              'support@camsik.in',
              'Support Email',
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: const Row(
              children: [
                Icon(Icons.access_time, size: 16, color: Color(0xFF64748B)),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Average response time on WhatsApp is under 5 minutes during operational hours.',
                    style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: iconColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A))),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 12, color: Color(0xFF94A3B8)),
          ],
        ),
      ),
    );
  }
}
