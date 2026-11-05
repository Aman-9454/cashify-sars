import 'package:flutter_test/flutter_test.dart';
import 'package:casmik_delivery_app/app.dart';

void main() {
  testWidgets('CamsikDeliveryApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const CamsikDeliveryApp());
    expect(find.byType(CamsikDeliveryApp), findsOneWidget);
  });
}
