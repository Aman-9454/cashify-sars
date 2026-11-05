class DeliveryLoginRequest {
  final String identifier;
  final String password;
  final String role;

  const DeliveryLoginRequest({
    required this.identifier,
    required this.password,
    this.role = 'delivery',
  });

  Map<String, dynamic> toJson() {
    return {
      'identifier': identifier,
      'password': password,
      'role': role,
    };
  }
}
