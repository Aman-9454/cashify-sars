import 'package:flutter/material.dart';

class PartnerUser {
  final String id;
  final String name;
  final String storeName;
  final String email;
  final String phone;
  final String city;
  final String state;
  final String address;
  final List<String> pinCodes;
  final List<String> categories;
  final String status;
  final double rating;
  final int totalOrders;
  final int completedOrders;
  final double totalEarnings;
  final double pendingPayout;
  double availableBalance;
  final double commission;
  final String joinedAt;
  final String bankName;
  final String accountNumber;
  final String ifscCode;
  final bool isBankVerified;

  PartnerUser({
    required this.id,
    required this.name,
    required this.storeName,
    required this.email,
    required this.phone,
    required this.city,
    this.state = 'Maharashtra',
    this.address = '',
    this.pinCodes = const [],
    this.categories = const [],
    this.status = 'active',
    this.rating = 4.9,
    this.totalOrders = 0,
    this.completedOrders = 0,
    this.totalEarnings = 0,
    this.pendingPayout = 0,
    this.availableBalance = 0,
    this.commission = 5.0,
    required this.joinedAt,
    this.bankName = 'HDFC Bank',
    this.accountNumber = '•••• 4892',
    this.ifscCode = 'HDFC0001234',
    this.isBankVerified = true,
  });

