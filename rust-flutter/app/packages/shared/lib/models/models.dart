// Shared data models used by both the web and mobile Flutter apps.
//
// No business entities exist yet in this foundation phase (see
// specs/002-rust-flutter-phase1-foundation/data-model.md); only the
// HealthStatus model used to call the backend's `/health` endpoint.

/// Mirrors the backend's `GET /health` response shape.
class HealthStatus {
  const HealthStatus({
    required this.status,
    required this.database,
    required this.version,
  });

  factory HealthStatus.fromJson(Map<String, dynamic> json) {
    return HealthStatus(
      status: json['status'] as String,
      database: json['database'] as String,
      version: json['version'] as String,
    );
  }

  final String status;
  final String database;
  final String version;

  bool get isOk => status == 'ok';
}
