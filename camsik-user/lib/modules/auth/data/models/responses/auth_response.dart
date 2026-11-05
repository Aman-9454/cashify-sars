class AuthResponse {
  final bool success;
  final String? message;
  final String? token;
  final AuthUserData? user;

  const AuthResponse({
    required this.success,
    this.message,
    this.token,
    this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      success: json['success'] == true,
      message: json['message']?.toString(),
      token: json['token']?.toString(),
      user: json['user'] is Map<String, dynamic>
          ? AuthUserData.fromJson(json['user'] as Map<String, dynamic>)
          : json['user'] is Map
              ? AuthUserData.fromJson(Map<String, dynamic>.from(json['user'] as Map))
              : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      if (message != null) 'message': message,
      if (token != null) 'token': token,
      if (user != null) 'user': user!.toJson(),
    };
  }
}

class AuthUserData {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String role;

  const AuthUserData({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    this.role = 'user',
  });

  factory AuthUserData.fromJson(Map<String, dynamic> json) {
    return AuthUserData(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'user',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'role': role,
    };
  }
}
