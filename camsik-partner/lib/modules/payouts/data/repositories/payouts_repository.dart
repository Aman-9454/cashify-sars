import 'package:dio/dio.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/services/api_service.dart';
import '../models/payout_transaction_model.dart';

abstract class PayoutsRepository {
  Future<PartnerWalletData?> fetchWalletData(String partnerId);
  Future<Map<String, dynamic>> requestWithdrawal({
    required String partnerId,
    required double amount,
    String? notes,
    String? bankName,
    String? accountNumber,
    String? ifscCode,
  });
  Future<Map<String, dynamic>> addFunds({
    required String partnerId,
    required double amount,
    String? method,
  });
}

class PayoutsRepositoryImpl implements PayoutsRepository {
  final Dio _dio;

  PayoutsRepositoryImpl({Dio? dio}) : _dio = dio ?? ApiService.dio;

  @override
  Future<PartnerWalletData?> fetchWalletData(String partnerId) async {
    try {
      final res = await _dio.get(
        ApiConstants.partnerPayouts,
        queryParameters: {'partnerId': partnerId},
      );
      if (res.data != null && res.data['success'] == true) {
        return PartnerWalletData.fromJson(Map<String, dynamic>.from(res.data));
      }
    } catch (_) {}
    return null;
  }

  @override
  Future<Map<String, dynamic>> requestWithdrawal({
    required String partnerId,
    required double amount,
    String? notes,
    String? bankName,
    String? accountNumber,
    String? ifscCode,
  }) async {
    try {
      final payload = <String, dynamic>{
        'partnerId': partnerId,
        'amount': amount,
        'type': 'withdrawal',
        'action': 'withdraw',
        'notes': notes ?? 'Float withdrawal to verified merchant account',
        'method': 'bank_transfer',
      };
      if (bankName != null) payload['bankName'] = bankName;
      if (accountNumber != null) payload['accountNumber'] = accountNumber;
      if (ifscCode != null) payload['ifscCode'] = ifscCode;

      final res = await _dio.post(
        ApiConstants.partnerPayouts,
        data: payload,
      );

      if (res.data != null && res.data['success'] == true) {
        return {
          'success': true,
          'message': res.data['message'] ?? 'Withdrawal successful',
          'payout': res.data['payout'],
          'wallet': res.data['wallet'],
        };
      }
      return {
        'success': false,
        'message': res.data?['message'] ?? 'Withdrawal request failed',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Failed to process withdrawal. Please try again.',
      };
    }
  }

  @override
  Future<Map<String, dynamic>> addFunds({
    required String partnerId,
    required double amount,
    String? method,
  }) async {
    try {
      final payload = <String, dynamic>{
        'partnerId': partnerId,
        'amount': amount,
        'type': 'float_topup',
        'action': 'topup',
        'method': method ?? 'instant_upi',
        'notes': 'Wallet float top-up via ${method ?? "Instant UPI"}',
      };

      final res = await _dio.post(
        ApiConstants.partnerPayouts,
        data: payload,
      );

      if (res.data != null && res.data['success'] == true) {
        return {
          'success': true,
          'message': res.data['message'] ?? 'Funds added successfully',
          'payout': res.data['payout'],
          'wallet': res.data['wallet'],
        };
      }
      return {
        'success': false,
        'message': res.data?['message'] ?? 'Failed to add funds',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Failed to add funds. Please check connection.',
      };
    }
  }
}
