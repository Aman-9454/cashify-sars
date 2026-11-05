class DeliveryAgentModel {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String city;
  final List<String> pinCodes;
  String status; // online, offline, on_trip
  final double rating;
  final int todayPickups;
  final int todayDeliveries;
  final String? partnerId;
  final String vehicle;
  final String vehicleNumber;

  DeliveryAgentModel({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.city,
    required this.pinCodes,
    required this.status,
    required this.rating,
    required this.todayPickups,
    required this.todayDeliveries,
    this.partnerId,
    this.vehicle = 'Bike',
    this.vehicleNumber = 'MH02AB1234',
  });

  factory DeliveryAgentModel.fromJson(Map<String, dynamic> json) {
    return DeliveryAgentModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Rider',
      phone: json['phone']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      city: json['city']?.toString() ?? 'Mumbai',
      pinCodes: (json['pinCodes'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      status: json['status']?.toString() ?? 'online',
      rating: (json['rating'] as num?)?.toDouble() ?? 4.9,
      todayPickups: (json['todayPickups'] as num?)?.toInt() ?? 0,
      todayDeliveries: (json['todayDeliveries'] as num?)?.toInt() ?? 0,
      partnerId: json['partnerId']?.toString(),
      vehicle: json['vehicle']?.toString() ?? 'Bike',
      vehicleNumber: json['vehicleNumber']?.toString() ?? 'MH02AB1234',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'phone': phone,
    'email': email,
    'city': city,
    'pinCodes': pinCodes,
    'status': status,
    'rating': rating,
    'todayPickups': todayPickups,
    'todayDeliveries': todayDeliveries,
    'partnerId': partnerId,
    'vehicle': vehicle,
    'vehicleNumber': vehicleNumber,
  };
}
