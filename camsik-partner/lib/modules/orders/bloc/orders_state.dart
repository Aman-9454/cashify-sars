import '../../../../models/partner_models.dart';

abstract class OrdersState {
  const OrdersState();
}

class OrdersInitial extends OrdersState {
  const OrdersInitial();
}

class OrdersLoading extends OrdersState {
  const OrdersLoading();
}

class OrdersLoaded extends OrdersState {
  final List<PartnerOrder> allOrders;
  final String selectedStatus;
  final String searchQuery;

  const OrdersLoaded({
    required this.allOrders,
    this.selectedStatus = 'all',
    this.searchQuery = '',
  });

  List<PartnerOrder> get orders => allOrders;


  List<PartnerOrder> get filteredOrders {
    return allOrders.where((o) {
      final matchesStatus = selectedStatus == 'all' || o.status == selectedStatus;
      final q = searchQuery.toLowerCase();
      final matchesSearch = q.isEmpty ||
          o.orderNumber.toLowerCase().contains(q) ||
          o.customerName.toLowerCase().contains(q) ||
          o.deviceName.toLowerCase().contains(q);
      return matchesStatus && matchesSearch;
    }).toList();
  }

  OrdersLoaded copyWith({
    List<PartnerOrder>? allOrders,
    String? selectedStatus,
    String? searchQuery,
  }) {
    return OrdersLoaded(
      allOrders: allOrders ?? this.allOrders,
      selectedStatus: selectedStatus ?? this.selectedStatus,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class OrdersFailure extends OrdersState {
  final String error;

  const OrdersFailure(this.error);
}
