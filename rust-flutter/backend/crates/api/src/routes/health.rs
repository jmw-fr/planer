//! `GET /health` — see specs/002-rust-flutter-phase1-foundation/contracts/health-check-api.md

use axum::{extract::State, http::StatusCode, response::IntoResponse, routing::get, Json, Router};
use domain::health::{DatabaseStatus, HealthStatus, ServiceStatus};
use serde::Serialize;

use crate::app::AppState;

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    database: &'static str,
    version: &'static str,
}

impl From<HealthStatus> for HealthResponse {
    fn from(health: HealthStatus) -> Self {
        Self {
            status: match health.status {
                ServiceStatus::Ok => "ok",
                ServiceStatus::Degraded => "degraded",
            },
            database: match health.database {
                DatabaseStatus::Connected => "connected",
                DatabaseStatus::Unreachable => "unreachable",
            },
            version: env!("CARGO_PKG_VERSION"),
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new().route("/health", get(handler))
}

async fn handler(State(state): State<AppState>) -> impl IntoResponse {
    let db_status = match &state.db {
        Some(db) if db.ping().await.is_ok() => DatabaseStatus::Connected,
        _ => DatabaseStatus::Unreachable,
    };
    let health = HealthStatus::from_database(db_status, env!("CARGO_PKG_VERSION"));
    let status_code = match health.status {
        ServiceStatus::Ok => StatusCode::OK,
        ServiceStatus::Degraded => StatusCode::SERVICE_UNAVAILABLE,
    };
    (status_code, Json(HealthResponse::from(health)))
}

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests {
    use axum::body::Body;
    use axum::http::Request;
    use axum::routing::get;
    use http_body_util::BodyExt;
    use tower::ServiceExt;

    use super::*;

    /// Unit-level check that only the `/health` path is routed (no DB involved).
    /// Full status-code behavior (200 connected / 503 unreachable) is covered
    /// by real-database integration tests in `tests/health_integration.rs`.
    #[tokio::test]
    async fn unknown_route_returns_not_found() {
        let router_only: Router<()> =
            Router::new().route("/health", get(|| async { StatusCode::OK }));
        let response = router_only
            .oneshot(
                Request::builder()
                    .uri("/other")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::NOT_FOUND);
        let _ = response.into_body().collect().await;
    }

    /// When no DB connection was established at startup (`db: None`), the
    /// handler must report "degraded"/"unreachable" rather than panicking.
    #[tokio::test]
    async fn health_reports_degraded_when_no_db_configured() {
        let app = router().with_state(AppState { db: None });
        let response = app
            .oneshot(
                Request::builder()
                    .uri("/health")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::SERVICE_UNAVAILABLE);
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["status"], "degraded");
        assert_eq!(json["database"], "unreachable");
    }
}
