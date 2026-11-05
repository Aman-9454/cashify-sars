class DeviceVerificationReportModel {
  final bool verified;
  final String imei;
  final String? maskedImei;
  final bool modelMatch;
  final String brand;
  final String model;
  final String status; // 'VERIFIED' / 'FAILED' / 'MISMATCH' / 'BLACKLISTED'
  final bool blacklisted;
  final String warrantyStatus;
  final num? estimatedValuation;
  final String provider;
  final String? verificationId;
  final String? mismatchReason;

  const DeviceVerificationReportModel({
    required this.verified,
    required this.imei,
    this.maskedImei,
    required this.modelMatch,
    required this.brand,
    required this.model,
    required this.status,
    required this.blacklisted,
    required this.warrantyStatus,
    this.estimatedValuation,
    this.provider = 'Camsik Diagnostics',
    this.verificationId,
    this.mismatchReason,
  });

  factory DeviceVerificationReportModel.fromJson(Map<String, dynamic> json, {String provider = 'Camsik Diagnostics'}) {
    final report = (json['report'] is Map<String, dynamic>)
        ? json['report'] as Map<String, dynamic>
        : json;

    final identifiers = report['identifiers'] is Map<String, dynamic>
        ? report['identifiers'] as Map<String, dynamic>
        : <String, dynamic>{};

    final device = report['device'] is Map<String, dynamic>
        ? report['device'] as Map<String, dynamic>
        : <String, dynamic>{};

    final matching = report['matching'] is Map<String, dynamic>
        ? report['matching'] as Map<String, dynamic>
        : <String, dynamic>{};

    final security = report['security'] is Map<String, dynamic>
        ? report['security'] as Map<String, dynamic>
        : <String, dynamic>{};

    final statusStr = (report['status'] ?? '').toString().toLowerCase();
    final bool isVerified = statusStr == 'verified' || report['verified'] == true || report['isValid'] == true;
    final bool isBlacklisted = report['blacklisted'] == true || security['blacklistStatus'] == 'blacklisted';

    final rawImei = identifiers['imei1']?.toString() ??
        report['imei']?.toString() ??
        report['rawImei']?.toString() ??
        '';

    final masked = identifiers['maskedImei']?.toString() ??
        (rawImei.length >= 10
            ? '${rawImei.substring(0, 4)}••••${rawImei.substring(rawImei.length - 4)}'
            : rawImei);

    final reason = matching['mismatchReason']?.toString() ??
        (report['notes'] is List && (report['notes'] as List).isNotEmpty
            ? (report['notes'] as List).first.toString()
            : null);

    return DeviceVerificationReportModel(
      verified: isVerified,
      imei: rawImei,
      maskedImei: masked,
      modelMatch: matching['matched'] == true || report['modelMatch'] != false,
      brand: device['brand']?.toString() ?? report['brand']?.toString() ?? '',
      model: device['model']?.toString() ?? report['model']?.toString() ?? '',
      status: isVerified ? 'VERIFIED' : (isBlacklisted ? 'BLACKLISTED' : (statusStr == 'mismatch' ? 'MISMATCH' : 'FAILED')),
      blacklisted: isBlacklisted,
      warrantyStatus: security['warrantyStatus']?.toString() ?? report['warrantyStatus']?.toString() ?? 'Active / Verified',
      estimatedValuation: report['estimatedValuation'] as num? ?? report['valuation'] as num?,
      provider: json['provider']?.toString() ?? report['providerName']?.toString() ?? provider,
      verificationId: report['verificationId']?.toString() ??
          json['verificationId']?.toString() ??
          'CAM-IMEI-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      mismatchReason: reason,
    );
  }
}
