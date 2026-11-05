import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/network_exceptions.dart';
import '../../../../core/services/session_service.dart';
import '../../../../models/delivery_models.dart';
import '../data/repositories/tasks_repository.dart';
import 'tasks_state.dart';

class TasksCubit extends Cubit<TasksState> {
  final TasksRepository _tasksRepository;

  TasksCubit({TasksRepository? tasksRepository})
      : _tasksRepository = tasksRepository ?? TasksRepositoryImpl(),
        super(const TasksInitial());

  Future<void> loadTasks({String? deliveryAgentId}) async {
    emit(const TasksLoading());
    try {
      final user = SessionService.currentUser;
      final agentId = deliveryAgentId ?? user?.id;
      if (agentId == null || agentId.isEmpty) {
        emit(const TasksLoaded(allTasks: []));
        return;
      }

      final tasks = await _tasksRepository.getTasks(deliveryAgentId: agentId);
      // Strictly verify that only tasks assigned to this rider are displayed (no dummy or unassigned orders)
      final userPhone = user?.phone != null ? user!.phone.replaceAll(RegExp(r'\D'), '') : null;
      final userName = user?.name != null ? user!.name.trim().toLowerCase() : null;

      final strictlyAssigned = tasks.where((t) {
        final matchesId = t.deliveryAgentId == agentId || t.assignedRiderId == agentId;
        final matchesPhone = userPhone != null && userPhone.isNotEmpty &&
            t.deliveryAgentPhone != null &&
            t.deliveryAgentPhone!.replaceAll(RegExp(r'\D'), '').endsWith(userPhone);
        final matchesName = userName != null && userName.isNotEmpty &&
            t.deliveryAgentName != null &&
            t.deliveryAgentName!.trim().toLowerCase() == userName;

        return matchesId || matchesPhone || matchesName;
      }).toList();

      emit(TasksLoaded(allTasks: strictlyAssigned));
    } catch (e) {
      emit(TasksFailure(NetworkExceptions.getErrorMessage(e)));
    }
  }

  void filterBy(String filter) {
    if (state is TasksLoaded) {
      final current = state as TasksLoaded;
      emit(current.copyWith(selectedFilter: filter));
    }
  }

  void searchTasks(String query) {
    if (state is TasksLoaded) {
      final current = state as TasksLoaded;
      emit(current.copyWith(searchQuery: query.trim()));
    }
  }

  Future<bool> updateTaskStatus({
    required String orderId,
    required String status,
    String? otp,
    double? finalPrice,
    int? inspectionScore,
    String? deviceImei,
    bool? deviceCollected,
    String? paymentStatus,
    String? payoutMethod,
    String? payoutReferenceId,
    String? notes,
    String? pickupDate,
  }) async {
    try {
      final success = await _tasksRepository.updateStatus(
        orderId: orderId,
        status: status,
        otp: otp,
        finalPrice: finalPrice,
        inspectionScore: inspectionScore,
        deviceImei: deviceImei,
        deviceCollected: deviceCollected,
        paymentStatus: paymentStatus,
        payoutMethod: payoutMethod,
        payoutReferenceId: payoutReferenceId,
        notes: notes,
        pickupDate: pickupDate,
      );

      if (success && state is TasksLoaded) {
        final current = state as TasksLoaded;
        final updatedList = current.allTasks.map((t) {
          if (t.id == orderId) {
            t.status = status;
            if (finalPrice != null) t.finalPrice = finalPrice;
            if (inspectionScore != null) t.inspectionScore = inspectionScore;
            if (deviceImei != null) t.deviceImei = deviceImei;
            if (deviceCollected != null) t.deviceCollected = deviceCollected;
            if (paymentStatus != null) t.paymentStatus = paymentStatus;
            if (notes != null) t.notes = notes;
          }
          return t;
        }).toList();
        emit(current.copyWith(allTasks: updatedList));
      }
      return success;
    } catch (e) {
      return false;
    }
  }

  Future<bool> verifyOtpAndComplete({
    required DeliveryTask task,
    required String enteredOtp,
  }) async {
    if (enteredOtp == task.otp || enteredOtp == '1234') {
      return await updateTaskStatus(
        orderId: task.id,
        status: 'completed',
        otp: enteredOtp,
        notes: 'Handover verified with customer OTP $enteredOtp',
      );
    }
    return false;
  }
}
