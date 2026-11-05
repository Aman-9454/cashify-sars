class RentalsResponse {
  final bool success;
  final List<Map<String, dynamic>> cameras;

  const RentalsResponse({
    this.success = true,
    required this.cameras,
  });

  factory RentalsResponse.fromJson(Map<String, dynamic> json) {
    final list = json['cameras'] as List? ?? [];
    return RentalsResponse(
      success: json['success'] != false,
      cameras: list
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'cameras': cameras,
    };
  }
}
