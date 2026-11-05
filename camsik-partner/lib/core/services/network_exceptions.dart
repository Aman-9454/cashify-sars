import 'package:dio/dio.dart';

class NetworkExceptions {
  static String getErrorMessage(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
          return 'Connection to server timed out. Please check your internet.';
        case DioExceptionType.sendTimeout:
          return 'Request sending timed out. Please retry.';
        case DioExceptionType.receiveTimeout:
          return 'Server took too long to respond. Please try again.';
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final msg = error.response?.data is Map
              ? (error.response?.data['message'] ?? error.response?.data['error'])
              : null;
          if (msg != null && msg.toString().isNotEmpty) {
            return msg.toString();
          }
          if (statusCode == 400) return 'Bad request. Please verify inputs.';
          if (statusCode == 401) return 'Session expired. Please log in again.';
          if (statusCode == 403) return 'You are not authorized for this action.';
          if (statusCode == 404) return 'Requested resource not found.';
          if (statusCode == 500) return 'Internal server error. Please retry shortly.';
          return 'Server responded with status $statusCode.';
        case DioExceptionType.cancel:
          return 'Request cancelled.';
        case DioExceptionType.connectionError:
          return 'No internet connection or server unreachable.';
        default:
          return 'An unexpected network error occurred.';
      }
    }
    return error?.toString() ?? 'An unknown error occurred.';
  }
}
