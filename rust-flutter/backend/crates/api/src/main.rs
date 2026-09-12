use api::{build_app, AppState};
use shared::Config;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let config = Config::from_env()?;
    // A failed DB connection at startup must not crash the process: the
    // container has to start and answer /health (as "degraded") regardless,
    // per contracts/health-check-api.md.
    let db = match infra::connect(&config.database_url).await {
        Ok(db) => Some(db),
        Err(err) => {
            tracing::warn!(error = %err, "failed to connect to database at startup");
            None
        }
    };
    let app = build_app(AppState { db });

    let listener = tokio::net::TcpListener::bind(("0.0.0.0", config.port)).await?;
    tracing::info!(port = config.port, "starting api server");
    axum::serve(listener, app).await?;
    Ok(())
}
