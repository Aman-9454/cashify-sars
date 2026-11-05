import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';

abstract class CatalogRepository {
  Future<Response> getBanners();
  Future<Response> getCategories();
  Future<Response> getRefurbished({String? category, String? condition, String? search});
  Future<Response> getRentalCameras({String? category, String? brand, String? search});
  Future<Response> getLenses();
}

class CatalogRepositoryImpl implements CatalogRepository {
  final Dio _dio;

  CatalogRepositoryImpl({Dio? dio}) : _dio = dio ?? ApiService.dio;

  @override
  Future<Response> getBanners() {
    return _dio.get(ApiConstants.banners);
  }

  @override
  Future<Response> getCategories() {
    return _dio.get(ApiConstants.categories);
  }

  @override
  Future<Response> getRefurbished({String? category, String? condition, String? search}) {
    final queryParams = <String, dynamic>{};
    if (category != null && category.isNotEmpty && category != 'all') queryParams['category'] = category;
    if (condition != null && condition.isNotEmpty && condition != 'all') queryParams['condition'] = condition;
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    return _dio.get(ApiConstants.refurbished, queryParameters: queryParams);
  }

  @override
  Future<Response> getRentalCameras({String? category, String? brand, String? search}) {
    final queryParams = <String, dynamic>{};
    if (category != null && category.isNotEmpty && category != 'all') queryParams['category'] = category;
    if (brand != null && brand.isNotEmpty && brand != 'all') queryParams['brand'] = brand;
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    return _dio.get(ApiConstants.rentals, queryParameters: queryParams);
  }

  @override
  Future<Response> getLenses() {
    return _dio.get(ApiConstants.lenses);
  }
}
