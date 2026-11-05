class AdminUser {
  final String id;
  final String name;
  final String email;
  final String role;
  final String token;

  const AdminUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.token,
  });

  factory AdminUser.fromJson(Map<String, dynamic> json) {
    return AdminUser(
      id: json['id']?.toString() ?? 'ADM-01',
      name: json['name']?.toString() ?? 'Super Admin',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'admin',
      token: json['token']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role,
    'token': token,
  };
}

class AdminOverviewStats {
  final int totalOrders;
  final double totalRevenue;
  final int pendingOrders;
  final int activeOrders;
  final int completedOrders;
  final int cancelledOrders;
  final int totalPartners;
  final int activePartners;
  final int pendingPartners;
  final int totalDeliveryAgents;
  final int activeDeliveryAgents;
  final int onlineAgents;
  final int totalCustomers;
  final double pendingPayouts;
  final int totalModels;
  final int totalBrands;

  const AdminOverviewStats({
    required this.totalOrders,
    required this.totalRevenue,
    required this.pendingOrders,
    required this.activeOrders,
    required this.completedOrders,
    required this.cancelledOrders,
    required this.totalPartners,
    required this.activePartners,
    this.pendingPartners = 0,
    required this.totalDeliveryAgents,
    required this.activeDeliveryAgents,
    this.onlineAgents = 0,
    this.totalCustomers = 0,
    this.pendingPayouts = 0.0,
    required this.totalModels,
    required this.totalBrands,
  });

  factory AdminOverviewStats.fromJson(Map<String, dynamic> json) {
    return AdminOverviewStats(
      totalOrders: (json['totalOrders'] as num?)?.toInt() ?? 0,
      totalRevenue: (json['totalRevenue'] as num?)?.toDouble() ?? 0.0,
      pendingOrders: (json['pendingOrders'] as num?)?.toInt() ?? 0,
      activeOrders: (json['activeOrders'] as num?)?.toInt() ?? 0,
      completedOrders: (json['completedOrders'] as num?)?.toInt() ?? 0,
      cancelledOrders: (json['cancelledOrders'] as num?)?.toInt() ?? 0,
      totalPartners: (json['totalPartners'] as num?)?.toInt() ?? 0,
      activePartners: (json['activePartners'] as num?)?.toInt() ?? 0,
      pendingPartners: (json['pendingPartners'] as num?)?.toInt() ?? 0,
      totalDeliveryAgents: (json['totalDeliveryAgents'] as num?)?.toInt() ?? 0,
      activeDeliveryAgents: (json['activeDeliveryAgents'] as num?)?.toInt() ?? 0,
      onlineAgents: (json['onlineAgents'] as num?)?.toInt() ?? (json['activeDeliveryAgents'] as num?)?.toInt() ?? 0,
      totalCustomers: (json['totalCustomers'] as num?)?.toInt() ?? 0,
      pendingPayouts: (json['pendingPayouts'] as num?)?.toDouble() ?? 0.0,
      totalModels: (json['totalModels'] as num?)?.toInt() ?? 0,
      totalBrands: (json['totalBrands'] as num?)?.toInt() ?? 0,
    );
  }
}

class AdminOrder {
  final String id;
  final String orderNumber;
  final String type;
  final String status;
  final String customerName;
  final String customerPhone;
  final String customerEmail;
  final String pickupAddress;
  final String pickupCity;
  final String pinCode;
  final String deviceName;
  final String deviceBrand;
  final String deviceModel;
  final String deviceVariant;
  final double finalPrice;
  final double estimatedPrice;
  final String paymentStatus;
  final String assignedPartnerId;
  final String assignedPartnerName;
  final String assignedRiderId;
  final String assignedRiderName;
  final String pickupDate;
  final String pickupSlot;
  final String createdAt;
  final String? qaNotes;
  final int? qaScore;
  final String? notes;

