import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/network_exceptions.dart';
import '../../../../data/repositories/overview_repository.dart';
import '../../../../models/admin_models.dart';
import 'overview_state.dart';

class OverviewCubit extends Cubit<OverviewState> {
  final OverviewRepository _overviewRepository;

  OverviewCubit({OverviewRepository? overviewRepository})
      : _overviewRepository = overviewRepository ?? OverviewRepositoryImpl(),
        super(const OverviewInitial());

  Future<void> loadOverview() async {
    emit(const OverviewLoading());
    try {
      final data = await _overviewRepository.getOverview();
      if (data != null && data['success'] == true) {
        final rawStats = data['stats'] as Map<String, dynamic>? ?? {};
        final rawRecent = data['recentOrders'] as List? ?? [];
        final rawWeekly = data['weeklyRevenue'] as List? ?? [];
        final rawCategories = data['topCategories'] as List? ?? [];

        final stats = AdminOverviewStats.fromJson(rawStats);
        final recentOrders = rawRecent
            .map((e) => AdminOrder.fromJson(e as Map<String, dynamic>))
            .toList();

        final weeklyRevenue = rawWeekly
            .map((e) => Map<String, dynamic>.from(e as Map))
            .toList();
        final topCategories = rawCategories
            .map((e) => Map<String, dynamic>.from(e as Map))
            .toList();

        emit(OverviewLoaded(
          stats: stats,
          recentOrders: recentOrders,
          weeklyRevenue: weeklyRevenue,
          topCategories: topCategories,
        ));
        return;
      }

      emit(const OverviewFailure('Unable to load overview analytics.'));
    } catch (e) {
      emit(OverviewFailure(NetworkExceptions.getErrorMessage(e)));
    }
  }
}
