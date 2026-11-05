import '../../../core/constants/api_constants.dart';
import '../../../core/services/api_service.dart';
import '../../../models/admin_models.dart';

abstract class OperationsRepository {
  factory OperationsRepository() => OperationsRepositoryImpl();

  // Payouts
  Future<List<AdminPayout>> fetchPayouts([String status = 'all']);
  Future<bool> updatePayout(Map<String, dynamic> data);

  // Coupons
  Future<List<AdminCoupon>> fetchCoupons();
  Future<bool> addCoupon(Map<String, dynamic> data);
  Future<bool> updateCoupon(Map<String, dynamic> data);
  Future<bool> deleteCoupon(String id);

  // Support Tickets
  Future<List<AdminSupportTicket>> fetchSupportTickets([String status = 'all']);
  Future<bool> updateSupportTicket(Map<String, dynamic> data);
  Future<bool> replySupportTicket(String ticketId, String replyMessage);

  // Diagnostic Questions
  Future<List<AdminCategoryQuestion>> fetchDiagnosticQuestions([String categoryId = 'cat-dslr']);
  Future<bool> createQuestion(Map<String, dynamic> data);
  Future<bool> updateQuestion(Map<String, dynamic> data);
  Future<bool> deleteQuestion(String id);

  // Pincodes
  Future<List<AdminPincode>> fetchPincodes();
  Future<bool> addPincode(String pincode, String city);
  Future<bool> deletePincode(String pincode);

  // Push Notifications
  Future<List<AdminPushNotification>> fetchNotifications();
  Future<bool> sendPushNotification({
    required String title,
    required String message,
    String target = 'all',
    String type = 'general',
  });
}

class OperationsRepositoryImpl implements OperationsRepository {
  final _dio = ApiService.dio;

  // ── PAYOUTS ──
  @override
  Future<List<AdminPayout>> fetchPayouts([String status = 'all']) async {
    final res = await _dio.get(ApiConstants.payouts, queryParameters: {'status': status});
    if (res.data != null && res.data['success'] == true && res.data['payouts'] is List) {
      return (res.data['payouts'] as List)
          .map((e) => AdminPayout.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> updatePayout(Map<String, dynamic> data) async {
    final res = await _dio.put(ApiConstants.payouts, data: data);
    return res.data != null && res.data['success'] == true;
  }

  // ── COUPONS ──
  @override
  Future<List<AdminCoupon>> fetchCoupons() async {
    final res = await _dio.get(ApiConstants.coupons);
    if (res.data != null && res.data['success'] == true && res.data['coupons'] is List) {
      return (res.data['coupons'] as List)
          .map((e) => AdminCoupon.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> addCoupon(Map<String, dynamic> data) async {
    final res = await _dio.post(ApiConstants.coupons, data: data);
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<bool> updateCoupon(Map<String, dynamic> data) async {
    final res = await _dio.put(ApiConstants.coupons, data: data);
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<bool> deleteCoupon(String id) async {
    final res = await _dio.delete("${ApiConstants.coupons}?id=$id");
    return res.data != null && res.data['success'] == true;
  }

  // ── SUPPORT TICKETS ──
  @override
  Future<List<AdminSupportTicket>> fetchSupportTickets([String status = 'all']) async {
    final res = await _dio.get(ApiConstants.supportTickets, queryParameters: {'status': status});
    if (res.data != null && res.data['success'] == true && res.data['tickets'] is List) {
      return (res.data['tickets'] as List)
          .map((e) => AdminSupportTicket.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> updateSupportTicket(Map<String, dynamic> data) async {
    final res = await _dio.put(ApiConstants.supportTickets, data: data);
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<bool> replySupportTicket(String ticketId, String replyMessage) async {
    final res = await _dio.post(
      "${ApiConstants.supportTickets}/reply",
      data: {
        'ticketId': ticketId,
        'message': replyMessage,
        'sender': 'admin',
      },
    );
    return res.data != null && res.data['success'] == true;
  }

  // ── DIAGNOSTIC QUESTIONS ──
  @override
  Future<List<AdminCategoryQuestion>> fetchDiagnosticQuestions([String categoryId = 'cat-dslr']) async {
    final res = await _dio.get(ApiConstants.questions, queryParameters: {'category': categoryId});
    if (res.data != null && res.data['success'] == true && res.data['questions'] is List) {
      return (res.data['questions'] as List)
          .map((e) => AdminCategoryQuestion.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> createQuestion(Map<String, dynamic> data) async {
    final res = await _dio.post(ApiConstants.questions, data: data);
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<bool> updateQuestion(Map<String, dynamic> data) async {
    final res = await _dio.put(ApiConstants.questions, data: data);
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<bool> deleteQuestion(String id) async {
    final res = await _dio.delete("${ApiConstants.questions}?id=$id");
    return res.data != null && res.data['success'] == true;
  }

  // ── PINCODES ──
  @override
  Future<List<AdminPincode>> fetchPincodes() async {
    final res = await _dio.get(ApiConstants.pincodes);
    if (res.data != null && res.data['success'] == true && res.data['pincodes'] is List) {
      return (res.data['pincodes'] as List)
          .map((e) => AdminPincode.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> addPincode(String pincode, String city) async {
    final res = await _dio.post(
      ApiConstants.pincodes,
      data: {'pincode': pincode, 'city': city},
    );
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<bool> deletePincode(String pincode) async {
    final res = await _dio.delete("${ApiConstants.pincodes}?pincode=$pincode");
    return res.data != null && res.data['success'] == true;
  }

  // ── PUSH NOTIFICATIONS ──
  @override
  Future<List<AdminPushNotification>> fetchNotifications() async {
    final res = await _dio.get(ApiConstants.notifications);
    if (res.data != null && res.data['success'] == true && res.data['notifications'] is List) {
      return (res.data['notifications'] as List)
          .map((e) => AdminPushNotification.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> sendPushNotification({
    required String title,
    required String message,
    String target = 'all',
    String type = 'general',
  }) async {
    final res = await _dio.post(
      ApiConstants.notifications,
      data: {
        'title': title,
        'message': message,
        'target': target,
        'type': type,
      },
    );
    return res.data != null && res.data['success'] == true;
  }
}
