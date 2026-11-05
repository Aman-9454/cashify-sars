import 'package:shared_preferences/shared_preferences.dart';

class SharedPreferencesService {
  static SharedPreferences? _prefs;

  SharedPreferencesService._();

  static Future<SharedPreferences> getInstance() async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }
}
