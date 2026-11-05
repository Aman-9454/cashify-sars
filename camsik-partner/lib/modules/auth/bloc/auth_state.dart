import '../../../models/partner_models.dart';

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
  final PartnerUser partner;
  final String message;

  const AuthSuccess({required this.partner, this.message = 'Logged in successfully'});
}

class AuthRegisterSuccess extends AuthState {
  final String message;
  final Map<String, dynamic> partnerData;

  const AuthRegisterSuccess({
    required this.message,
    required this.partnerData,
  });
}

class AuthPendingApproval extends AuthState {
  final String message;
  final Map<String, dynamic> partnerData;

  const AuthPendingApproval(
    this.message, {
    this.partnerData = const {},
  });
}

class AuthFailure extends AuthState {
  final String error;

  const AuthFailure(this.error);
}
