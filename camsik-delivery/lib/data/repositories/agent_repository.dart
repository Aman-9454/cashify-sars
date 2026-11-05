import '../../core/services/api_service.dart';
import '../../models/delivery_models.dart';

abstract class AgentRepository {
  Future<DeliveryAgentUser?> getProfile(String agentId);
  Future<bool> updateShift(String agentId, String status);
  Future<Map<String, dynamic>> login(String identifier, String password);
}

class AgentRepositoryImpl implements AgentRepository {
  @override
  Future<DeliveryAgentUser?> getProfile(String agentId) {
    return ApiService.fetchAgentProfile(agentId);
  }

  @override
  Future<bool> updateShift(String agentId, String status) {
    return ApiService.updateAgentShift(agentId, status);
  }

  @override
  Future<Map<String, dynamic>> login(String identifier, String password) {
    return ApiService.login(identifier, password);
  }
}
