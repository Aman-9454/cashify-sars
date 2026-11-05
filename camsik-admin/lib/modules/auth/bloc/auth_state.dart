import '../../../models/admin_models.dart';

abstract class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class AuthSuccess extends AuthState {
  final AdminUser user;
  final String message;

  const AuthSuccess({required this.user, this.message = 'Logged in successfully'});
}

class AuthFailure extends AuthState {
  final String error;

  const AuthFailure(this.error);
}
