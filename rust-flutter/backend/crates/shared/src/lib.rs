//! Cross-cutting types shared across crates: configuration and common errors.

pub mod config;
pub mod error;

pub use config::Config;
pub use error::SharedError;
