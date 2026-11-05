import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';

class HowItWorksSection extends StatelessWidget {
  const HowItWorksSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'How Camsik ReCommerce Works',
            style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
          ),
          const SizedBox(height: 12),
          _buildStepCard(
            step: '01',
            title: 'Instant 60-Sec AI Valuation',
            desc: 'Select your device model, answer category-specific condition questions and get a guaranteed quote.',
            icon: Icons.speed,
            color: const Color(0xFF059669),
          ),
          const SizedBox(height: 8),
          _buildStepCard(
            step: '02',
            title: 'Free Doorstep Verification',
            desc: 'A verified Camsik camera technician visits your doorstep at your scheduled slot in 200+ cities.',
            icon: Icons.doorbell_outlined,
            color: const Color(0xFF4F46E5),
          ),
          const SizedBox(height: 8),
          _buildStepCard(
            step: '03',
            title: 'Instant Spot UPI Transfer',
            desc: 'Full payout credited directly to your bank account or UPI ID before the device leaves your hands.',
            icon: Icons.account_balance_wallet_outlined,
            color: const Color(0xFF7C3AED),
          ),
        ],
      ),
    );
  }

  Widget _buildStepCard({
    required String step,
    required String title,
    required String desc,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(child: Icon(icon, color: color, size: 18)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: 'STEP $step $kBullet ',
                        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                      TextSpan(
                        text: title,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Text(desc, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
