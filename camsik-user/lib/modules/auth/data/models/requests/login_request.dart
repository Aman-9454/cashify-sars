class LoginRequest {
  final String identifier;
  final String password;

  const LoginRequest({
    required this.identifier,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'identifier': identifier.trim(),
      'password': password.trim(),
    };
  }

  factory LoginRequest.fromJson(Map<String, dynamic> json) {
    return LoginRequest(
      identifier: json['identifier']?.toString() ?? '',
      password: json['password']?.toString() ?? '',
    );
  }
}
