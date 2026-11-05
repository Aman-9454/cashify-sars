import 'package:shared_preferences/shared_preferences.dart';

class SharedPreferencesService {
  static SharedPreferencesService? _instance;
  static SharedPreferences? _preferences;
  // singleton
  static Future<SharedPreferencesService> getInstance() async {
    if (_instance == null) {
      _instance = SharedPreferencesService();
      await _instance!._initPreferences();
    }
    return _instance!;
  }

  Future<void> _initPreferences() async {
    _preferences = await SharedPreferences.getInstance();
  }

  // Setters
  Future<bool> setBool(String key, bool value) {
    return _preferences!.setBool(key, value);
  }

  Future<bool> setInt(String key, int value) {
    return _preferences!.setInt(key, value);
  }

  Future<bool> setDouble(String key, double value) {
    return _preferences!.setDouble(key, value);
  }

  Future<bool> setString(String key, String value) {
    return _preferences!.setString(key, value);
  }

  Future<bool> setStringList(String key, List<String> value) {
    return _preferences!.setStringList(key, value);
  }

  // Getters
  bool? getBool(String key) {
    return _preferences!.getBool(key);
  }

  int? getInt(String key) {
    return _preferences!.getInt(key);
  }

  double? getDouble(String key) {
    return _preferences!.getDouble(key);
  }

  String? getString(String key) {
    return _preferences!.getString(key);
  }

  List<String>? getStringList(String key) {
    return _preferences!.getStringList(key);
  }

  // Remove
  Future<bool> remove(String key) {
    return _preferences!.remove(key);
  }

  // Clear all data
  Future<bool> clear() {
    return _preferences!.clear();
  }

  // Get all keys
  Set<String> getKeys() {
    return _preferences!.getKeys();
  }
}
