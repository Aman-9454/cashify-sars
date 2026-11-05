import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';
import '../models/requests/create_verification_session_request.dart';
import '../models/requests/fetch_models_request.dart';
import '../models/requests/fetch_questions_request.dart';
import '../models/requests/validate_imei_request.dart';

abstract class SellRepository {
  Future<Response> fetchModels(FetchModelsRequest request);
  Future<Response> fetchQuestions(FetchQuestionsRequest request);
  Future<Response> validateImei(ValidateImeiRequest request);
  Future<Response> createVerificationSession(CreateVerificationSessionRequest request);
  Future<Response> getVerificationSession(String sessionId);
}

class SellRepositoryImpl implements SellRepository {
  final Dio _dio;

  SellRepositoryImpl({Dio? dio}) : _dio = dio ?? ApiService.dio;

  @override
  Future<Response> fetchModels(FetchModelsRequest request) {
    return _dio.get(
      ApiConstants.models,
      queryParameters: request.toQueryParameters(),
    );
  }

  @override
  Future<Response> fetchQuestions(FetchQuestionsRequest request) {
    return _dio.get(
      ApiConstants.questions,
      queryParameters: request.toQueryParameters(),
    );
  }

  @override
  Future<Response> validateImei(ValidateImeiRequest request) {
    return _dio.post(
      ApiConstants.validateImei,
      data: request.toJson(),
    );
  }

  @override
  Future<Response> createVerificationSession(CreateVerificationSessionRequest request) {
    return _dio.post(
      ApiConstants.verificationSession,
      data: request.toJson(),
    );
  }

  @override
  Future<Response> getVerificationSession(String sessionId) {
    return _dio.get(
      '${ApiConstants.verificationSession}/$sessionId',
    );
  }
}
