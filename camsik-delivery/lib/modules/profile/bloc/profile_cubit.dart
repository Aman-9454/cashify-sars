import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/session_service.dart';
import '../data/repositories/agent_repository.dart';
import 'profile_state.dart';

class ProfileCubit extends Cubit<ProfileState> {
  final AgentRepository _agentRepository;

  ProfileCubit({AgentRepository? agentRepository})
      : _agentRepository = agentRepository ?? AgentRepositoryImpl(),
        super(const ProfileInitial());

  Future<void> loadProfile() async {
    final localUser = SessionService.currentUser;
    final isOnline = localUser?.status != 'offline';
    emit(ProfileLoaded(user: localUser, isOnline: isOnline));

    if (localUser != null && localUser.id.isNotEmpty) {
      try {
        final freshAgent = await _agentRepository.getProfile(localUser.id);
        if (freshAgent != null) {
          await SessionService.saveSession(freshAgent);
          emit(ProfileLoaded(
            user: freshAgent,
            isOnline: freshAgent.status != 'offline',
          ));
        }
      } catch (_) {}
    }
  }

  Future<void> toggleShiftStatus() async {
    if (state is ProfileLoaded) {
      final current = state as ProfileLoaded;
      final newOnline = !current.isOnline;
      final newStatus = newOnline ? 'online' : 'offline';

      final user = current.user;
      if (user != null) {
        user.status = newStatus;
        await SessionService.saveSession(user);
        await _agentRepository.updateShift(user.id, newStatus);
      }

      emit(current.copyWith(isOnline: newOnline));
    }
  }

  Future<void> logout() async {
    emit(const ProfileLoading());
    await SessionService.clearSession();
    emit(const ProfileLoaded(user: null, isOnline: false));
  }
}
