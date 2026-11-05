import 'package:flutter/material.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../widgets/camsik_smart_image.dart';

class BuyProductDetailView extends StatefulWidget {
  final Map<String, dynamic> product;
  final List<Map<String, dynamic>> allProducts;
  final VoidCallback onBack;
  final Function(int finalPrice, String condition, String storage, String color) onCheckout;

  const BuyProductDetailView({
    super.key,
    required this.product,
    this.allProducts = const [],
    required this.onBack,
    required this.onCheckout,
  });

  @override
  State<BuyProductDetailView> createState() => _BuyProductDetailViewState();
}

class _BuyProductDetailViewState extends State<BuyProductDetailView> {
  late String _activeCondition;
  late Map<String, dynamic> _selectedProduct;
  int _activeImageIndex = 0;

  @override
  void initState() {
    super.initState();
    _selectedProduct = widget.product;
    _activeCondition = _selectedProduct['condition']?.toString() ?? 'Superb';
  }

  String _getModelKey(Map<String, dynamic> p) {
    final mId = p['modelId']?.toString();
    if (mId != null && mId.isNotEmpty) return mId.toLowerCase();
    final m = p['model']?.toString() ?? '';
    return m.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-');
  }

  List<Map<String, dynamic>> _getAvailableUnitsForCondition(String condition) {
    final currentKey = _getModelKey(_selectedProduct);
    final list = widget.allProducts.where((p) {
      final key = _getModelKey(p);
      final c = p['condition']?.toString() ?? '';
      return key == currentKey && c.toLowerCase() == condition.toLowerCase();
    }).toList();

    if (list.isNotEmpty) return list;

    // Fallback: If only single product was passed, fabricate units based on product specs
    final basePrice = (_selectedProduct['sellingPrice'] as num?)?.toInt() ?? 58999;
    final origPrice = (_selectedProduct['originalPrice'] as num?)?.toInt() ?? 134900;
    final storage = _selectedProduct['storage']?.toString() ?? '128GB';
    final color = _selectedProduct['color']?.toString() ?? 'Natural Titanium';

    if (condition.toLowerCase() == _activeCondition.toLowerCase()) {
      return [
        {
          ..._selectedProduct,
          'storage': storage,
          'color': color,
          'sellingPrice': basePrice,
          'originalPrice': origPrice,
          'batteryHealth': _selectedProduct['batteryHealth'] ?? 98,
          'warranty': _selectedProduct['warranty'] ?? '12 months',
          'stock': 4,
          'conditionNote': 'Like new, minimal marks',
        },
        {
          ..._selectedProduct,
          'id': '${_selectedProduct['id']}-256',
          'storage': '256GB',
          'color': 'Blue Titanium',
          'sellingPrice': (basePrice * 1.1).round(),
          'originalPrice': (origPrice * 1.07).round(),
          'batteryHealth': 99,
          'warranty': '12 months',
          'stock': 2,
          'conditionNote': 'Pristine chassis, in original packaging',
        },
      ];
    }
    return [];
  }

  int _getStartingPrice(String condition) {
    final units = _getAvailableUnitsForCondition(condition);
    if (units.isNotEmpty) {
      return units.map((u) => (u['sellingPrice'] as num?)?.toInt() ?? 0).reduce((a, b) => a < b ? a : b);
    }
    final basePrice = (_selectedProduct['sellingPrice'] as num?)?.toInt() ?? 58999;
    if (condition == 'Superb') return basePrice;
    if (condition == 'Good') return (basePrice * 0.89).round();
    return (basePrice * 0.79).round();
  }

  int _getUnitCount(String condition) {
    final units = _getAvailableUnitsForCondition(condition);
    return units.isNotEmpty ? units.length : 2;
  }

