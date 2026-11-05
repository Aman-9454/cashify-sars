import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/network_exceptions.dart';
import '../../../../data/repositories/partners_repository.dart';
import '../../../../models/admin_models.dart';
import 'partners_state.dart';

class PartnersCubit extends Cubit<PartnersState> {
  final PartnersRepository _partnersRepository;

  PartnersCubit({PartnersRepository? partnersRepository})
      : _partnersRepository = partnersRepository ?? PartnersRepositoryImpl(),
        super(const PartnersInitial());

  Future<void> loadPartners() async {
    emit(const PartnersLoading());
    try {
      final partners = await _partnersRepository.getPartners();
      emit(PartnersLoaded(allPartners: partners));
    } catch (e) {
      emit(PartnersFailure(NetworkExceptions.getErrorMessage(e)));
    }
  }

  void searchPartners(String query) {
    if (state is PartnersLoaded) {
      final current = state as PartnersLoaded;
      emit(current.copyWith(searchQuery: query.trim()));
    }
  }

  Future<bool> togglePartnerStatus(AdminPartner partner) async {
    final nextStatus = partner.status == 'active' ? 'suspended' : 'active';
    try {
      final ok = await _partnersRepository.updateStatus(
        partnerId: partner.id,
        status: nextStatus,
      );
      if (ok) {
        await loadPartners();
      }
      return ok;
    } catch (_) {
      return false;
    }
  }
}
