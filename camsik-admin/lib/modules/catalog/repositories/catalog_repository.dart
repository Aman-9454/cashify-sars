import '../../../core/constants/api_constants.dart';
import '../../../core/services/api_service.dart';
import '../../../models/admin_models.dart';

abstract class CatalogRepository {
  factory CatalogRepository() => CatalogRepositoryImpl();

  Future<List<AdminCategory>> fetchCategories();
  Future<bool> addCategory(Map<String, dynamic> data);
  Future<List<AdminBrand>> fetchBrands({String? categoryId});
  Future<bool> addBrand(Map<String, dynamic> data);
  Future<List<AdminDeviceModel>> fetchModels({String? categoryId, String? brandId, String? search});
  Future<bool> addModel(Map<String, dynamic> data);
  Future<bool> updateModelPrice(String id, double basePrice);
  Future<List<AdminLens>> fetchLenses();
  Future<bool> addLens(Map<String, dynamic> data);
  Future<bool> deleteLens(String id);
  Future<List<AdminRefurbishedDevice>> fetchRefurbished();
  Future<bool> addRefurbished(Map<String, dynamic> data);
  Future<bool> updateRefurbished(Map<String, dynamic> data);
}

class CatalogRepositoryImpl implements CatalogRepository {
  final _dio = ApiService.dio;

  @override
  Future<List<AdminCategory>> fetchCategories() async {
    final res = await _dio.get(ApiConstants.categories);
    if (res.data != null && res.data['success'] == true && res.data['categories'] is List) {
      return (res.data['categories'] as List)
          .map((e) => AdminCategory.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> addCategory(Map<String, dynamic> data) async {
    final res = await _dio.post(ApiConstants.categories, data: data);
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<List<AdminBrand>> fetchBrands({String? categoryId}) async {
    final queryParams = <String, dynamic>{};
    if (categoryId != null && categoryId.isNotEmpty && categoryId != 'all') {
      queryParams['categoryId'] = categoryId;
    }
    final res = await _dio.get(ApiConstants.brands, queryParameters: queryParams);
    if (res.data != null && res.data['success'] == true && res.data['brands'] is List) {
      return (res.data['brands'] as List)
          .map((e) => AdminBrand.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> addBrand(Map<String, dynamic> data) async {
    final res = await _dio.post(ApiConstants.brands, data: data);
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<List<AdminDeviceModel>> fetchModels({String? categoryId, String? brandId, String? search}) async {
    final queryParams = <String, dynamic>{};
    if (categoryId != null && categoryId.isNotEmpty && categoryId != 'all') {
      queryParams['categoryId'] = categoryId;
    }
    if (brandId != null && brandId.isNotEmpty && brandId != 'all') {
      queryParams['brandId'] = brandId;
    }
    if (search != null && search.isNotEmpty) {
      queryParams['search'] = search;
    }

    final res = await _dio.get(ApiConstants.models, queryParameters: queryParams);
    if (res.data != null && res.data['success'] == true && res.data['models'] is List) {
      return (res.data['models'] as List)
          .map((e) => AdminDeviceModel.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> addModel(Map<String, dynamic> data) async {
    final res = await _dio.post(ApiConstants.models, data: data);
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<bool> updateModelPrice(String id, double basePrice) async {
    final res = await _dio.put(
      ApiConstants.models,
      data: {'id': id, 'basePrice': basePrice},
    );
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<List<AdminLens>> fetchLenses() async {
    final res = await _dio.get(ApiConstants.lenses);
    if (res.data != null && res.data['success'] == true && res.data['lenses'] is List) {
      return (res.data['lenses'] as List)
          .map((e) => AdminLens.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> addLens(Map<String, dynamic> data) async {
    final res = await _dio.post(ApiConstants.lenses, data: data);
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<bool> deleteLens(String id) async {
    final res = await _dio.delete("${ApiConstants.lenses}?id=$id");
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<List<AdminRefurbishedDevice>> fetchRefurbished() async {
    final res = await _dio.get(ApiConstants.refurbished);
    if (res.data != null && res.data['success'] == true && res.data['devices'] is List) {
      return (res.data['devices'] as List)
          .map((e) => AdminRefurbishedDevice.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> addRefurbished(Map<String, dynamic> data) async {
    final res = await _dio.post(ApiConstants.refurbished, data: data);
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<bool> updateRefurbished(Map<String, dynamic> data) async {
    final res = await _dio.put(ApiConstants.refurbished, data: data);
    return res.data != null && res.data['success'] == true;
  }
}
