import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';
import '../models/delivery_agent_model.dart';

abstract class RidersRepository {
  Future<List<DeliveryAgentModel>> fetchRiders({String? partnerId});
  Future<bool> addRider({
    required String name,
    required String phone,
    required String email,
    required String partnerId,
    String? city,
    String? vehicle,
    String? vehicleNumber,
    String? pinCodes,
  });
  Future<bool> updateRiderStatus(String agentId, String status);
}

class RidersRepositoryImpl implements RidersRepository {
  final Dio _dio;

  RidersRepositoryImpl({Dio? dio}) : _dio = dio ?? ApiService.dio;

  @override
  Future<List<DeliveryAgentModel>> fetchRiders({String? partnerId}) async {
    try {
      final res = await _dio.get(
        ApiConstants.deliveryAgents,
        queryParameters: {
          if (partnerId != null && partnerId.isNotEmpty) 'partnerId': partnerId,
        },
      );
      if (res.data != null && res.data['success'] == true && res.data['agents'] is List) {
        return (res.data['agents'] as List)
            .map((item) => DeliveryAgentModel.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      }
    } catch (_) {}
    return [];
  }

  @override
  Future<bool> addRider({
    required String name,
    required String phone,
    required String email,
    required String partnerId,
    String? city,
    String? vehicle,
    String? vehicleNumber,
    String? pinCodes,
  }) async {
    try {
      final res = await _dio.post(
        ApiConstants.deliveryAgents,
        data: {
          'name': name.trim(),
          'phone': phone.trim(),
          'email': email.trim(),
          'partnerId': partnerId,
          'city': city ?? 'Mumbai',
          'vehicle': vehicle ?? 'Bike',
          'vehicleNumber': vehicleNumber ?? 'MH02AB1234',
          'pinCodes': pinCodes ?? '400001, 400050',
          'status': 'online',
        },
      );
      return res.data != null && res.data['success'] == true;
    } catch (_) {
      return false;
    }
  }

  @override
  Future<bool> updateRiderStatus(String agentId, String status) async {
    try {
      final res = await _dio.patch(
        ApiConstants.deliveryAgents,
        data: {
          'id': agentId,
          'status': status,
        },
      );
      return res.data != null && res.data['success'] == true;
    } catch (_) {
      return false;
    }
  }
}
