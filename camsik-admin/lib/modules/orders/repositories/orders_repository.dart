import '../../../core/constants/api_constants.dart';
import '../../../core/services/api_service.dart';
import '../../../models/admin_models.dart';

abstract class OrdersRepository {
  factory OrdersRepository() => OrdersRepositoryImpl();

  Future<List<AdminOrder>> getOrders({String? search, String? status, String? type});
  Future<bool> updateOrder({
    required String orderId,
    String? status,
    String? notes,
    String? assignedPartnerId,
    String? assignedPartnerName,
    String? assignedRiderId,
    String? assignedRiderName,
  });
}

class OrdersRepositoryImpl implements OrdersRepository {
  final _dio = ApiService.dio;

  @override
  Future<List<AdminOrder>> getOrders({String? search, String? status, String? type}) async {
    final queryParams = <String, dynamic>{};
    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (status != null && status.isNotEmpty && status != 'all') queryParams['status'] = status;
    if (type != null && type.isNotEmpty && type != 'all') queryParams['type'] = type;

    final res = await _dio.get(ApiConstants.orders, queryParameters: queryParams);
    if (res.data != null && res.data['success'] == true && res.data['orders'] is List) {
      return (res.data['orders'] as List)
          .map((e) => AdminOrder.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  @override
  Future<bool> updateOrder({
    required String orderId,
    String? status,
    String? notes,
    String? assignedPartnerId,
    String? assignedPartnerName,
    String? assignedRiderId,
    String? assignedRiderName,
  }) async {
    final data = <String, dynamic>{'orderId': orderId};
    if (status != null) data['status'] = status;
    if (notes != null) data['notes'] = notes;
    if (assignedPartnerId != null) {
      data['partnerId'] = assignedPartnerId;
      data['assignedPartnerId'] = assignedPartnerId;
      data['partnerName'] = assignedPartnerName;
      data['assignedPartnerName'] = assignedPartnerName;
    }
    if (assignedRiderId != null) {
      data['deliveryAgentId'] = assignedRiderId;
      data['assignedRiderId'] = assignedRiderId;
      data['deliveryAgentName'] = assignedRiderName;
      data['assignedRiderName'] = assignedRiderName;
    }

    final res = await _dio.put(ApiConstants.orders, data: data);
    return res.data != null && res.data['success'] == true;
  }
}
