class FetchModelsRequest {
  final String? categoryId;
  final String? search;

  const FetchModelsRequest({
    this.categoryId,
    this.search,
  });

  Map<String, dynamic> toQueryParameters() {
    final params = <String, dynamic>{};
    if (categoryId != null && categoryId!.isNotEmpty && categoryId != 'all') {
      params['categoryId'] = categoryId;
    }
    if (search != null && search!.trim().isNotEmpty) {
      params['search'] = search!.trim();
    }
    return params;
  }
}
