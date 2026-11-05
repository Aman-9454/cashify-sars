import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/session_service.dart';
import 'profile_state.dart';

class ProfileCubit extends Cubit<ProfileState> {
  ProfileCubit() : super(const ProfileInitial());

  Future<void> loadProfile() async {
    final user = SessionService.currentUser;
    emit(ProfileLoaded(user: user));
  }

  Future<void> logout() async {
    emit(const ProfileLoading());
    await SessionService.clearSession();
    emit(const ProfileLoaded(user: null));
  }
}
