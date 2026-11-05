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
  final List<Map<String, dynamic>> orders;

  const OrdersLoaded(this.orders);
}

class OrderCreateSuccess extends OrdersState {
  final Map<String, dynamic> order;

  const OrderCreateSuccess(this.order);
}

class OrdersFailure extends OrdersState {
  final String message;

  const OrdersFailure(this.message);
}
