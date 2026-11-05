import 'package:flutter_test/flutter_test.dart';
import 'package:casmik_partner_app/app.dart';
import 'package:casmik_partner_app/core/services/api_service.dart';
import 'package:casmik_partner_app/core/services/session_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUpAll(() async {
    SharedPreferences.setMockInitialValues({});
    ApiService.init();
    await SessionService.init();
  });

  testWidgets('CamsikPartnerApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const CamsikPartnerApp());
    expect(find.byType(CamsikPartnerApp), findsOneWidget);
  });
}
