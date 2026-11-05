import 'package:flutter/material.dart';

class DeliveryAgentUser {
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
  final int totalDeliveries;
  final double earnings;
  final String vehicle;
  final String vehicleNumber;
  final String joinedAt;

  DeliveryAgentUser({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.city,
    this.pinCodes = const [],
    this.status = 'online',
    this.rating = 4.9,
    this.todayPickups = 0,
    this.todayDeliveries = 0,
    this.totalDeliveries = 0,
    this.earnings = 0.0,
    this.vehicle = 'Motorcycle',
    this.vehicleNumber = 'MH-04-AB-1234',
    required this.joinedAt,
  });

  factory DeliveryAgentUser.fromJson(Map<String, dynamic> json) {
    return DeliveryAgentUser(
      id: json['id']?.toString() ?? 'agent-101',
      name: json['name']?.toString() ?? 'Field Executive',
      phone: json['phone']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      city: json['city']?.toString() ?? 'Mumbai',
      pinCodes: (json['pinCodes'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      status: json['status']?.toString() ?? 'online',
      rating: (json['rating'] as num?)?.toDouble() ?? 4.9,
      todayPickups: (json['todayPickups'] as num?)?.toInt() ?? 0,
      todayDeliveries: (json['todayDeliveries'] as num?)?.toInt() ?? 0,
      totalDeliveries: (json['totalDeliveries'] as num?)?.toInt() ?? 0,
      earnings: (json['earnings'] as num?)?.toDouble() ?? 0.0,
      vehicle: json['vehicle']?.toString() ?? 'Motorcycle',
      vehicleNumber: json['vehicleNumber']?.toString() ?? 'MH-04-AB-1234',
      joinedAt: json['joinedAt']?.toString() ?? '2026-01-01',
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
    'totalDeliveries': totalDeliveries,
    'earnings': earnings,
    'vehicle': vehicle,
    'vehicleNumber': vehicleNumber,
    'joinedAt': joinedAt,
  };
}

enum SlotPeriod {
  morning,   // 8 AM - 12 PM (SABSE UPAR)
  afternoon, // 12 PM - 4 PM (Dopahar)
  evening,   // 4 PM - 9 PM (Sham)
  other,
}

enum DayGroup {
  today,
  tomorrow,
  upcoming,
}

enum DeviceCategory {
  smartphone,
  camera,
  lens,
  laptop,
  tablet,
  smartwatch,
}

class DeliveryTask {
  final String id;
  final String orderNumber;
  final String type; // sell (pickup), buy (delivery), exchange (both)
  String status;
  final String customerName;
  final String customerPhone;
  final String customerAddress;
  final String city;
  final String pinCode;
  final String deviceName;
  final String? category;
  final double quotedPrice;
  double finalPrice;
  final String paymentMethod;
  String paymentStatus;
  final String pickupDate;
  final String pickupSlot;
  final String otp;
  String notes;
  final String createdAt;
  bool deviceCollected;
  int? inspectionScore;
  String? deviceImei;
  String? partnerName;
  String? partnerId;
  String? deliveryAgentId;
  String? assignedRiderId;
  String? deliveryAgentPhone;
  String? deliveryAgentName;

  DeliveryTask({
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
    this.category,
    required this.quotedPrice,
    required this.finalPrice,
    this.paymentMethod = 'UPI / Instant Bank Transfer',
    this.paymentStatus = 'pending',
    required this.pickupDate,
    required this.pickupSlot,
    this.otp = '1234',
    this.notes = '',
    required this.createdAt,
    this.deviceCollected = false,
    this.inspectionScore,
    this.deviceImei,
    this.partnerName,
    this.partnerId,
    this.deliveryAgentId,
    this.assignedRiderId,
    this.deliveryAgentPhone,
    this.deliveryAgentName,
  });

  factory DeliveryTask.fromJson(Map<String, dynamic> json) {
    return DeliveryTask(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? 'task-${DateTime.now().millisecondsSinceEpoch}',
      orderNumber: json['orderNumber']?.toString() ?? 'CSM-DEL',
      type: json['type']?.toString() ?? 'sell',
      status: json['status']?.toString() ?? 'assigned',
      customerName: json['customerName']?.toString() ?? 'Customer',
      customerPhone: json['customerPhone']?.toString() ?? '',
      customerAddress: json['customerAddress']?.toString() ?? '',
      city: json['city']?.toString() ?? 'Mumbai',
      pinCode: json['pinCode']?.toString() ?? json['pincode']?.toString() ?? '',
      deviceName: json['deviceName']?.toString() ?? 'Tech Gadget',
      category: json['category']?.toString() ?? json['productType']?.toString() ?? json['deviceCategory']?.toString(),
      quotedPrice: (json['quotedPrice'] as num?)?.toDouble() ?? (json['amount'] as num?)?.toDouble() ?? 0.0,
      finalPrice: (json['finalPrice'] as num?)?.toDouble() ?? (json['quotedPrice'] as num?)?.toDouble() ?? 0.0,
      paymentMethod: json['paymentMethod']?.toString() ?? 'UPI / Bank IMPS',
      paymentStatus: json['paymentStatus']?.toString() ?? 'pending',
      pickupDate: json['pickupDate']?.toString() ?? 'Today',
      pickupSlot: json['pickupSlot']?.toString() ?? '10:00 AM - 1:00 PM',
      otp: json['otp']?.toString() ?? '1234',
      notes: json['notes']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? DateTime.now().toIso8601String(),
      deviceCollected: json['deviceCollected'] == true || json['status'] == 'picked_up' || json['status'] == 'completed',
      inspectionScore: (json['inspectionScore'] as num?)?.toInt(),
      deviceImei: json['deviceImei']?.toString(),
      partnerName: json['partnerName']?.toString(),
      partnerId: json['partnerId']?.toString(),
      deliveryAgentId: json['deliveryAgentId']?.toString() ?? json['assignedRiderId']?.toString(),
      assignedRiderId: json['assignedRiderId']?.toString() ?? json['deliveryAgentId']?.toString(),
      deliveryAgentPhone: json['deliveryAgentPhone']?.toString(),
      deliveryAgentName: json['deliveryAgentName']?.toString() ?? json['assignedRiderName']?.toString(),
    );
  }

  DeviceCategory get detectedCategory {
    final cat = (category ?? '').toLowerCase();
    final name = deviceName.toLowerCase();

    if (cat.contains('dslr') || cat.contains('mirrorless') || cat.contains('camera') || cat.contains('video') || cat.contains('action')) {
      return DeviceCategory.camera;
    }
    if (cat.contains('lens')) {
      return DeviceCategory.lens;
    }
    if (cat.contains('laptop') || cat.contains('macbook')) {
      return DeviceCategory.laptop;
    }
    if (cat.contains('tablet') || cat.contains('ipad')) {
      return DeviceCategory.tablet;
    }
    if (cat.contains('smartwatch') || cat.contains('watch')) {
      return DeviceCategory.smartwatch;
    }

    if (name.contains('lens') || name.contains('f/1.') || name.contains('f/2.') || name.contains('f/4') || name.contains('zoom') || name.contains('macro') || name.contains('telephoto')) {
      return DeviceCategory.lens;
    }
    if (name.contains('canon') || name.contains('nikon') || name.contains('sony alpha') || name.contains('lumix') || name.contains('fujifilm') || name.contains('eos') || name.contains('dslr') || name.contains('mirrorless') || name.contains('gopro') || name.contains('camera')) {
      return DeviceCategory.camera;
    }
    if (name.contains('macbook') || name.contains('thinkpad') || name.contains('laptop') || name.contains('notebook') || name.contains('inspiron') || name.contains('xps') || name.contains('zenbook')) {
      return DeviceCategory.laptop;
    }
    if (name.contains('ipad') || name.contains('tab ') || name.contains('tablet') || name.contains('surface pro')) {
      return DeviceCategory.tablet;
    }
    if (name.contains('apple watch') || name.contains('galaxy watch') || name.contains('smartwatch') || name.contains('fitbit')) {
      return DeviceCategory.smartwatch;
    }

    return DeviceCategory.smartphone;
  }

  String get categoryDisplayName {
    switch (detectedCategory) {
      case DeviceCategory.camera:
        return 'DSLR & Mirrorless';
      case DeviceCategory.lens:
        return 'Camera Lens';
      case DeviceCategory.laptop:
        return 'Laptop';
      case DeviceCategory.tablet:
        return 'Tablet';
      case DeviceCategory.smartwatch:
        return 'Smartwatch';
      case DeviceCategory.smartphone:
        return 'Smartphone';
    }
  }

  String get apiCategoryId {
    switch (detectedCategory) {
      case DeviceCategory.camera:
        return 'cat-dslr';
      case DeviceCategory.lens:
        return 'cat-lens';
      case DeviceCategory.laptop:
        return 'cat-laptop';
      case DeviceCategory.tablet:
        return 'cat-tablet';
      case DeviceCategory.smartwatch:
        return 'cat-smartwatch';
      case DeviceCategory.smartphone:
        return 'cat-smartphone';
    }
  }

  bool get isPickup => type == 'sell' || type == 'exchange';

  String get taskTypeDisplay => isPickup ? 'Doorstep Pickup' : 'Certified Delivery';

  // 4-Step Pipeline Completion Flags
  bool get isStep1Done =>
      status == 'pickup_scheduled' ||
      status == 'in_transit' ||
      deviceCollected ||
      status == 'picked_up' ||
      status == 'completed';

  bool get isStep2Done =>
      deviceCollected || status == 'picked_up' || status == 'completed';

  bool get isStep3Done => paymentStatus == 'paid' || status == 'completed';

  bool get isStep4Done => status == 'completed';

  SlotPeriod get slotPeriod {
    final s = pickupSlot.toLowerCase().trim();
    if (s.contains('morning') ||
        s.contains('8:00') ||
        s.contains('9:00') ||
        s.contains('10:00') ||
        s.contains('11:00') ||
        s.contains('8 am') ||
        s.contains('9 am') ||
        s.contains('10 am') ||
        s.contains('11 am')) {
      return SlotPeriod.morning;
    }
    if (s.contains('afternoon') ||
        // s.contains('dopahar') ||
        s.contains('12:00') ||
        s.contains('1:00') ||
        s.contains('2:00') ||
        s.contains('3:00') ||
        s.contains('12 pm') ||
        s.contains('1 pm') ||
        s.contains('2 pm') ||
        s.contains('3 pm')) {
      return SlotPeriod.afternoon;
    }
    if (s.contains('evening') ||
        // s.contains('sham') ||
        s.contains('4:00') ||
        s.contains('5:00') ||
        s.contains('6:00') ||
        s.contains('7:00') ||
        s.contains('8:00') ||
        s.contains('4 pm') ||
        s.contains('5 pm') ||
        s.contains('6 pm') ||
        s.contains('7 pm') ||
        s.contains('8 pm')) {
      return SlotPeriod.evening;
    }

    final match = RegExp(r'(\d{1,2})(?::\d{2})?\s*(am|pm)', caseSensitive: false).firstMatch(s);
    if (match != null) {
      int hour = int.tryParse(match.group(1) ?? '10') ?? 10;
      final ampm = (match.group(2) ?? 'am').toLowerCase();
      if (ampm == 'pm' && hour < 12) hour += 12;
      if (ampm == 'am' && hour == 12) hour = 0;
      if (hour < 12) return SlotPeriod.morning;
      if (hour < 16) return SlotPeriod.afternoon;
      return SlotPeriod.evening;
    }
    return SlotPeriod.morning;
  }

  DayGroup get dayGroup {
    final d = pickupDate.trim().toLowerCase();
    if (d == 'today' || d.contains('today')) return DayGroup.today;
    if (d == 'tomorrow' || d.contains('tomorrow')) return DayGroup.tomorrow;

    final now = DateTime.now();
    final todayStr = '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    final tom = now.add(const Duration(days: 1));
    final tomStr = '${tom.year}-${tom.month.toString().padLeft(2, '0')}-${tom.day.toString().padLeft(2, '0')}';

    if (d.contains(todayStr)) return DayGroup.today;
    if (d.contains(tomStr)) return DayGroup.tomorrow;

    try {
      final parsed = DateTime.tryParse(pickupDate);
      if (parsed != null) {
        if (parsed.year == now.year && parsed.month == now.month && parsed.day == now.day) {
          return DayGroup.today;
        }
        if (parsed.year == tom.year && parsed.month == tom.month && parsed.day == tom.day) {
          return DayGroup.tomorrow;
        }
        if (parsed.isAfter(now)) return DayGroup.upcoming;
      }
    } catch (_) {}

    return DayGroup.today;
  }

  String get timeSectionLabel {
    final dayLabel = dayGroup == DayGroup.today
        ? 'Today'
        : (dayGroup == DayGroup.tomorrow ? 'Tomorrow' : pickupDate);
    final periodLabel = slotPeriod == SlotPeriod.morning
        ? 'Morning'
        : (slotPeriod == SlotPeriod.afternoon ? 'Afternoon (Dopahar)' : 'Evening (Sham)');
    return '$dayLabel • $periodLabel Slot';
  }

  /// Sort Rank Calculation:
  /// 1. Current day Morning = 10 (SABSE UPAR)
  /// 2. Current day Afternoon (Dopahar) = 20
  /// 3. Current day Evening (Sham) = 30
  /// 4. Tomorrow Morning = 110
  /// 5. Tomorrow Afternoon (Dopahar) = 120
  /// 6. Tomorrow Evening (Sham) = 130
  /// 7. Upcoming dates = 200+
  int get sortRank {
    int dayWeight = 0;
    if (dayGroup == DayGroup.today) {
      dayWeight = 0;
    } else if (dayGroup == DayGroup.tomorrow) {
      dayWeight = 100;
    } else {
      dayWeight = 200;
    }

    int slotWeight = 10;
    if (slotPeriod == SlotPeriod.morning) {
      slotWeight = 10;
    } else if (slotPeriod == SlotPeriod.afternoon) {
      slotWeight = 20;
    } else if (slotPeriod == SlotPeriod.evening) {
      slotWeight = 30;
    } else {
      slotWeight = 40;
    }

    return dayWeight + slotWeight;
  }

  String get statusDisplay {
    switch (status) {
      case 'assigned':
        return 'Task Assigned';
      case 'accepted':
        return 'Accepted';
      case 'pickup_scheduled':
        return 'En Route';
      case 'inspection':
        return 'Diagnostic';
      case 'picked_up':
        return 'Device Collected';
      case 'in_transit':
        return 'In Transit';
      case 'completed':
        return 'Completed';
      case 'paid':
        return 'Paid';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.replaceAll('_', ' ').toUpperCase();
    }
  }

  Color get statusColor {
    switch (status) {
      case 'completed':
        return const Color(0xFF059669);
      case 'paid':
        return const Color(0xFF10B981);
      case 'assigned':
      case 'accepted':
        return const Color(0xFF2563EB);
      case 'pickup_scheduled':
        return const Color(0xFFF59E0B);
      case 'inspection':
        return const Color(0xFF6366F1);
      case 'picked_up':
      case 'in_transit':
        return const Color(0xFFD97706);
      case 'cancelled':
        return const Color(0xFFEF4444);
      default:
        return const Color(0xFF64748B);
    }
  }
}
