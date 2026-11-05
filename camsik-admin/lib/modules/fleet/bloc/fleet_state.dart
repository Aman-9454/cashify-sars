import '../../../models/admin_models.dart';

abstract class FleetState {
  const FleetState();
}

class FleetInitial extends FleetState {
  const FleetInitial();
}

class FleetLoading extends FleetState {
  const FleetLoading();
}

class FleetLoaded extends FleetState {
  final List<AdminDeliveryAgent> allAgents;
  final String searchQuery;

  const FleetLoaded({
    required this.allAgents,
    this.searchQuery = '',
  });

  List<AdminDeliveryAgent> get agents => allAgents;

  List<AdminDeliveryAgent> get filteredAgents {
    final q = searchQuery.toLowerCase();
    if (q.isEmpty) return allAgents;
    return allAgents.where((a) {
      return a.name.toLowerCase().contains(q) ||
          a.zone.toLowerCase().contains(q) ||
          a.phone.toLowerCase().contains(q) ||
          a.vehicleType.toLowerCase().contains(q);
    }).toList();
  }

  FleetLoaded copyWith({
    List<AdminDeliveryAgent>? allAgents,
    String? searchQuery,
  }) {
    return FleetLoaded(
      allAgents: allAgents ?? this.allAgents,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class FleetFailure extends FleetState {
  final String error;

  const FleetFailure(this.error);
}
