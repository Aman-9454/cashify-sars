import '../../../models/delivery_models.dart';

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
  final DeliveryAgentUser? user;
  final bool isOnline;

  const ProfileLoaded({
    this.user,
    this.isOnline = true,
  });

  ProfileLoaded copyWith({
    DeliveryAgentUser? user,
    bool? isOnline,
  }) {
    return ProfileLoaded(
      user: user ?? this.user,
      isOnline: isOnline ?? this.isOnline,
    );
  }
}

class ProfileError extends ProfileState {
  final String error;
  const ProfileError(this.error);
}
