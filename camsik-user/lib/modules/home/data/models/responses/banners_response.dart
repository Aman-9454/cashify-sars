class BannersResponse {
  final bool success;
  final List<BannerModel> banners;

  const BannersResponse({
    this.success = true,
    required this.banners,
  });

  factory BannersResponse.fromJson(Map<String, dynamic> json) {
    final list = json['banners'] as List? ?? [];
    return BannersResponse(
      success: json['success'] != false,
      banners: list
          .whereType<Map>()
          .map((e) => BannerModel.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'banners': banners.map((b) => b.toJson()).toList(),
    };
  }
}

class BannerModel {
  final String id;
  final String title;
  final String subtitle;
  final String image;
  final String? categoryFilter;

  const BannerModel({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.image,
    this.categoryFilter,
  });

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      subtitle: json['subtitle']?.toString() ?? '',
      image: json['image']?.toString() ?? '',
      categoryFilter: json['categoryFilter']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'subtitle': subtitle,
      'image': image,
      if (categoryFilter != null) 'categoryFilter': categoryFilter,
    };
  }
}
