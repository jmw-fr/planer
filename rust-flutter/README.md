# Planer Sport - Rust + Flutter implementation

This folder will contain the new implementation of the Planer Sport project based on the Rust (backend) and Flutter (web + mobile frontend) stack, described in [docs/Plan-Developpement-Rust-Flutter.md](../docs/Plan-Developpement-Rust-Flutter.md).

The previous .NET/Blazor implementation has been moved to the [dotnet/](../dotnet/) folder.

## Structure

```
rust-flutter/
├── backend/   # Cargo workspace (Rust API): crates/api, crates/domain, crates/infra, crates/shared
└── app/       # Flutter melos workspace (web + mobile): packages/shared, packages/planer_sport_app
```

## Getting started

See [specs/002-rust-flutter-phase1-foundation/quickstart.md](../specs/002-rust-flutter-phase1-foundation/quickstart.md) for build, test, run, and Docker instructions.

CI: `.github/workflows/rust-flutter-ci.yml` (GitHub Actions) and `azure-pipelines.yml` (Azure DevOps, repo root) both run the same checks via `scripts/ci/*.sh`.
