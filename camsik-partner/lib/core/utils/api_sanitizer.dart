class ApiSanitizer {
  // ── IMAGE & DATA SANITIZATION HELPERS ──
  static String cleanImagePath(dynamic path, {String? categoryId}) {
    if (path == null) {
      return categoryFallback(categoryId);
    }
    var s = path.toString().trim();
    if (s.isEmpty) return categoryFallback(categoryId);
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    while (s.startsWith('/')) {
      s = s.substring(1);
    }
    return s;
  }

  static String categoryFallback(String? categoryId) {
    switch (categoryId) {
      case 'cat-dslr':
      case 'Cameras':
      case 'cameras':
        return 'assets/images/categories/dslr.png';
      case 'cat-lens':
        return 'assets/images/categories/lens.png';
      case 'cat-video':
      case 'cat-video-camera':
        return 'assets/images/categories/video.png';
      case 'cat-action':
      case 'cat-action-camera':
        return 'assets/images/categories/action.png';
      case 'cat-gimbal':
        return 'assets/images/categories/gimbal.png';
      case 'cat-smartphone':
      case 'Smartphones':
        return 'assets/images/categories/smartphone.png';
      case 'cat-laptop':
      case 'Laptops':
        return 'assets/images/categories/laptop.png';
      case 'cat-tablet':
      case 'Tablets':
        return 'assets/images/categories/tablet.png';
      default:
        return 'assets/images/categories/dslr.png';
    }
  }

  static void sanitizeCategories(List<Map<String, dynamic>> list) {
    for (final cat in list) {
      cat['image'] = cleanImagePath(cat['image'], categoryId: cat['id']?.toString());
    }
  }

  static void sanitizeModels(List<Map<String, dynamic>> list) {
    for (final m in list) {
      m['image'] = cleanImagePath(m['image'], categoryId: m['categoryId']?.toString());
      if (m['specs'] is Map) {
        final entries = (m['specs'] as Map).entries.map((e) => '${e.key}: ${e.value}').take(2);
        m['specs'] = entries.isNotEmpty ? entries.join(' · ') : '';
      } else if (m['specs'] == null) {
        m['specs'] = '';
      } else {
        m['specs'] = m['specs'].toString();
      }
      if (m['basePrice'] != null) {
        m['basePrice'] = (m['basePrice'] as num).toInt();
      }
    }
  }

  static void sanitizeRentalCameras(List<Map<String, dynamic>> list) {
    for (final c in list) {
      c['image'] = cleanImagePath(c['image'], categoryId: 'cameras');
      if (c['gallery'] is List) {
        c['gallery'] = (c['gallery'] as List).map((g) => cleanImagePath(g, categoryId: 'cameras')).toList();
      }
      c['dailyPrice'] = (c['dailyPrice'] as num?)?.toInt() ?? 0;
      c['weeklyPrice'] = (c['weeklyPrice'] as num?)?.toInt() ?? 0;
      c['securityDeposit'] = (c['securityDeposit'] as num?)?.toInt() ?? 0;
      c['rating'] = (c['rating'] as num?)?.toDouble() ?? 4.9;
      c['reviewsCount'] = (c['reviewsCount'] as num?)?.toInt() ?? 50;
      c['stock'] = (c['stock'] as num?)?.toInt() ?? 3;
    }
  }

  static void sanitizeRefurbished(List<Map<String, dynamic>> list) {
    for (final p in list) {
      p['image'] = cleanImagePath(p['image'], categoryId: p['category']?.toString());
      if (p['gallery'] is List) {
        p['gallery'] = (p['gallery'] as List).map((g) => cleanImagePath(g, categoryId: p['category']?.toString())).toList();
      }
      final bRaw = p['batteryHealth'];
      if (bRaw is num) {
        p['batteryHealth'] = '$bRaw% Battery';
      } else if (bRaw != null) {
        final bStr = bRaw.toString().trim();
        if (RegExp(r'^\d+$').hasMatch(bStr)) {
          p['batteryHealth'] = '$bStr% Battery';
        } else {
          p['batteryHealth'] = bStr;
        }
      } else {
        p['batteryHealth'] = '98% Battery';
      }
      p['sellingPrice'] = (p['sellingPrice'] as num?)?.toInt() ?? 0;
      p['originalPrice'] = (p['originalPrice'] as num?)?.toInt() ?? 0;
      p['discount'] = (p['discount'] as num?)?.toInt() ?? 0;

      final existingUnits = p['availableUnits'];
      if (existingUnits == null || (existingUnits is List && existingUnits.isEmpty)) {
        final brand = p['brand']?.toString() ?? 'Camsik';
        final cond = p['condition']?.toString() ?? 'Superb';
        final sellP = p['sellingPrice'] as int;
        final origP = p['originalPrice'] as int;
        final batt = p['batteryHealth'] as String;
        final stock = (p['stock'] as num?)?.toInt() ?? 3;
        final count = stock > 0 ? (stock > 4 ? 4 : stock) : 2;

        p['availableUnits'] = List.generate(count, (uIdx) => {
          'unitId': 'U-${p['id']}-0${uIdx + 1}',
          'storage': p['storage']?.toString() ?? 'Standard',
          'color': p['color']?.toString() ?? 'Standard',
          'condition': cond,
          'batteryHealth': batt,
          'price': sellP,
          'originalPrice': origP,
          'serial': 'CSM-${brand.toUpperCase().replaceAll(' ', '')}-${8810 + uIdx}',
          'note': 'Unit ${uIdx + 1} · $batt · $cond Condition · 45-Point Inspected',
        });
      }
    }
  }
}
