import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';
import '../models/requests/fetch_refurbished_request.dart';

abstract class RefurbishedRepository {
  Future<Response> getRefurbished(FetchRefurbishedRequest request);
}

class RefurbishedRepositoryImpl implements RefurbishedRepository {
  final Dio _dio;

  RefurbishedRepositoryImpl({Dio? dio}) : _dio = dio ?? ApiService.dio;

  @override
  Future<Response> getRefurbished(FetchRefurbishedRequest request) {
    return _dio.get(
      ApiConstants.refurbished,
      queryParameters: request.toQueryParameters(),
    );
  }
}
