import 'dart:async';
import 'package:dio/dio.dart';
import '../../models/delivery_models.dart';
import '../../modules/tasks/models/diagnostic_check_registry.dart';
import '../constants/api_constants.dart';
import '../constants/app_keys.dart';
import '../utils/logger.dart';
import '../utils/session_manager.dart';
import 'network_exceptions.dart';
import 'storage_service.dart';

class ApiService {
  static Dio? _dio;

  static Dio get dio {
    if (_dio == null) {
      init();
    }
    return _dio!;
  }

  static set dio(Dio value) => _dio = value;

  static void init() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    )..interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) async {
            final startTime = DateTime.now();
            options.extra['startTime'] = startTime;

            final prefs = await SharedPreferencesService.getInstance();
            final token = prefs.getString(AppKeys.accessToken);

            if (token != null && token.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $token';
              appLog("🔐 Bearer Token attached");
            }

            dynamic dataToLog = options.data;
            if (options.data is FormData) {
              final formData = options.data as FormData;
              final fieldsMap = Map.fromEntries(formData.fields);
              final filesMap = Map.fromEntries(
                formData.files.map((f) => MapEntry(f.key, f.value.filename ?? 'File')),
              );
              dataToLog = {
                if (fieldsMap.isNotEmpty) 'fields': fieldsMap,
                if (filesMap.isNotEmpty) 'files': filesMap,
              };
            }

            appLog("📤 REQUEST → ${options.method} ${options.uri}");
            appLog("🔸 Headers: ${options.headers}");
            appLog("🔸 Data: $dataToLog");
            appLog("⏱️ Started at: $startTime");

            return handler.next(options);
          },
          onResponse: (response, handler) {
            final startTime = response.requestOptions.extra['startTime'] as DateTime?;
            final duration = startTime != null ? DateTime.now().difference(startTime) : null;
            appLog("✅ RESPONSE ← ${response.statusCode} ${response.requestOptions.uri}");
            appLog("📦 Response Data: ${response.data}");
            if (duration != null) {
              appLog("⏳ API Duration: ${duration.inMilliseconds} ms (${duration.inSeconds}s)");
            }
            return handler.next(response);
          },
          onError: (DioException e, handler) async {
            final startTime = e.requestOptions.extra['startTime'] as DateTime?;
            final duration = startTime != null ? DateTime.now().difference(startTime) : null;

            appLog("❌ ERROR ← ${e.response?.statusCode} ${e.requestOptions.uri}");
            if (duration != null) {
              appLog("⏱️ API failed after: ${duration.inMilliseconds} ms (${duration.inSeconds}s)");
            }

            if (e.response?.statusCode == 401) {
              if (e.requestOptions.path.contains('/auth/refresh-token')) {
                appLog("🚨 Refresh token endpoint returned 401 - forcing logout");
                await SessionManager.forceLogout();
                return handler.next(e);
              }

              final prefs = await SharedPreferencesService.getInstance();
              final storedRefreshToken = prefs.getString(AppKeys.refreshToken);

              if (storedRefreshToken != null && storedRefreshToken.isNotEmpty) {
                appLog("🔄 401 Unauthorized received. Attempting token refresh...");
                try {
                  final refreshDio = Dio(
                    BaseOptions(
                      connectTimeout: const Duration(seconds: 15),
                      receiveTimeout: const Duration(seconds: 15),
                      headers: {"Accept": "application/json", "Content-Type": "application/json"},
                    ),
                  );

                  final refreshResponse = await refreshDio.post(
                    ApiConstants.refreshToken,
                    data: {"token": storedRefreshToken},
                  );

                  if (refreshResponse.statusCode == 200 &&
                      refreshResponse.data != null &&
                      refreshResponse.data['success'] == true) {
                    final newAccessToken = refreshResponse.data['data']?['accessToken'];
                    if (newAccessToken != null && newAccessToken is String && newAccessToken.isNotEmpty) {
                      appLog("✅ Access token refreshed successfully! Retrying request...");
                      await prefs.setString(AppKeys.accessToken, newAccessToken);

                      final retryOptions = e.requestOptions;
                      retryOptions.headers['Authorization'] = 'Bearer $newAccessToken';
                      final response = await dio.fetch(retryOptions);
                      return handler.resolve(response);
                    }
                  }
                } catch (refreshErr) {
                  appLog("❌ Refresh token call failed: $refreshErr");
                }
              }

              appLog("🚨 401 Unauthorized & refresh token unavailable/expired - forcing logout");
              await SessionManager.forceLogout();
              return handler.next(e);
            }

            if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout) {
              appLog("⚠️ Timeout: The API took too long to respond.");
              try {
                appLog("🔁 Retrying request once due to timeout...");
                final retryOptions = e.requestOptions;
                retryOptions.connectTimeout = const Duration(seconds: 30);
                retryOptions.receiveTimeout = const Duration(seconds: 30);

                final response = await dio.fetch(retryOptions);
                appLog("✅ Retry succeeded with status ${response.statusCode}");
                return handler.resolve(response);
              } catch (retryError) {
                appLog("❌ Retry failed too: $retryError");
              }
            }

            return handler.next(e);
          },
        ),
      );
  }

  // ── AUTHENTICATION ──
  static Future<Map<String, dynamic>> login(String identifier, String password) async {
    try {
      final res = await dio.post(
        ApiConstants.login,
        data: {
          'identifier': identifier.trim(),
          'password': password.trim(),
          'role': 'delivery',
        },
      );

      if (res.data != null && res.data['success'] == true) {
        final agentData = res.data['agent'] ?? res.data['user'];
        final token = res.data['token'] ?? res.data['accessToken'];
        final refreshToken = res.data['refreshToken'];
        return {
          'success': true,
          'agent': DeliveryAgentUser.fromJson(Map<String, dynamic>.from(agentData)),
          'token': token,
          'refreshToken': refreshToken,
          'message': res.data['message'] ?? 'Logged in successfully',
        };
      }

      return {
        'success': false,
        'message': res.data?['message'] ?? 'Invalid credentials.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': NetworkExceptions.getErrorMessage(e),
      };
    }
  }

  // ── ORDERS & TASKS ──
  static Future<List<DeliveryTask>> fetchTasks({
    String? deliveryAgentId,
    String? status,
    String? search,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (deliveryAgentId != null && deliveryAgentId.isNotEmpty) {
        queryParams['deliveryAgentId'] = deliveryAgentId;
      }
      if (status != null && status.isNotEmpty && status != 'all') {
        queryParams['status'] = status;
      }
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }

      final res = await dio.get(ApiConstants.orders, queryParameters: queryParams);
      if (res.data != null && res.data['success'] == true && res.data['orders'] is List) {
        return (res.data['orders'] as List)
            .map((item) => DeliveryTask.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching delivery tasks: $e");
    }
    return [];
  }

  static Future<bool> updateTaskStatus({
    required String orderId,
    required String status,
    String? otp,
    double? finalPrice,
    int? inspectionScore,
    String? deviceImei,
    bool? deviceCollected,
    String? paymentStatus,
    String? payoutMethod,
    String? payoutReferenceId,
    String? notes,
    String? pickupDate,
  }) async {
    try {
      final payload = <String, dynamic>{
        'orderId': orderId,
        'status': status,
      };
      if (otp != null && otp.isNotEmpty) payload['otp'] = otp;
      if (finalPrice != null) payload['finalPrice'] = finalPrice;
      if (inspectionScore != null) payload['inspectionScore'] = inspectionScore;
      if (deviceImei != null && deviceImei.isNotEmpty) payload['deviceImei'] = deviceImei;
      if (deviceCollected != null) payload['deviceCollected'] = deviceCollected;
      if (paymentStatus != null && paymentStatus.isNotEmpty) payload['paymentStatus'] = paymentStatus;
      if (payoutMethod != null && payoutMethod.isNotEmpty) payload['payoutMethod'] = payoutMethod;
      if (payoutReferenceId != null && payoutReferenceId.isNotEmpty) {
        payload['payoutReferenceId'] = payoutReferenceId;
      }
      if (notes != null && notes.isNotEmpty) payload['notes'] = notes;
      if (pickupDate != null && pickupDate.isNotEmpty) payload['pickupDate'] = pickupDate;

      final res = await dio.patch(ApiConstants.orders, data: payload);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error updating task status: $e");
      return false;
    }
  }

  // ── AGENT PROFILE & SHIFT ──
  static Future<DeliveryAgentUser?> fetchAgentProfile(String agentId) async {
    try {
      final res = await dio.get(
        ApiConstants.deliveryAgents,
        queryParameters: {'id': agentId},
      );
      if (res.data != null && res.data['success'] == true && res.data['agent'] != null) {
        return DeliveryAgentUser.fromJson(Map<String, dynamic>.from(res.data['agent']));
      }
    } catch (e) {
      appLog("Error fetching agent profile: $e");
    }
    return null;
  }

  static Future<bool> updateAgentShift(String agentId, String status) async {
    try {
      final res = await dio.patch(
        ApiConstants.deliveryAgents,
        data: {'id': agentId, 'status': status},
      );
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error updating agent shift: $e");
      return false;
    }
  }

  // ── ORDER MESSAGES / TIMELINE ──
  static Future<List<dynamic>> fetchOrderMessages(String orderId) async {
    try {
      final res = await dio.get(
        ApiConstants.orderMessages,
        queryParameters: {'orderId': orderId},
      );
      if (res.data != null && res.data['success'] == true && res.data['messages'] is List) {
        return res.data['messages'];
      }
    } catch (e) {
      appLog("Error fetching order messages: $e");
    }
    return [];
  }

  static Future<bool> sendOrderMessage(String orderId, String message, {String senderRole = 'delivery'}) async {
    try {
      final res = await dio.post(
        ApiConstants.orderMessages,
        data: {
          'orderId': orderId,
          'message': message,
          'sender': senderRole,
        },
      );
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error sending order message: $e");
      return false;
    }
  }

  // ── DEVICE VERIFICATION ──
  static Future<Map<String, dynamic>> validateImei(String imei) async {
    try {
      final res = await dio.post(
        ApiConstants.validateImei,
        data: {'imei': imei},
      );
      return res.data is Map<String, dynamic> ? res.data : {'success': false};
    } catch (e) {
      return {'success': false, 'message': NetworkExceptions.getErrorMessage(e)};
    }
  }

  // ── DIAGNOSTIC QUESTIONS (ADMIN SYNC) ──
  static Future<List<DiagnosticCheckItem>> fetchDiagnosticQuestions(String categoryId, {double? quotedPrice}) async {
    try {
      final res = await dio.get(
        ApiConstants.questions,
        queryParameters: {'categoryId': categoryId},
      );
      if (res.data != null && res.data['success'] == true && res.data['questions'] is List) {
        final List rawList = res.data['questions'];
        if (rawList.isNotEmpty) {
          return rawList.map((item) {
            final options = item['options'] as List? ?? [];
            int deductionPct = 15;
            if (options.isNotEmpty) {
              int minAdj = 0;
              for (final opt in options) {
                final adj = (opt['adj'] as num?)?.toInt() ?? 0;
                if (adj < minAdj) minAdj = adj;
              }
              if (minAdj < 0 && quotedPrice != null && quotedPrice > 0) {
                deductionPct = ((minAdj.abs() / quotedPrice) * 100).round().clamp(5, 35);
              }
            }
            return DiagnosticCheckItem(
              id: item['id']?.toString() ?? '',
              label: item['question']?.toString() ?? '',
              subtext: item['subtext']?.toString() ?? '',
              deductionPct: deductionPct,
            );
          }).toList();
        }
      }
    } catch (e) {
      appLog("Error fetching diagnostic questions from admin: $e");
    }
    return [];
  }
}
