import 'package:flutter_test/flutter_test.dart';
import 'package:planer_sport_app/main.dart';

void main() {
  testWidgets('placeholder screen is shown', (WidgetTester tester) async {
    await tester.pumpWidget(const PlanerSportApp());

    expect(find.text('PlanerSport'), findsOneWidget);
    expect(
      find.text('Foundation phase - business screens coming soon'),
      findsOneWidget,
    );
  });
}
