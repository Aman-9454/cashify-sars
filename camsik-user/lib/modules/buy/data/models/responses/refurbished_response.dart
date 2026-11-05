class RefurbishedResponse {
  final bool success;
  final List<Map<String, dynamic>> products;

  const RefurbishedResponse({
    this.success = true,
    required this.products,
  });

  factory RefurbishedResponse.fromJson(Map<String, dynamic> json) {
    final list = json['products'] as List? ?? [];
    return RefurbishedResponse(
      success: json['success'] != false,
      products: list
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'products': products,
    };
  }
}
