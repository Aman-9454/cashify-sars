import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/network_exceptions.dart';
import '../../../../core/services/session_service.dart';
import '../../../../data/repositories/tasks_repository.dart';
import 'earnings_state.dart';

class EarningsCubit extends Cubit<EarningsState> {
  final TasksRepository _tasksRepository;

  EarningsCubit({TasksRepository? tasksRepository})
      : _tasksRepository = tasksRepository ?? TasksRepositoryImpl(),
        super(const EarningsInitial());

  Future<void> loadEarnings({String? deliveryAgentId}) async {
    emit(const EarningsLoading());
    try {
      final agentId = deliveryAgentId ?? SessionService.currentUser?.id;
      final allTasks = await _tasksRepository.getTasks(deliveryAgentId: agentId);
      final completed = allTasks
          .where((t) => t.status == 'completed' || t.status == 'paid')
          .toList();
      final total = completed.length * 250.0;
      emit(EarningsLoaded(totalEarnings: total, completedTasks: completed));
    } catch (e) {
      emit(EarningsFailure(NetworkExceptions.getErrorMessage(e)));
    }
  }
}
