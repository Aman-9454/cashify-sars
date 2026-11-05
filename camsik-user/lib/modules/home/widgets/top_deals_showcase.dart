import 'package:flutter/material.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../widgets/camsik_smart_image.dart';

class TopDealsShowcase extends StatelessWidget {
  final List<Map<String, dynamic>> products;
  final VoidCallback onShopAll;

  const TopDealsShowcase({
    super.key,
    required this.products,
    required this.onShopAll,
  });

  @override
  Widget build(BuildContext context) {
    // Default fallback deals if products array is empty
    final defaultDeals = [
      {
        'model': 'iPhone 15 Pro',
        'sellingPrice': 58999,
        'originalPrice': 134900,
        'discount': 56,
        'batteryHealth': '98% Battery',
        'warranty': '12M Warranty',
        'condition': 'Superb',
        'image': 'assets/images/categories/smartphone.png',
      },
      {
        'model': 'Samsung S23 Ultra',
        'sellingPrice': 49999,
        'originalPrice': 86900,
        'discount': 42,
        'batteryHealth': '95% Battery',
        'warranty': '12M Warranty',
        'condition': 'Excellent',
        'image': 'assets/images/categories/smartphone.png',
      },
    ];

    final displayProducts = products.isNotEmpty ? products : defaultDeals;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header Row
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Text(
                    'Hot Deals on Refurbished',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                      letterSpacing: -0.3,
                    ),
                  ),
                ],
              ),
              InkWell(
                onTap: onShopAll,
                borderRadius: BorderRadius.circular(8),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Shop All',
                        style: TextStyle(
                          color: Color(0xFF6D28D9),
                          fontWeight: FontWeight.w800,
                          fontSize: 12.5,
                        ),
                      ),
                      SizedBox(width: 2),
                      Icon(
                        Icons.chevron_right_rounded,
                        color: Color(0xFF6D28D9),
                        size: 16,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Product Cards
        SizedBox(
          height: 232,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: displayProducts.length,
            itemBuilder: (ctx, idx) {
              final p = displayProducts[idx];
              final name = p['model'] as String? ?? 'Device';
              final price = (p['sellingPrice'] as num?)?.toInt() ?? 0;
              final origPrice = (p['originalPrice'] as num?)?.toInt() ?? 0;
              final discount = (p['discount'] as num?)?.toInt() ?? 0;
              final bRaw = p['batteryHealth'];
              final battery = bRaw is num ? '$bRaw% Battery' : (bRaw?.toString() ?? '98% Battery');
              final warranty = p['warranty']?.toString() ?? '12M Warranty';
              final condition = p['condition'] as String? ?? 'Superb';
              final image = p['image'] as String? ?? '';

              final cardWidth = (MediaQuery.of(context).size.width - 40) / 2;

              return Container(
                width: cardWidth.clamp(168.0, 195.0),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFF1F5F9), width: 1.2),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top Badge Row + Heart
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5.5, vertical: 2.5),
                          decoration: BoxDecoration(
                            color: const Color(0xFFDCFCE7),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '$discount% OFF',
                            style: const TextStyle(
                              color: Color(0xFF059669),
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEDE9FE),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            condition,
                            style: const TextStyle(
                              color: Color(0xFF6D28D9),
                              fontSize: 8.5,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        const Spacer(),
                        const Icon(
                          Icons.favorite_border_rounded,
                          size: 16,
                          color: Color(0xFF94A3B8),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),

                    // Centered Device Image
                    Expanded(
                      child: Center(
                        child: CamsikSmartImage(
                          image: image,
                          fit: BoxFit.contain,
                          iconSize: 42,
                          iconColor: const Color(0xFF94A3B8),
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),

                    // Device Name
                    Text(
                      name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                        color: Color(0xFF0F172A),
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 2),

                    // Specs (Battery • Warranty)
                    Text(
                      '$battery • $warranty',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFF64748B),
                        fontSize: 9.5,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),

                    // Price Row
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          formatCurrency(price),
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 14,
                            color: Color(0xFF059669),
                            letterSpacing: -0.2,
                          ),
                        ),
                        const SizedBox(width: 5),
                        if (origPrice > price)
                          Text(
                            formatCurrency(origPrice),
                            style: const TextStyle(
                              decoration: TextDecoration.lineThrough,
                              color: Color(0xFF94A3B8),
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