  factory PartnerUser.fromJson(Map<String, dynamic> json) {
    final docs = json['documents'] is Map ? json['documents'] as Map : null;
    final bankInfo = json['bankDetails'] is Map ? json['bankDetails'] as Map : null;

    final bName = bankInfo?['bankName']?.toString() ??
        json['bankName']?.toString() ??
        'HDFC Bank';
    final accNum = bankInfo?['accountNumber']?.toString() ??
        docs?['accountNumber']?.toString() ??
        json['accountNumber']?.toString() ??
        '•••• 4892';
    final ifsc = bankInfo?['ifscCode']?.toString() ??
        docs?['ifscCode']?.toString() ??
        json['ifscCode']?.toString() ??
        'HDFC0001234';
    final isVer = bankInfo?['isVerified'] == true ||
        docs?['verified'] == true ||
        json['isBankVerified'] == true;

    return PartnerUser(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      storeName: json['storeName']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      state: json['state']?.toString() ?? '',
      address: json['address']?.toString() ?? '',
      pinCodes: (json['pinCodes'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      categories: (json['categories'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      status: json['status']?.toString() ?? 'active',
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      totalOrders: (json['totalOrders'] as num?)?.toInt() ?? 0,
      completedOrders: (json['completedOrders'] as num?)?.toInt() ?? 0,
      totalEarnings: (json['totalEarnings'] as num?)?.toDouble() ?? 0,
      pendingPayout: (json['pendingPayout'] as num?)?.toDouble() ?? 0,
      availableBalance: (json['availableBalance'] as num?)?.toDouble() ?? 0,
      commission: (json['commission'] as num?)?.toDouble() ?? 5.0,
      joinedAt: json['joinedAt']?.toString() ?? '2026-01-01',
      bankName: bName,
      accountNumber: accNum,
      ifscCode: ifsc,
      isBankVerified: isVer,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'storeName': storeName,
    'email': email,
    'phone': phone,
    'city': city,
    'state': state,
    'address': address,
    'pinCodes': pinCodes,
    'categories': categories,
    'status': status,
    'rating': rating,
    'totalOrders': totalOrders,
    'completedOrders': completedOrders,
    'totalEarnings': totalEarnings,
    'pendingPayout': pendingPayout,
    'availableBalance': availableBalance,
    'commission': commission,
    'joinedAt': joinedAt,
    'bankName': bankName,
    'accountNumber': accountNumber,
    'ifscCode': ifscCode,
    'isBankVerified': isBankVerified,
  };
}

class PartnerOrder {
  final String id;
  final String orderNumber;
  final String type; // sell, buy, exchange, repair
  String status;
  final String customerName;
  final String customerPhone;
  final String customerAddress;
  final String city;
  final String pinCode;
  final String deviceName;
  final String deviceBrand;
  final String deviceModel;
  final String deviceStorage;
  final double quotedPrice;
  double finalPrice;
  int? inspectionScore;
  String paymentStatus;
  final String pickupDate;
  final String pickupSlot;
  String notes;
  final String createdAt;
  String? deliveryAgentId;
  String? deliveryAgentName;
  String? deliveryAgentPhone;
  String? partnerId;

  PartnerOrder({
    required this.id,
    required this.orderNumber,
    required this.type,
    required this.status,
    required this.customerName,
    required this.customerPhone,
    required this.customerAddress,
    required this.city,
    required this.pinCode,
    required this.deviceName,
    required this.deviceBrand,
    required this.deviceModel,
    required this.deviceStorage,
    required this.quotedPrice,
    required this.finalPrice,
    this.inspectionScore,
    this.paymentStatus = 'pending',
    required this.pickupDate,
    required this.pickupSlot,
    this.notes = '',
    required this.createdAt,
    this.deliveryAgentId,
    this.deliveryAgentName,
    this.deliveryAgentPhone,
    this.partnerId,
  });

  factory PartnerOrder.fromJson(Map<String, dynamic> json) {
    return PartnerOrder(
      id: json['id']?.toString() ?? 'ord-${DateTime.now().millisecondsSinceEpoch}',
      orderNumber: json['orderNumber']?.toString() ?? 'CSM-ORD',
      type: json['type']?.toString() ?? 'sell',
      status: json['status']?.toString() ?? 'created',
      customerName: json['customerName']?.toString() ?? 'Customer',
      customerPhone: json['customerPhone']?.toString() ?? '',
      customerAddress: json['customerAddress']?.toString() ?? '',
      city: json['city']?.toString() ?? 'Mumbai',
      pinCode: json['pinCode']?.toString() ?? json['pincode']?.toString() ?? '',
      deviceName: json['deviceName']?.toString() ?? 'Tech Device',
      deviceBrand: json['deviceBrand']?.toString() ?? '',
      deviceModel: json['deviceModel']?.toString() ?? '',
      deviceStorage: json['deviceStorage']?.toString() ?? '',
      quotedPrice: (json['quotedPrice'] as num?)?.toDouble() ?? (json['amount'] as num?)?.toDouble() ?? 0.0,
      finalPrice: (json['finalPrice'] as num?)?.toDouble() ?? (json['quotedPrice'] as num?)?.toDouble() ?? 0.0,
      inspectionScore: (json['inspectionScore'] as num?)?.toInt(),
      paymentStatus: json['paymentStatus']?.toString() ?? 'pending',
      pickupDate: json['pickupDate']?.toString() ?? 'Today',
      pickupSlot: json['pickupSlot']?.toString() ?? '10:00 AM - 1:00 PM',
      notes: json['notes']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? DateTime.now().toIso8601String(),
      deliveryAgentId: json['deliveryAgentId']?.toString() ?? json['delivery_agent_id']?.toString(),
      deliveryAgentName: json['deliveryAgentName']?.toString() ?? json['delivery_agent_name']?.toString(),
      deliveryAgentPhone: json['deliveryAgentPhone']?.toString() ?? json['delivery_agent_phone']?.toString(),
      partnerId: json['partnerId']?.toString() ?? json['assignedPartnerId']?.toString(),
    );
  }

  double get offeredPrice => finalPrice > 0 ? finalPrice : quotedPrice;

  String get statusDisplay {
    switch (status) {
      case 'created':
        return 'Order Created';
      case 'assigned':
        return 'Assigned to Store';
      case 'accepted':
        return 'Store Accepted';
      case 'pickup_scheduled':
        return 'Pickup Scheduled';
      case 'picked_up':
        return 'Picked Up';
      case 'in_transit':
        return 'In Transit';
      case 'inspection':
        return 'Under 45-Pt QA';
      case 'inspection_completed':
        return 'QA Passed';
      case 'final_price':
        return 'Final Price Quoted';
      case 'completed':
        return 'Completed';
      case 'paid':
        return 'Payment Disbursed';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
        return 'Rejected';
      default:
        return status.replaceAll('_', ' ').toUpperCase();
    }
  }

  Color get statusColor {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'inspection_completed':
        return const Color(0xFF10B981);
      case 'assigned':
      case 'accepted':
      case 'pickup_scheduled':
        return const Color(0xFF2563EB);
      case 'inspection':
      case 'picked_up':
      case 'in_transit':
      case 'final_price':
        return const Color(0xFFD97706);
      case 'cancelled':
      case 'rejected':
        return const Color(0xFFEF4444);
      default:
        return const Color(0xFF64748B);
    }
  }

  Color get typeColor {
    switch (type) {
      case 'sell':
        return const Color(0xFF7C3AED);
      case 'buy':
        return const Color(0xFF2563EB);
      case 'exchange':
        return const Color(0xFF059669);
      case 'repair':
        return const Color(0xFFD97706);
      default:
        return const Color(0xFF2563EB);
    }
  }
}
