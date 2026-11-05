import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/network_exceptions.dart';
import '../../../../core/services/session_service.dart';
import '../data/repositories/orders_repository.dart';
import 'orders_state.dart';

class OrdersCubit extends Cubit<OrdersState> {
  final OrdersRepository _ordersRepository;

  OrdersCubit({OrdersRepository? ordersRepository})
      : _ordersRepository = ordersRepository ?? OrdersRepositoryImpl(),
        super(const OrdersInitial());

  Future<void> loadOrders({String? partnerId}) async {
    emit(const OrdersLoading());
    try {
      final pid = partnerId ?? SessionService.currentUser?.id;
      final orders = await _ordersRepository.fetchOrders(partnerId: pid);
      emit(OrdersLoaded(allOrders: orders));
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

  void searchOrders(String query) {
    if (state is OrdersLoaded) {
      final current = state as OrdersLoaded;
      emit(current.copyWith(searchQuery: query.trim()));
    }
  }

  Future<bool> updateOrderStatus({
    required String orderId,
    required String status,
    double? finalPrice,
    int? inspectionScore,
    String? notes,
  }) async {
    try {
      final success = await _ordersRepository.updateOrder(
        orderId: orderId,
        status: status,
        finalPrice: finalPrice,
        inspectionScore: inspectionScore,
        notes: notes,
      );

      if (success && state is OrdersLoaded) {
        final current = state as OrdersLoaded;
        final updatedList = current.allOrders.map((o) {
          if (o.id == orderId) {
            o.status = status;
            if (finalPrice != null) o.finalPrice = finalPrice;
            if (inspectionScore != null) o.inspectionScore = inspectionScore;
          }
          return o;
        }).toList();
        emit(current.copyWith(allOrders: updatedList));
      }
      return success;
    } catch (_) {
      return false;
    }
  }
}
