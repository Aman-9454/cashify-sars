import 'package:flutter_test/flutter_test.dart';
import 'package:camsik_user/app.dart';

void main() {
  testWidgets('CamsikUserApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const CamsikUserApp());
    expect(find.byType(CamsikUserApp), findsOneWidget);
  });
}
