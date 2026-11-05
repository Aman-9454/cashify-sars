import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';

class CompactHorizontalActionHub extends StatelessWidget {
  final VoidCallback onTapSell;
  final VoidCallback onTapBuy;
  final VoidCallback onTapExchange;
  final VoidCallback onTapRent;

  const CompactHorizontalActionHub({
    super.key,
    required this.onTapSell,
    required this.onTapBuy,
    required this.onTapExchange,
    required this.onTapRent,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final totalWidth = constraints.maxWidth;
        final isWide = totalWidth >= 620;
        final isVeryNarrow = totalWidth < 350;
        final horizontalPadding = isVeryNarrow ? 10.0 : 14.0;
        final itemSpacing = isVeryNarrow ? 6.0 : (isWide ? 12.0 : 10.0);

        // Pre-build cards
        final sellCard = _buildActionCard(
          title: 'Sell',
          subtitle: 'Instant Cash',
          cardBgColor: const Color(0xFFF0FDF4),
          borderColor: const Color(0xFFDCFCE7),
          iconBgColor: const Color(0xFF059669),
          subtitleColor: const Color(0xFF059669),
          chevronColor: const Color(0xFF059669),
          totalWidth: totalWidth,
          isWide: isWide,
          isVeryNarrow: isVeryNarrow,
          icon: const Text(
            kRupee,
            style: TextStyle(
              color: Colors.white,
              fontSize: 19,
              fontWeight: FontWeight.w900,
            ),
          ),
          onTap: onTapSell,
        );

        final buyCard = _buildActionCard(
          title: 'Buy',
          subtitle: 'Refurbished',
          cardBgColor: const Color(0xFFEEF2FF),
          borderColor: const Color(0xFFE0E7FF),
          iconBgColor: const Color(0xFF4F46E5),
          subtitleColor: const Color(0xFF6366F1),
          chevronColor: const Color(0xFF6366F1),
          totalWidth: totalWidth,
          isWide: isWide,
          isVeryNarrow: isVeryNarrow,
          icon: const Icon(
            Icons.shopping_bag_outlined,
            color: Colors.white,
            size: 19,
          ),
          onTap: onTapBuy,
        );

        final exchangeCard = _buildActionCard(
          title: 'Exchange',
          subtitle: 'Upgrade Gear',
          cardBgColor: const Color(0xFFFAF5FF),
          borderColor: const Color(0xFFF3E8FF),
          iconBgColor: const Color(0xFF9333EA),
          subtitleColor: const Color(0xFFA855F7),
          chevronColor: const Color(0xFFA855F7),
          totalWidth: totalWidth,
          isWide: isWide,
          isVeryNarrow: isVeryNarrow,
          icon: const Icon(
            Icons.swap_horiz_rounded,
            color: Colors.white,
            size: 20,
          ),
          onTap: onTapExchange,
        );

        final rentCard = _buildActionCard(
          title: 'Rent',
          subtitle: 'Pro Cameras',
          cardBgColor: const Color(0xFFFEF2F2),
          borderColor: const Color(0xFFFEE2E2),
          iconBgColor: const Color(0xFFEF4444),
          subtitleColor: const Color(0xFFEF4444),
          chevronColor: const Color(0xFFEF4444),
          totalWidth: totalWidth,
          isWide: isWide,
          isVeryNarrow: isVeryNarrow,
          icon: const Icon(
            Icons.videocam_outlined,
            color: Colors.white,
            size: 19,
          ),
          onTap: onTapRent,
        );

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title: What would you like to do?
            Padding(
              padding: EdgeInsets.symmetric(horizontal: isVeryNarrow ? 12 : 16),
              child: Text(
                'What would you like to do?',
                style: TextStyle(
                  fontSize: isVeryNarrow ? 16 : 18,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF0F172A),
                  letterSpacing: -0.4,
                ),
              ),
            ),
            SizedBox(height: isVeryNarrow ? 8 : 12),

            // Adaptive layout depending on screen width
            Padding(
              padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
              child: isWide
                  ? Row(
                      children: [
                        Expanded(child: sellCard),
                        SizedBox(width: itemSpacing),
                        Expanded(child: buyCard),
                        SizedBox(width: itemSpacing),
                        Expanded(child: exchangeCard),
                        SizedBox(width: itemSpacing),
                        Expanded(child: rentCard),
                      ],
                    )
                  : Column(
                      children: [
                        Row(
                          children: [
                            Expanded(child: sellCard),
                            SizedBox(width: itemSpacing),
                            Expanded(child: buyCard),
                          ],
                        ),
                        SizedBox(height: itemSpacing),
                        Row(
                          children: [
                            Expanded(child: exchangeCard),
                            SizedBox(width: itemSpacing),
                            Expanded(child: rentCard),
                          ],
                        ),
                      ],
                    ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildActionCard({
    required String title,
    required String subtitle,
    required Color cardBgColor,
    required Color borderColor,
    required Color iconBgColor,
    required Color subtitleColor,
    required Color chevronColor,
    required Widget icon,
    required VoidCallback onTap,
    required double totalWidth,
    required bool isWide,
    required bool isVeryNarrow,
  }) {
    // Dynamic responsive dimensions based on screen width
    final iconCircleSize = isVeryNarrow ? 36.0 : (isWide ? 44.0 : 40.0);
    final cardPaddingH = isVeryNarrow ? 8.0 : (isWide ? 12.0 : 10.0);
    final cardPaddingV = isVeryNarrow ? 8.0 : (isWide ? 12.0 : 10.0);
    final gapWidth = isVeryNarrow ? 6.0 : 8.0;
    final titleFontSize = isVeryNarrow ? 13.0 : (isWide ? 14.5 : 14.0);
    final subtitleFontSize = isVeryNarrow ? 10.0 : (isWide ? 11.0 : 10.5);
    final showChevron = !isVeryNarrow;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: cardPaddingH, vertical: cardPaddingV),
        decoration: BoxDecoration(
          color: cardBgColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 4,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Row(
          children: [
            // Responsive Circle Icon Container
            Container(
              width: iconCircleSize,
              height: iconCircleSize,
              decoration: BoxDecoration(
                color: iconBgColor,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: iconBgColor.withValues(alpha: 0.28),
                    blurRadius: 5,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Center(child: icon),
            ),
            SizedBox(width: gapWidth),

            // Title & Subtitle Column with flexible ellipsis
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: const Color(0xFF0F172A),
                      fontWeight: FontWeight.w900,
                      fontSize: titleFontSize,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: subtitleColor,
                      fontSize: subtitleFontSize,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.2,
                    ),
                  ),
                ],
              ),
            ),

            // Right Arrow Chevron (omitted on very narrow screens to prevent cramming)
            if (showChevron) ...[
              const SizedBox(width: 2),
              Icon(
                Icons.chevron_right_rounded,
                color: chevronColor,
                size: isVeryNarrow ? 14 : 18,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
