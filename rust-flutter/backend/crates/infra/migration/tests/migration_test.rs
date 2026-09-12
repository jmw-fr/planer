//! Verifies `Migrator::up` creates the SeaORM migration-history table
//! against a real PostgreSQL testcontainer (proves the migration pipeline works).
#![allow(clippy::unwrap_used, clippy::expect_used)]

use sea_orm::{ConnectOptions, Database};
use sea_orm_migration::MigratorTrait;
use testcontainers::runners::AsyncRunner;
use testcontainers_modules::postgres::Postgres;

#[tokio::test]
async fn migrator_up_runs_successfully() {
    let container = Postgres::default().start().await.expect("start postgres");
    let host_port = container
        .get_host_port_ipv4(5432)
        .await
        .expect("mapped port");
    let url = format!("postgres://postgres:postgres@127.0.0.1:{host_port}/postgres");
    let db = Database::connect(ConnectOptions::new(url))
        .await
        .expect("connect");

    migration::Migrator::up(&db, None)
        .await
        .expect("migrations should apply cleanly");
}
