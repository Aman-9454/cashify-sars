import 'package:dio/dio.dart';

class NetworkExceptions {
  static String getErrorMessage(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.cancel:
          return "Request to server was cancelled";
        case DioExceptionType.connectionTimeout:
          return "Connection timeout with server";
        case DioExceptionType.receiveTimeout:
          return "Receive timeout in connection with server";
        case DioExceptionType.sendTimeout:
          return "Send timeout in connection with server";
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final data = error.response?.data;
          if (data is Map && data.containsKey('message')) {
            return data['message'].toString();
          }
          if (statusCode == 400) return "Bad request";
          if (statusCode == 401) return "Unauthorized access. Please login again.";
          if (statusCode == 403) return "Forbidden access";
          if (statusCode == 404) return "Requested resource not found";
          if (statusCode == 500) return "Internal server error";
          return "Received invalid status code: $statusCode";
        case DioExceptionType.unknown:
          if (error.message?.contains("SocketException") ?? false) {
            return "No internet connection. Please verify network.";
          }
          return "Unexpected error occurred";
        default:
          return "Something went wrong. Please try again.";
      }
    }
    return error?.toString() ?? "An unexpected error occurred";
  }
}
