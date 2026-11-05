class PayoutTransactionModel {
  final String id;
  final String partnerId;
  final String? orderId;
  final String? orderNumber;
  final String? customerName;
  final String? modelName;
  final double amount;
  final String type; // withdrawal, spot_payout, spot_credit, commission
  final String status; // completed, processing, pending
  final String method; // bank_transfer, instant_upi, cash
  final String referenceId;
  final String bankName;
  final String accountNumber;
  final String ifscCode;
  final String holderName;
  final String notes;
  final String createdAt;

  PayoutTransactionModel({
    required this.id,
    required this.partnerId,
    this.orderId,
    this.orderNumber,
    this.customerName,
    this.modelName,
    required this.amount,
    required this.type,
    required this.status,
    required this.method,
    required this.referenceId,
    required this.bankName,
    required this.accountNumber,
    required this.ifscCode,
    required this.holderName,
    this.notes = '',
    required this.createdAt,
  });

  factory PayoutTransactionModel.fromJson(Map<String, dynamic> json) {
    final acc = json['accountDetails'] is Map ? json['accountDetails'] as Map : null;
    return PayoutTransactionModel(
      id: json['id']?.toString() ?? '',
      partnerId: json['partnerId']?.toString() ?? '',
      orderId: json['orderId']?.toString(),
      orderNumber: json['orderNumber']?.toString(),
      customerName: json['customerName']?.toString() ?? acc?['holderName']?.toString(),
      modelName: json['modelName']?.toString(),
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      type: json['type']?.toString() ?? 'withdrawal',
      status: json['status']?.toString() ?? 'completed',
      method: json['method']?.toString() ?? 'bank_transfer',
      referenceId: json['referenceId']?.toString() ?? '',
      bankName: acc?['bankName']?.toString() ?? json['bankName']?.toString() ?? 'HDFC Bank',
      accountNumber: acc?['accountNumber']?.toString() ?? json['accountNumber']?.toString() ?? '•••• 4892',
      ifscCode: acc?['ifscCode']?.toString() ?? json['ifscCode']?.toString() ?? 'HDFC0001234',
      holderName: acc?['holderName']?.toString() ?? json['holderName']?.toString() ?? 'Partner Account',
      notes: json['notes']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? DateTime.now().toIso8601String(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'partnerId': partnerId,
    'orderId': orderId,
    'orderNumber': orderNumber,
    'customerName': customerName,
    'modelName': modelName,
    'amount': amount,
    'type': type,
    'status': status,
    'method': method,
    'referenceId': referenceId,
    'bankName': bankName,
    'accountNumber': accountNumber,
    'ifscCode': ifscCode,
    'holderName': holderName,
    'notes': notes,
    'createdAt': createdAt,
  };
}

class PartnerWalletData {
  final String partnerId;
  final String partnerName;
  final String storeName;
  final double availableBalance;
  final double totalEarnings;
  final double totalCommissionEarned;
  final double commissionRate;
  final double pendingPayout;
  final String bankName;
  final String accountNumber;
  final String ifscCode;
  final String accountHolderName;
  final bool isVerified;
  final List<PayoutTransactionModel> transactions;

  PartnerWalletData({
    required this.partnerId,
    required this.partnerName,
    required this.storeName,
    required this.availableBalance,
    required this.totalEarnings,
    this.totalCommissionEarned = 0.0,
    this.commissionRate = 5.0,
    required this.pendingPayout,
    required this.bankName,
    required this.accountNumber,
    required this.ifscCode,
    required this.accountHolderName,
    required this.isVerified,
    required this.transactions,
  });

  factory PartnerWalletData.fromJson(Map<String, dynamic> json) {
    final wallet = json['wallet'] is Map ? json['wallet'] as Map : json;
    final bank = wallet['bankDetails'] is Map ? wallet['bankDetails'] as Map : null;
    final payoutsList = json['payouts'] is List ? json['payouts'] as List : [];

    final totalEarnings = (wallet['totalEarnings'] as num?)?.toDouble() ?? 0.0;
    final commissionRate = (wallet['commissionRate'] as num?)?.toDouble() ?? 5.0;
    final totalCommissionEarned = (wallet['totalCommissionEarned'] as num?)?.toDouble() ??
        ((totalEarnings * commissionRate) / 100);

    return PartnerWalletData(
      partnerId: wallet['partnerId']?.toString() ?? '',
      partnerName: wallet['partnerName']?.toString() ?? 'Store Partner',
      storeName: wallet['storeName']?.toString() ?? 'Camsik Certified Store',
      availableBalance: (wallet['availableBalance'] as num?)?.toDouble() ?? 0.0,
      totalEarnings: totalEarnings,
      totalCommissionEarned: totalCommissionEarned,
      commissionRate: commissionRate,
      pendingPayout: (wallet['pendingPayout'] as num?)?.toDouble() ?? 0.0,
      bankName: bank?['bankName']?.toString() ?? 'HDFC Bank',
      accountNumber: bank?['accountNumber']?.toString() ?? '•••• 4892',
      ifscCode: bank?['ifscCode']?.toString() ?? 'HDFC0001234',
      accountHolderName: bank?['accountHolderName']?.toString() ?? 'Verified Partner',
      isVerified: bank?['isVerified'] == true,
      transactions: payoutsList
          .map((item) => PayoutTransactionModel.fromJson(Map<String, dynamic>.from(item)))
          .toList(),
    );
  }
}
