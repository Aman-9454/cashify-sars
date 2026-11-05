import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';
import '../../../../models/partner_models.dart';

abstract class PartnerRepository {
  Future<PartnerUser?> fetchPartnerProfile(String partnerId);
  Future<bool> updatePartnerProfile(String partnerId, Map<String, dynamic> updates);
}

class PartnerRepositoryImpl implements PartnerRepository {
  final Dio _dio;

  PartnerRepositoryImpl({Dio? dio}) : _dio = dio ?? ApiService.dio;

  @override
  Future<PartnerUser?> fetchPartnerProfile(String partnerId) async {
    try {
      final res = await _dio.get(
        ApiConstants.partners,
        queryParameters: {'id': partnerId},
      );
      if (res.data != null && res.data['success'] == true && res.data['partners'] is List) {
        final list = res.data['partners'] as List;
        if (list.isNotEmpty) {
          return PartnerUser.fromJson(Map<String, dynamic>.from(list.first));
        }
      }
    } catch (_) {}
    return null;
  }

  @override
  Future<bool> updatePartnerProfile(String partnerId, Map<String, dynamic> updates) async {
    try {
      final payload = {'id': partnerId, ...updates};
      final res = await _dio.patch(ApiConstants.partners, data: payload);
      return res.data != null && res.data['success'] == true;
    } catch (_) {
      return false;
    }
  }
}
