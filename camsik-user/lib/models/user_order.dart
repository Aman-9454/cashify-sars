class UserOrder {
  final String id;
  final String orderNumber;
  final String type; // 'sell' | 'buy' | 'exchange' | 'rent'
  final String device;
  final int amount;
  final String status;
  final String rawStatus;
  final String otp;
  final String date;
  final String? pickupDate;
  final String? pickupSlot;
  final String address;
  final String paymentMethod;
  final String? partnerName;
  final String? deliveryAgentName;
  final String? deliveryAgentPhone;
  final List<String> timelineSteps;
  final int currentStep;

  UserOrder({
    required this.id,
    required this.orderNumber,
    required this.type,
    required this.device,
    required this.amount,
    required this.status,
    required this.rawStatus,
    required this.otp,
    required this.date,
    this.pickupDate,
    this.pickupSlot,
    required this.address,
    required this.paymentMethod,
    this.partnerName,
    this.deliveryAgentName,
    this.deliveryAgentPhone,
    required this.timelineSteps,
    required this.currentStep,
  });

  factory UserOrder.fromJson(Map<String, dynamic> json) {
    final type = (json['type'] ?? json['order_type'] ?? 'sell').toString().toLowerCase();
    final rawStatus = (json['status'] ?? 'Order Placed').toString();
    final normalized = rawStatus.toLowerCase().trim().replaceAll(' ', '_');

    String displayStatus = rawStatus;
    int calculatedStep = 0;

    if (normalized == 'created' || normalized == 'new' || normalized == 'order_placed') {
      displayStatus = 'Order Placed';
      calculatedStep = 0;
    } else if (normalized == 'assigned' || normalized == 'partner_assigned') {
      displayStatus = 'Partner Assigned';
      calculatedStep = 1;
    } else if (normalized == 'accepted') {
      displayStatus = 'Order Accepted';
      calculatedStep = 1;
    } else if (normalized == 'pickup_scheduled' || normalized == 'scheduled') {
      displayStatus = 'Pickup Scheduled';
      calculatedStep = 2;
    } else if (normalized == 'picked_up' || normalized == 'device_picked_up') {
      displayStatus = 'Device Picked Up';
      calculatedStep = 3;
    } else if (normalized == 'in_transit') {
      displayStatus = 'In Transit';
      calculatedStep = 3;
    } else if (normalized == 'inspection' || normalized == 'under_inspection') {
      displayStatus = 'Under Inspection';
      calculatedStep = 3;
    } else if (normalized == 'inspection_completed') {
      displayStatus = 'Inspection Done';
      calculatedStep = 3;
    } else if (normalized == 'completed' || normalized == 'paid') {
      displayStatus = 'Completed';
      calculatedStep = 4;
    } else if (normalized.contains('cancel')) {
      displayStatus = 'Cancelled';
      calculatedStep = 0;
    }

    final timelineSteps = type == 'rent'
        ? [
            'Rental Booking Confirmed',
            'Gear Sanitization & Calibration',
            'Doorstep Kit Delivery & Handover',
            'Shoot In Progress',
            'Gear Return & Deposit Refund',
          ]
        : [
            'Order Placed & Confirmed',
            'Camsik Partner Assigned',
            'Pickup Scheduled / Executive Dispatched',
            'Device Inspected & Handover',
            'Payout Disbursed / Order Completed',
          ];

    final int finalStep = calculatedStep.clamp(0, timelineSteps.length - 1);

    final amountNum = json['amount'] ?? json['final_price'] ?? json['quoted_price'] ?? 0;
    final int amount = (amountNum is num) ? amountNum.toInt() : 0;

    return UserOrder(
      id: json['id'] ?? 'ord-${DateTime.now().millisecondsSinceEpoch}',
      orderNumber: json['orderNumber'] ?? json['order_number'] ?? 'CSM-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      type: type,
      device: json['deviceName'] ?? json['device'] ?? json['device_name'] ?? 'Tech Device',
      amount: amount,
      status: displayStatus,
      rawStatus: rawStatus,
      otp: json['otp']?.toString() ?? '1234',
      date: json['pickupDate'] ?? json['pickup_date'] ?? json['createdAt'] ?? 'Today',
      pickupDate: json['pickupDate'] ?? json['pickup_date'],
      pickupSlot: json['pickupSlot'] ?? json['pickup_slot'],
      address: json['customerAddress'] ?? json['customer_address'] ?? json['address'] ?? 'Registered Address',
      paymentMethod: json['paymentMethod'] ?? json['payment_status'] ?? 'Instant UPI',
      partnerName: json['partnerName'] ?? json['partner_name'],
      deliveryAgentName: json['deliveryAgentName'] ?? json['delivery_agent_name'],
      deliveryAgentPhone: json['deliveryAgentPhone'] ?? json['delivery_agent_phone'],
      timelineSteps: timelineSteps,
      currentStep: finalStep,
    );
  }
}
