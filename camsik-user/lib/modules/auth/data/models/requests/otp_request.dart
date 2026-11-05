class SendOtpRequest {
  final String phone;

  const SendOtpRequest({required this.phone});

  Map<String, dynamic> toJson() {
    return {
      'phone': phone.trim().replaceAll(RegExp(r'\D'), ''),
    };
  }

  factory SendOtpRequest.fromJson(Map<String, dynamic> json) {
    return SendOtpRequest(
      phone: json['phone']?.toString() ?? '',
    );
  }
}

class VerifyOtpRequest {
  final String phone;
  final String otp;

  const VerifyOtpRequest({
    required this.phone,
    required this.otp,
  });

  Map<String, dynamic> toJson() {
    return {
      'phone': phone.trim().replaceAll(RegExp(r'\D'), ''),
      'otp': otp.trim(),
    };
  }

  factory VerifyOtpRequest.fromJson(Map<String, dynamic> json) {
    return VerifyOtpRequest(
      phone: json['phone']?.toString() ?? '',
      otp: json['otp']?.toString() ?? '',
    );
  }
}
