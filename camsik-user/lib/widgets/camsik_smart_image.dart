import 'package:flutter/material.dart';

// ── ROBUST IMAGE RENDERER (ASSETS, NETWORK & GRACEFUL FALLBACK) ──
class CamsikSmartImage extends StatelessWidget {
  final String? image;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Widget? fallback;
  final double iconSize;
  final Color iconColor;

  const CamsikSmartImage({
    super.key,
    required this.image,
    this.width,
    this.height,
    this.fit = BoxFit.contain,
    this.fallback,
    this.iconSize = 32,
    this.iconColor = const Color(0xFF94A3B8),
  });

  @override
  Widget build(BuildContext context) {
    final raw = (image ?? '').trim();
    final defaultFallback = fallback ?? Icon(Icons.devices, size: iconSize, color: iconColor);

    if (raw.isEmpty) {
      return defaultFallback;
    }

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return Image.network(
        raw,
        width: width,
        height: height,
        fit: fit,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Center(
            child: SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                value: loadingProgress.expectedTotalBytes != null
                    ? loadingProgress.cumulativeBytesLoaded / (loadingProgress.expectedTotalBytes ?? 1)
                    : null,
                color: const Color(0xFF059669),
              ),
            ),
          );
        },
        errorBuilder: (context, error, stackTrace) => defaultFallback,
      );
    }

    // Local asset: ensure leading slashes are removed
    var cleanPath = raw;
    while (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }

    return Image.asset(
      cleanPath,
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (context, error, stackTrace) => defaultFallback,
    );
  }
}
