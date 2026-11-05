class FetchOrdersRequest {
  final String? phone;

  const FetchOrdersRequest({this.phone});

  Map<String, dynamic> toQueryParameters() {
    final params = <String, dynamic>{};
    if (phone != null && phone!.trim().isNotEmpty) {
      params['phone'] = phone!.trim();
    }
    return params;
  }
}
