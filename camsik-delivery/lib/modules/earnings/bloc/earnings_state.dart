import '../../../models/delivery_models.dart';

abstract class EarningsState {
  const EarningsState();
}

class EarningsInitial extends EarningsState {
  const EarningsInitial();
}

class EarningsLoading extends EarningsState {
  const EarningsLoading();
}

class EarningsLoaded extends EarningsState {
  final double totalEarnings;
  final List<DeliveryTask> completedTasks;

  const EarningsLoaded({
    required this.totalEarnings,
    required this.completedTasks,
  });
}

class EarningsFailure extends EarningsState {
  final String error;

  const EarningsFailure(this.error);
}
