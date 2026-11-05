import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/network_exceptions.dart';
import '../../../../core/services/session_service.dart';
import '../../../../models/partner_models.dart';
import '../data/models/requests/partner_login_request.dart';
import '../data/models/requests/partner_register_request.dart';
import '../data/repositories/auth_repository.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  final AuthRepository _authRepository;

  AuthCubit({AuthRepository? authRepository})
      : _authRepository = authRepository ?? AuthRepositoryImpl(),
        super(const AuthInitial());

  Future<void> login({
    required String identifier,
    required String password,
  }) async {
    final cleanId = identifier.trim();
    final cleanPass = password.trim();

    if (cleanId.isEmpty) {
      emit(const AuthFailure('Please enter your partner email or phone number.'));
      return;
    }

    if (cleanPass.isEmpty) {
      emit(const AuthFailure('Please enter your password.'));
      return;
    }

    emit(const AuthLoading());

    try {
      final response = await _authRepository.login(
        PartnerLoginRequest(
          identifier: cleanId,
          password: cleanPass,
        ),
      );

      final data = response.data;
      if (data != null && data['success'] == true) {
        final partnerJson = data['partner'] ?? data['user'];
        if (partnerJson != null) {
          final partner = PartnerUser.fromJson(Map<String, dynamic>.from(partnerJson));
          await SessionService.saveSession(partner);
          emit(AuthSuccess(
            partner: partner,
            message: data['message']?.toString() ?? 'Logged in successfully',
          ));
          return;
        }
      }

      if (data != null && data['status'] == 'pending') {
        final partnerJson = data['partner'] is Map
            ? Map<String, dynamic>.from(data['partner'] as Map)
            : <String, dynamic>{'phone': cleanId};
        emit(AuthPendingApproval(
          data['message']?.toString() ??
              'Your partner application is pending Super Admin approval.',
          partnerData: partnerJson,
        ));
        return;
      }

      final errMsg = data?['message']?.toString() ??
          'Login failed. Please verify partner credentials.';
      emit(AuthFailure(errMsg));
    } catch (e) {
      if (e is DioException && e.response?.data is Map) {
        final resData = e.response?.data as Map;
        if (resData['status'] == 'pending') {
          final partnerJson = resData['partner'] is Map
              ? Map<String, dynamic>.from(resData['partner'] as Map)
              : <String, dynamic>{'phone': cleanId};
          emit(AuthPendingApproval(
            resData['message']?.toString() ??
                'Your partner application is currently PENDING approval from Super Admin.',
            partnerData: partnerJson,
          ));
          return;
        }
        final msg = resData['message']?.toString();
        if (msg != null && msg.isNotEmpty) {
          emit(AuthFailure(msg));
          return;
        }
      }
      final errorMsg = NetworkExceptions.getErrorMessage(e);
      emit(AuthFailure(errorMsg));
    }
  }

  Future<void> register(PartnerRegisterRequest request) async {
    emit(const AuthLoading());

    try {
      final response = await _authRepository.register(request);
      final data = response.data;

      if (data != null && data['success'] == true) {
        final partnerJson = data['partner'] is Map
            ? Map<String, dynamic>.from(data['partner'] as Map)
            : <String, dynamic>{};
        emit(AuthRegisterSuccess(
          message: data['message']?.toString() ??
              'Application submitted successfully. Super Admin verification pending.',
          partnerData: partnerJson,
        ));
        return;
      }

      final errMsg = data?['message']?.toString() ??
          'Registration failed. Please check submitted details.';
      emit(AuthFailure(errMsg));
    } catch (e) {
      if (e is DioException && e.response?.data is Map) {
        final resData = e.response?.data as Map;
        final msg = resData['message']?.toString();
        if (msg != null && msg.isNotEmpty) {
          emit(AuthFailure(msg));
          return;
        }
      }
      final errorMsg = NetworkExceptions.getErrorMessage(e);
      emit(AuthFailure(errorMsg));
    }
  }

  Future<void> logout() async {
    await SessionService.clearSession();
    emit(const AuthInitial());
  }
}
