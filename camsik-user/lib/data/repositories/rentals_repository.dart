import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';
import '../../core/services/api_service.dart';
import '../../modules/rent/data/models/requests/fetch_rentals_request.dart';

abstract class RentalsRepository {
  Future<Response> getRentals(FetchRentalsRequest request);
}

class RentalsRepositoryImpl implements RentalsRepository {
  final Dio _dio;

  RentalsRepositoryImpl({Dio? dio}) : _dio = dio ?? ApiService.dio;

  @override
  Future<Response> getRentals(FetchRentalsRequest request) {
    return _dio.get(
      ApiConstants.rentals,
      queryParameters: request.toQueryParameters(),
    );
  }
}
