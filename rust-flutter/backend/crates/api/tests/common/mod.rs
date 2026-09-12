#![allow(clippy::unwrap_used, clippy::expect_used)]

use sea_orm::{ConnectOptions, Database, DatabaseConnection};
use testcontainers::runners::AsyncRunner;
use testcontainers::ContainerAsync;
use testcontainers_modules::postgres::Postgres;

/// Starts a throwaway PostgreSQL container and returns a connected `DatabaseConnection`
/// along with the container handle (must be kept alive for the container to stay up).
pub async fn start_postgres() -> (ContainerAsync<Postgres>, DatabaseConnection) {
    let container = Postgres::default()
        .start()
        .await
        .expect("failed to start postgres testcontainer");
    let host_port = container
        .get_host_port_ipv4(5432)
        .await
        .expect("failed to get mapped postgres port");
    let url = format!("postgres://postgres:postgres@127.0.0.1:{host_port}/postgres");
    let db = Database::connect(ConnectOptions::new(url))
        .await
        .expect("failed to connect to postgres testcontainer");
    (container, db)
}
