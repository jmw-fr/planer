//! Axum application wiring: routes, middleware, shared state.

use axum::Router;
use sea_orm::DatabaseConnection;

use crate::routes;

/// Shared application state injected into every handler.
///
/// `db` is `None` when the initial connection attempt failed at startup;
/// the `/health` handler reports `database: "unreachable"` in that case
/// instead of the process crashing (see FR-011).
#[derive(Clone)]
pub struct AppState {
    pub db: Option<DatabaseConnection>,
}

/// Builds the Axum router for the API, given the application state.
pub fn build_app(state: AppState) -> Router {
    Router::new()
        .merge(routes::health::router())
        .with_state(state)
}
