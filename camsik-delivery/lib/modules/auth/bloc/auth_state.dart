import '../../../models/delivery_models.dart';

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
  final DeliveryAgentUser agent;
  final String message;

  const AuthSuccess({required this.agent, this.message = 'Logged in successfully'});
}

class AuthFailure extends AuthState {
  final String error;

  const AuthFailure(this.error);
}
