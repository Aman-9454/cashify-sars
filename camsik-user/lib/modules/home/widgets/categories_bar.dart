import 'package:flutter/material.dart';
import '../../../widgets/camsik_smart_image.dart';

class EightCategoriesBar extends StatelessWidget {
  final List<Map<String, dynamic>> categories;
  final Function(String catId) onCategorySelected;
  final VoidCallback onViewAll;

  const EightCategoriesBar({
    super.key,
    required this.categories,
    required this.onCategorySelected,
    required this.onViewAll,
  });

  @override
  Widget build(BuildContext context) {
    // Only real camera categories from Camsik catalog (NO dummy/external categories)
    final fallbackCameraCategories = [
      {
        'id': 'cat-dslr',
        'name': 'Cameras',
        'image': 'assets/images/categories/dslr.png',
      },
      {
        'id': 'cat-lens',
        'name': 'Lenses',
        'image': 'assets/images/categories/lens.png',
      },
      {
        'id': 'cat-video-camera',
        'name': 'Video Cameras',
        'image': 'assets/images/categories/video.png',
      },
      {
        'id': 'cat-action-camera',
        'name': 'Action Cameras',
        'image': 'assets/images/categories/action.png',
      },
      {
        'id': 'cat-gimbal',
        'name': 'Gimbals',
        'image': 'assets/images/categories/gimbal.png',
      },
    ];

    final displayList = categories.isNotEmpty ? categories : fallbackCameraCategories;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header Row
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Trending Categories',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.3,
                ),
              ),
              InkWell(
                onTap: onViewAll,
                borderRadius: BorderRadius.circular(8),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'View All',
                        style: TextStyle(
                          color: Color(0xFF059669),
                          fontWeight: FontWeight.w800,
                          fontSize: 12.5,
                        ),
                      ),
                      SizedBox(width: 2),
                      Icon(
                        Icons.chevron_right_rounded,
                        color: Color(0xFF059669),
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

        // Horizontal Category Cards
        SizedBox(
          height: 108,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: displayList.length,
            itemBuilder: (ctx, idx) {
              final item = displayList[idx];
              final id = item['id'] as String? ?? 'cat-dslr';
              final rawName = item['name'] as String? ?? 'Category';
              // Add Sell prefix to all categories as requested
              String name = rawName;
              final lower = rawName.toLowerCase();
              if (lower.contains('dslr') || lower.contains('camera')) {
                name = 'Sell DSLR';
              } else if (lower.contains('lens')) {
                name = 'Sell Lenses';
              } else if (lower.contains('gimbal')) {
                name = 'Sell Gimbals';
              } else if (lower.contains('video')) {
                name = 'Sell Video Cam';
              } else if (lower.contains('action')) {
                name = 'Sell Action Cam';
              } else if (lower.contains('phone') || lower.contains('smart')) {
                name = 'Sell Phone';
              } else if (lower.contains('laptop') || lower.contains('macbook')) {
                name = 'Sell Laptop';
              } else if (lower.contains('tablet') || lower.contains('ipad')) {
                name = 'Sell Tablet';
              } else if (!lower.startsWith('sell')) {
                name = 'Sell $rawName';
              }

              final image = item['image'] as String? ?? 'assets/images/categories/dslr.png';

              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: InkWell(
                  onTap: () => onCategorySelected(id),
                  borderRadius: BorderRadius.circular(16),
                  child: SizedBox(
                    width: 86,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Image Card Container
                        Container(
                          height: 72,
                          width: 86,
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: const Color(0xFFF1F5F9),
                              width: 1.2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.025),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Center(
                            child: CamsikSmartImage(
                              image: image,
                              fit: BoxFit.contain,
                              iconSize: 30,
                              iconColor: const Color(0xFF059669),
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),

                        // Category Label
                        Text(
                          name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                            letterSpacing: -0.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
