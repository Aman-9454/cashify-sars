import '../../../../models/partner_models.dart';
import '../data/models/device_verification_report_model.dart';
import '../data/models/inspection_criteria_model.dart';

class InspectionState {
  final PartnerOrder? selectedOrder;
  final List<InspectionCriterionModel> criteria;
  final bool screenOriginal;
  final bool touchPerfect;
  final bool batteryHealthy;
  final bool cameraClean;
  final bool shutterLow;
  final bool motherboardClean;
  final double customDeduction;
  final bool isSubmitting;
  final bool isVerifyingImei;
  final DeviceVerificationReportModel? verificationReport;
  final String? successMessage;
  final String? errorMessage;

  const InspectionState({
    this.selectedOrder,
    this.criteria = const [],
    this.screenOriginal = true,
    this.touchPerfect = true,
    this.batteryHealthy = true,
    this.cameraClean = true,
    this.shutterLow = true,
    this.motherboardClean = true,
    this.customDeduction = 0.0,
    this.isSubmitting = false,
    this.isVerifyingImei = false,
    this.verificationReport,
    this.successMessage,
    this.errorMessage,
  });

  double get adjustedPrice {
    if (selectedOrder == null) return 0.0;
    double price = selectedOrder!.quotedPrice;

    if (criteria.isNotEmpty) {
      for (final c in criteria) {
        final passed = _isCriterionPassed(c.key);
        if (!passed) {
          price -= c.deductionAmount;
        }
      }
    } else {
      if (!screenOriginal) price -= 4500;
      if (!touchPerfect) price -= 2500;
      if (!batteryHealthy) price -= 2000;
      if (!cameraClean) price -= 3000;
      if (!shutterLow) price -= 2000;
      if (!motherboardClean) price -= 5000;
    }

    price -= customDeduction;
    return price < 1000 ? 1000 : price;
  }

  int get inspectionScore {
    int score = 100;
    if (criteria.isNotEmpty) {
      for (final c in criteria) {
        final passed = _isCriterionPassed(c.key);
        if (!passed) {
          score -= c.scoreWeight;
        }
      }
    } else {
      if (!screenOriginal) score -= 20;
      if (!touchPerfect) score -= 15;
      if (!batteryHealthy) score -= 15;
      if (!cameraClean) score -= 15;
      if (!shutterLow) score -= 10;
      if (!motherboardClean) score -= 25;
    }
    return score < 20 ? 20 : score;
  }

  bool _isCriterionPassed(String key) {
    switch (key) {
      case 'screenOriginal':
        return screenOriginal;
      case 'touchPerfect':
        return touchPerfect;
      case 'batteryHealthy':
        return batteryHealthy;
      case 'cameraClean':
        return cameraClean;
      case 'shutterLow':
        return shutterLow;
      case 'motherboardClean':
        return motherboardClean;
      default:
        return true;
    }
  }

  InspectionState copyWith({
    PartnerOrder? selectedOrder,
    List<InspectionCriterionModel>? criteria,
    bool? screenOriginal,
    bool? touchPerfect,
    bool? batteryHealthy,
    bool? cameraClean,
    bool? shutterLow,
    bool? motherboardClean,
    double? customDeduction,
    bool? isSubmitting,
    bool? isVerifyingImei,
    DeviceVerificationReportModel? verificationReport,
    String? successMessage,
    String? errorMessage,
    bool clearMessages = false,
  }) {
    return InspectionState(
      selectedOrder: selectedOrder ?? this.selectedOrder,
      criteria: criteria ?? this.criteria,
      screenOriginal: screenOriginal ?? this.screenOriginal,
      touchPerfect: touchPerfect ?? this.touchPerfect,
      batteryHealthy: batteryHealthy ?? this.batteryHealthy,
      cameraClean: cameraClean ?? this.cameraClean,
      shutterLow: shutterLow ?? this.shutterLow,
      motherboardClean: motherboardClean ?? this.motherboardClean,
      customDeduction: customDeduction ?? this.customDeduction,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isVerifyingImei: isVerifyingImei ?? this.isVerifyingImei,
      verificationReport: verificationReport ?? this.verificationReport,
      successMessage: clearMessages ? null : (successMessage ?? this.successMessage),
      errorMessage: clearMessages ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
