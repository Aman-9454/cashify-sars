import 'package:flutter/material.dart';
import '../../../models/user_order.dart';

class ExchangeConfirmedStep extends StatelessWidget {
  final UserOrder? confirmedOrder;
  final String selectedDate;
  final String selectedSlot;
  final VoidCallback onExchangeAnother;

  const ExchangeConfirmedStep({
    super.key,
    required this.confirmedOrder,
    required this.selectedDate,
    required this.selectedSlot,
    required this.onExchangeAnother,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 20),
          Container(
            width: 80,
            height: 80,
            decoration: const BoxDecoration(
              color: Color(0xFFDCFCE7),
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Icon(Icons.check_circle_rounded,
                  color: Color(0xFF059669), size: 52),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            '1-Step Exchange Booked!',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Your doorstep swap has been scheduled successfully.',
            style: TextStyle(color: Color(0xFF64748B), fontSize: 13),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),

          // Verification OTP Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Order Number:',
                        style:
                            TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    Text(
                      confirmedOrder?.orderNumber ?? 'CSM-EXC-94821',
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ],
                ),
                const Divider(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Doorstep Handover OTP:',
                        style:
                            TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEDE9FE),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        confirmedOrder?.otp ?? '8921',
                        style: const TextStyle(
                          color: Color(0xFF7C3AED),
                          fontWeight: FontWeight.w900,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Scheduled Slot:',
                        style:
                            TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    Text(
                      '$selectedDate ($selectedSlot)',
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),

          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF059669),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              onPressed: onExchangeAnother,
              child: const Text('Exchange Another Device',
                  style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}
