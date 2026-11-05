class ImageKitUploadRequest {
  final String file; // Base64 string or remote image URL
  final String fileName;
  final String? folder;
  final List<String>? tags;

  const ImageKitUploadRequest({
    required this.file,
    required this.fileName,
    this.folder,
    this.tags,
  });

  Map<String, dynamic> toJson() {
    return {
      'file': file,
      'fileName': fileName,
      if (folder != null && folder!.isNotEmpty) 'folder': folder,
      if (tags != null && tags!.isNotEmpty) 'tags': tags,
    };
  }
}
