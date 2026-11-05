class FetchQuestionsRequest {
  final String categoryId;

  const FetchQuestionsRequest({required this.categoryId});

  Map<String, dynamic> toQueryParameters() {
    return {
      'categoryId': categoryId.trim(),
    };
  }
}
