import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';
import '../models/dashboard_stats_model.dart';

abstract class DashboardRepository {
  Future<DashboardStatsModel?> fetchDashboardStats(String partnerId);
}

class DashboardRepositoryImpl implements DashboardRepository {
  final Dio _dio;

  DashboardRepositoryImpl({Dio? dio}) : _dio = dio ?? ApiService.dio;

  @override
  Future<DashboardStatsModel?> fetchDashboardStats(String partnerId) async {
    try {
      final res = await _dio.get(
        ApiConstants.partnerDashboard,
        queryParameters: {'partnerId': partnerId},
      );
      if (res.data != null && res.data['success'] == true) {
        return DashboardStatsModel.fromJson(Map<String, dynamic>.from(res.data));
      }
    } catch (_) {}
    return null;
  }
}
