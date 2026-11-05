import 'package:flutter_test/flutter_test.dart';
import 'package:casmik_admin_app/app.dart';

void main() {
  testWidgets('CamsikAdminApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const CamsikAdminApp());
    expect(find.byType(CamsikAdminApp), findsOneWidget);
  });
}
