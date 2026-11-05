import '../../../core/constants/api_constants.dart';
import '../../../core/services/api_service.dart';
import '../../../models/admin_models.dart';

abstract class PartnersRepository {
  factory PartnersRepository() => PartnersRepositoryImpl();

  Future<List<AdminPartner>> getPartners({String? city, String? status});
  Future<bool> updateStatus({required String partnerId, required String status});
  Future<bool> updateCommission({required String partnerId, required double commissionRate});
}

class PartnersRepositoryImpl implements PartnersRepository {
  final _dio = ApiService.dio;

  @override
  Future<List<AdminPartner>> getPartners({String? city, String? status}) async {
    final queryParams = <String, dynamic>{};
    if (city != null && city.isNotEmpty) queryParams['city'] = city;
    if (status != null && status.isNotEmpty && status != 'all') queryParams['status'] = status;

    final res = await _dio.get(ApiConstants.partners, queryParameters: queryParams);
    if (res.data != null && res.data['success'] == true && res.data['partners'] is List) {
      return (res.data['partners'] as List)
          .map((e) => AdminPartner.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> updateStatus({required String partnerId, required String status}) async {
    final res = await _dio.put(
      ApiConstants.partners,
      data: {'id': partnerId, 'status': status},
    );
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<bool> updateCommission({required String partnerId, required double commissionRate}) async {
    final res = await _dio.put(
      ApiConstants.partners,
      data: {'id': partnerId, 'commissionRate': commissionRate},
    );
    return res.data != null && res.data['success'] == true;
  }
}
