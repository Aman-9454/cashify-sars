import 'dart:async';
import 'package:dio/dio.dart';
import '../../models/admin_models.dart';
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

  static Future<void> loadSavedServerUrl() async {
    try {
      final prefs = await SharedPreferencesService.getInstance();
      final savedUrl = prefs.getString('custom_server_url');
      if (savedUrl != null && savedUrl.isNotEmpty) {
        ApiConstants.serverUrl = savedUrl;
      }
    } catch (_) {}
  }

  static Future<void> switchServerUrl(String newUrl) async {
    ApiConstants.serverUrl = newUrl;
    final prefs = await SharedPreferencesService.getInstance();
    await prefs.setString('custom_server_url', newUrl);
    init();
  }

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
            if (dataToLog != null) {
              appLog("📦 Payload: $dataToLog");
            }
            appLog("⏱️ Started at: $startTime");

            return handler.next(options);
          },
          onResponse: (response, handler) {
            final startTime = response.requestOptions.extra['startTime'] as DateTime?;
            final duration = startTime != null ? DateTime.now().difference(startTime) : null;
            appLog("✅ RESPONSE ← ${response.statusCode} ${response.requestOptions.uri}");
            if (duration != null) {
              appLog("⏳ API Duration: ${duration.inMilliseconds} ms");
            }
            return handler.next(response);
          },
          onError: (DioException e, handler) async {
            appLog("❌ ERROR ← ${e.response?.statusCode} ${e.requestOptions.uri}");

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
              try {
                final retryOptions = e.requestOptions;
                retryOptions.connectTimeout = const Duration(seconds: 30);
                retryOptions.receiveTimeout = const Duration(seconds: 30);
                final response = await dio.fetch(retryOptions);
                return handler.resolve(response);
              } catch (_) {}
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
          'email': identifier.trim(),
          'password': password.trim(),
          'role': 'admin',
        },
      );

      if (res.data != null && res.data['success'] == true) {
        final userData = res.data['user'] ?? res.data['admin'];
        final token = res.data['token'] ?? res.data['accessToken'] ?? 'admin-session-token';
        final refreshToken = res.data['refreshToken'] ?? '';

        if (userData != null) {
          final adminUser = AdminUser.fromJson(Map<String, dynamic>.from(userData));
          return {
            'success': true,
            'user': adminUser,
            'token': token,
            'refreshToken': refreshToken,
            'message': res.data['message'] ?? 'Logged in successfully',
          };
        }
      }

      return {
        'success': false,
        'message': res.data?['message'] ?? 'Invalid admin credentials.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': NetworkExceptions.getErrorMessage(e),
      };
    }
  }

  // ── PLATFORM OVERVIEW & ANALYTICS ──
  static Future<Map<String, dynamic>?> fetchOverview() async {
    try {
      final res = await dio.get(ApiConstants.overview);
      if (res.data != null && res.data['success'] == true) {
        return res.data;
      }
    } catch (e) {
      appLog("Error fetching platform overview: $e");
    }
    return null;
  }

  // ── ORDERS MANAGEMENT ──
  static Future<List<AdminOrder>> fetchOrders({
    String? search,
    String? status,
    String? type,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (search != null && search.isNotEmpty) queryParams['search'] = search;
      if (status != null && status.isNotEmpty && status != 'all') queryParams['status'] = status;
      if (type != null && type.isNotEmpty && type != 'all') queryParams['type'] = type;

      final res = await dio.get(ApiConstants.orders, queryParameters: queryParams);
      if (res.data != null && res.data['success'] == true && res.data['orders'] is List) {
        return (res.data['orders'] as List)
            .map((e) => AdminOrder.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching orders: $e");
    }
    return [];
  }

  static Future<bool> updateOrder({
    required String orderId,
    String? status,
    String? notes,
    double? finalPrice,
    String? assignedPartnerId,
    String? assignedPartnerName,
    String? assignedRiderId,
    String? assignedRiderName,
  }) async {
    try {
      final payload = <String, dynamic>{'orderId': orderId, 'id': orderId};
      if (status != null && status.isNotEmpty) payload['status'] = status;
      if (notes != null && notes.isNotEmpty) payload['notes'] = notes;
      if (finalPrice != null) payload['finalPrice'] = finalPrice;
      if (assignedPartnerId != null) {
        payload['partnerId'] = assignedPartnerId;
        payload['assignedPartnerId'] = assignedPartnerId;
      }
      if (assignedPartnerName != null) {
        payload['partnerName'] = assignedPartnerName;
        payload['assignedPartnerName'] = assignedPartnerName;
      }
      if (assignedRiderId != null) {
        payload['deliveryAgentId'] = assignedRiderId;
        payload['assignedRiderId'] = assignedRiderId;
      }
      if (assignedRiderName != null) {
        payload['deliveryAgentName'] = assignedRiderName;
        payload['assignedRiderName'] = assignedRiderName;
      }

      final res = await dio.patch(ApiConstants.orders, data: payload);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error updating order: $e");
      return false;
    }
  }

  // ── PARTNER STORES DIRECTORY ──
  static Future<List<AdminPartner>> fetchPartners({String? city, String? status}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (city != null && city.isNotEmpty) queryParams['city'] = city;
      if (status != null && status.isNotEmpty && status != 'all') queryParams['status'] = status;

      final res = await dio.get(ApiConstants.partners, queryParameters: queryParams);
      if (res.data != null && res.data['success'] == true && res.data['partners'] is List) {
        return (res.data['partners'] as List)
            .map((e) => AdminPartner.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching partners: $e");
    }
    return [];
  }

  static Future<bool> updatePartnerStatus({
    required String partnerId,
    required String status,
  }) async {
    try {
      final res = await dio.patch(
        ApiConstants.partners,
        data: {'id': partnerId, 'status': status},
      );
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error updating partner status: $e");
      return false;
    }
  }

  static Future<bool> updatePartnerCommission({
    required String partnerId,
    required double commissionRate,
  }) async {
    try {
      final res = await dio.patch(
        ApiConstants.partners,
        data: {'id': partnerId, 'commissionRate': commissionRate},
      );
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error updating partner commission: $e");
      return false;
    }
  }

  // ── DELIVERY FLEET & AGENTS ──
  static Future<List<AdminDeliveryAgent>> fetchDeliveryAgents({String? dutyStatus}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (dutyStatus != null && dutyStatus.isNotEmpty && dutyStatus != 'all') {
        queryParams['dutyStatus'] = dutyStatus;
      }

      final res = await dio.get(ApiConstants.deliveryAgents, queryParameters: queryParams);
      if (res.data != null && res.data['success'] == true && res.data['agents'] is List) {
        return (res.data['agents'] as List)
            .map((e) => AdminDeliveryAgent.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching delivery agents: $e");
    }
    return [];
  }

  static Future<bool> updateAgentDutyStatus({
    required String agentId,
    required String dutyStatus,
  }) async {
    try {
      final res = await dio.patch(
        ApiConstants.deliveryAgents,
        data: {'id': agentId, 'dutyStatus': dutyStatus, 'status': dutyStatus},
      );
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error updating agent duty status: $e");
      return false;
    }
  }

  // ── RENTALS FLEET & BOOKINGS ──
  static Future<List<AdminRentalCamera>> fetchRentalCameras({String? category, String? brand, String? search}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (category != null && category.isNotEmpty && category != 'all') queryParams['category'] = category;
      if (brand != null && brand.isNotEmpty && brand != 'all') queryParams['brand'] = brand;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final res = await dio.get(ApiConstants.rentals, queryParameters: queryParams);
      if (res.data != null && res.data['success'] == true && res.data['cameras'] is List) {
        return (res.data['cameras'] as List)
            .map((e) => AdminRentalCamera.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching rental cameras: $e");
    }
    return [];
  }

  static Future<bool> addRentalCamera(Map<String, dynamic> data) async {
    try {
      final res = await dio.post(ApiConstants.rentals, data: data);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error adding rental camera: $e");
      return false;
    }
  }

  static Future<bool> updateRentalCamera(Map<String, dynamic> data) async {
    try {
      final res = await dio.put(ApiConstants.rentals, data: data);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error updating rental camera: $e");
      return false;
    }
  }

  static Future<bool> deleteRentalCamera(String id) async {
    try {
      final res = await dio.delete("${ApiConstants.rentals}?id=$id");
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error deleting rental camera: $e");
      return false;
    }
  }

  // ── CATALOG: CATEGORIES ──
  static Future<List<AdminCategory>> fetchCategories() async {
    try {
      final res = await dio.get(ApiConstants.categories);
      if (res.data != null && res.data['success'] == true && res.data['categories'] is List) {
        return (res.data['categories'] as List)
            .map((e) => AdminCategory.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching categories: $e");
    }
    return [];
  }

  static Future<bool> addCategory(Map<String, dynamic> data) async {
    try {
      final res = await dio.post(ApiConstants.categories, data: data);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error adding category: $e");
      return false;
    }
  }

  // ── CATALOG: BRANDS ──
  static Future<List<AdminBrand>> fetchBrands({String? categoryId}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (categoryId != null && categoryId.isNotEmpty && categoryId != 'all') {
        queryParams['categoryId'] = categoryId;
      }
      final res = await dio.get(ApiConstants.brands, queryParameters: queryParams);
      if (res.data != null && res.data['success'] == true && res.data['brands'] is List) {
        return (res.data['brands'] as List)
            .map((e) => AdminBrand.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching brands: $e");
    }
    return [];
  }

  static Future<bool> addBrand(Map<String, dynamic> data) async {
    try {
      final res = await dio.post(ApiConstants.brands, data: data);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error adding brand: $e");
      return false;
    }
  }

  // ── CATALOG: MODELS ──
  static Future<List<AdminDeviceModel>> fetchModels({String? categoryId, String? brandId, String? search}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (categoryId != null && categoryId.isNotEmpty && categoryId != 'all') queryParams['categoryId'] = categoryId;
      if (brandId != null && brandId.isNotEmpty && brandId != 'all') queryParams['brandId'] = brandId;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final res = await dio.get(ApiConstants.models, queryParameters: queryParams);
      if (res.data != null && res.data['success'] == true && res.data['models'] is List) {
        return (res.data['models'] as List)
            .map((e) => AdminDeviceModel.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching models: $e");
    }
    return [];
  }

  static Future<bool> addModel(Map<String, dynamic> data) async {
    try {
      final res = await dio.post(ApiConstants.models, data: data);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error adding model: $e");
      return false;
    }
  }

  static Future<bool> updateModelPrice(String id, double basePrice) async {
    try {
      final res = await dio.put(ApiConstants.models, data: {'id': id, 'basePrice': basePrice});
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error updating model price: $e");
      return false;
    }
  }

  // ── CATALOG: LENSES ──
  static Future<List<AdminLens>> fetchLenses() async {
    try {
      final res = await dio.get(ApiConstants.lenses);
      if (res.data != null && res.data['success'] == true && res.data['lenses'] is List) {
        return (res.data['lenses'] as List)
            .map((e) => AdminLens.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching lenses: $e");
    }
    return [];
  }

  static Future<bool> addLens(Map<String, dynamic> data) async {
    try {
      final res = await dio.post(ApiConstants.lenses, data: data);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error adding lens: $e");
      return false;
    }
  }

  static Future<bool> deleteLens(String id) async {
    try {
      final res = await dio.delete("${ApiConstants.lenses}?id=$id");
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error deleting lens: $e");
      return false;
    }
  }

  // ── CATALOG: REFURBISHED ──
  static Future<List<AdminRefurbishedDevice>> fetchRefurbished() async {
    try {
      final res = await dio.get(ApiConstants.refurbished);
      if (res.data != null && res.data['success'] == true && res.data['products'] is List) {
        return (res.data['products'] as List)
            .map((e) => AdminRefurbishedDevice.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching refurbished devices: $e");
    }
    return [];
  }

  static Future<bool> addRefurbished(Map<String, dynamic> data) async {
    try {
      final res = await dio.post(ApiConstants.refurbished, data: data);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error adding refurbished device: $e");
      return false;
    }
  }

  static Future<bool> deleteRefurbished(String id) async {
    try {
      final res = await dio.delete("${ApiConstants.refurbished}?id=$id");
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error deleting refurbished: $e");
      return false;
    }
  }

  // ── LOGISTICS: PINCODES ──
  static Future<List<AdminPincode>> fetchPincodes() async {
    try {
      final res = await dio.get(ApiConstants.pincodes);
      if (res.data != null && res.data['success'] == true && res.data['pincodes'] is List) {
        return (res.data['pincodes'] as List)
            .map((e) => AdminPincode.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching pincodes: $e");
    }
    return [];
  }

  static Future<bool> addPincode(String pincode, String city) async {
    try {
      final res = await dio.post(
        ApiConstants.pincodes,
        data: {'pincode': pincode.trim(), 'city': city.trim()},
      );
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error adding pincode: $e");
      return false;
    }
  }

  static Future<bool> deletePincode(String pincode) async {
    try {
      final res = await dio.delete("${ApiConstants.pincodes}?pincode=$pincode");
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error deleting pincode: $e");
      return false;
    }
  }

  // ── NOTIFICATIONS & BROADCASTS ──
  static Future<List<AdminPushNotification>> fetchNotifications() async {
    try {
      final res = await dio.get(ApiConstants.notifications);
      if (res.data != null && res.data['success'] == true && res.data['notifications'] is List) {
        return (res.data['notifications'] as List)
            .map((e) => AdminPushNotification.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching notifications: $e");
    }
    return [];
  }

  static Future<bool> sendPushNotification({
    required String title,
    required String message,
    String target = 'all',
    String type = 'general',
  }) async {
    try {
      final res = await dio.post(
        ApiConstants.notifications,
        data: {
          'title': title,
          'message': message,
          'body': message,
          'targetRole': target,
          'type': type,
        },
      );
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error sending push notification: $e");
      return false;
    }
  }

  // ── DIAGNOSTIC VALUATION QUESTIONS ──
  static Future<List<AdminCategoryQuestion>> fetchDiagnosticQuestions([String categoryId = 'cat-dslr']) async {
    try {
      final res = await dio.get("${ApiConstants.questions}?categoryId=$categoryId");
      if (res.data != null && res.data['success'] == true && res.data['questions'] is List) {
        return (res.data['questions'] as List)
            .map((e) => AdminCategoryQuestion.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching diagnostic questions: $e");
    }
    return [];
  }

  static Future<bool> createQuestion(Map<String, dynamic> data) async {
    try {
      final res = await dio.post(ApiConstants.questions, data: data);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error creating question: $e");
      return false;
    }
  }

  static Future<bool> updateQuestion(Map<String, dynamic> data) async {
    try {
      final res = await dio.put(ApiConstants.questions, data: data);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error updating question: $e");
      return false;
    }
  }

  static Future<bool> deleteQuestion(String id) async {
    try {
      final res = await dio.delete("${ApiConstants.questions}?id=$id");
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error deleting question: $e");
      return false;
    }
  }

  // ── PAYOUTS ──
  static Future<List<AdminPayout>> fetchPayouts([String status = 'all']) async {
    try {
      final res = await dio.get(ApiConstants.payouts, queryParameters: {'status': status});
      if (res.data != null && res.data['success'] == true && res.data['payouts'] is List) {
        return (res.data['payouts'] as List)
            .map((e) => AdminPayout.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching payouts: $e");
    }
    return [];
  }

  static Future<bool> updatePayout(Map<String, dynamic> data) async {
    try {
      final res = await dio.put(ApiConstants.payouts, data: data);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error updating payout: $e");
      return false;
    }
  }

  // ── COUPONS ──
  static Future<List<AdminCoupon>> fetchCoupons() async {
    try {
      final res = await dio.get(ApiConstants.coupons);
      if (res.data != null && res.data['success'] == true && res.data['coupons'] is List) {
        return (res.data['coupons'] as List)
            .map((e) => AdminCoupon.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching coupons: $e");
    }
    return [];
  }

  static Future<bool> addCoupon(Map<String, dynamic> data) async {
    try {
      final res = await dio.post(ApiConstants.coupons, data: data);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error adding coupon: $e");
      return false;
    }
  }

  static Future<bool> updateCoupon(Map<String, dynamic> data) async {
    try {
      final res = await dio.put(ApiConstants.coupons, data: data);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error updating coupon: $e");
      return false;
    }
  }

  static Future<bool> deleteCoupon(String id) async {
    try {
      final res = await dio.delete("${ApiConstants.coupons}?id=$id");
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error deleting coupon: $e");
      return false;
    }
  }

  // ── SUPPORT TICKETS ──
  static Future<List<AdminSupportTicket>> fetchSupportTickets([String status = 'all']) async {
    try {
      final res = await dio.get(ApiConstants.supportTickets, queryParameters: {'status': status});
      if (res.data != null && res.data['success'] == true && res.data['tickets'] is List) {
        return (res.data['tickets'] as List)
            .map((e) => AdminSupportTicket.fromJson(Map<String, dynamic>.from(e)))
            .toList();
      }
    } catch (e) {
      appLog("Error fetching support tickets: $e");
    }
    return [];
  }

  static Future<bool> updateSupportTicket(Map<String, dynamic> data) async {
    try {
      final res = await dio.put(ApiConstants.supportTickets, data: data);
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error updating support ticket: $e");
      return false;
    }
  }

  static Future<bool> replySupportTicket(String ticketId, String replyMessage) async {
    try {
      final res = await dio.post(ApiConstants.supportTickets, data: {
        'ticketId': ticketId,
        'replyMessage': replyMessage,
        'author': 'Super Admin',
      });
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("Error sending ticket reply: $e");
      return false;
    }
  }
}
