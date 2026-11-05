import 'package:flutter/material.dart';

class WhyCamsikSection extends StatelessWidget {
  const WhyCamsikSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Why 3.2 Lakh+ Sellers Trust Camsik',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 12),
            _buildWhyBullet('Guaranteed Best Market Price', 'AI pricing calculated from live nationwide second-hand market transactions.'),
            _buildWhyBullet('Zero Hidden Deductions', 'Transparent inspection criteria with objective condition grading.'),
            _buildWhyBullet('1-Step Doorstep Exchange', 'Seamlessly upgrade to certified refurbished devices with only net difference payable.'),
            _buildWhyBullet('Certified DoD Military Wipe', 'Permanent zero-recovery data erasure keeping your personal files 100% secure.'),
          ],
        ),
      ),
    );
  }

  Widget _buildWhyBullet(String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle, color: Color(0xFF059669), size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A))),
                Text(desc, style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
