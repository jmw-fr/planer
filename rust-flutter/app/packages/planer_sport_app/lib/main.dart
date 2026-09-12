import 'package:flutter/material.dart';
import 'package:shared/shared.dart';

void main() {
  runApp(const PlanerSportApp());
}

/// Root widget for the PlanerSport foundation app (web + mobile).
///
/// This phase intentionally ships only a placeholder screen; business
/// screens are added by future feature specs (see spec.md FR-014).
class PlanerSportApp extends StatelessWidget {
  const PlanerSportApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PlanerSport',
      theme: appTheme,
      home: const PlaceholderScreen(),
    );
  }
}

/// Placeholder home screen proving the shared package and app shell work.
class PlaceholderScreen extends StatelessWidget {
  const PlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('PlanerSport')),
      body: const Center(
        child: Text('Foundation phase - business screens coming soon'),
      ),
    );
  }
}
