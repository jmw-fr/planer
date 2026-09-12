# Quickstart: Rust/Flutter Phase 1 Foundation

## Prerequisites

- Rust toolchain matching `rust-flutter/backend/rust-toolchain.toml` (installed automatically by `rustup` when running any `cargo` command inside `backend/`)
- Docker (used by `testcontainers-rs` for integration tests and for building/running the backend image)
- Flutter SDK 3.24+ and `melos` (`dart pub global activate melos`)

## Backend

```powershell
cd rust-flutter/backend

# Format, lint, build (matches CI gates)
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --locked

# Unit tests (per crate)
cargo test --workspace --lib

# Integration tests (spins up a real PostgreSQL container via testcontainers-rs)
cargo test --workspace --test '*'

# Run the API locally
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/postgres"
cargo run -p api
# then, in another terminal:
curl http://localhost:8080/health
```

## Frontend

```powershell
cd rust-flutter/app

melos bootstrap
melos run analyze
melos run test
```

## Backend Docker image

```powershell
cd rust-flutter/backend
docker build -t planersport-backend:local .
docker run --rm -p 8080:8080 -e DATABASE_URL="postgres://postgres:postgres@host.docker.internal:5432/postgres" -e PORT=8080 planersport-backend:local
curl http://localhost:8080/health
```

Note: `/health` returns `200 {"status":"ok", ...}` when the database is reachable, and `503 {"status":"degraded", ...}` when it is not (e.g. `DATABASE_URL` points at an unreachable host) — the container always starts and responds either way, per FR-011.

## CI

- GitHub Actions: `.github/workflows/rust-flutter-ci.yml` runs automatically on pull requests and pushes to `main`.
- Azure DevOps: `azure-pipelines.yml` (repo root) runs the equivalent steps; requires the Azure DevOps project to be configured to point at this repository (out of scope for this feature, see spec Assumptions).

Both pipelines call the same underlying `cargo`/`melos` commands listed above, so a green run locally is a strong predictor of a green CI run.
