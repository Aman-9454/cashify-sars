class FetchRefurbishedRequest {
  final String? category;
  final String? condition;
  final String? search;

  const FetchRefurbishedRequest({
    this.category,
    this.condition,
    this.search,
  });

  Map<String, dynamic> toQueryParameters() {
    final params = <String, dynamic>{};
    if (category != null && category!.isNotEmpty && category != 'all') {
      params['category'] = category;
    }
    if (condition != null && condition!.isNotEmpty && condition != 'all') {
      params['condition'] = condition;
    }
    if (search != null && search!.trim().isNotEmpty) {
      params['search'] = search!.trim();
    }
    return params;
  }
}
