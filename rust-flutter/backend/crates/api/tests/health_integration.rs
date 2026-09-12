//! Integration tests for `GET /health` against a real PostgreSQL instance.
//! See specs/002-rust-flutter-phase1-foundation/contracts/health-check-api.md
#![allow(clippy::unwrap_used, clippy::expect_used)]

mod common;

use api::{build_app, AppState};
use axum::body::Body;
use axum::http::{Request, StatusCode};
use http_body_util::BodyExt;
use sea_orm::{ConnectOptions, Database};
use serde_json::Value;
use tower::ServiceExt;

#[tokio::test]
async fn health_returns_ok_when_database_connected() {
    let (_container, db) = common::start_postgres().await;
    let app = build_app(AppState { db: Some(db) });

    let response = app
        .oneshot(
            Request::builder()
                .uri("/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["status"], "ok");
    assert_eq!(json["database"], "connected");
}

#[tokio::test]
async fn health_returns_degraded_when_database_unreachable() {
    let (container, _db) = common::start_postgres().await;
    let host_port = container.get_host_port_ipv4(5432).await.unwrap();
    let url = format!("postgres://postgres:postgres@127.0.0.1:{host_port}/postgres");
    // Connect once, then drop the container so the connection becomes unreachable.
    let db = Database::connect(ConnectOptions::new(url)).await.unwrap();
    drop(container);

    let app = build_app(AppState { db: Some(db) });
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
    let json: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["status"], "degraded");
    assert_eq!(json["database"], "unreachable");
}
