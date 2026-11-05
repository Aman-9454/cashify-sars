import '../../../core/services/session_service.dart';
import '../../../models/admin_models.dart';

abstract class ProfileRepository {
  Future<AdminUser?> getProfile();
  Future<void> logout();
  Future<void> saveProfile(AdminUser user);
}

class ProfileRepositoryImpl implements ProfileRepository {
  @override
  Future<AdminUser?> getProfile() async {
    return SessionService.currentUser;
  }

  @override
  Future<void> logout() async {
    await SessionService.clearSession();
  }

  @override
  Future<void> saveProfile(AdminUser user) async {
    await SessionService.saveUser(user);
  }
}
