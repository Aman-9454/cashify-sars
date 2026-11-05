import 'package:dio/dio.dart';

class NetworkExceptions {
  NetworkExceptions._();

  static String getErrorMessage(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return 'Connection timed out. Please check your network connection.';
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          if (statusCode == 400) {
            return error.response?.data?['message']?.toString() ?? 'Bad request. Please verify details.';
          } else if (statusCode == 401) {
            return error.response?.data?['message']?.toString() ?? 'Unauthorized. Please sign in again.';
          } else if (statusCode == 404) {
            return error.response?.data?['message']?.toString() ?? 'Task or resource not found.';
          } else if (statusCode == 500 || statusCode == 502 || statusCode == 503) {
            return 'Server issue. Please try again in a few moments.';
          }
          return error.response?.data?['message']?.toString() ?? 'Server error [$statusCode]';
        case DioExceptionType.cancel:
          return 'Request was cancelled.';
        case DioExceptionType.connectionError:
          return 'Cannot reach delivery server. Please check internet.';
        default:
          return 'An unexpected network error occurred.';
      }
    }
    return error?.toString() ?? 'An unknown error occurred.';
  }
}
