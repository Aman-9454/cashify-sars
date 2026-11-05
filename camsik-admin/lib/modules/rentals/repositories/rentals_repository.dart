import '../../../core/constants/api_constants.dart';
import '../../../core/services/api_service.dart';
import '../../../models/admin_models.dart';

abstract class RentalsRepository {
  factory RentalsRepository() => RentalsRepositoryImpl();

  Future<List<AdminRentalCamera>> fetchRentalCameras({String? category, String? brand, String? search});
  Future<bool> addRentalCamera(Map<String, dynamic> data);
  Future<bool> updateRentalCamera(Map<String, dynamic> data);
  Future<bool> deleteRentalCamera(String id);
  Future<List<AdminOrder>> fetchRentalOrders();
}

class RentalsRepositoryImpl implements RentalsRepository {
  final _dio = ApiService.dio;

  @override
  Future<List<AdminRentalCamera>> fetchRentalCameras({String? category, String? brand, String? search}) async {
    final queryParams = <String, dynamic>{};
    if (category != null && category.isNotEmpty && category != 'all') queryParams['category'] = category;
    if (brand != null && brand.isNotEmpty && brand != 'all') queryParams['brand'] = brand;
    if (search != null && search.isNotEmpty) queryParams['search'] = search;

    final res = await _dio.get(ApiConstants.rentals, queryParameters: queryParams);
    if (res.data != null && res.data['success'] == true && res.data['cameras'] is List) {
      return (res.data['cameras'] as List)
          .map((e) => AdminRentalCamera.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> addRentalCamera(Map<String, dynamic> data) async {
    final res = await _dio.post(ApiConstants.rentals, data: data);
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<bool> updateRentalCamera(Map<String, dynamic> data) async {
    final res = await _dio.put(ApiConstants.rentals, data: data);
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<bool> deleteRentalCamera(String id) async {
    final res = await _dio.delete("${ApiConstants.rentals}?id=$id");
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<List<AdminOrder>> fetchRentalOrders() async {
    final res = await _dio.get(ApiConstants.orders, queryParameters: {'type': 'rent'});
    if (res.data != null && res.data['success'] == true && res.data['orders'] is List) {
      return (res.data['orders'] as List)
          .map((e) => AdminOrder.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }
}
