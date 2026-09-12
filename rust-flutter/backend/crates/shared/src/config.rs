use crate::error::SharedError;

/// Backend runtime configuration, loaded from environment variables.
#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub port: u16,
}

impl Config {
    /// Reads `DATABASE_URL` (required) and `PORT` (defaults to 8080) from the environment.
    pub fn from_env() -> Result<Self, SharedError> {
        let database_url = std::env::var("DATABASE_URL")
            .map_err(|_| SharedError::MissingEnvVar("DATABASE_URL"))?;
        let port = std::env::var("PORT")
            .ok()
            .map(|v| v.parse::<u16>())
            .transpose()
            .map_err(|_| SharedError::InvalidEnvVar("PORT"))?
            .unwrap_or(8080);
        Ok(Self { database_url, port })
    }
}
