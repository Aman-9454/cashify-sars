import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/session_service.dart';
import '../data/repositories/partner_repository.dart';
import 'profile_state.dart';

class ProfileCubit extends Cubit<ProfileState> {
  final PartnerRepository _partnerRepository;

  ProfileCubit({PartnerRepository? partnerRepository})
      : _partnerRepository = partnerRepository ?? PartnerRepositoryImpl(),
        super(ProfileInitial());

  Future<void> loadProfile() async {
    final localUser = SessionService.currentUser;
    emit(ProfileLoaded(user: localUser));

    if (localUser != null && localUser.id.isNotEmpty) {
      try {
        final freshPartner = await _partnerRepository.fetchPartnerProfile(localUser.id);
        if (freshPartner != null) {
          await SessionService.saveSession(freshPartner);
          emit(ProfileLoaded(user: freshPartner));
        }
      } catch (_) {}
    }
  }

  Future<void> logout() async {
    emit(ProfileLoading());
    await SessionService.clearSession();
    emit(const ProfileLoaded(user: null));
  }
}
