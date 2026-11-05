import '../data/models/responses/auth_response.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, failure }

class AuthState {
  final AuthStatus status;
  final bool isRegister;
  final AuthUserData? user;
  final String? token;
  final String? errorMessage;
  final bool obscureLoginPassword;
  final bool obscureRegPassword;
  final bool obscureRegConfirm;

  const AuthState({
    this.status = AuthStatus.initial,
    this.isRegister = false,
    this.user,
    this.token,
    this.errorMessage,
    this.obscureLoginPassword = true,
    this.obscureRegPassword = true,
    this.obscureRegConfirm = true,
  });

  bool get isLoading => status == AuthStatus.loading;
  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get isFailure => status == AuthStatus.failure;

  AuthState copyWith({
    AuthStatus? status,
    bool? isRegister,
    AuthUserData? user,
    String? token,
    String? errorMessage,
    bool clearError = false,
    bool? obscureLoginPassword,
    bool? obscureRegPassword,
    bool? obscureRegConfirm,
  }) {
    return AuthState(
      status: status ?? this.status,
      isRegister: isRegister ?? this.isRegister,
      user: user ?? this.user,
      token: token ?? this.token,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      obscureLoginPassword: obscureLoginPassword ?? this.obscureLoginPassword,
      obscureRegPassword: obscureRegPassword ?? this.obscureRegPassword,
      obscureRegConfirm: obscureRegConfirm ?? this.obscureRegConfirm,
    );
  }
}
