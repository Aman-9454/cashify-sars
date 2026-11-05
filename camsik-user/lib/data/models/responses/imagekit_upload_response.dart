class ImageKitUploadResponse {
  final bool success;
  final String fileId;
  final String name;
  final String url;
  final String thumbnailUrl;

  const ImageKitUploadResponse({
    required this.success,
    required this.fileId,
    required this.name,
    required this.url,
    required this.thumbnailUrl,
  });

  factory ImageKitUploadResponse.fromJson(Map<String, dynamic> json) {
    final data = (json['data'] is Map<String, dynamic>)
        ? json['data'] as Map<String, dynamic>
        : json;

    return ImageKitUploadResponse(
      success: json['success'] == true,
      fileId: data['fileId']?.toString() ?? '',
      name: data['name']?.toString() ?? '',
      url: data['url']?.toString() ?? '',
      thumbnailUrl: data['thumbnailUrl']?.toString() ?? data['url']?.toString() ?? '',
    );
  }
}
