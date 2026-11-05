class SendOrderMessageRequest {
  final String orderId;
  final String orderNumber;
  final String senderRole;
  final String senderName;
  final String senderPhone;
  final String recipientRole;
  final String text;

  const SendOrderMessageRequest({
    required this.orderId,
    required this.orderNumber,
    this.senderRole = 'user',
    required this.senderName,
    this.senderPhone = '',
    this.recipientRole = 'delivery',
    required this.text,
  });

  Map<String, dynamic> toJson() {
    return {
      'orderId': orderId,
      'orderNumber': orderNumber,
      'senderRole': senderRole,
      'senderName': senderName,
      'senderPhone': senderPhone,
      'recipientRole': recipientRole,
      'text': text,
    };
  }
}
