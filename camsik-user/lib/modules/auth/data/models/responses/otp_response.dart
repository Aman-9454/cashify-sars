class OtpResponse {
  final bool success;
  final String? message;
  final String? otp;

  const OtpResponse({
    required this.success,
    this.message,
    this.otp,
  });

  factory OtpResponse.fromJson(Map<String, dynamic> json) {
    return OtpResponse(
      success: json['success'] == true,
      message: json['message']?.toString(),
      otp: json['otp']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      if (message != null) 'message': message,
      if (otp != null) 'otp': otp,
    };
  }
}
