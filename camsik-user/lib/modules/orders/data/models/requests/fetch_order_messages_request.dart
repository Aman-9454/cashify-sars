class FetchOrderMessagesRequest {
  final String? orderId;
  final String? orderNumber;

  const FetchOrderMessagesRequest({
    this.orderId,
    this.orderNumber,
  });

  Map<String, dynamic> toQueryParameters() {
    final params = <String, dynamic>{};
    if (orderId != null && orderId!.isNotEmpty) {
      params['orderId'] = orderId;
    }
    if (orderNumber != null && orderNumber!.isNotEmpty) {
      params['orderNumber'] = orderNumber;
    }
    return params;
  }
}
