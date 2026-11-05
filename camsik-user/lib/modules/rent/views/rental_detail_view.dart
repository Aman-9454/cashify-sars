import 'package:flutter/material.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../widgets/camsik_smart_image.dart';

class RentalDetailView extends StatefulWidget {
  final Map<String, dynamic> camera;
  final int initialRentalDays;
  final VoidCallback onBack;
  final Function(int days, Map<String, dynamic> calc) onProceedToCheckout;

  const RentalDetailView({
    super.key,
    required this.camera,
    required this.initialRentalDays,
    required this.onBack,
    required this.onProceedToCheckout,
  });

  @override
  State<RentalDetailView> createState() => _RentalDetailViewState();
}

class _RentalDetailViewState extends State<RentalDetailView> {
  late int _rentalDays;

  @override
  void initState() {
    super.initState();
    _rentalDays = widget.initialRentalDays;
  }

  Map<String, dynamic> _calculatePrice(int dailyRate, int days, int deposit) {
    final validDays = days < 1 ? 1 : days;
    final basePrice = dailyRate * validDays;
    int discountPercent = 0;
    if (validDays >= 30) {
      discountPercent = 30;
    } else if (validDays >= 14) {
      discountPercent = 20;
    } else if (validDays >= 7) {
      discountPercent = 15;
    } else if (validDays >= 3) {
      discountPercent = 10;
    }
    final discountAmount = ((basePrice * discountPercent) / 100).round();
    final subtotal = basePrice - discountAmount;
    final grandTotal = subtotal + deposit;
    return {
      'basePrice': basePrice,
      'discountPercent': discountPercent,
      'discountAmount': discountAmount,
      'subtotal': subtotal,
      'deposit': deposit,
      'grandTotal': grandTotal,
    };
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.camera;
    final name = c['model'] as String? ?? 'Camera';
    final brand = c['brand'] as String? ?? 'Sony';
    final category = c['category'] as String? ?? 'Cinema';
    final dailyPrice = (c['dailyPrice'] as num?)?.toInt() ?? 0;
    final deposit = (c['securityDeposit'] as num?)?.toInt() ?? 0;
    final rating = (c['rating'] as num?)?.toDouble() ?? 4.9;
    final reviews = (c['reviewsCount'] as num?)?.toInt() ?? 80;
    final sensor = c['sensor'] as String? ?? '';
    final mount = c['mount'] as String? ?? '';
    final gallery = (c['gallery'] as List?)?.map((e) => e.toString()).toList() ?? [c['image']?.toString() ?? 'assets/images/categories/dslr.png'];
    final includedKit = (c['includedKit'] as List?)?.map((e) => e.toString()).toList() ?? [
      'Camera Body with Sensor Cap',
      '2x High Capacity Batteries',
      'Dual-Bay Rapid Charger',
      'High Speed Memory Card',
      'Weatherproof Padded Hard Case',
    ];

    final calc = _calculatePrice(dailyPrice, _rentalDays, deposit);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 1,
        title: Text(name, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBack,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Gallery PageView
            SizedBox(
              height: 210,
              child: PageView.builder(
                itemCount: gallery.length,
                itemBuilder: (ctx, idx) => Center(
                  child: CamsikSmartImage(
                    image: gallery[idx],
                    fit: BoxFit.contain,
                    iconSize: 64,
                    iconColor: const Color(0xFFE11D48),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Category & Rating Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFE4E6),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    category.toUpperCase(),
                    style: const TextStyle(color: Color(0xFFE11D48), fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
                Row(
                  children: [
                    const Icon(Icons.star, color: Color(0xFFF59E0B), size: 16),
                    const SizedBox(width: 4),
                    Text('$rating', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    Text(' ($reviews reviews)', style: const TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Camera Title
            Text(
              name,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 4),
            Text(
              '$brand · $mount · $sensor',
              style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
            ),
            const SizedBox(height: 12),

            // Base Daily Rate Badge
            Row(
              children: [
                Text(
                  formatCurrency(dailyPrice),
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFFE11D48)),
                ),
                const Text(
                  ' / day',
                  style: TextStyle(color: Color(0xFF64748B), fontSize: 14, fontWeight: FontWeight.w600),
                ),
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'Deposit: ${formatCurrency(deposit)}',
                    style: const TextStyle(color: Color(0xFF475569), fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // ── DURATION SELECTOR & PRICE MULTIPLIER ──
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF1F2).withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFFECDD3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Select Rental Duration',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE11D48),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '$_rentalDays ${_rentalDays == 1 ? "Day" : "Days"} Selected',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Stepper row [-] Days [+]
                  Row(
                    children: [
                      IconButton(
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white,
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                        icon: const Icon(Icons.remove, size: 18),
                        onPressed: _rentalDays > 1 ? () => setState(() => _rentalDays--) : null,
                      ),
                      Expanded(
                        child: Center(
                          child: Text(
                            '$_rentalDays ${_rentalDays == 1 ? "Day" : "Days"}',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                          ),
                        ),
                      ),
                      IconButton(
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white,
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                        icon: const Icon(Icons.add, size: 18),
                        onPressed: () => setState(() => _rentalDays++),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Quick duration chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildDurationChip(1, '1 Day'),
                        _buildDurationChip(3, '3 Days (10% Off)'),
                        _buildDurationChip(7, '7 Days (15% Off)'),
                        _buildDurationChip(14, '14 Days (20% Off)'),
                        _buildDurationChip(30, '30 Days (30% Off)'),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),
                  const Divider(color: Color(0xFFFECDD3), height: 1),
                  const SizedBox(height: 14),

                  // Live Multiplication Breakdown
                  const Text('Price Calculation Breakdown:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF475569))),
                  const SizedBox(height: 8),
                  _buildCalcRow('Per Day Price', formatCurrency(dailyPrice)),
                  _buildCalcRow('Rental Duration', '$_rentalDays ${_rentalDays == 1 ? "Day" : "Days"}'),
                  _buildCalcRow('Multiplication (${formatCurrency(dailyPrice)} × $_rentalDays)', formatCurrency(calc['basePrice']), isHighlight: true),
                  if (calc['discountPercent'] > 0)
                    _buildCalcRow('Multi-Day Discount (${calc['discountPercent']}%)', '-${formatCurrency(calc['discountAmount'])}', isDiscount: true),
                  _buildCalcRow('Equipment Rental Subtotal', formatCurrency(calc['subtotal'])),
                  _buildCalcRow('Refundable Security Deposit', '+${formatCurrency(deposit)}', isDeposit: true),
                  const SizedBox(height: 8),
                  const Divider(color: Color(0xFFFECDD3), height: 1),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Total Price Payable', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF0F172A))),
                          Text('(Deposit refunded on return)', style: TextStyle(fontSize: 10, color: Color(0xFF059669), fontWeight: FontWeight.bold)),
                        ],
                      ),
                      Text(
                        formatCurrency(calc['grandTotal']),
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: Color(0xFFE11D48)),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Kit Included Checklist
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.inventory_2_outlined, color: Color(0xFF0F172A), size: 16),
                      SizedBox(width: 8),
                      Text('Complete Pro Production Kit Included:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ...includedKit.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.check_circle, color: Color(0xFF059669), size: 15),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(item, style: const TextStyle(fontSize: 12, color: Color(0xFF334155))),
                        ),
                      ],
                    ),
                  )),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Rental Security & Guarantee
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.verified_user_outlined, color: Color(0xFF059669), size: 16),
                      SizedBox(width: 8),
                      Text('Camsik Rental Assurance', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF065F46))),
                    ],
                  ),
                  SizedBox(height: 6),
                  Text('✓ Free doorstep delivery & return pickup\n✓ Sensor cleaned & optical bench calibrated before handover\n✓ 100% Refundable security deposit returned via UPI on return\n✓ 24/7 on-call technical shoot support',
                    style: TextStyle(fontSize: 11, color: Color(0xFF166534), height: 1.4),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Book Now CTA
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFE11D48),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 4,
                ),
                onPressed: () => widget.onProceedToCheckout(_rentalDays, calc),
                child: Text('Proceed to Checkout · ${formatCurrency(calc["grandTotal"])}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDurationChip(int days, String label) {
    final isSel = _rentalDays == days;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: ChoiceChip(
        label: Text(label),
        selected: isSel,
        onSelected: (s) => setState(() => _rentalDays = days),
        selectedColor: const Color(0xFFE11D48),
        labelStyle: TextStyle(
          color: isSel ? Colors.white : const Color(0xFF0F172A),
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildCalcRow(String label, String value, {bool isHighlight = false, bool isDiscount = false, bool isDeposit = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 11, color: isHighlight ? const Color(0xFF0F172A) : const Color(0xFF64748B), fontWeight: isHighlight ? FontWeight.bold : FontWeight.normal)),
          Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isHighlight ? FontWeight.w900 : FontWeight.bold,
              color: isDiscount ? const Color(0xFF059669) : isDeposit ? const Color(0xFF4F46E5) : const Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }
}
