import '../../core/services/api_service.dart';
import '../../models/delivery_models.dart';

abstract class TasksRepository {
  Future<List<DeliveryTask>> getTasks({
    String? deliveryAgentId,
    String? status,
    String? search,
  });

  Future<bool> updateStatus({
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
  });

  Future<List<dynamic>> getMessages(String orderId);

  Future<bool> sendMessage(String orderId, String message);
}

class TasksRepositoryImpl implements TasksRepository {
  @override
  Future<List<DeliveryTask>> getTasks({
    String? deliveryAgentId,
    String? status,
    String? search,
  }) {
    return ApiService.fetchTasks(
      deliveryAgentId: deliveryAgentId,
      status: status,
      search: search,
    );
  }

  @override
  Future<bool> updateStatus({
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
  }) {
    return ApiService.updateTaskStatus(
      orderId: orderId,
      status: status,
      otp: otp,
      finalPrice: finalPrice,
      inspectionScore: inspectionScore,
      deviceImei: deviceImei,
      deviceCollected: deviceCollected,
      paymentStatus: paymentStatus,
      payoutMethod: payoutMethod,
      payoutReferenceId: payoutReferenceId,
      notes: notes,
      pickupDate: pickupDate,
    );
  }

  @override
  Future<List<dynamic>> getMessages(String orderId) {
    return ApiService.fetchOrderMessages(orderId);
  }

  @override
  Future<bool> sendMessage(String orderId, String message) {
    return ApiService.sendOrderMessage(orderId, message);
  }
}
