class PartnerLoginRequest {
  final String identifier;
  final String password;
  final String role;

  const PartnerLoginRequest({
    required this.identifier,
    required this.password,
    this.role = 'partner',
  });

  Map<String, dynamic> toJson() {
    return {
      'identifier': identifier.trim(),
      'password': password.trim(),
      'role': role,
    };
  }
}
