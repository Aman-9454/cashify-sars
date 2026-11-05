import '../../../models/admin_models.dart';

abstract class OverviewState {
  const OverviewState();
}

class OverviewInitial extends OverviewState {
  const OverviewInitial();
}

class OverviewLoading extends OverviewState {
  const OverviewLoading();
}

class OverviewLoaded extends OverviewState {
  final AdminOverviewStats stats;
  final List<AdminOrder> recentOrders;
  final List<Map<String, dynamic>> weeklyRevenue;
  final List<Map<String, dynamic>> topCategories;

  const OverviewLoaded({
    required this.stats,
    required this.recentOrders,
    this.weeklyRevenue = const [],
    this.topCategories = const [],
  });
}

class OverviewFailure extends OverviewState {
  final String error;

  const OverviewFailure(this.error);
}
