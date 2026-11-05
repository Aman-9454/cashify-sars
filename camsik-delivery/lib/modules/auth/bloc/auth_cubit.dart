import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/services/network_exceptions.dart';
import '../../../../core/services/session_service.dart';
import '../../../../models/delivery_models.dart';
import '../data/models/requests/delivery_login_request.dart';
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
      emit(const AuthFailure('Please enter your registered mobile number or email.'));
      return;
    }

    if (cleanPass.isEmpty) {
      emit(const AuthFailure('Please enter your password.'));
      return;
    }

    emit(const AuthLoading());

    try {
      final response = await _authRepository.login(
        DeliveryLoginRequest(
          identifier: cleanId,
          password: cleanPass,
        ),
      );

      final data = response.data;
      if (data != null && data['success'] == true) {
        final agentJson = data['agent'] ?? data['user'];
        final token = data['token'] ?? data['accessToken'];
        final refreshToken = data['refreshToken'];

        if (agentJson != null) {
          final agent = DeliveryAgentUser.fromJson(Map<String, dynamic>.from(agentJson));
          await SessionService.saveSession(
            agent,
            token: token?.toString(),
            refreshToken: refreshToken?.toString(),
          );
          emit(AuthSuccess(
            agent: agent,
            message: data['message']?.toString() ?? 'Logged in successfully',
          ));
          return;
        }
      }

      final errMsg = data?['message']?.toString() ?? 'Login failed. Please verify credentials.';
      emit(AuthFailure(errMsg));
    } catch (e) {
      final errorMsg = NetworkExceptions.getErrorMessage(e);
      emit(AuthFailure(errorMsg));
    }
  }

  Future<void> logout() async {
    await SessionService.clearSession();
    emit(const AuthInitial());
  }
}
