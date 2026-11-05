class ValidateImeiRequest {
  final String imei;
  final String? imei2;
  final String selectedBrand;
  final String selectedModel;
  final String? selectedVariant;
  final String source;
  final Map<String, dynamic>? deviceDetailsFromApp;

  const ValidateImeiRequest({
    required this.imei,
    this.imei2,
    required this.selectedBrand,
    required this.selectedModel,
    this.selectedVariant,
    this.source = 'mobile-app',
    this.deviceDetailsFromApp,
  });

  Map<String, dynamic> toJson() {
    return {
      'imei': imei,
      if (imei2 != null && imei2!.isNotEmpty) 'imei2': imei2,
      'selectedBrand': selectedBrand,
      'selectedModel': selectedModel,
      if (selectedVariant != null && selectedVariant!.isNotEmpty)
        'selectedVariant': selectedVariant,
      'source': source,
      if (deviceDetailsFromApp != null)
        'deviceDetailsFromApp': deviceDetailsFromApp,
    };
  }
}
