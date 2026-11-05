import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';
import '../../../../models/partner_models.dart';

abstract class OrdersRepository {
  Future<List<PartnerOrder>> fetchOrders({
    String? partnerId,
    String? status,
    String? type,
    String? search,
  });

  Future<bool> updateOrder({
    required String orderId,
    required String status,
    double? finalPrice,
    int? inspectionScore,
    String? notes,
  });

  Future<Response> fetchOrderMessages(String orderId);
  Future<Response> sendOrderMessage(Map<String, dynamic> data);
}

class OrdersRepositoryImpl implements OrdersRepository {
  final Dio _dio;

  OrdersRepositoryImpl({Dio? dio}) : _dio = dio ?? ApiService.dio;

  @override
  Future<List<PartnerOrder>> fetchOrders({
    String? partnerId,
    String? status,
    String? type,
    String? search,
  }) async {
    final queryParams = <String, dynamic>{};
    if (partnerId != null && partnerId.isNotEmpty) queryParams['partnerId'] = partnerId;
    if (status != null && status.isNotEmpty && status != 'all') queryParams['status'] = status;
    if (type != null && type.isNotEmpty && type != 'all') queryParams['type'] = type;
    if (search != null && search.isNotEmpty) queryParams['search'] = search;

    final res = await _dio.get(ApiConstants.orders, queryParameters: queryParams);
    if (res.data != null && res.data['success'] == true && res.data['orders'] is List) {
      return (res.data['orders'] as List)
          .map((item) => PartnerOrder.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> updateOrder({
    required String orderId,
    required String status,
    double? finalPrice,
    int? inspectionScore,
    String? notes,
  }) async {
    final payload = <String, dynamic>{
      'orderId': orderId,
      'status': status,
    };
    if (finalPrice != null) payload['finalPrice'] = finalPrice;
    if (inspectionScore != null) payload['inspectionScore'] = inspectionScore;
    if (notes != null) payload['notes'] = notes;

    final res = await _dio.patch(ApiConstants.orders, data: payload);
    return res.data != null && res.data['success'] == true;
  }

  @override
  Future<Response> fetchOrderMessages(String orderId) {
    return _dio.get(ApiConstants.orderMessages, queryParameters: {'orderId': orderId});
  }

  @override
  Future<Response> sendOrderMessage(Map<String, dynamic> data) {
    return _dio.post(ApiConstants.orderMessages, data: data);
  }
}
