import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/services/api_service.dart';
import '../models/requests/imagekit_upload_request.dart';

abstract class MediaRepository {
  Future<Response> getImageKitAuth();
  Future<Response> uploadImage(ImageKitUploadRequest request);
  Future<Response> uploadImageFormData(FormData formData);
}

class MediaRepositoryImpl implements MediaRepository {
  final Dio _dio;

  MediaRepositoryImpl({Dio? dio}) : _dio = dio ?? ApiService.dio;

  @override
  Future<Response> getImageKitAuth() {
    return _dio.get(ApiConstants.imageKitAuth);
  }

  @override
  Future<Response> uploadImage(ImageKitUploadRequest request) {
    return _dio.post(
      ApiConstants.imageKitUpload,
      data: request.toJson(),
    );
  }

  @override
  Future<Response> uploadImageFormData(FormData formData) {
    return _dio.post(
      ApiConstants.imageKitUpload,
      data: formData,
    );
  }
}