  const AdminOrder({
    required this.id,
    required this.orderNumber,
    required this.type,
    required this.status,
    required this.customerName,
    required this.customerPhone,
    required this.customerEmail,
    required this.pickupAddress,
    required this.pickupCity,
    required this.pinCode,
    required this.deviceName,
    required this.deviceBrand,
    required this.deviceModel,
    required this.deviceVariant,
    required this.finalPrice,
    required this.estimatedPrice,
    required this.paymentStatus,
    required this.assignedPartnerId,
    required this.assignedPartnerName,
    required this.assignedRiderId,
    required this.assignedRiderName,
    required this.pickupDate,
    required this.pickupSlot,
    required this.createdAt,
    this.qaNotes,
    this.qaScore,
    this.notes,
  });

  String get partnerName => assignedPartnerName;
  double get quotedPrice => estimatedPrice;

  factory AdminOrder.fromJson(Map<String, dynamic> json) {
    final customer = json['customer'] as Map<String, dynamic>? ?? {};
    final device = json['device'] as Map<String, dynamic>? ?? {};
    final address = json['address'] as Map<String, dynamic>? ?? {};
    final qa = json['qaReport'] as Map<String, dynamic>? ?? {};

    final id = json['id']?.toString() ?? json['_id']?.toString() ?? '';
    final orderNum = json['orderNumber']?.toString() ??
        (id.length > 8 ? 'CSM-${id.substring(id.length - 6).toUpperCase()}' : id);

    final rawName = customer['name']?.toString() ?? json['customerName']?.toString() ?? '';
    final rawPhone = customer['phone']?.toString() ?? json['customerPhone']?.toString() ?? json['phone']?.toString() ?? '';
    final rawAddr = address['street']?.toString() ?? json['customerAddress']?.toString() ?? json['pickupAddress']?.toString() ?? 'Doorstep Pickup';
    final rawCity = address['city']?.toString() ?? json['city']?.toString() ?? json['pickupCity']?.toString() ?? '';
    final rawPin = json['pinCode']?.toString() ?? json['pincode']?.toString() ?? '';

    final dName = json['deviceName']?.toString() ?? json['productName']?.toString() ?? device['name']?.toString() ?? 'Device';
    final dBrand = json['deviceBrand']?.toString() ?? json['brand']?.toString() ?? device['brand']?.toString() ?? '';
    final dModel = json['deviceModel']?.toString() ?? device['model']?.toString() ?? dName;
    final dVariant = device['variant']?.toString() ?? json['deviceStorage']?.toString() ?? device['storage']?.toString() ?? '';

    final fPrice = (json['finalPrice'] as num?)?.toDouble() ??
        (json['amount'] as num?)?.toDouble() ??
        (json['quotedPrice'] as num?)?.toDouble() ??
        0.0;
    final ePrice = (json['quotedPrice'] as num?)?.toDouble() ??
        (json['estimatedPrice'] as num?)?.toDouble() ??
        fPrice;

    return AdminOrder(
      id: id,
      orderNumber: orderNum,
      type: json['type']?.toString() ?? json['order_type']?.toString() ?? 'sell',
      status: json['status']?.toString() ?? 'created',
      customerName: rawName.isEmpty ? 'Customer' : rawName,
      customerPhone: rawPhone,
      customerEmail: customer['email']?.toString() ?? json['customerEmail']?.toString() ?? '',
      pickupAddress: rawAddr,
      pickupCity: rawCity,
      pinCode: rawPin,
      deviceName: dName,
      deviceBrand: dBrand,
      deviceModel: dModel,
      deviceVariant: dVariant,
      finalPrice: fPrice,
      estimatedPrice: ePrice,
      paymentStatus: json['paymentStatus']?.toString() ?? json['payment_status']?.toString() ?? 'pending',
      assignedPartnerId: json['partnerId']?.toString() ?? json['assignedPartnerId']?.toString() ?? '',
      assignedPartnerName: json['partnerName']?.toString() ?? json['assignedPartnerName']?.toString() ?? 'Unassigned Hub',
      assignedRiderId: json['deliveryAgentId']?.toString() ?? json['assignedDeliveryAgentId']?.toString() ?? json['assignedRiderId']?.toString() ?? '',
      assignedRiderName: json['deliveryAgentName']?.toString() ?? json['assignedDeliveryAgentName']?.toString() ?? json['assignedRiderName']?.toString() ?? 'Unassigned Rider',
      pickupDate: json['pickupDate']?.toString() ?? json['pickup_date']?.toString() ?? '',
      pickupSlot: json['pickupSlot']?.toString() ?? json['pickup_slot']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? json['created_at']?.toString() ?? '',
      qaNotes: qa['notes']?.toString() ?? json['inspectionNotes']?.toString(),
      qaScore: (qa['score'] as num?)?.toInt() ?? (json['inspectionScore'] as num?)?.toInt(),
      notes: json['notes']?.toString(),
    );
  }
}

