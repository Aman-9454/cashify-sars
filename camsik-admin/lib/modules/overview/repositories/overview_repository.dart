import '../../../core/constants/api_constants.dart';
import '../../../core/services/api_service.dart';

abstract class OverviewRepository {
  factory OverviewRepository() => OverviewRepositoryImpl();
  Future<Map<String, dynamic>?> getOverview();
  Future<Map<String, dynamic>?> fetchOverview();
}

class OverviewRepositoryImpl implements OverviewRepository {
  final _dio = ApiService.dio;

  @override
  Future<Map<String, dynamic>?> getOverview() async {
    return fetchOverview();
  }

  @override
  Future<Map<String, dynamic>?> fetchOverview() async {
    final res = await _dio.get(ApiConstants.overview);
    if (res.data != null && res.data['success'] == true) {
      return res.data;
    }
    return null;
  }
}
