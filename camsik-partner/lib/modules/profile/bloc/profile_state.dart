import '../../../../models/partner_models.dart';

abstract class ProfileState {
  const ProfileState();
}

class ProfileInitial extends ProfileState {}

class ProfileLoading extends ProfileState {}

class ProfileLoaded extends ProfileState {
  final PartnerUser? user;
  const ProfileLoaded({this.user});
}

class ProfileError extends ProfileState {
  final String error;
  const ProfileError(this.error);
}