class AdminPartner {
  final String id;
  final String storeName;
  final String ownerName;
  final String email;
  final String phone;
  final String city;
  final String status;
  final double rating;
  final int totalOrders;
  final double commissionRate;
  final double balance;
  final bool isVerified;
  final List<String> categories;
  final List<String> pinCodes;

  const AdminPartner({
    required this.id,
    required this.storeName,
    required this.ownerName,
    required this.email,
    required this.phone,
    required this.city,
    required this.status,
    required this.rating,
    required this.totalOrders,
    required this.commissionRate,
    required this.balance,
    required this.isVerified,
    this.categories = const [],
    this.pinCodes = const [],
  });

  factory AdminPartner.fromJson(Map<String, dynamic> json) {
    return AdminPartner(
      id: json['id']?.toString() ?? '',
      storeName: json['name']?.toString() ?? json['storeName']?.toString() ?? 'Partner Hub',
      ownerName: json['ownerName']?.toString() ?? json['contactPerson']?.toString() ?? 'Owner',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      city: json['city']?.toString() ?? json['location']?.toString() ?? '',
      status: json['status']?.toString() ?? 'active',
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
      totalOrders: (json['totalOrders'] as num?)?.toInt() ?? (json['completedOrders'] as num?)?.toInt() ?? 0,
      commissionRate: (json['commissionRate'] as num?)?.toDouble() ?? 5.0,
      balance: (json['balance'] as num?)?.toDouble() ?? (json['availableBalance'] as num?)?.toDouble() ?? (json['walletBalance'] as num?)?.toDouble() ?? 0.0,
      isVerified: json['isVerified'] == true || json['status'] == 'active',
      categories: (json['categories'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      pinCodes: (json['pinCodes'] as List?)?.map((e) => e.toString()).toList() ?? const [],
    );
  }
}

class AdminDeliveryAgent {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String zone;
  final String dutyStatus;
  final String vehicleType;
  final String vehicleNumber;
  final int activeOrders;
  final int totalDeliveries;
  final double rating;

  const AdminDeliveryAgent({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.zone,
    required this.dutyStatus,
    required this.vehicleType,
    this.vehicleNumber = '',
    required this.activeOrders,
    this.totalDeliveries = 0,
    required this.rating,
  });

  factory AdminDeliveryAgent.fromJson(Map<String, dynamic> json) {
    final status = json['dutyStatus']?.toString() ?? json['status']?.toString() ?? (json['isAvailable'] == true ? 'online' : 'offline');
    return AdminDeliveryAgent(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Rider',
      phone: json['phone']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      zone: json['zone']?.toString() ?? json['city']?.toString() ?? 'General Zone',
      dutyStatus: status,
      vehicleType: json['vehicleType']?.toString() ?? json['vehicle']?.toString() ?? 'Bike (Hero Splendor)',
      vehicleNumber: json['vehicleNumber']?.toString() ?? '',
      activeOrders: (json['currentOrdersCount'] as num?)?.toInt() ?? (json['todayPickups'] as num?)?.toInt() ?? 0,
      totalDeliveries: (json['totalDeliveries'] as num?)?.toInt() ?? 0,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.9,
    );
  }
}

// ── RENTALS FLEET & BOOKINGS ──
class AdminRentalCamera {
  final String id;
  final String brand;
  final String model;
  final String category;
  final String sensor;
  final String mount;
  final String videoRes;
  final double dailyPrice;
  final double weeklyPrice;
  final double securityDeposit;
  final int stock;
  final String status; // 'available', 'rented', 'maintenance'
  final String image;
  final String specs;

  const AdminRentalCamera({
    required this.id,
    required this.brand,
    required this.model,
    required this.category,
    required this.sensor,
    required this.mount,
    required this.videoRes,
    required this.dailyPrice,
    required this.weeklyPrice,
    required this.securityDeposit,
    required this.stock,
    required this.status,
    required this.image,
    required this.specs,
  });

  factory AdminRentalCamera.fromJson(Map<String, dynamic> json) {
    return AdminRentalCamera(
      id: json['id']?.toString() ?? json['modelId']?.toString() ?? '',
      brand: json['brand']?.toString() ?? 'Sony',
      model: json['model']?.toString() ?? json['name']?.toString() ?? 'Cinema Camera',
      category: json['category']?.toString() ?? 'Cinema Cameras',
      sensor: json['sensor']?.toString() ?? 'Full-Frame',
      mount: json['mount']?.toString() ?? 'Standard Mount',
      videoRes: json['videoRes']?.toString() ?? '4K Video',
      dailyPrice: (json['dailyPrice'] as num?)?.toDouble() ?? 2499.0,
      weeklyPrice: (json['weeklyPrice'] as num?)?.toDouble() ?? 14999.0,
      securityDeposit: (json['securityDeposit'] as num?)?.toDouble() ?? 8000.0,
      stock: (json['stock'] as num?)?.toInt() ?? 1,
      status: json['status']?.toString() ?? 'available',
      image: json['image']?.toString() ?? '',
      specs: json['specs']?.toString() ?? '',
    );
  }
}

// ── CATALOG: CATEGORIES ──
class AdminCategory {
  final String id;
  final String name;
  final String slug;
  final String icon;
  final String image;
  final String description;
  final int brandCount;
  final int modelCount;
  final bool active;

  const AdminCategory({
    required this.id,
    required this.name,
    required this.slug,
    required this.icon,
    required this.image,
    required this.description,
    required this.brandCount,
    required this.modelCount,
    required this.active,
  });

  factory AdminCategory.fromJson(Map<String, dynamic> json) {
    return AdminCategory(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      icon: json['icon']?.toString() ?? '📷',
      image: json['image']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      brandCount: (json['brandCount'] as num?)?.toInt() ?? 0,
      modelCount: (json['modelCount'] as num?)?.toInt() ?? 0,
      active: json['active'] != false,
    );
  }
}

// ── CATALOG: BRANDS ──
class AdminBrand {
  final String id;
  final String categoryId;
  final String name;
  final String slug;
  final String logo;
  final int modelCount;
  final bool active;

  const AdminBrand({
    required this.id,
    required this.categoryId,
    required this.name,
    required this.slug,
    required this.logo,
    required this.modelCount,
    required this.active,
  });

  factory AdminBrand.fromJson(Map<String, dynamic> json) {
    return AdminBrand(
      id: json['id']?.toString() ?? '',
      categoryId: json['categoryId']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      logo: json['logo']?.toString() ?? '',
      modelCount: (json['modelCount'] as num?)?.toInt() ?? 0,
      active: json['active'] != false,
    );
  }
}

// ── CATALOG: MODELS ──
class AdminDeviceModel {
  final String id;
  final String brandId;
  final String categoryId;
  final String name;
  final String slug;
  final String image;
  final double basePrice;
  final List<String> storages;
  final List<String> colors;
  final Map<String, dynamic> specs;
  final bool active;

  const AdminDeviceModel({
    required this.id,
    required this.brandId,
    required this.categoryId,
    required this.name,
    required this.slug,
    required this.image,
    required this.basePrice,
    required this.storages,
    required this.colors,
    required this.specs,
    required this.active,
  });

  factory AdminDeviceModel.fromJson(Map<String, dynamic> json) {
    return AdminDeviceModel(
      id: json['id']?.toString() ?? '',
      brandId: json['brandId']?.toString() ?? '',
      categoryId: json['categoryId']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      image: json['image']?.toString() ?? '',
      basePrice: (json['basePrice'] as num?)?.toDouble() ?? 0.0,
      storages: (json['storages'] as List?)?.map((e) => e.toString()).toList() ?? const ['128GB', '256GB'],
      colors: (json['colors'] as List?)?.map((e) => e.toString()).toList() ?? const ['Black'],
      specs: json['specs'] is Map ? Map<String, dynamic>.from(json['specs']) : {},
      active: json['active'] != false,
    );
  }
}

// ── CATALOG: LENSES ──
class AdminLens {
  final String id;
  final String name;
  final String type;
  final double price;
  final String icon;
  final bool active;

  const AdminLens({
    required this.id,
    required this.name,
    required this.type,
    required this.price,
    required this.icon,
    required this.active,
  });

  factory AdminLens.fromJson(Map<String, dynamic> json) {
    return AdminLens(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      type: json['type']?.toString() ?? 'Lens',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      icon: json['icon']?.toString() ?? '📷',
      active: json['active'] != false,
    );
  }
}

// ── CATALOG: REFURBISHED DEVICES ──
class AdminRefurbishedDevice {
  final String id;
  final String brand;
  final String model;
  final String category;
  final String condition;
  final String conditionNote;
  final double price;
  final double originalPrice;
  final int warrantyMonths;
  final int stock;
  final String image;
  final bool active;

  const AdminRefurbishedDevice({
    required this.id,
    required this.brand,
    required this.model,
    required this.category,
    required this.condition,
    required this.conditionNote,
    required this.price,
    required this.originalPrice,
    required this.warrantyMonths,
    required this.stock,
    required this.image,
    required this.active,
  });

  factory AdminRefurbishedDevice.fromJson(Map<String, dynamic> json) {
    return AdminRefurbishedDevice(
      id: json['id']?.toString() ?? '',
      brand: json['brand']?.toString() ?? '',
      model: json['model']?.toString() ?? '',
      category: json['category']?.toString() ?? 'Cameras',
      condition: json['condition']?.toString() ?? 'Superb',
      conditionNote: json['conditionNote']?.toString() ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      originalPrice: (json['originalPrice'] as num?)?.toDouble() ?? 0.0,
      warrantyMonths: (json['warrantyMonths'] as num?)?.toInt() ?? 6,
      stock: (json['stock'] as num?)?.toInt() ?? 1,
      image: json['image']?.toString() ?? '',
      active: json['active'] != false,
    );
  }
}

// ── CATALOG: REPAIR ISSUES ──
class AdminRepairIssue {
  final String id;
  final String category;
  final String title;
  final String description;
  final double estimatedCost;
  final int tatDays;

  const AdminRepairIssue({
    required this.id,
    required this.category,
    required this.title,
    required this.description,
    required this.estimatedCost,
    required this.tatDays,
  });

  factory AdminRepairIssue.fromJson(Map<String, dynamic> json) {
    return AdminRepairIssue(
      id: json['id']?.toString() ?? '',
      category: json['category']?.toString() ?? 'DSLR & Mirrorless',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      estimatedCost: (json['estimatedCost'] as num?)?.toDouble() ?? 1500.0,
      tatDays: (json['tatDays'] as num?)?.toInt() ?? 3,
    );
  }
}

// ── CUSTOMERS DIRECTORY ──
class AdminCustomer {
  final String id;
  final String name;
  final String phone;
  final String email;
  final String city;
  final int totalOrders;
  final double totalSpent;
  final String joinedAt;

  const AdminCustomer({
    required this.id,
    required this.name,
    required this.phone,
    required this.email,
    required this.city,
    required this.totalOrders,
    required this.totalSpent,
    required this.joinedAt,
  });

  factory AdminCustomer.fromJson(Map<String, dynamic> json) {
    return AdminCustomer(
      id: json['id']?.toString() ?? json['phone']?.toString() ?? '',
      name: json['name']?.toString() ?? json['customerName']?.toString() ?? 'Customer',
      phone: json['phone']?.toString() ?? json['customerPhone']?.toString() ?? '',
      email: json['email']?.toString() ?? json['customerEmail']?.toString() ?? '',
      city: json['city']?.toString() ?? 'India',
      totalOrders: (json['totalOrders'] as num?)?.toInt() ?? 1,
      totalSpent: (json['totalSpent'] as num?)?.toDouble() ?? 0.0,
      joinedAt: json['joinedAt']?.toString() ?? json['createdAt']?.toString() ?? '2026',
    );
  }
}

// ── LOGISTICS: PINCODES ──
class AdminPincode {
  final String pincode;
  final String city;
  final bool active;
  final String addedAt;

  const AdminPincode({
    required this.pincode,
    required this.city,
    required this.active,
    required this.addedAt,
  });

  factory AdminPincode.fromJson(Map<String, dynamic> json) {
    return AdminPincode(
      pincode: json['pincode']?.toString() ?? '',
      city: json['city']?.toString() ?? 'Metro Serviceable Area',
      active: json['active'] != false,
      addedAt: json['addedAt']?.toString() ?? '',
    );
  }
}

// ── FINANCE: PAYOUTS ──
class AdminPayout {
  final String id;
  final String requesterName;
  final String requesterType; // 'partner' | 'rider'
  final String requesterId;
  final double amount;
  final String paymentMethod;
  final String accountDetails;
  final String status; // 'pending' | 'approved' | 'paid' | 'rejected'
  final String transactionRef;
  final String requestedAt;

  const AdminPayout({
    required this.id,
    required this.requesterName,
    required this.requesterType,
    required this.requesterId,
    required this.amount,
    required this.paymentMethod,
    required this.accountDetails,
    required this.status,
    required this.transactionRef,
    required this.requestedAt,
  });

  factory AdminPayout.fromJson(Map<String, dynamic> json) {
    return AdminPayout(
      id: json['id']?.toString() ?? '',
      requesterName: json['requesterName']?.toString() ?? json['name']?.toString() ?? 'Requester',
      requesterType: json['requesterType']?.toString() ?? 'partner',
      requesterId: json['requesterId']?.toString() ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      paymentMethod: json['paymentMethod']?.toString() ?? 'UPI',
      accountDetails: json['accountDetails']?.toString() ?? json['upiId']?.toString() ?? '',
      status: json['status']?.toString() ?? 'pending',
      transactionRef: json['transactionRef']?.toString() ?? '',
      requestedAt: json['requestedAt']?.toString() ?? json['createdAt']?.toString() ?? '',
    );
  }
}

// ── MARKETING: COUPONS ──
class AdminCoupon {
  final String id;
  final String code;
  final String description;
  final String discountType; // 'percentage' | 'fixed'
  final double discountValue;
  final double minOrderValue;
  final double maxDiscount;
  final String expiryDate;
  final int usageLimit;
  final int usedCount;
  final bool active;

  const AdminCoupon({
    required this.id,
    required this.code,
    required this.description,
    required this.discountType,
    required this.discountValue,
    required this.minOrderValue,
    required this.maxDiscount,
    required this.expiryDate,
    required this.usageLimit,
    required this.usedCount,
    required this.active,
  });

  factory AdminCoupon.fromJson(Map<String, dynamic> json) {
    return AdminCoupon(
      id: json['id']?.toString() ?? '',
      code: json['code']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      discountType: json['discountType']?.toString() ?? 'percentage',
      discountValue: (json['discountValue'] as num?)?.toDouble() ?? 10.0,
      minOrderValue: (json['minOrderValue'] as num?)?.toDouble() ?? 0.0,
      maxDiscount: (json['maxDiscount'] as num?)?.toDouble() ?? 500.0,
      expiryDate: json['expiryDate']?.toString() ?? '2026-12-31',
      usageLimit: (json['usageLimit'] as num?)?.toInt() ?? 100,
      usedCount: (json['usedCount'] as num?)?.toInt() ?? 0,
      active: json['active'] != false,
    );
  }
}

// ── SUPPORT TICKETS ──
class AdminSupportTicket {
  final String id;
  final String ticketNumber;
  final String userName;
  final String userPhone;
  final String userRole;
  final String subject;
  final String category;
  final String priority;
  final String status;
  final String createdAt;
  final String lastMessage;

  const AdminSupportTicket({
    required this.id,
    required this.ticketNumber,
    required this.userName,
    required this.userPhone,
    required this.userRole,
    required this.subject,
    required this.category,
    required this.priority,
    required this.status,
    required this.createdAt,
    required this.lastMessage,
  });

  factory AdminSupportTicket.fromJson(Map<String, dynamic> json) {
    return AdminSupportTicket(
      id: json['id']?.toString() ?? '',
      ticketNumber: json['ticketNumber']?.toString() ?? json['id']?.toString() ?? '',
      userName: json['userName']?.toString() ?? json['customerName']?.toString() ?? 'User',
      userPhone: json['userPhone']?.toString() ?? '',
      userRole: json['userRole']?.toString() ?? 'customer',
      subject: json['subject']?.toString() ?? 'Inquiry',
      category: json['category']?.toString() ?? 'General',
      priority: json['priority']?.toString() ?? 'medium',
      status: json['status']?.toString() ?? 'open',
      createdAt: json['createdAt']?.toString() ?? '',
      lastMessage: json['lastMessage']?.toString() ?? json['message']?.toString() ?? '',
    );
  }
}

// ── BROADCAST NOTIFICATIONS ──
class AdminPushNotification {
  final String id;
  final String title;
  final String body;
  final String type;
  final String targetRole;
  final String timestamp;
  final bool read;

  const AdminPushNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.targetRole,
    required this.timestamp,
    required this.read,
  });

