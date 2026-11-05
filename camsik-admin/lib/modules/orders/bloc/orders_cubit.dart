import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/network_exceptions.dart';
import '../../../../data/repositories/fleet_repository.dart';
import '../../../../data/repositories/orders_repository.dart';
import '../../../../data/repositories/partners_repository.dart';
import 'orders_state.dart';

class OrdersCubit extends Cubit<OrdersState> {
  final OrdersRepository _ordersRepository;
  final PartnersRepository _partnersRepository;
  final FleetRepository _fleetRepository;

  OrdersCubit({
    OrdersRepository? ordersRepository,
    PartnersRepository? partnersRepository,
    FleetRepository? fleetRepository,
  })  : _ordersRepository = ordersRepository ?? OrdersRepositoryImpl(),
        _partnersRepository = partnersRepository ?? PartnersRepositoryImpl(),
        _fleetRepository = fleetRepository ?? FleetRepositoryImpl(),
        super(const OrdersInitial());

  Future<void> loadOrders() async {
    emit(const OrdersLoading());
    try {
      final orders = await _ordersRepository.getOrders();
      final partners = await _partnersRepository.getPartners();
      final agents = await _fleetRepository.getAgents();

      emit(OrdersLoaded(
        allOrders: orders,
        partners: partners,
        agents: agents,
      ));
    } catch (e) {
      emit(OrdersFailure(NetworkExceptions.getErrorMessage(e)));
    }
  }

  void filterByStatus(String status) {
    if (state is OrdersLoaded) {
      final current = state as OrdersLoaded;
      emit(current.copyWith(selectedStatus: status));
    }
  }

  void filterByType(String type) {
    if (state is OrdersLoaded) {
      final current = state as OrdersLoaded;
      emit(current.copyWith(selectedType: type));
    }
  }

  void searchOrders(String query) {
    if (state is OrdersLoaded) {
      final current = state as OrdersLoaded;
      emit(current.copyWith(searchQuery: query.trim()));
    }
  }

  Future<bool> updateOrder({
    required String orderId,
    String? status,
    String? notes,
    String? assignedPartnerId,
    String? assignedPartnerName,
    String? assignedRiderId,
    String? assignedRiderName,
  }) async {
    try {
      final success = await _ordersRepository.updateOrder(
        orderId: orderId,
        status: status,
        notes: notes,
        assignedPartnerId: assignedPartnerId,
        assignedPartnerName: assignedPartnerName,
        assignedRiderId: assignedRiderId,
        assignedRiderName: assignedRiderName,
      );

      if (success) {
        await loadOrders();
      }
      return success;
    } catch (_) {
      return false;
    }
  }
}
