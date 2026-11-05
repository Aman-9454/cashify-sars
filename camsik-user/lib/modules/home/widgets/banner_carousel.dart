import 'dart:async';
import 'package:flutter/material.dart';
import '../../../widgets/camsik_smart_image.dart';

class CamsikFullWidthBannerCarousel extends StatefulWidget {
  final List<Map<String, dynamic>> banners;
  final Function(String) onBannerTap;
  final VoidCallback? onBrowseDeals;

  const CamsikFullWidthBannerCarousel({
    super.key,
    required this.banners,
    required this.onBannerTap,
    this.onBrowseDeals,
  });

  @override
  State<CamsikFullWidthBannerCarousel> createState() => _CamsikFullWidthBannerCarouselState();
}

class _CamsikFullWidthBannerCarouselState extends State<CamsikFullWidthBannerCarousel> {
  late final PageController _pageController;
  int _virtualPage = 1000;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _virtualPage);
    _startAutoScroll();
  }

  void _startAutoScroll() {
    _timer?.cancel();
    if (widget.banners.length > 1) {
      _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
        if (_pageController.hasClients) {
          _virtualPage++;
          _pageController.animateToPage(
            _virtualPage,
            duration: const Duration(milliseconds: 500),
            curve: Curves.easeOutCubic,
          );
        }
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // If no banners from API, render the primary hero banner matching the reference design
    if (widget.banners.isEmpty) {
      return _buildHeroSlide(
        tagline: 'SELL • BUY • EXCHANGE • RENT',
        titlePrefix: 'More Value\nfor ',
        titleHighlight: 'Your',
        titleSuffix: ' Gear',
        subtitle: 'Trusted by 3,20,000+ sellers across India',
        image: 'assets/images/categories/dslr.png',
        catId: 'cat-dslr',
      );
    }

    final actualCount = widget.banners.length;

    return SizedBox(
      height: 220,
      width: double.infinity,
      child: PageView.builder(
        controller: _pageController,
        onPageChanged: (page) {
          setState(() {
            _virtualPage = page;
          });
        },
        itemBuilder: (ctx, index) {
          final banner = widget.banners[index % actualCount];
          final catId = banner['categoryFilter'] as String? ?? 'cat-dslr';
          final badge = banner['badge'] as String? ?? 'SELL • BUY • EXCHANGE • RENT';
          final titlePrefix = banner['titlePrefix'] as String? ?? 'More Value\nfor ';
          final titleHighlight = banner['titleHighlight'] as String? ?? 'Your';
          final titleSuffix = banner['titleSuffix'] as String? ?? ' Gear';
          final desc = banner['description'] as String? ?? 'Trusted by 3,20,000+ sellers across India';
          final image = banner['image'] as String? ?? 'assets/images/categories/dslr.png';

          final cleanTagline = badge
              .replaceAll('📱', '')
              .replaceAll('💻', '')
              .replaceAll('📟', '')
              .replaceAll('★', '')
              .replaceAll('🔍', '')
              .replaceAll('🎥', '')
              .trim();

          return _buildHeroSlide(
            tagline: cleanTagline.isNotEmpty ? cleanTagline : 'SELL • BUY • EXCHANGE • RENT',
            titlePrefix: titlePrefix,
            titleHighlight: titleHighlight,
            titleSuffix: titleSuffix,
            subtitle: desc,
            image: image,
            catId: catId,
          );
        },
      ),
    );
  }

  Widget _buildHeroSlide({
    required String tagline,
    required String titlePrefix,
    required String titleHighlight,
    required String titleSuffix,
    required String subtitle,
    required String image,
    required String catId,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 18),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF0B132B), Color(0xFF0F172A), Color(0xFF0B132B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Ambient soft green luminous glow behind the camera image
          Positioned(
            right: -10,
            top: 0,
            bottom: 0,
            width: 170,
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF10B981).withValues(alpha: 0.35),
                    const Color(0xFF059669).withValues(alpha: 0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Main Content Layout
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Left text & buttons
              Expanded(
                flex: 12,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // 1. Tagline: SELL • BUY • EXCHANGE • RENT
                    Text(
                      tagline,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 9.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 6),

                    // 2. Big Headline: More Value for Your Gear
                    RichText(
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: titlePrefix,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 22,
                              letterSpacing: -0.5,
                              height: 1.15,
                            ),
                          ),
                          TextSpan(
                            text: titleHighlight,
                            style: const TextStyle(
                              color: Color(0xFF34D399),
                              fontWeight: FontWeight.w900,
                              fontSize: 22,
                              letterSpacing: -0.5,
                              height: 1.15,
                            ),
                          ),
                          TextSpan(
                            text: titleSuffix,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 22,
                              letterSpacing: -0.5,
                              height: 1.15,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 6),

                    // 3. Subtitle
                    Text(
                      subtitle,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 10.5,
                        fontWeight: FontWeight.w500,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // 4. Two Buttons Row (Sell Now -> & Browse Deals)
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        // Button 1: Sell Now ->
                        InkWell(
                          onTap: () => widget.onBannerTap(catId),
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7.5),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF059669), Color(0xFF10B981)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF10B981).withValues(alpha: 0.35),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Sell Now',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: -0.2,
                                  ),
                                ),
                                SizedBox(width: 4),
                                Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 13),
                              ],
                            ),
                          ),
                        ),

                        // Button 2: Browse Deals
                        InkWell(
                          onTap: widget.onBrowseDeals ?? () => widget.onBannerTap(catId),
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 7.5),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.2), width: 1),
                            ),
                            child: const Text(
                              'Browse Deals',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                letterSpacing: -0.2,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              // Right Device Image
              Expanded(
                flex: 9,
                child: SizedBox(
                  height: 140,
                  child: Center(
                    child: CamsikSmartImage(
                      image: image,
                      fit: BoxFit.contain,
                      iconSize: 55,
                      iconColor: const Color(0xFF94A3B8),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
