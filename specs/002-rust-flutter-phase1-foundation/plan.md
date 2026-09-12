# Implementation Plan: Rust/Flutter Phase 1 Foundation Setup

**Branch**: `002-rust-flutter-phase1-foundation` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-rust-flutter-phase1-foundation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Stand up the Phase 1 foundation of the new Rust/Flutter stack described in [docs/Plan-Developpement-Rust-Flutter.md](../../docs/Plan-Developpement-Rust-Flutter.md): a Cargo workspace backend (API/domain/infra/shared crates) exposing a minimal health-check REST endpoint, backed by PostgreSQL; a Flutter (melos) monorepo skeleton sharing code across web and mobile; automated unit tests and real-database integration tests for the backend; CI pipelines on both GitHub Actions and Azure DevOps that run formatting, linting, build and tests; and a minimal multi-stage Docker image for the backend that starts and answers the health check. No business features (auth, planning, sessions) are implemented — only the scaffolding needed to prove the toolchain end-to-end.

## Technical Context

**Language/Version**: Rust 1.82 (stable, pinned via `rust-toolchain.toml`); Dart/Flutter 3.24 (stable channel)

**Primary Dependencies**: Backend — `axum` (HTTP framework), `tokio` (async runtime), `sea-orm` + `sea-orm-cli` (ORM/migrations), `tower`/`tower-http` (middleware, tracing), `tracing` + `tracing-subscriber` (observability), `thiserror`/`anyhow` (errors), `utoipa` (OpenAPI, prepared for later phases). Frontend — `melos` (monorepo/workspace management), standard `flutter`/`dart` SDK tooling only for this phase (no state-management/router library needed yet beyond a placeholder screen)

**Storage**: PostgreSQL (via `sea-orm`), run locally and in CI as a container; no business schema yet beyond a migration-history table used to prove migrations run

**Testing**: Backend — `cargo test` (unit tests in each crate) and `cargo test --test '*'` integration tests using `testcontainers-rs` to spin up a real PostgreSQL container. Frontend — `flutter test` (unit/widget) and `flutter analyze`/`dart format --set-exit-if-changed` as quality gates

**Target Platform**: Backend: Linux server / Linux container (Docker). Frontend: Flutter Web + Android/iOS from a single shared codebase

**Project Type**: Web application (backend API + web/mobile frontend) — Option 2/3 hybrid (backend + Flutter web/mobile client)

**Performance Goals**: Not applicable in this phase (no business logic under load yet); only requirement is the container health check responds within a few seconds of startup (SC-004)

**Constraints**: Zero compiler/linter warnings (`cargo clippy -- -D warnings`, `flutter analyze`); `cargo build --locked` / committed `pubspec.lock`; pinned Rust toolchain version; minimal final Docker image (no build toolchain/source in runtime layer)

