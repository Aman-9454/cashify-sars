import '../../../core/constants/api_constants.dart';
import '../../../core/services/api_service.dart';
import '../../../models/admin_models.dart';

abstract class FleetRepository {
  factory FleetRepository() => FleetRepositoryImpl();

  Future<List<AdminDeliveryAgent>> getAgents({String? dutyStatus});
  Future<bool> updateDutyStatus({required String agentId, required String dutyStatus});
  Future<List<Map<String, dynamic>>> getAgentPayouts(String agentId);
}

class FleetRepositoryImpl implements FleetRepository {
  final _dio = ApiService.dio;

  @override
  Future<List<AdminDeliveryAgent>> getAgents({String? dutyStatus}) async {
    final queryParams = <String, dynamic>{};
    if (dutyStatus != null && dutyStatus.isNotEmpty && dutyStatus != 'all') {
      queryParams['dutyStatus'] = dutyStatus;
    }

    final res = await _dio.get(ApiConstants.deliveryAgents, queryParameters: queryParams);
    if (res.data != null && res.data['success'] == true && res.data['agents'] is List) {
      return (res.data['agents'] as List)
          .map((e) => AdminDeliveryAgent.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> updateDutyStatus({required String agentId, required String dutyStatus}) async {
    final res = await _dio.put(
      ApiConstants.deliveryAgents,
      data: {'id': agentId, 'dutyStatus': dutyStatus},
    );
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<List<Map<String, dynamic>>> getAgentPayouts(String agentId) async {
    final res = await _dio.get(
      ApiConstants.payouts,
      queryParameters: {'requesterId': agentId},
    );
    if (res.data != null && res.data['success'] == true && res.data['payouts'] is List) {
      return List<Map<String, dynamic>>.from(res.data['payouts']);
    }
    return [];
  }
}
