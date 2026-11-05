import '../../../../models/partner_models.dart';
import '../data/models/payout_transaction_model.dart';

abstract class PayoutsState {
  const PayoutsState();
}

class PayoutsInitial extends PayoutsState {}

class PayoutsLoading extends PayoutsState {}

class PayoutsLoaded extends PayoutsState {
  final double floatBalance;
  final List<PartnerOrder> completedOrders;
  final double totalDisbursed;
  final PartnerWalletData? wallet;
  final List<PayoutTransactionModel> transactions;
  final bool isSubmittingWithdrawal;
  final String? actionMessage;
  final String? actionError;

  const PayoutsLoaded({
    required this.floatBalance,
    required this.completedOrders,
    required this.totalDisbursed,
    this.wallet,
    this.transactions = const [],
    this.isSubmittingWithdrawal = false,
    this.actionMessage,
    this.actionError,
  });

  PayoutsLoaded copyWith({
    double? floatBalance,
    List<PartnerOrder>? completedOrders,
    double? totalDisbursed,
    PartnerWalletData? wallet,
    List<PayoutTransactionModel>? transactions,
    bool? isSubmittingWithdrawal,
    String? actionMessage,
    String? actionError,
    bool clearMessages = false,
  }) {
    return PayoutsLoaded(
      floatBalance: floatBalance ?? this.floatBalance,
      completedOrders: completedOrders ?? this.completedOrders,
      totalDisbursed: totalDisbursed ?? this.totalDisbursed,
      wallet: wallet ?? this.wallet,
      transactions: transactions ?? this.transactions,
      isSubmittingWithdrawal: isSubmittingWithdrawal ?? this.isSubmittingWithdrawal,
      actionMessage: clearMessages ? null : (actionMessage ?? this.actionMessage),
      actionError: clearMessages ? null : (actionError ?? this.actionError),
    );
  }
}

class PayoutsFailure extends PayoutsState {
  final String error;
  const PayoutsFailure(this.error);
}
