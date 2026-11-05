import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';
import '../models/requests/login_request.dart';
import '../models/requests/otp_request.dart';
import '../models/requests/refresh_token_request.dart';
import '../models/requests/register_request.dart';

abstract class AuthRepository {
  Future<Response> login(LoginRequest request);
  Future<Response> register(RegisterRequest request);
  Future<Response> sendOtp(SendOtpRequest request);
  Future<Response> verifyOtp(VerifyOtpRequest request);
  Future<Response> refreshToken(RefreshTokenRequest request);
  Future<Response> getProfile();
  Future<Response> updateProfile(Map<String, dynamic> data);
}

class AuthRepositoryImpl implements AuthRepository {
  final Dio _dio;

  AuthRepositoryImpl({Dio? dio}) : _dio = dio ?? ApiService.dio;

  @override
  Future<Response> login(LoginRequest request) {
    return _dio.post(
      ApiConstants.login,
      data: request.toJson(),
    );
  }

  @override
  Future<Response> register(RegisterRequest request) {
    return _dio.post(
      ApiConstants.register,
      data: request.toJson(),
    );
  }

  @override
  Future<Response> sendOtp(SendOtpRequest request) {
    return _dio.post(
      ApiConstants.sendOtp,
      data: request.toJson(),
    );
  }

  @override
  Future<Response> verifyOtp(VerifyOtpRequest request) {
    return _dio.post(
      ApiConstants.verifyOtp,
      data: request.toJson(),
    );
  }

  @override
  Future<Response> refreshToken(RefreshTokenRequest request) {
    return _dio.post(
      ApiConstants.refreshToken,
      data: request.toJson(),
    );
  }

  @override
  Future<Response> getProfile() {
    return _dio.get(ApiConstants.getProfile);
  }

  @override
  Future<Response> updateProfile(Map<String, dynamic> data) {
    return _dio.put(
      ApiConstants.updateProfile,
      data: data,
    );
  }
}
