import '../../../models/admin_models.dart';

abstract class ProfileState {
  const ProfileState();
}

class ProfileInitial extends ProfileState {
  const ProfileInitial();
}

class ProfileLoading extends ProfileState {
  const ProfileLoading();
}

class ProfileLoaded extends ProfileState {
  final AdminUser? user;

  const ProfileLoaded({this.user});
}

class ProfileError extends ProfileState {
  final String error;

  const ProfileError(this.error);
}
