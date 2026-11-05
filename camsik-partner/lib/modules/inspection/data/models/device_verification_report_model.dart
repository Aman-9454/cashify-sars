class DeviceVerificationReportModel {
  final bool verified;
  final String imei;
  final bool modelMatch;
  final String brand;
  final String model;
  final String status; // CLEAN / BLACKLISTED / FLAGGED
  final bool blacklisted;
  final String warrantyStatus;
  final num? estimatedValuation;
  final String provider;

  const DeviceVerificationReportModel({
    required this.verified,
    required this.imei,
    required this.modelMatch,
    required this.brand,
    required this.model,
    required this.status,
    required this.blacklisted,
    required this.warrantyStatus,
    this.estimatedValuation,
    this.provider = 'Camsik Diagnostics',
  });

  factory DeviceVerificationReportModel.fromJson(Map<String, dynamic> json, {String provider = 'Camsik Diagnostics'}) {
    final report = (json['report'] is Map<String, dynamic>)
        ? json['report'] as Map<String, dynamic>
        : json;

    return DeviceVerificationReportModel(
      verified: report['verified'] == true || report['isValid'] == true,
      imei: report['imei']?.toString() ?? '',
      modelMatch: report['modelMatch'] != false,
      brand: report['brand']?.toString() ?? '',
      model: report['model']?.toString() ?? '',
      status: report['status']?.toString() ?? (report['blacklisted'] == true ? 'FLAGGED' : 'CLEAN'),
      blacklisted: report['blacklisted'] == true,
      warrantyStatus: report['warrantyStatus']?.toString() ?? 'Active',
      estimatedValuation: report['estimatedValuation'] as num? ?? report['valuation'] as num?,
      provider: json['provider']?.toString() ?? provider,
    );
  }
}
