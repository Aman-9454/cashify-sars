import '../data/models/responses/models_response.dart';
import '../data/models/responses/questions_response.dart';

abstract class SellState {
  const SellState();
}

class SellInitial extends SellState {
  const SellInitial();
}

class SellLoading extends SellState {
  const SellLoading();
}

class SellModelsLoaded extends SellState {
  final List<DeviceModelData> models;

  const SellModelsLoaded(this.models);
}

class SellQuestionsLoaded extends SellState {
  final List<QuestionModel> questions;

  const SellQuestionsLoaded(this.questions);
}

class SellQuotationCalculated extends SellState {
  final double finalPrice;
  final Map<String, dynamic> breakdown;

  const SellQuotationCalculated({
    required this.finalPrice,
    required this.breakdown,
  });
}

class SellOrderCreatedSuccess extends SellState {
  final Map<String, dynamic> order;

  const SellOrderCreatedSuccess(this.order);
}

class SellFailure extends SellState {
  final String message;

  const SellFailure(this.message);
}
