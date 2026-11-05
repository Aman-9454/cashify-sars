class CreateOrderRequest {
  final String type;
  final String customerName;
  final String customerPhone;
  final String customerAddress;
  final String city;
  final String pincode;
  final String pickupDate;
  final String pickupSlot;
  final String paymentMethod;
  final num amount;
  final String deviceName;
  final Map<String, dynamic>? additionalData;

  const CreateOrderRequest({
    required this.type,
    required this.customerName,
    required this.customerPhone,
    required this.customerAddress,
    required this.city,
    required this.pincode,
    required this.pickupDate,
    required this.pickupSlot,
    required this.paymentMethod,
    required this.amount,
    required this.deviceName,
    this.additionalData,
  });

  Map<String, dynamic> toJson() {
    final map = <String, dynamic>{
      'type': type,
      'customerName': customerName,
      'customerPhone': customerPhone,
      'customerAddress': customerAddress,
      'city': city,
      'pincode': pincode,
      'pickupDate': pickupDate,
      'pickupSlot': pickupSlot,
      'paymentMethod': paymentMethod,
      'amount': amount,
      'deviceName': deviceName,
    };
    if (additionalData != null) {
      map.addAll(additionalData!);
    }
    return map;
  }

  factory CreateOrderRequest.fromJson(Map<String, dynamic> json) {
    return CreateOrderRequest(
      type: json['type']?.toString() ?? 'sell',
      customerName: json['customerName']?.toString() ?? '',
      customerPhone: json['customerPhone']?.toString() ?? '',
      customerAddress: json['customerAddress']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      pincode: json['pincode']?.toString() ?? '',
      pickupDate: json['pickupDate']?.toString() ?? '',
      pickupSlot: json['pickupSlot']?.toString() ?? '',
      paymentMethod: json['paymentMethod']?.toString() ?? '',
      amount: json['amount'] as num? ?? 0,
      deviceName: json['deviceName']?.toString() ?? '',
      additionalData: json,
    );
  }
}
