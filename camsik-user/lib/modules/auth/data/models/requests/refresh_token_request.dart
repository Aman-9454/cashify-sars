class RefreshTokenRequest {
  final String token;

  const RefreshTokenRequest({required this.token});

  Map<String, dynamic> toJson() {
    return {
      'token': token.trim(),
    };
  }

  factory RefreshTokenRequest.fromJson(Map<String, dynamic> json) {
    return RefreshTokenRequest(
      token: json['token']?.toString() ?? '',
    );
  }
}
