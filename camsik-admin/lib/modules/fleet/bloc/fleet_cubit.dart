import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/network_exceptions.dart';
import '../../../../data/repositories/fleet_repository.dart';
import '../../../../models/admin_models.dart';
import 'fleet_state.dart';

class FleetCubit extends Cubit<FleetState> {
  final FleetRepository _fleetRepository;

  FleetCubit({FleetRepository? fleetRepository})
      : _fleetRepository = fleetRepository ?? FleetRepositoryImpl(),
        super(const FleetInitial());

  Future<void> loadAgents() async {
    emit(const FleetLoading());
    try {
      final agents = await _fleetRepository.getAgents();
      emit(FleetLoaded(allAgents: agents));
    } catch (e) {
      emit(FleetFailure(NetworkExceptions.getErrorMessage(e)));
    }
  }

  void searchAgents(String query) {
    if (state is FleetLoaded) {
      final current = state as FleetLoaded;
      emit(current.copyWith(searchQuery: query.trim()));
    }
  }

  Future<bool> toggleDuty(AdminDeliveryAgent agent) async {
    final nextDuty = agent.dutyStatus == 'online' ? 'offline' : 'online';
    try {
      final ok = await _fleetRepository.updateDutyStatus(
        agentId: agent.id,
        dutyStatus: nextDuty,
      );
      if (ok) {
        await loadAgents();
      }
      return ok;
    } catch (_) {
      return false;
    }
  }
}