**Scale/Scope**: Foundation-only scope: one health-check endpoint, one placeholder Flutter screen, two CI pipeline definitions, one Dockerfile; no additional business entities (per FR-014)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **User Value First**: Satisfied indirectly — this phase delivers no end-user-facing value by itself, but it is the explicitly-required prerequisite (per the project's own Rust/Flutter development plan) for all future user-facing phases; scope is deliberately minimal (FR-014) to avoid speculative work.
- **Incremental Quality**: Satisfied — unit tests, real-database integration tests, and CI gates (fmt, clippy, build, test) are mandatory deliverables of this phase (FR-004–FR-009), enforced before any business code is added.
- **Data Integrity & Privacy**: Satisfied — no business or personal data is introduced in this phase; PostgreSQL access is scaffolded only to prove connectivity/migrations, with no sensitive fields.
- **Observability & Operational Resilience**: Satisfied — `tracing` is included from day one (Primary Dependencies) and the container health check (FR-011) is the first observability contract established.
- **Iteration Within Constraints**: Partially in tension — the constitution's "Additional Constraints" section requires alignment with the existing **.NET/C#** architecture and states that *"New technology or major platform changes MUST be explicitly approved and documented in the specification."* Migrating to Rust/Flutter is exactly such a major platform change.
  - **Resolution**: This is a deliberate, product-owner-approved strategic pivot, not an ad-hoc deviation. It is documented in [docs/Plan-Developpement-Rust-Flutter.md](../../docs/Plan-Developpement-Rust-Flutter.md) (a full parallel development plan authored for this stack) and was explicitly requested by the user for this feature. The existing `.NET` implementation under `dotnet/` is left untouched; the new stack lives in its own `rust-flutter/` folder so both can coexist during the transition. See Complexity Tracking below.
  - **Follow-up**: The constitution's "Additional Constraints" section should be revisited/amended (via `/speckit.constitution`) once the Rust/Flutter track is confirmed as the project's forward direction, so governance reflects reality. Recorded as a follow-up, not a blocker for this phase.

**Initial gate result**: PASS (with documented, justified platform-change exception; no other violations).

## Project Structure

### Documentation (this feature)

```text
specs/002-rust-flutter-phase1-foundation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
rust-flutter/
├── README.md
├── backend/                        # Cargo workspace (Rust API)
│   ├── Cargo.toml                  # workspace manifest
│   ├── rust-toolchain.toml         # pinned toolchain version
│   ├── Dockerfile                  # multi-stage build -> minimal runtime image
│   ├── .dockerignore
│   ├── deny.toml                   # cargo-deny config (license/dep hygiene)
│   ├── crates/
│   │   ├── api/                    # Axum HTTP entrypoint, routes, middleware, health check
│   │   │   ├── src/
│   │   │   └── tests/              # integration tests (testcontainers + reqwest against the app)
│   │   ├── domain/                 # business entities & rules (no external deps)
│   │   │   └── src/
│   │   ├── infra/                  # SeaORM DbContext, migrations, repositories
│   │   │   ├── src/
│   │   │   └── migration/          # sea-orm-cli migration crate
│   │   └── shared/                 # cross-cutting types/errors/config
│   │       └── src/
│   └── migration/ -> crates/infra/migration  # (kept alongside infra per SeaORM convention)
│
└── app/                             # Flutter melos monorepo (web + mobile)
    ├── melos.yaml
    ├── packages/
    │   ├── shared/                  # models, API client, theme (pure Dart/Flutter package)
    │   │   ├── lib/
    │   │   └── test/
    │   └── planer_sport_app/        # single Flutter app targeting web + Android/iOS
    │       ├── lib/
    │       └── test/

.github/
└── workflows/
    └── rust-flutter-ci.yml          # GitHub Actions: fmt, clippy, build, tests (backend) + analyze/test (frontend)

azure-pipelines.yml                  # Azure DevOps equivalent pipeline (repo root, ADO convention)
```

**Structure Decision**: Web application (backend + frontend) layout, matching the repo's existing convention of one top-level folder per stack (`dotnet/` for the legacy .NET stack, `rust-flutter/` for this one — folder already scaffolded with a placeholder `README.md`). Inside `rust-flutter/`, `backend/` is a Cargo workspace split into `api`/`domain`/`infra`/`shared` crates mirroring the layering already used in the `.NET` solution (see [specs/Phase1/Phase1-Architecture-Solution.md](../Phase1/Phase1-Architecture-Solution.md)) for team familiarity. `app/` is a Flutter melos workspace so the `shared` package (models, API client, theme) can be consumed by a single Flutter app compiled for both web and mobile targets, per the development plan's "maximize UI code sharing" goal. CI definitions live at the conventional locations for each platform: `.github/workflows/` for GitHub Actions and repo-root `azure-pipelines.yml` for Azure DevOps, both driving the same underlying `cargo`/`flutter` commands so the two platforms stay in sync.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New technology platform (Rust + Flutter) replacing the constitution's mandated .NET/C# stack | The user explicitly requested starting Phase 1 of the Rust/Flutter plan; a full alternate development plan ([docs/Plan-Developpement-Rust-Flutter.md](../../docs/Plan-Developpement-Rust-Flutter.md)) already exists and documents the rationale (performance, memory safety for health data, unified Flutter UI) | Staying on .NET only would ignore the explicit, documented product direction for this feature; the two stacks are kept isolated in separate top-level folders (`dotnet/` vs `rust-flutter/`) so the existing .NET system is not put at risk while this track is evaluated |