  @override
  Widget build(BuildContext context) {
    final p = _selectedProduct;
    final modelName = p['model']?.toString() ?? 'Device';
    final currentPrice = (p['sellingPrice'] as num?)?.toInt() ?? 0;
    final origPrice = (p['originalPrice'] as num?)?.toInt() ?? currentPrice;
    final discount = (p['discount'] as num?)?.toInt() ??
        (origPrice > currentPrice ? (((origPrice - currentPrice) / origPrice) * 100).round() : 0);
    final storage = p['storage']?.toString() ?? '128GB';
    final color = p['color']?.toString() ?? 'Natural Titanium';
    final conditionNote = p['conditionNote']?.toString() ?? 'Like new, minimal marks';

    final gallery = (p['gallery'] as List?)?.map((e) => e.toString()).toList() ??
        [p['image']?.toString() ?? 'assets/images/categories/smartphone.png'];

    final bRaw = p['batteryHealth'];
    final battery = bRaw is num ? '$bRaw%' : (bRaw?.toString().replaceAll('%', '').replaceAll('Battery', '').trim() ?? '98%');
    final warranty = p['warranty']?.toString() ?? '12 months';
    final rating = p['rating']?.toString() ?? '4.9';
    final reviews = p['reviews']?.toString() ?? '248';
    final deliveryDays = p['deliveryDays']?.toString() ?? '2';
    final specs = p['specs']?.toString() ?? '$modelName, $storage, $color';

    final conditionUnits = _getAvailableUnitsForCondition(_activeCondition);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: widget.onBack,
        ),
        title: Text(
          modelName,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, size: 20),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.favorite_border_rounded, size: 20),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── TOP HERO CARD (IMAGE + BADGES) ──
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Column(
                children: [
                  Stack(
                    children: [
                      // Main Image
                      Container(
                        height: 250,
                        width: double.infinity,
                        alignment: Alignment.center,
                        child: CamsikSmartImage(
                          image: gallery[_activeImageIndex.clamp(0, gallery.length - 1)],
                          fit: BoxFit.contain,
                          iconSize: 80,
                        ),
                      ),
                      // Top Left: Condition Badge
                      Positioned(
                        top: 4,
                        left: 4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFA7F3D0), width: 0.8),
                          ),
                          child: Text(
                            _activeCondition,
                            style: const TextStyle(
                              color: Color(0xFF059669),
                              fontWeight: FontWeight.w900,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ),
                      // Top Right: Discount Badge
                      Positioned(
                        top: 4,
                        right: 4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF059669),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '$discount% OFF',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Image Thumbnails Row
                  if (gallery.length > 1)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(gallery.length, (idx) {
                        final isSel = _activeImageIndex == idx;
                        return GestureDetector(
                          onTap: () => setState(() => _activeImageIndex = idx),
                          child: Container(
                            width: 52,
                            height: 52,
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isSel ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                                width: isSel ? 2 : 1,
                              ),
                            ),
                            child: CamsikSmartImage(image: gallery[idx], fit: BoxFit.contain),
                          ),
                        );
                      }),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // ── PRODUCT DETAILS & PRICING CARD ──
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Condition Subtitle Pill
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFF10B981),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          '$_activeCondition  ·  $conditionNote',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF059669),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Model Title
                  Text(
                    modelName,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$storage · $color',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Pricing Row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        formatCurrency(currentPrice),
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF0F172A),
                          letterSpacing: -0.8,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        formatCurrency(origPrice),
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF94A3B8),
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDCFCE7),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '$discount% OFF',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF059669),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 10),
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(5),
                              decoration: const BoxDecoration(
                                color: Color(0xFF059669),
                                shape: BoxShape.circle,
                              ),
                              child: const Text('1', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900)),
                            ),
                            const SizedBox(width: 8),
                            const Flexible(
                              child: Text(
                                'SELECT CONDITION GRADE',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.3, color: Color(0xFF0F172A)),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        '6 units listed',
                        style: TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Condition Cards (Superb, Good, Fair)
                  Row(
                    children: [
                      _buildConditionOptionCard(
                        condition: 'Superb',
                        subtitle: 'Pristine • Like New\n95%+ Battery',
                        startingPrice: _getStartingPrice('Superb'),
                        availableCount: _getUnitCount('Superb'),
                        isSelected: _activeCondition.toLowerCase() == 'superb',
                        onTap: () {
                          setState(() {
                            _activeCondition = 'Superb';
                            final units = _getAvailableUnitsForCondition('Superb');
                            if (units.isNotEmpty) _selectedProduct = units[0];
                          });
                        },
                      ),
                      const SizedBox(width: 8),
                      _buildConditionOptionCard(
                        condition: 'Good',
                        subtitle: 'Lightly Used • Best\n88–94% Battery',
                        startingPrice: _getStartingPrice('Good'),
                        availableCount: _getUnitCount('Good'),
                        isSelected: _activeCondition.toLowerCase() == 'good',
                        onTap: () {
                          setState(() {
                            _activeCondition = 'Good';
                            final units = _getAvailableUnitsForCondition('Good');
                            if (units.isNotEmpty) _selectedProduct = units[0];
                          });
                        },
                      ),
                      const SizedBox(width: 8),
                      _buildConditionOptionCard(
                        condition: 'Fair',
                        subtitle: 'Budget Deal • Tested\n80–87% Battery',
                        startingPrice: _getStartingPrice('Fair'),
                        availableCount: _getUnitCount('Fair'),
                        isSelected: _activeCondition.toLowerCase() == 'fair',
                        onTap: () {
                          setState(() {
                            _activeCondition = 'Fair';
                            final units = _getAvailableUnitsForCondition('Fair');
                            if (units.isNotEmpty) _selectedProduct = units[0];
                          });
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // ── 2. AVAILABLE UNITS IN CONDITION ──
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(5),
                              decoration: const BoxDecoration(
                                color: Color(0xFF0F172A),
                                shape: BoxShape.circle,
                              ),
                              child: const Text('2', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900)),
                            ),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                'AVAILABLE UNITS IN ${_activeCondition.toUpperCase()}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        'Tap to switch',
                        style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Units List
                  ...conditionUnits.map((unit) {
                    final isSel = unit['id'] == _selectedProduct['id'] ||
                        (unit['storage'] == _selectedProduct['storage'] && unit['color'] == _selectedProduct['color']);
                    final uStorage = unit['storage']?.toString() ?? '128GB';
                    final uColor = unit['color']?.toString() ?? 'Standard';
                    final uPrice = (unit['sellingPrice'] as num?)?.toInt() ?? currentPrice;
                    final uOrigPrice = (unit['originalPrice'] as num?)?.toInt() ?? origPrice;
                    final uDiscount = (unit['discount'] as num?)?.toInt() ?? discount;
                    final uBatt = unit['batteryHealth']?.toString() ?? '98%';
                    final uWarranty = unit['warranty']?.toString() ?? '12 months';
                    final uStock = (unit['stock'] as num?)?.toInt() ?? 3;
                    final uNote = unit['conditionNote']?.toString() ?? 'Like new, minimal marks';

                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedProduct = unit;
                        });
                      },
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isSel ? const Color(0xFFF0FDF4) : Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSel ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                            width: isSel ? 2.0 : 1.0,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: isSel ? const Color(0xFF059669).withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.02),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            // Unit Image Thumbnail
                            Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: CamsikSmartImage(image: unit['image'] ?? gallery[0], fit: BoxFit.contain),
                            ),
                            const SizedBox(width: 12),

                            // Unit Details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Flexible(
                                        child: Text(
                                          '$uStorage · $uColor',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                                        ),
                                      ),
                                      if (isSel) ...[
                                        const SizedBox(width: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF059669),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: const Text(
                                            'Selected',
                                            style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w900),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  Row(
                                    children: [
                                      Text('⚡ $uBatt', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF059669))),
                                      const SizedBox(width: 8),
                                      Flexible(
                                        child: Text(
                                          '🛡️ $uWarranty',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    uNote,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8)),
                                  ),
                                ],
                              ),
                            ),

                            // Unit Price & Stock
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  formatCurrency(uPrice),
                                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                                ),
                                Row(
                                  children: [
                                    Text(
                                      formatCurrency(uOrigPrice),
                                      style: const TextStyle(fontSize: 10.5, color: Color(0xFF94A3B8), decoration: TextDecoration.lineThrough),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '$uDiscount% OFF',
                                      style: const TextStyle(fontSize: 9.5, color: Color(0xFF059669), fontWeight: FontWeight.w800),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Stock: $uStock',
                                  style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // ── 4 STAT CHIPS GRID (2x2) ──
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: _buildStatTile(
                      icon: Icons.battery_charging_full_rounded,
                      iconColor: const Color(0xFF059669),
                      bgColor: const Color(0xFFECFDF5),
                      label: 'Battery Health',
                      value: '$battery%',
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildStatTile(
                      icon: Icons.shield_outlined,
                      iconColor: const Color(0xFF2563EB),
                      bgColor: const Color(0xFFEFF6FF),
                      label: 'Warranty',
                      value: warranty,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Row(
                children: [
                  Expanded(
                    child: _buildStatTile(
                      icon: Icons.star_rounded,
                      iconColor: const Color(0xFFF59E0B),
                      bgColor: const Color(0xFFFFFBEB),
                      label: 'Rating',
                      value: '$rating / 5 ($reviews)',
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildStatTile(
                      icon: Icons.local_shipping_outlined,
                      iconColor: const Color(0xFF7C3AED),
                      bgColor: const Color(0xFFF5F3FF),
                      label: 'Delivery',
                      value: '$deliveryDays business days',
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // ── CERTIFIED 45-POINT INSPECTION REPORT ──
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.assignment_turned_in_rounded, color: Color(0xFF059669), size: 18),
                      const SizedBox(width: 8),
                      const Text(
                        'CERTIFIED 45-POINT INSPECTION REPORT',
                        style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: Color(0xFF0F172A), letterSpacing: 0.3),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildInspectionGrid(),
                ],
              ),
            ),

            const SizedBox(height: 10),

            // ── KEY SPECIFICATIONS ──
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Key Specifications:',
                    style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    specs,
                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.4),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),

      // ── BOTTOM STICKY BAR: BUY NOW CTA ──
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 10,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: SafeArea(
          child: SizedBox(
            height: 52,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF059669),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 0,
              ),
              onPressed: () {
                final storage = _selectedProduct['storage']?.toString() ?? '128GB';
                final color = _selectedProduct['color']?.toString() ?? 'Default';
                widget.onCheckout(currentPrice, _activeCondition, storage, color);
              },
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Buy Now — ${formatCurrency(currentPrice)}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: -0.2),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.arrow_forward_rounded, size: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildConditionOptionCard({
    required String condition,
    required String subtitle,
    required int startingPrice,
    required int availableCount,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFF0FDF4) : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
              width: isSelected ? 2 : 1,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: const Color(0xFF059669).withValues(alpha: 0.12),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : [],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    condition,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      color: isSelected ? const Color(0xFF059669) : const Color(0xFF0F172A),
                    ),
                  ),
                  Text(
                    '$availableCount avail',
                    style: const TextStyle(fontSize: 9.5, color: Color(0xFF94A3B8), fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              const SizedBox(height: 5),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), height: 1.25),
              ),
              const SizedBox(height: 8),
              Text(
                'Starting',
                style: TextStyle(fontSize: 8.5, color: const Color(0xFF94A3B8)),
              ),
              Text(
                formatCurrency(startingPrice),
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: isSelected ? const Color(0xFF059669) : const Color(0xFF0F172A),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatTile({
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                const SizedBox(height: 1),
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInspectionGrid() {
    const checks = [
      {'name': 'Display & Touch', 'status': 'Passed'},
      {'name': 'Battery Capacity', 'status': 'Passed'},
      {'name': 'Camera & Optics', 'status': 'Passed'},
      {'name': 'Speakers & Mic', 'status': 'Passed'},
      {'name': 'Charging & Ports', 'status': 'Passed'},
      {'name': 'Sensors / Biometrics', 'status': 'Passed'},
    ];

    return Wrap(
      spacing: 12,
      runSpacing: 8,
      children: checks.map((c) {
        final halfWidth = (MediaQuery.of(context).size.width - 56) / 2;
        return SizedBox(
          width: halfWidth,
          child: Row(
            children: [
              const Icon(Icons.check_rounded, color: Color(0xFF059669), size: 16),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  c['name']!,
                  style: const TextStyle(fontSize: 11.5, color: Color(0xFF334155), fontWeight: FontWeight.w600),
                ),
              ),
              Text(
                c['status']!,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
