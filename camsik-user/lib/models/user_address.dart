class UserAddress {
  final String id;
  final String tag; // 'Home', 'Office', 'Other'
  final String contactName;
  final String contactPhone;
  final String flat;
  final String street;
  final String city;
  final String pincode;
  final bool isDefault;

  const UserAddress({
    required this.id,
    this.tag = 'Home',
    this.contactName = '',
    this.contactPhone = '',
    required this.flat,
    required this.street,
    required this.city,
    required this.pincode,
    this.isDefault = false,
  });

  String get formattedAddress {
    final parts = [
      if (flat.isNotEmpty) flat,
      if (street.isNotEmpty) street,
      if (city.isNotEmpty) city,
      if (pincode.isNotEmpty) pincode,
    ];
    return parts.join(', ');
  }

  UserAddress copyWith({
    String? id,
    String? tag,
    String? contactName,
    String? contactPhone,
    String? flat,
    String? street,
    String? city,
    String? pincode,
    bool? isDefault,
  }) {
    return UserAddress(
      id: id ?? this.id,
      tag: tag ?? this.tag,
      contactName: contactName ?? this.contactName,
      contactPhone: contactPhone ?? this.contactPhone,
      flat: flat ?? this.flat,
      street: street ?? this.street,
      city: city ?? this.city,
      pincode: pincode ?? this.pincode,
      isDefault: isDefault ?? this.isDefault,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tag': tag,
      'contactName': contactName,
      'contactPhone': contactPhone,
      'flat': flat,
      'street': street,
      'city': city,
      'pincode': pincode,
      'isDefault': isDefault,
    };
  }

  factory UserAddress.fromJson(Map<String, dynamic> json) {
    return UserAddress(
      id: json['id']?.toString() ?? 'addr-${DateTime.now().millisecondsSinceEpoch}',
      tag: json['tag']?.toString() ?? 'Home',
      contactName: json['contactName']?.toString() ?? '',
      contactPhone: json['contactPhone']?.toString() ?? '',
      flat: json['flat']?.toString() ?? '',
      street: json['street']?.toString() ?? '',
      city: json['city']?.toString() ?? 'Mumbai',
      pincode: json['pincode']?.toString() ?? '',
      isDefault: json['isDefault'] == true,
    );
  }
}
