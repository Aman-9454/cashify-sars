import 'package:flutter/foundation.dart';

void appLog(dynamic message) {
  if (kDebugMode) {
    print(message);
  }
}
