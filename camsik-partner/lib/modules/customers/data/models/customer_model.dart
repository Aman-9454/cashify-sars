import '../../../../models/partner_models.dart';

class CustomerModel {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String city;
  final String pinCode;
  final String address;
  final int orderCount;
  final double totalSpent;
  final String latestDevice;
  final String latestOrderType;
  final String latestOrderDate;
  final String status; // vip, repeat, active
  final List<PartnerOrder> orders;

  CustomerModel({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.city,
    required this.pinCode,
    required this.address,
    required this.orderCount,
    required this.totalSpent,
    required this.latestDevice,
    required this.latestOrderType,
    required this.latestOrderDate,
    required this.status,
    required this.orders,
  });

  factory CustomerModel.fromOrders(String key, List<PartnerOrder> userOrders) {
    final sortedOrders = List<PartnerOrder>.from(userOrders)
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    final first = sortedOrders.first;
    final totalSpent = sortedOrders.fold<double>(
      0.0,
      (s, o) => s + (o.finalPrice > 0 ? o.finalPrice : o.quotedPrice),
    );
    final count = sortedOrders.length;
    final isVip = totalSpent >= 50000 || count >= 3;
    final isRepeat = count >= 2;
    final status = isVip ? 'vip' : (isRepeat ? 'repeat' : 'active');

    final cleanPhone = first.customerPhone.isNotEmpty ? first.customerPhone : key;

    return CustomerModel(
      id: 'cust-${first.id}',
      name: first.customerName.trim().isNotEmpty ? first.customerName.trim() : 'Store Client',
      phone: cleanPhone,
      email: '',
      city: first.city.trim().isNotEmpty
          ? first.city.trim()
          : (first.pinCode.trim().isNotEmpty ? 'PIN: ${first.pinCode.trim()}' : 'Client Region'),
      pinCode: first.pinCode.trim(),
      address: first.customerAddress.trim().isNotEmpty ? first.customerAddress.trim() : '',
      orderCount: count,
      totalSpent: totalSpent,
      latestDevice: first.deviceName.isNotEmpty
          ? first.deviceName
          : (first.deviceModel.isNotEmpty ? first.deviceModel : 'Traded Device'),
      latestOrderType: first.type,
      latestOrderDate: first.pickupDate.isNotEmpty ? first.pickupDate : first.createdAt,
      status: status,
      orders: sortedOrders,
    );
  }
}
