import 'package:flutter/material.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../widgets/camsik_smart_image.dart';

class ExchangeProductDetailStep extends StatelessWidget {
  final Map<String, dynamic>? selectedNewDevice;
  final String selectedCondition;
  final int selectedUnitIndex;
  final int calculatedOldValue;
  final int exchangeBonus;
  final ValueChanged<String> onConditionChanged;
  final ValueChanged<int> onUnitSelected;
  final VoidCallback onProceedToCheckout;

  const ExchangeProductDetailStep({
    super.key,
    required this.selectedNewDevice,
    required this.selectedCondition,
    required this.selectedUnitIndex,
    required this.calculatedOldValue,
    required this.exchangeBonus,
    required this.onConditionChanged,
    required this.onUnitSelected,
    required this.onProceedToCheckout,
  });

  int _getAdjustedNewDevicePrice() {
    final basePrice =
        (selectedNewDevice?['sellingPrice'] as int?) ?? 70000;
    if (selectedCondition == 'Good') return (basePrice * 0.92).toInt();
    if (selectedCondition == 'Fair') return (basePrice * 0.85).toInt();
    return basePrice;
  }

  String _formatMetricLabel(String raw) {
    final lower = raw.toLowerCase().trim();
    if (lower.contains('shutter')) {
      return raw.trim();
    }
    if (lower.contains('battery')) {
      return raw.trim();
    }
    if (lower.contains('%')) {
      return 'Battery: $raw';
    }
    return 'Health: $raw';
  }

