use sea_orm::{Database, DatabaseConnection, DbErr};

/// Opens a connection pool to the PostgreSQL database at `database_url`.
pub async fn connect(database_url: &str) -> Result<DatabaseConnection, DbErr> {
    Database::connect(database_url).await
}
