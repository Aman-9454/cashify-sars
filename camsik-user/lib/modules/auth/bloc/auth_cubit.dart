import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/app_keys.dart';
import '../../../core/services/session_service.dart';
import '../../../core/services/storage_service.dart';
import '../data/models/requests/login_request.dart';
import '../data/models/requests/otp_request.dart';
import '../data/models/requests/register_request.dart';
import '../data/models/responses/auth_response.dart';
import '../data/repositories/auth_repository.dart';
import 'auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  final AuthRepository _authRepository;

  AuthCubit({AuthRepository? authRepository})
      : _authRepository = authRepository ?? AuthRepositoryImpl(),
        super(const AuthState());

  void switchMode(bool isRegister) {
    emit(state.copyWith(isRegister: isRegister, clearError: true));
  }

  void toggleLoginPasswordVisibility() {
    emit(state.copyWith(obscureLoginPassword: !state.obscureLoginPassword));
  }

  void toggleRegPasswordVisibility() {
    emit(state.copyWith(obscureRegPassword: !state.obscureRegPassword));
  }

  void toggleRegConfirmVisibility() {
    emit(state.copyWith(obscureRegConfirm: !state.obscureRegConfirm));
  }

  Future<void> checkSession() async {
    final loggedIn = SessionService.isLoggedIn();
    if (loggedIn) {
      final saved = SessionService.getSavedProfile();
      if (saved != null) {
        emit(state.copyWith(
          status: AuthStatus.authenticated,
          user: AuthUserData(
            id: saved['phone']?.toString() ?? 'usr',
            name: saved['name']?.toString() ?? 'Camsik Customer',
            phone: saved['phone']?.toString() ?? '',
            email: saved['email']?.toString() ?? '',
          ),
        ));
        return;
      }
    }
    emit(state.copyWith(status: AuthStatus.unauthenticated));
  }

  Future<void> login({required String identifier, required String password}) async {
    final cleanId = identifier.trim();
    final cleanPass = password.trim();

    // Business validation in BLoC
    if (cleanId.isEmpty || cleanId.length < 3) {
      emit(state.copyWith(
        status: AuthStatus.failure,
        errorMessage: 'Please enter your 10-digit mobile number or email address',
      ));
      return;
    }
    if (cleanPass.isEmpty) {
      emit(state.copyWith(
        status: AuthStatus.failure,
        errorMessage: 'Please enter your account password',
      ));
      return;
    }

    emit(state.copyWith(status: AuthStatus.loading, clearError: true));
    try {
      final response = await _authRepository.login(
        LoginRequest(identifier: cleanId, password: cleanPass),
      );

      if (response.data != null && response.data is Map) {
        final authRes = AuthResponse.fromJson(Map<String, dynamic>.from(response.data as Map));
        if (authRes.success && authRes.user != null) {
          await _saveSession(authRes);
          emit(state.copyWith(
            status: AuthStatus.authenticated,
            user: authRes.user,
            token: authRes.token,
          ));
          return;
        } else if (authRes.message != null && authRes.message!.isNotEmpty) {
          emit(state.copyWith(status: AuthStatus.failure, errorMessage: authRes.message!));
          return;
        }
      }
      emit(state.copyWith(
        status: AuthStatus.failure,
        errorMessage: 'Invalid credentials or account not found.',
      ));
    } catch (e) {
      String message = 'Login failed. Please check your credentials.';
      if (e is DioException) {
        final data = e.response?.data;
        if (data is Map && data['message'] != null) {
          message = data['message'].toString();
        } else if (e.response?.statusCode == 401) {
          message = 'Incorrect password or account not found.';
        }
      }
      /*
      // --- Offline / Demo Fallback (Commented Out) ---
      final localAccount = SessionService.verifyLocalAccount(identifier: cleanId, password: cleanPass);
      if (localAccount != null) {
        emit(state.copyWith(
          status: AuthStatus.authenticated,
          user: AuthUserData(
            id: 'usr-local',
            name: localAccount['name']?.toString() ?? 'Customer',
            phone: localAccount['phone']?.toString() ?? cleanId,
            email: localAccount['email']?.toString() ?? '',
          ),
        ));
        return;
      }
      if (cleanId == '9876543210' || cleanId.toLowerCase() == 'test@camsik.in') {
        emit(state.copyWith(
          status: AuthStatus.authenticated,
          user: const AuthUserData(
            id: 'usr-default',
            name: 'Rahul Sharma',
            phone: '9876543210',
            email: 'rahul.s@camsik.in',
          ),
        ));
        return;
      }
      */
      emit(state.copyWith(status: AuthStatus.failure, errorMessage: message));
    }
  }

  Future<void> register({
    required String name,
    required String phone,
    required String email,
    required String password,
    required String confirmPassword,
  }) async {
    final cleanName = name.trim();
    final cleanPhone = phone.trim().replaceAll(RegExp(r'\D'), '');
    final cleanEmail = email.trim().toLowerCase();
    final cleanPassword = password.trim();
    final cleanConfirm = confirmPassword.trim();

    // Business validation in BLoC
    if (cleanName.isEmpty) {
      emit(state.copyWith(
        status: AuthStatus.failure,
        errorMessage: 'Please enter your full name',
      ));
      return;
    }
    if (cleanPhone.length != 10) {
      emit(state.copyWith(
        status: AuthStatus.failure,
        errorMessage: 'Please enter a valid 10-digit mobile number',
      ));
      return;
    }
    if (cleanEmail.isEmpty || !cleanEmail.contains('@') || !cleanEmail.contains('.')) {
      emit(state.copyWith(
        status: AuthStatus.failure,
        errorMessage: 'Please enter a valid email address',
      ));
      return;
    }
    if (cleanPassword.length < 6) {
      emit(state.copyWith(
        status: AuthStatus.failure,
        errorMessage: 'Password must be at least 6 characters long',
      ));
      return;
    }
    if (cleanPassword != cleanConfirm) {
      emit(state.copyWith(
        status: AuthStatus.failure,
        errorMessage: 'Passwords do not match',
      ));
      return;
    }

    emit(state.copyWith(status: AuthStatus.loading, clearError: true));
    try {
      final response = await _authRepository.register(
        RegisterRequest(
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          password: cleanPassword,
        ),
      );

      if (response.data != null && response.data is Map) {
        final authRes = AuthResponse.fromJson(Map<String, dynamic>.from(response.data as Map));
        if (authRes.success && authRes.user != null) {
          await _saveSession(authRes);
          emit(state.copyWith(
            status: AuthStatus.authenticated,
            user: authRes.user,
            token: authRes.token,
          ));
          return;
        } else if (authRes.message != null && authRes.message!.isNotEmpty) {
          emit(state.copyWith(status: AuthStatus.failure, errorMessage: authRes.message!));
          return;
        }
      }
      emit(state.copyWith(
        status: AuthStatus.failure,
        errorMessage: 'Registration failed. Please try again.',
      ));
    } catch (e) {
      String message = 'Registration failed. Please try again.';
      if (e is DioException) {
        final data = e.response?.data;
        if (data is Map && data['message'] != null) {
          message = data['message'].toString();
        } else if (e.response?.statusCode == 409) {
          message = 'Mobile number is already registered. Please sign in.';
        } else if (e.response?.statusCode == 404) {
          message = 'Registration endpoint not found on server.';
        }
      }
      /*
      // --- Offline Local Account Fallback (Commented Out) ---
      await SessionService.saveLocalAccount(
        phone: cleanPhone, password: cleanPassword, name: cleanName, email: cleanEmail,
      );
      final localUser = AuthUserData(
        id: 'usr-${DateTime.now().millisecondsSinceEpoch}',
        name: cleanName, phone: cleanPhone, email: cleanEmail,
      );
      emit(state.copyWith(status: AuthStatus.authenticated, user: localUser));
      return;
      */
      emit(state.copyWith(status: AuthStatus.failure, errorMessage: message));
    }
  }

  Future<void> sendOtp(String phone) async {
    emit(state.copyWith(status: AuthStatus.loading, clearError: true));
    try {
      await _authRepository.sendOtp(SendOtpRequest(phone: phone));
      emit(state.copyWith(status: AuthStatus.initial));
    } catch (e) {
      emit(state.copyWith(
        status: AuthStatus.failure,
        errorMessage: 'Failed to send OTP. Please try again.',
      ));
    }
  }

  Future<void> logout() async {
    await SessionService.clearSession();
    final prefs = await SharedPreferencesService.getInstance();
    await prefs.remove(AppKeys.accessToken);
    await prefs.remove(AppKeys.refreshToken);
    emit(state.copyWith(status: AuthStatus.unauthenticated, user: null, token: null));
  }

  Future<void> _saveSession(AuthResponse authRes) async {
    if (authRes.user != null) {
      await SessionService.saveUserSession(
        name: authRes.user!.name,
        phone: authRes.user!.phone,
        email: authRes.user!.email,
      );
    }
    if (authRes.token != null) {
      final prefs = await SharedPreferencesService.getInstance();
      await prefs.setString(AppKeys.accessToken, authRes.token!);
    }
  }
}