  @override
  Widget build(BuildContext context) {
    if (selectedNewDevice == null) {
      return const Center(child: Text('Device not selected'));
    }

    final p = selectedNewDevice!;
    final name = p['model'] as String? ?? 'Device';
    final brand = p['brand'] as String? ?? 'Brand';
    final image = p['image'] as String? ?? 'assets/images/categories/dslr.png';
    final specs = p['specs'] as String? ??
        'Certified 45-point hardware tested with comprehensive warranty.';
    final originalPrice = (p['originalPrice'] as num?)?.toInt() ?? 0;
    final discount = (p['discount'] as num?)?.toInt() ?? 0;

    final units = (p['availableUnits'] as List?) ?? [
      {'serial': 'CSM-8821', 'batteryHealth': '98%', 'warranty': '12 Months'},
      {'serial': 'CSM-8822', 'batteryHealth': '95%', 'warranty': '12 Months'},
    ];

    final adjustedPrice = _getAdjustedNewDevicePrice();
    final totalTradeIn = calculatedOldValue + exchangeBonus;
    final netDiff = adjustedPrice - totalTradeIn;
    final netPayable = netDiff > 0 ? netDiff : 0;
    final cashback = netDiff < 0 ? netDiff.abs() : 0;

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── 1. Hero Product Showcase Card ──
                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.04),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Stack(
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                        child: Column(
                          children: [
                            // Product Image Container
                            Container(
                              height: 190,
                              width: double.infinity,
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: CamsikSmartImage(
                                image: image,
                                fit: BoxFit.contain,
                                iconSize: 72,
                                iconColor: const Color(0xFF6366F1),
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Name, Brand & Price Line
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        name,
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFF0F172A),
                                          letterSpacing: -0.3,
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFF1F5F9),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              brand,
                                              style: const TextStyle(
                                                color: Color(0xFF475569),
                                                fontSize: 11,
                                                fontWeight: FontWeight.w700,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 6),
                                          const Text(
                                            'Certified Refurbished',
                                            style: TextStyle(
                                              color: Color(0xFF059669),
                                              fontSize: 11.5,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      formatCurrency(adjustedPrice),
                                      style: const TextStyle(
                                        fontSize: 19,
                                        fontWeight: FontWeight.w900,
                                        color: Color(0xFF4F46E5),
                                      ),
                                    ),
                                    if (originalPrice > adjustedPrice) ...[
                                      Text(
                                        formatCurrency(originalPrice),
                                        style: const TextStyle(
                                          fontSize: 11.5,
                                          color: Color(0xFF94A3B8),
                                          decoration: TextDecoration.lineThrough,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      // Verified badge top right
                      Positioned(
                        top: 14,
                        right: 14,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.verified_rounded, size: 14, color: Color(0xFF059669)),
                              SizedBox(width: 4),
                              Text(
                                'Quality Verified',
                                style: TextStyle(
                                  color: Color(0xFF059669),
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Discount pill top left
                      if (discount > 0)
                        Positioned(
                          top: 14,
                          left: 14,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFFEF4444), Color(0xFFF43F5E)],
                              ),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFFEF4444).withValues(alpha: 0.25),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Text(
                              '$discount% OFF',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),

                // ── 2. Refurbished Condition Grades ──
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Select Refurbished Grade',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 14,
                        color: Color(0xFF0F172A),
                        letterSpacing: -0.2,
                      ),
                    ),
                    Text(
                      selectedCondition == 'Superb'
                          ? 'Like-New Condition'
                          : selectedCondition == 'Good'
                              ? 'Minor daily wear'
                              : 'Visible signs of use',
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF64748B),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                Row(
                  children: [
                    _buildModernConditionCard(
                      key: 'Superb',
                      title: 'Superb',
                      subtitle: 'Flawless, Like New',
                      badge: 'Recommended',
                      isPopular: true,
                    ),
                    const SizedBox(width: 8),
                    _buildModernConditionCard(
                      key: 'Good',
                      title: 'Good',
                      subtitle: 'Light rub marks',
                      badge: 'Save 8%',
                    ),
                    const SizedBox(width: 8),
                    _buildModernConditionCard(
                      key: 'Fair',
                      title: 'Fair',
                      subtitle: 'Normal cosmetic wear',
                      badge: 'Save 15%',
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // ── 3. Select Verified Serial Unit ──
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Available Inspected Units',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 14,
                        color: Color(0xFF0F172A),
                        letterSpacing: -0.2,
                      ),
                    ),
                    Text(
                      '${units.length} units in stock',
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF059669),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                Column(
                  children: List.generate(units.length, (uIdx) {
                    final u = units[uIdx] as Map<String, dynamic>;
                    final isSel = selectedUnitIndex == uIdx;
                    final serial = u['serial']?.toString() ?? 'Unit ${uIdx + 1}';
                    final rawMetric = u['batteryHealth']?.toString() ??
                        u['shutterCount']?.toString() ??
                        '96%';
                    final metricLabel = _formatMetricLabel(rawMetric);
                    final warranty = u['warranty']?.toString() ?? '12 Months';

                    return GestureDetector(
                      onTap: () => onUnitSelected(uIdx),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isSel ? const Color(0xFFF5F3FF) : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSel
                                ? const Color(0xFF7C3AED)
                                : const Color(0xFFE2E8F0),
                            width: isSel ? 1.8 : 1,
                          ),
                          boxShadow: isSel
                              ? [
                                  BoxShadow(
                                    color: const Color(0xFF7C3AED).withValues(alpha: 0.1),
                                    blurRadius: 10,
                                    offset: const Offset(0, 3),
                                  ),
                                ]
                              : [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.02),
                                    blurRadius: 4,
                                    offset: const Offset(0, 1),
                                  ),
                                ],
                        ),
                        child: Row(
                          children: [
                            // Radio indicator
                            Container(
                              width: 22,
                              height: 22,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isSel ? const Color(0xFF7C3AED) : Colors.transparent,
                                border: Border.all(
                                  color: isSel
                                      ? const Color(0xFF7C3AED)
                                      : const Color(0xFFCBD5E1),
                                  width: 2,
                                ),
                              ),
                              child: isSel
                                  ? const Icon(
                                      Icons.check_rounded,
                                      size: 14,
                                      color: Colors.white,
                                    )
                                  : null,
                            ),
                            const SizedBox(width: 12),

                            // Serial ID
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        serial,
                                        style: TextStyle(
                                          fontWeight: FontWeight.w800,
                                          fontSize: 13,
                                          color: isSel
                                              ? const Color(0xFF4C1D95)
                                              : const Color(0xFF0F172A),
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFECFDF5),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: const Text(
                                          'Ready to Ship',
                                          style: TextStyle(
                                            color: Color(0xFF059669),
                                            fontSize: 9.5,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  const Text(
                                    '100% genuine IMEI / Serial verified',
                                    style: TextStyle(
                                      fontSize: 10.5,
                                      color: Color(0xFF94A3B8),
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Metric & Warranty Badges
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFDCFCE7),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        metricLabel.toLowerCase().contains('shutter')
                                            ? Icons.camera_alt_rounded
                                            : Icons.battery_charging_full_rounded,
                                        size: 11,
                                        color: const Color(0xFF059669),
                                      ),
                                      const SizedBox(width: 3),
                                      Text(
                                        metricLabel,
                                        style: const TextStyle(
                                          color: Color(0xFF059669),
                                          fontSize: 10.5,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEDE9FE),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.shield_rounded,
                                        size: 11,
                                        color: Color(0xFF7C3AED),
                                      ),
                                      const SizedBox(width: 3),
                                      Text(
                                        warranty,
                                        style: const TextStyle(
                                          color: Color(0xFF7C3AED),
                                          fontSize: 10,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 16),

                // ── 4. 45-Point Inspection Certified Box ──
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.shield_outlined,
                              color: Color(0xFF059669), size: 20),
                          SizedBox(width: 8),
                          Text(
                            '45-Point Camsik Certified Inspection',
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 13,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        specs,
                        style: const TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 11.5,
                          height: 1.45,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Wrap(
                        spacing: 8,
                        runSpacing: 6,
                        children: [
                          _InspectionCheckItem('Camera Sensor Passed'),
                          _InspectionCheckItem('Display & Touch Perfect'),
                          _InspectionCheckItem('Battery Life Benchmarked'),
                          _InspectionCheckItem('Dials & Motors Tested'),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),

        // ── 5. Sticky Exchange Calculation Bottom Bar ──
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 16,
                offset: const Offset(0, -4),
              ),
            ],
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: SafeArea(
            top: false,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      cashback > 0 ? 'Cashback to You:' : 'Net Difference:',
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF64748B),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      cashback > 0
                          ? '+${formatCurrency(cashback)}'
                          : formatCurrency(netPayable),
                      style: TextStyle(
                        color: cashback > 0
                            ? const Color(0xFF059669)
                            : const Color(0xFF4F46E5),
                        fontWeight: FontWeight.w900,
                        fontSize: 21,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ],
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    foregroundColor: Colors.white,
                    elevation: 2,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  onPressed: onProceedToCheckout,
                  child: const Row(
                    children: [
                      Text(
                        'Proceed to Checkout',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 14,
                        ),
                      ),
                      SizedBox(width: 8),
                      Icon(Icons.arrow_forward_rounded, size: 17),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildModernConditionCard({
    required String key,
    required String title,
    required String subtitle,
    required String badge,
    bool isPopular = false,
  }) {
    final isSel = selectedCondition == key;
    return Expanded(
      child: GestureDetector(
        onTap: () => onConditionChanged(key),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
          decoration: BoxDecoration(
            color: isSel ? const Color(0xFF4F46E5) : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSel ? const Color(0xFF4F46E5) : const Color(0xFFE2E8F0),
              width: isSel ? 1.6 : 1,
            ),
            boxShadow: isSel
                ? [
                    BoxShadow(
                      color: const Color(0xFF4F46E5).withValues(alpha: 0.25),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ]
                : [],
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isSel
                      ? Colors.white.withValues(alpha: 0.2)
                      : (isPopular ? const Color(0xFFFEF3C7) : const Color(0xFFF1F5F9)),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  badge,
                  style: TextStyle(
                    fontSize: 8.5,
                    fontWeight: FontWeight.w800,
                    color: isSel
                        ? Colors.white
                        : (isPopular ? const Color(0xFFB45309) : const Color(0xFF475569)),
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 13,
                  color: isSel ? Colors.white : const Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 9.5,
                  fontWeight: FontWeight.w500,
                  color: isSel ? Colors.white.withValues(alpha: 0.85) : const Color(0xFF94A3B8),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InspectionCheckItem extends StatelessWidget {
  final String label;
  const _InspectionCheckItem(this.label);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.check_circle_rounded, size: 14, color: Color(0xFF059669)),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10.5,
            fontWeight: FontWeight.w600,
            color: Color(0xFF334155),
          ),
        ),
      ],
    );
  }
}
