class FetchRentalsRequest {
  final String? category;
  final String? brand;
  final String? search;

  const FetchRentalsRequest({
    this.category,
    this.brand,
    this.search,
  });

  Map<String, dynamic> toQueryParameters() {
    final params = <String, dynamic>{};
    if (category != null && category!.isNotEmpty && category != 'all') {
      params['category'] = category;
    }
    if (brand != null && brand!.isNotEmpty && brand != 'all') {
      params['brand'] = brand;
    }
    if (search != null && search!.trim().isNotEmpty) {
      params['search'] = search!.trim();
    }
    return params;
  }
}
