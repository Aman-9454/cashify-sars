import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';
import '../models/device_verification_report_model.dart';
import '../models/inspection_criteria_model.dart';

abstract class InspectionRepository {
  Future<DeviceVerificationReportModel?> validateImei({
    required String imei,
    required String brand,
    required String model,
    String? variant,
  });

  Future<Map<String, dynamic>?> createVerificationSession({
    required String brand,
    required String model,
    String? userId,
    String? orderId,
  });

  Future<bool> submitQAReport({
    required String orderId,
    required double finalPrice,
    required int inspectionScore,
    String? notes,
  });

  Future<List<InspectionCriterionModel>> fetchInspectionCriteria();
}

class InspectionRepositoryImpl implements InspectionRepository {
  final Dio _dio;

  InspectionRepositoryImpl({Dio? dio}) : _dio = dio ?? ApiService.dio;

  @override
  Future<DeviceVerificationReportModel?> validateImei({
    required String imei,
    required String brand,
    required String model,
    String? variant,
  }) async {
    try {
      final res = await _dio.post(
        ApiConstants.validateImei,
        data: {
          'imei': imei.trim(),
          'selectedBrand': brand,
          'selectedModel': model,
          'selectedVariant': variant ?? '',
          'source': 'partner-app-hub-inspection',
        },
      );

      if (res.data != null && res.data['success'] == true) {
        return DeviceVerificationReportModel.fromJson(Map<String, dynamic>.from(res.data));
      }
    } catch (_) {}
    return null;
  }

  @override
  Future<Map<String, dynamic>?> createVerificationSession({
    required String brand,
    required String model,
    String? userId,
    String? orderId,
  }) async {
    try {
      final res = await _dio.post(
        ApiConstants.verificationSession,
        data: {
          'selectedDevice': {
            'brand': brand,
            'model': model,
          },
          'userId': userId,
          'sellFlowId': orderId,
        },
      );

      if (res.data != null && res.data['success'] == true && res.data['session'] is Map) {
        return Map<String, dynamic>.from(res.data['session']);
      }
    } catch (_) {}
    return null;
  }

  @override
  Future<bool> submitQAReport({
    required String orderId,
    required double finalPrice,
    required int inspectionScore,
    String? notes,
  }) async {
    return ApiService.updateOrder(
      orderId: orderId,
      status: 'inspection_completed',
      finalPrice: finalPrice,
      inspectionScore: inspectionScore,
      notes: notes ?? '45-Point QA Score: $inspectionScore/100. Certified by Hub Technician.',
    );
  }

  @override
  Future<List<InspectionCriterionModel>> fetchInspectionCriteria() async {
    try {
      final res = await _dio.get(ApiConstants.partnerInspectionCriteria);
      if (res.data != null && res.data['success'] == true && res.data['criteria'] is List) {
        return (res.data['criteria'] as List)
            .map((item) => InspectionCriterionModel.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      }
    } catch (_) {}
    return [];
  }
}