  factory AdminPushNotification.fromJson(Map<String, dynamic> json) {
    return AdminPushNotification(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Announcement',
      body: json['body']?.toString() ?? json['message']?.toString() ?? '',
      type: json['type']?.toString() ?? 'general',
      targetRole: json['targetRole']?.toString() ?? json['target']?.toString() ?? 'all',
      timestamp: json['timestamp']?.toString() ?? json['createdAt']?.toString() ?? '',
      read: json['read'] == true,
    );
  }
}

// ── DIAGNOSTIC VALUATION QUESTIONS ──
class AdminQuestionOption {
  final String id;
  final String label;
  final String sublabel;
  final double adj;

  const AdminQuestionOption({
    required this.id,
    required this.label,
    required this.sublabel,
    required this.adj,
  });

  factory AdminQuestionOption.fromJson(Map<String, dynamic> json) {
    return AdminQuestionOption(
      id: json['id']?.toString() ?? '',
      label: json['label']?.toString() ?? '',
      sublabel: json['sublabel']?.toString() ?? json['description']?.toString() ?? '',
      adj: (json['adj'] as num?)?.toDouble() ?? (json['priceAdjustment'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'label': label,
    'sublabel': sublabel,
    'adj': adj,
  };
}

class AdminCategoryQuestion {
  final String id;
  final String categoryId;
  final String question;
  final String subtext;
  final bool active;
  final List<AdminQuestionOption> options;

  const AdminCategoryQuestion({
    required this.id,
    required this.categoryId,
    required this.question,
    required this.subtext,
    required this.active,
    required this.options,
  });

  factory AdminCategoryQuestion.fromJson(Map<String, dynamic> json) {
    return AdminCategoryQuestion(
      id: json['id']?.toString() ?? '',
      categoryId: json['categoryId']?.toString() ?? 'cat-dslr',
      question: json['question']?.toString() ?? '',
      subtext: json['subtext']?.toString() ?? '',
      active: json['active'] != false,
      options: (json['options'] as List?)
              ?.map((e) => AdminQuestionOption.fromJson(Map<String, dynamic>.from(e)))
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'categoryId': categoryId,
    'question': question,
    'subtext': subtext,
    'active': active,
    'options': options.map((e) => e.toJson()).toList(),
  };
}
