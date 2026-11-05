class PartnerRegisterRequest {
  final String name;
  final String phone;
  final String email;
  final String password;
  final String storeName;
  final String city;
  final String state;
  final String pinCode;
  final String address;
  final String panNumber;
  final String? gstNumber;
  final String? bankName;
  final String? accountNumber;
  final String? ifscCode;
  final List<String> categories;

  const PartnerRegisterRequest({
    required this.name,
    required this.phone,
    required this.email,
    required this.password,
    required this.storeName,
    required this.city,
    this.state = 'Maharashtra',
    required this.pinCode,
    required this.address,
    required this.panNumber,
    this.gstNumber,
    this.bankName = 'HDFC Bank',
    this.accountNumber,
    this.ifscCode,
    this.categories = const ['cat-dslr', 'cat-lens', 'cat-video-camera'],
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name.trim(),
      'phone': phone.trim(),
      'email': email.trim().toLowerCase(),
      'password': password.trim(),
      'storeName': storeName.trim(),
      'city': city.trim(),
      'state': state.trim(),
      'pinCode': pinCode.trim(),
      'address': address.trim(),
      'panNumber': panNumber.trim().toUpperCase(),
      if (gstNumber != null && gstNumber!.trim().isNotEmpty)
        'gstNumber': gstNumber!.trim().toUpperCase(),
      if (bankName != null && bankName!.trim().isNotEmpty)
        'bankName': bankName!.trim(),
      if (accountNumber != null && accountNumber!.trim().isNotEmpty)
        'accountNumber': accountNumber!.trim(),
      if (ifscCode != null && ifscCode!.trim().isNotEmpty)
        'ifscCode': ifscCode!.trim().toUpperCase(),
      'categories': categories,
    };
  }
}
