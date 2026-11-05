import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/fallback/fallback_models.dart';
import '../../../data/fallback/fallback_questions.dart';
import '../../orders/bloc/orders_cubit.dart';
import '../../orders/data/models/requests/create_order_request.dart';
import '../../orders/data/repositories/orders_repository.dart';
import '../data/models/requests/fetch_models_request.dart';
import '../data/models/requests/fetch_questions_request.dart';
import '../data/models/responses/models_response.dart';
import '../data/models/responses/questions_response.dart';
import '../data/repositories/sell_repository.dart';
import 'sell_state.dart';

class SellCubit extends Cubit<SellState> {
  final SellRepository _sellRepository;
  final OrdersRepository _ordersRepository;

  SellCubit({
    SellRepository? sellRepository,
    OrdersRepository? ordersRepository,
  })  : _sellRepository = sellRepository ?? SellRepositoryImpl(),
        _ordersRepository = ordersRepository ?? OrdersRepositoryImpl(),
        super(const SellInitial());

  Future<void> fetchModels({String? categoryId, String? search}) async {
    emit(const SellLoading());
    try {
      final response = await _sellRepository.fetchModels(
        FetchModelsRequest(categoryId: categoryId, search: search),
      );
      if (response.statusCode == 200 && response.data != null) {
        final res = ModelsResponse.fromJson(Map<String, dynamic>.from(response.data as Map));
        if (res.models.isNotEmpty) {
          emit(SellModelsLoaded(res.models));
          return;
        }
      }
    } catch (_) {}

    // Fallback sync models
    final fallback = FallbackModels.getModels(categoryId: categoryId, search: search);
    final models = fallback.map((m) => DeviceModelData.fromJson(m)).toList();
    emit(SellModelsLoaded(models));
  }

  Future<void> fetchQuestions({required String categoryId}) async {
    emit(const SellLoading());
    try {
      final response = await _sellRepository.fetchQuestions(
        FetchQuestionsRequest(categoryId: categoryId),
      );
      if (response.statusCode == 200 && response.data != null) {
        final res = QuestionsResponse.fromJson(Map<String, dynamic>.from(response.data as Map));
        if (res.questions.isNotEmpty) {
          emit(SellQuestionsLoaded(res.questions));
          return;
        }
      }
    } catch (_) {}

    // Fallback sync questions
    final fallback = FallbackQuestions.getQuestions(categoryId);
    final questions = fallback.map((q) => QuestionModel.fromJson(q)).toList();
    emit(SellQuestionsLoaded(questions));
  }

  void calculateQuote({
    required double basePrice,
    required Map<String, dynamic> selectedAnswers,
  }) {
    double finalPrice = basePrice;
    selectedAnswers.forEach((key, val) {
      if (val is num) {
        finalPrice -= val.toDouble();
      }
    });
    if (finalPrice < 500) finalPrice = 500;

    emit(SellQuotationCalculated(
      finalPrice: finalPrice,
      breakdown: {
        'basePrice': basePrice,
        'deductions': basePrice - finalPrice,
        'finalPrice': finalPrice,
      },
    ));
  }

  Future<Map<String, dynamic>?> placeSellOrder(CreateOrderRequest request) async {
    emit(const SellLoading());
    try {
      final response = await _ordersRepository.createOrder(request);
      if (response.statusCode == 200 && response.data != null && response.data['order'] != null) {
        final orderMap = Map<String, dynamic>.from(response.data['order'] as Map);
        emit(SellOrderCreatedSuccess(orderMap));
        return orderMap;
      }
    } catch (_) {}

    // Fallback offline order generation handled in BLoC
    final order = OrdersCubit.generateFallbackOrder(request.toJson());
    emit(SellOrderCreatedSuccess(order));
    return order;
  }
}
