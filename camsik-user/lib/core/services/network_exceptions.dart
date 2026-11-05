import 'package:dio/dio.dart';

class NetworkExceptions {
  static String getErrorMessage(DioException error) {
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return "Connection timeout, please try again.";
    } else if (error.type == DioExceptionType.badResponse) {
      if (error.response?.data != null && error.response?.data is Map) {
        final data = error.response!.data as Map;
        if (data['message'] != null && data['message'].toString().isNotEmpty) {
          return data['message'].toString();
        }
      }
      final statusCode = error.response?.statusCode ?? 0;
      switch (statusCode) {
        case 400:
          return "Bad Request";
        case 401:
          return "Unauthorized, please login again";
        case 403:
          return "Forbidden request";
        case 404:
          return "Not Found";
        case 500:
          return "Internal Server Error";
        default:
          return "Server error: $statusCode";
      }
    } else if (error.type == DioExceptionType.cancel) {
      return "Request was cancelled";
    } else {
      return "Unexpected error occurred";
    }
  }
}
