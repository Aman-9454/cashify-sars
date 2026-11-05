import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/extensions/order_extensions.dart';
import '../../../../core/services/session_service.dart';
import '../../../../models/partner_models.dart';
import '../../orders/data/repositories/orders_repository.dart';
import '../../profile/data/repositories/partner_repository.dart';
import '../data/repositories/payouts_repository.dart';
import 'payouts_state.dart';

class PayoutsCubit extends Cubit<PayoutsState> {
  final OrdersRepository _ordersRepository;
  final PartnerRepository _partnerRepository;
  final PayoutsRepository _payoutsRepository;

  PayoutsCubit({
    OrdersRepository? ordersRepository,
    PartnerRepository? partnerRepository,
    PayoutsRepository? payoutsRepository,
  })  : _ordersRepository = ordersRepository ?? OrdersRepositoryImpl(),
        _partnerRepository = partnerRepository ?? PartnerRepositoryImpl(),
        _payoutsRepository = payoutsRepository ?? PayoutsRepositoryImpl(),
        super(PayoutsInitial());

  Future<void> loadPayouts({List<PartnerOrder>? existingOrders}) async {
    emit(PayoutsLoading());
    try {
      final user = SessionService.currentUser;
      final partnerId = user?.id ?? '';
      if (partnerId.isEmpty) {
        emit(PayoutsLoaded(
          floatBalance: 0.0,
          completedOrders: [],
          totalDisbursed: 0.0,
          wallet: null,
          transactions: [],
        ));
        return;
      }

      // 1. Fetch live wallet & payouts data from API
      final walletData = await _payoutsRepository.fetchWalletData(partnerId);

      // 2. Fetch or reuse orders
      List<PartnerOrder> allOrders;
      if (existingOrders != null) {
        allOrders = existingOrders;
      } else {
        allOrders = await _ordersRepository.fetchOrders(partnerId: partnerId);
      }

      final completedOrders = allOrders.filterCompleted();
      final totalDisbursed =
          completedOrders.fold<double>(0.0, (s, o) => s + o.finalPrice);

      double floatBalance = walletData?.availableBalance ??
          (user?.availableBalance != null && user!.availableBalance > 0
              ? user.availableBalance
              : 0.0);

      // Refresh user profile if available
      final fresh = await _partnerRepository.fetchPartnerProfile(partnerId);
      if (fresh != null) {
        await SessionService.saveSession(fresh);
      }

      emit(PayoutsLoaded(
        floatBalance: floatBalance,
        completedOrders: completedOrders,
        totalDisbursed: totalDisbursed,
        wallet: walletData,
        transactions: walletData?.transactions ?? [],
      ));
    } catch (e) {
      emit(PayoutsFailure(e.toString()));
    }
  }

  Future<bool> requestWithdrawal(
    double amount, {
    String? bankName,
    String? accountNumber,
    String? ifscCode,
  }) async {
    final current = state;
    if (current is! PayoutsLoaded) return false;

    emit(current.copyWith(isSubmittingWithdrawal: true, clearMessages: true));
    try {
      final user = SessionService.currentUser;
      final partnerId = user?.id ?? '';
      if (partnerId.isEmpty) return false;

      final res = await _payoutsRepository.requestWithdrawal(
        partnerId: partnerId,
        amount: amount,
        bankName: bankName,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
      );

      if (res['success'] == true) {
        // Refetch fresh wallet from API
        final refreshedWallet = await _payoutsRepository.fetchWalletData(partnerId);
        final newFloat = refreshedWallet?.availableBalance ??
            (current.floatBalance - amount > 0 ? current.floatBalance - amount : 0.0);

        emit(current.copyWith(
          isSubmittingWithdrawal: false,
          floatBalance: newFloat,
          wallet: refreshedWallet ?? current.wallet,
          transactions: refreshedWallet?.transactions ?? current.transactions,
          actionMessage: res['message']?.toString() ?? 'Withdrawal requested successfully',
        ));
        return true;
      } else {
        emit(current.copyWith(
          isSubmittingWithdrawal: false,
          actionError: res['message']?.toString() ?? 'Withdrawal failed. Please try again.',
        ));
        return false;
      }
    } catch (e) {
      emit(current.copyWith(
        isSubmittingWithdrawal: false,
        actionError: e.toString(),
      ));
      return false;
    }
  }

  Future<bool> addFunds(double amount, {String? method}) async {
    final current = state;
    if (current is! PayoutsLoaded) return false;

    emit(current.copyWith(isSubmittingWithdrawal: true, clearMessages: true));
    try {
      final user = SessionService.currentUser;
      final partnerId = user?.id ?? '';
      if (partnerId.isEmpty) return false;

      final res = await _payoutsRepository.addFunds(
        partnerId: partnerId,
        amount: amount,
        method: method,
      );

      if (res['success'] == true) {
        final refreshedWallet = await _payoutsRepository.fetchWalletData(partnerId);
        final newFloat = refreshedWallet?.availableBalance ?? (current.floatBalance + amount);

        if (user != null) {
          user.availableBalance = newFloat;
          await SessionService.saveSession(user);
        }

        emit(current.copyWith(
          isSubmittingWithdrawal: false,
          floatBalance: newFloat,
          wallet: refreshedWallet ?? current.wallet,
          transactions: refreshedWallet?.transactions ?? current.transactions,
          actionMessage: res['message']?.toString() ?? 'Funds added to payout wallet successfully!',
        ));
        return true;
      } else {
        emit(current.copyWith(
          isSubmittingWithdrawal: false,
          actionError: res['message']?.toString() ?? 'Failed to add funds.',
        ));
        return false;
      }
    } catch (e) {
      emit(current.copyWith(
        isSubmittingWithdrawal: false,
        actionError: e.toString(),
      ));
      return false;
    }
  }

  void updateWithOrders(List<PartnerOrder> allOrders) {
    final current = state;
    final user = SessionService.currentUser;
    final floatBalance = current is PayoutsLoaded
        ? current.floatBalance
        : (user?.availableBalance ?? 0.0);
    final completedOrders = allOrders.filterCompleted();
    final totalDisbursed =
        completedOrders.fold<double>(0.0, (s, o) => s + o.finalPrice);

    if (current is PayoutsLoaded) {
      emit(current.copyWith(
        completedOrders: completedOrders,
        totalDisbursed: totalDisbursed,
      ));
    } else {
      emit(PayoutsLoaded(
        floatBalance: floatBalance,
        completedOrders: completedOrders,
        totalDisbursed: totalDisbursed,
      ));
    }
  }
}
