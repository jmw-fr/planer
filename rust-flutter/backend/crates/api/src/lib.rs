//! Rust API crate: Axum HTTP entrypoint composing domain, infra and shared crates.

pub mod app;
pub mod routes;

pub use app::{build_app, AppState};
