import '../../../models/admin_models.dart';

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
  final List<AdminOrder> allOrders;
  final List<AdminPartner> partners;
  final List<AdminDeliveryAgent> agents;
  final String selectedStatus;
  final String selectedType;
  final String searchQuery;

  const OrdersLoaded({
    required this.allOrders,
    this.partners = const [],
    this.agents = const [],
    this.selectedStatus = 'all',
    this.selectedType = 'all',
    this.searchQuery = '',
  });

  List<AdminOrder> get orders => allOrders;

  List<AdminOrder> get filteredOrders {
    return allOrders.where((o) {
      final matchesStatus = selectedStatus == 'all' || o.status == selectedStatus;
      final matchesType = selectedType == 'all' || o.type == selectedType;
      final q = searchQuery.toLowerCase();
      final matchesSearch = q.isEmpty ||
          o.id.toLowerCase().contains(q) ||
          o.customerName.toLowerCase().contains(q) ||
          o.customerPhone.toLowerCase().contains(q) ||
          o.deviceModel.toLowerCase().contains(q) ||
          o.pickupCity.toLowerCase().contains(q);
      return matchesStatus && matchesType && matchesSearch;
    }).toList();
  }

  OrdersLoaded copyWith({
    List<AdminOrder>? allOrders,
    List<AdminPartner>? partners,
    List<AdminDeliveryAgent>? agents,
    String? selectedStatus,
    String? selectedType,
    String? searchQuery,
  }) {
    return OrdersLoaded(
      allOrders: allOrders ?? this.allOrders,
      partners: partners ?? this.partners,
      agents: agents ?? this.agents,
      selectedStatus: selectedStatus ?? this.selectedStatus,
      selectedType: selectedType ?? this.selectedType,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class OrdersFailure extends OrdersState {
  final String error;

  const OrdersFailure(this.error);
}
