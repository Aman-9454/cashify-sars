import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class TopCategoriesCard extends StatelessWidget {
  final List<Map<String, dynamic>> topCategories;
  final VoidCallback? onManageCatalog;

  const TopCategoriesCard({
    super.key,
    required this.topCategories,
    this.onManageCatalog,
  });

  static const List<Color> _colors = [
    Color(0xFF10B981),
    Color(0xFF3B82F6),
    Color(0xFF8B5CF6),
    Color(0xFFF97316),
    Color(0xFF06B6D4),
  ];

  @override
  Widget build(BuildContext context) {
    final categories = topCategories.isNotEmpty
        ? topCategories
        : [
            {'name': 'Cameras & Lenses', 'value': 60, 'count': 3},
            {'name': 'Smartphones', 'value': 40, 'count': 2},
          ];

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Top Categories',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              if (onManageCatalog != null)
                InkWell(
                  onTap: onManageCatalog,
                  child: const Text(
                    'Manage Catalog →',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Order share across active product lines',
            style: TextStyle(fontSize: 11, color: AppColors.textMuted),
          ),
          const SizedBox(height: 16),

          ...categories.asMap().entries.map((entry) {
            final idx = entry.key;
            final cat = entry.value;
            final name = cat['name'] as String? ?? 'General';
            final val = (cat['value'] as num?)?.toInt() ?? 0;
            final count = (cat['count'] as num?)?.toInt() ?? 0;
            final color = _colors[idx % _colors.length];

            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: color,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            name,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          if (count > 0) ...[
                            const SizedBox(width: 6),
                            Text(
                              '($count)',
                              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ],
                      ),
                      Text(
                        '$val%',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: val / 100.0,
                      minHeight: 6,
                      backgroundColor: const Color(0xFFF1F5F9),
                      valueColor: AlwaysStoppedAnimation<Color>(color),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
