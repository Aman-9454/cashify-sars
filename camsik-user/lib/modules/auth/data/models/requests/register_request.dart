class RegisterRequest {
  final String name;
  final String phone;
  final String email;
  final String password;
  final String role;

  const RegisterRequest({
    required this.name,
    required this.phone,
    required this.email,
    required this.password,
    this.role = 'user',
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name.trim(),
      'phone': phone.trim().replaceAll(RegExp(r'\D'), ''),
      'email': email.trim(),
      'password': password.trim(),
      'role': role,
    };
  }

  factory RegisterRequest.fromJson(Map<String, dynamic> json) {
    return RegisterRequest(
      name: json['name']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      password: json['password']?.toString() ?? '',
      role: json['role']?.toString() ?? 'user',
    );
  }
}
