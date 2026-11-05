class CategoriesResponse {
  final bool success;
  final List<CategoryModel> categories;

  const CategoriesResponse({
    this.success = true,
    required this.categories,
  });

  factory CategoriesResponse.fromJson(Map<String, dynamic> json) {
    final list = json['categories'] as List? ?? [];
    return CategoriesResponse(
      success: json['success'] != false,
      categories: list
          .whereType<Map>()
          .map((e) => CategoryModel.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'categories': categories.map((c) => c.toJson()).toList(),
    };
  }
}

class CategoryModel {
  final String id;
  final String name;
  final String icon;
  final String? image;
  final bool isHot;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.icon,
    this.image,
    this.isHot = false,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      icon: json['icon']?.toString() ?? 'devices_other',
      image: json['image']?.toString(),
      isHot: json['isHot'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      if (image != null) 'image': image,
      'isHot': isHot,
    };
  }
}
