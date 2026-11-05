class OrderMessageModel {
  final String id;
  final String orderId;
  final String orderNumber;
  final String senderRole;
  final String senderName;
  final String senderPhone;
  final String recipientRole;
  final String text;
  final DateTime timestamp;
  final bool read;

  const OrderMessageModel({
    required this.id,
    required this.orderId,
    required this.orderNumber,
    required this.senderRole,
    required this.senderName,
    this.senderPhone = '',
    this.recipientRole = 'all',
    required this.text,
    required this.timestamp,
    this.read = false,
  });

  bool get isUserSender => senderRole.toLowerCase() == 'user';

  factory OrderMessageModel.fromJson(Map<String, dynamic> json) {
    DateTime parsedTime;
    try {
      parsedTime = DateTime.parse(json['timestamp']?.toString() ?? '');
    } catch (_) {
      parsedTime = DateTime.now();
    }

    return OrderMessageModel(
      id: json['id']?.toString() ?? '',
      orderId: json['orderId']?.toString() ?? '',
      orderNumber: json['orderNumber']?.toString() ?? '',
      senderRole: json['senderRole']?.toString() ?? 'user',
      senderName: json['senderName']?.toString() ?? '',
      senderPhone: json['senderPhone']?.toString() ?? '',
      recipientRole: json['recipientRole']?.toString() ?? 'all',
      text: json['text']?.toString() ?? '',
      timestamp: parsedTime,
      read: json['read'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderId': orderId,
      'orderNumber': orderNumber,
      'senderRole': senderRole,
      'senderName': senderName,
      'senderPhone': senderPhone,
      'recipientRole': recipientRole,
      'text': text,
      'timestamp': timestamp.toIso8601String(),
      'read': read,
    };
  }
}
