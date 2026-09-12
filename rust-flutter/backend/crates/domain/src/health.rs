//! Domain-level health-check status computation (see spec contracts/health-check-api.md).

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DatabaseStatus {
    Connected,
    Unreachable,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ServiceStatus {
    Ok,
    Degraded,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HealthStatus {
    pub status: ServiceStatus,
    pub database: DatabaseStatus,
    pub version: String,
}

impl HealthStatus {
    /// Status is `Ok` only when the database is `Connected`.
    pub fn from_database(database: DatabaseStatus, version: impl Into<String>) -> Self {
        let status = match database {
            DatabaseStatus::Connected => ServiceStatus::Ok,
            DatabaseStatus::Unreachable => ServiceStatus::Degraded,
        };
        Self {
            status,
            database,
            version: version.into(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn status_is_ok_when_database_connected() {
        let health = HealthStatus::from_database(DatabaseStatus::Connected, "0.1.0");
        assert_eq!(health.status, ServiceStatus::Ok);
    }

    #[test]
    fn status_is_degraded_when_database_unreachable() {
        let health = HealthStatus::from_database(DatabaseStatus::Unreachable, "0.1.0");
        assert_eq!(health.status, ServiceStatus::Degraded);
    }
}
