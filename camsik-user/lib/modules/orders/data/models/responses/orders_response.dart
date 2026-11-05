class OrdersResponse {
  final bool success;
  final List<Map<String, dynamic>> orders;

  const OrdersResponse({
    this.success = true,
    required this.orders,
  });

  factory OrdersResponse.fromJson(Map<String, dynamic> json) {
    final list = json['orders'] as List? ?? [];
    return OrdersResponse(
      success: json['success'] != false,
      orders: list
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'orders': orders,
    };
  }
}

class CreateOrderResponse {
  final bool success;
  final String? message;
  final Map<String, dynamic>? order;

  const CreateOrderResponse({
    required this.success,
    this.message,
    this.order,
  });

  factory CreateOrderResponse.fromJson(Map<String, dynamic> json) {
    return CreateOrderResponse(
      success: json['success'] == true,
      message: json['message']?.toString(),
      order: json['order'] is Map ? Map<String, dynamic>.from(json['order'] as Map) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      if (message != null) 'message': message,
      if (order != null) 'order': order,
    };
  }
}
