class RefreshTokenResponse {
  final bool success;
  final String? accessToken;
  final String? message;

  const RefreshTokenResponse({
    required this.success,
    this.accessToken,
    this.message,
  });

  factory RefreshTokenResponse.fromJson(Map<String, dynamic> json) {
    return RefreshTokenResponse(
      success: json['success'] == true,
      accessToken: json['data']?['accessToken']?.toString() ?? json['accessToken']?.toString(),
      message: json['message']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      if (accessToken != null) 'accessToken': accessToken,
      if (message != null) 'message': message,
    };
  }
}
