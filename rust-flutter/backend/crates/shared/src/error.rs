use thiserror::Error;

#[derive(Debug, Error)]
pub enum SharedError {
    #[error("missing required environment variable: {0}")]
    MissingEnvVar(&'static str),

    #[error("invalid value for environment variable: {0}")]
    InvalidEnvVar(&'static str),
}
