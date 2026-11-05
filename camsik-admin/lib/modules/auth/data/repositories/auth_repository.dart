import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';

abstract class AuthRepository {
  Future<Response> login({required String identifier, required String password});
}

class AuthRepositoryImpl implements AuthRepository {
  final Dio _dio;

  AuthRepositoryImpl({Dio? dio}) : _dio = dio ?? ApiService.dio;

  @override
  Future<Response> login({required String identifier, required String password}) {
    return _dio.post(
      ApiConstants.login,
      data: {
        'identifier': identifier.trim(),
        'email': identifier.trim(),
        'password': password.trim(),
        'role': 'admin',
      },
    );
  }
}
