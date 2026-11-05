import '../../../models/delivery_models.dart';

abstract class TasksState {
  const TasksState();
}

class TasksInitial extends TasksState {
  const TasksInitial();
}

class TasksLoading extends TasksState {
  const TasksLoading();
}

class TasksLoaded extends TasksState {
  final List<DeliveryTask> allTasks;
  final String selectedFilter;
  final String searchQuery;

  const TasksLoaded({
    required this.allTasks,
    this.selectedFilter = 'all',
    this.searchQuery = '',
  });

  List<DeliveryTask> get tasks => allTasks;

  List<DeliveryTask> get filteredTasks {
    final list = allTasks.where((t) {
      if (selectedFilter == 'pickup' && !t.isPickup) {
        return false;
      }
      if (selectedFilter == 'delivery' && t.isPickup) {
        return false;
      }
      if (selectedFilter == 'completed' &&
          t.status != 'completed' &&
          t.status != 'paid') {
        return false;
      }

      final q = searchQuery.toLowerCase();
      return q.isEmpty ||
          t.orderNumber.toLowerCase().contains(q) ||
          t.customerName.toLowerCase().contains(q) ||
          t.deviceName.toLowerCase().contains(q) ||
          t.customerAddress.toLowerCase().contains(q);
    }).toList();

    // 1. Current day Morning (sabse upar)
    // 2. Current day Afternoon (dopahar)
    // 3. Current day Evening (sham)
    // 4. Tomorrow Morning
    // 5. Tomorrow Afternoon
    // 6. Tomorrow Evening
    list.sort((a, b) {
      final rankComp = a.sortRank.compareTo(b.sortRank);
      if (rankComp != 0) return rankComp;
      return b.createdAt.compareTo(a.createdAt);
    });

    return list;
  }

  Map<String, List<DeliveryTask>> get groupedByTimeSection {
    final map = <String, List<DeliveryTask>>{};
    for (final task in filteredTasks) {
      final section = task.timeSectionLabel;
      map.putIfAbsent(section, () => []).add(task);
    }
    return map;
  }

  TasksLoaded copyWith({
    List<DeliveryTask>? allTasks,
    String? selectedFilter,
    String? searchQuery,
  }) {
    return TasksLoaded(
      allTasks: allTasks ?? this.allTasks,
      selectedFilter: selectedFilter ?? this.selectedFilter,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class TasksFailure extends TasksState {
  final String error;

  const TasksFailure(this.error);
}
