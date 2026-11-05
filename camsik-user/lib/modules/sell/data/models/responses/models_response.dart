class ModelsResponse {
  final bool success;
  final List<DeviceModelData> models;

  const ModelsResponse({
    this.success = true,
    required this.models,
  });

  factory ModelsResponse.fromJson(Map<String, dynamic> json) {
    final list = json['models'] as List? ?? [];
    return ModelsResponse(
      success: json['success'] != false,
      models: list
          .whereType<Map>()
          .map((e) => DeviceModelData.fromJson(Map<String, dynamic>.from(e)))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'models': models.map((m) => m.toJson()).toList(),
    };
  }
}

class DeviceModelData {
  final String id;
  final String name;
  final String brand;
  final String categoryId;
  final String image;
  final num basePrice;
  final List<Map<String, dynamic>> variants;

  const DeviceModelData({
    required this.id,
    required this.name,
    required this.brand,
    required this.categoryId,
    required this.image,
    required this.basePrice,
    this.variants = const [],
  });

  factory DeviceModelData.fromJson(Map<String, dynamic> json) {
    final rawVariants = json['variants'] as List? ?? [];
    return DeviceModelData(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      brand: json['brand']?.toString() ?? '',
      categoryId: json['categoryId']?.toString() ?? '',
      image: json['image']?.toString() ?? '',
      basePrice: json['basePrice'] as num? ?? 0,
      variants: rawVariants
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'brand': brand,
      'categoryId': categoryId,
      'image': image,
      'basePrice': basePrice,
      'variants': variants,
    };
  }
}
