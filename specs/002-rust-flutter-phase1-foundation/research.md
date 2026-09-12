# Phase 0 Research: Rust/Flutter Phase 1 Foundation Setup

## 1. Rust web framework: Axum vs Actix Web

- **Decision**: Axum
- **Rationale**: Built directly on `tokio`/`tower`/`hyper`, giving a smaller surface area and idiomatic middleware composition via `tower::Service`. Actively maintained by the Tokio team, integrates cleanly with `tower-http` (tracing, CORS, compression) and `utoipa` for OpenAPI generation planned in later phases. The project's own development plan lists Axum first as the primary option.
- **Alternatives considered**: Actix Web — mature and very fast, but uses its own actor-based runtime/macro-heavy handler style that is less composable with the plain `tower` middleware ecosystem; would add a second async-ecosystem mental model for the team with no clear benefit for this project's needs.

## 2. ORM / data access: SeaORM vs Diesel vs raw sqlx

- **Decision**: SeaORM (`sea-orm`, `sea-orm-cli` for migrations)
- **Rationale**: Fully async (matches Axum/Tokio), dynamic query builder plus migration tooling (`sea-orm-cli migrate`) that maps closely to the team's EF Core migration experience from the .NET stack, easing the transition. Good PostgreSQL support and active maintenance.
- **Alternatives considered**: Diesel — mature and fast but synchronous-first (requires `diesel-async` for async support, an extra integration layer) and macro-heavy DSL with a steeper learning curve. Raw `sqlx` — excellent compile-time-checked SQL but no migration/model scaffolding, meaning more boilerplate for CRUD in later phases; can still be introduced later for hot-path queries if needed.

## 3. Backend workspace layout

- **Decision**: Cargo workspace with 4 crates — `api`, `domain`, `infra`, `shared` — under `rust-flutter/backend/crates/`.
- **Rationale**: Mirrors the layering the team already knows from the `.NET` solution (`Api`/`Application`+`Domain`/`Infrastructure`/`Abstractions`, see [specs/Phase1/Phase1-Architecture-Solution.md](../Phase1/Phase1-Architecture-Solution.md)), reducing conceptual overhead while moving to Rust. `domain` has zero external dependencies (pure business rules), `infra` depends on `domain` + `shared` for persistence, `api` composes `domain` + `infra` + `shared` into the Axum app.
- **Alternatives considered**: Single-crate backend — simpler to start but violates the constitution's "Incremental Quality" principle by not enforcing module boundaries at compile time; harder to keep `domain` free of framework/database concerns as the codebase grows.

## 4. Integration testing strategy against PostgreSQL

- **Decision**: `testcontainers-rs` (`testcontainers` + `testcontainers-modules::postgres`) to start a real, ephemeral PostgreSQL container per test run, both locally and in CI.
- **Rationale**: Matches the plan's explicit requirement ("Integration tests against a real PostgreSQL instance... rather than mocks only, to catch SQL/schema issues early") and requires no external services to be pre-provisioned — CI runners just need Docker-in-Docker or a Docker socket, which both GitHub Actions and Azure DevOps hosted agents provide natively.
- **Alternatives considered**: A shared long-lived CI database service — simpler pipeline YAML but introduces test ordering/isolation issues and a shared-state risk between concurrent CI runs; a pure mocking approach — fast but explicitly rejected by the development plan for integration tests.

## 5. Frontend monorepo tooling: melos vs plain multi-package pubspec

- **Decision**: `melos` to manage the Flutter workspace (`rust-flutter/app/`), with a `shared` package (models, API client, theme) and a single `planer_sport_app` package that targets both Flutter Web and mobile (Android/iOS) build targets.
- **Rationale**: Melos is the de-facto standard for Dart/Flutter monorepos, providing `melos bootstrap`, cross-package versioning, and script running (`melos run analyze`, `melos run test`) that CI pipelines can call as single commands — directly satisfying FR-006 (single command per suite) for the frontend side too.
- **Alternatives considered**: Two entirely separate Flutter apps (web + mobile) — maximizes platform-specific tuning but duplicates UI code, contradicting the development plan's explicit goal of maximizing Flutter code sharing; plain path-dependency `pubspec.yaml` without melos — works but loses the convenience scripts and bootstrap tooling, pushing more logic into ad-hoc shell scripts in CI.

## 6. CI platform parity: GitHub Actions and Azure DevOps

- **Decision**: Two independent pipeline definitions — `.github/workflows/rust-flutter-ci.yml` and repo-root `azure-pipelines.yml` — both invoking the same underlying commands (`cargo fmt --check`, `cargo clippy --all-targets --all-features -- -D warnings`, `cargo build --locked`, `cargo test`, `melos run analyze`, `melos run test`), rather than one pipeline calling into the other.
- **Rationale**: Keeps each pipeline definition idiomatic to its platform (native YAML syntax, native caching actions/tasks) while guaranteeing behavioral parity because both simply shell out to the same project-level commands (no pipeline-specific business logic). This satisfies FR-007/FR-008/FR-009 and the edge case requiring both pipelines to run independently on the same commit without coordination.
- **Alternatives considered**: A single shared pipeline definition with a cross-platform abstraction layer (e.g., a Justfile or Makefile invoked identically by both) — considered and partially adopted (see below) to avoid drift, but full "pipeline-as-code sharing" tools (e.g., Dagger) were rejected as unnecessary complexity for a foundation phase.
- **Refinement**: A small `Justfile`/npm-free shell script set (`scripts/ci/*.sh` or a `justfile`) will define the canonical commands once; both YAML pipelines call these scripts. This avoids duplicating flag lists (e.g., clippy's `-D warnings`) in two YAML dialects and reduces drift risk noted in the Alternatives above.

## 7. Backend Docker image strategy

- **Decision**: Multi-stage Dockerfile — a `rust:1.82-slim` (or pinned-version) builder stage compiling a statically-ish linked release binary (via the `x86_64-unknown-linux-musl` target where feasible, falling back to `-slim` + glibc if musl adds friction with SeaORM's native dependencies), copied into a minimal final stage (`gcr.io/distroless/cc-debian12` or `debian:bookworm-slim`) that only contains the compiled binary, CA certificates, and non-root user.
- **Rationale**: Directly satisfies FR-010/FR-011/SC-004 (minimal runtime image, no build toolchain/source, fast health-check startup) and matches the development plan's "Docker (multi-stage Rust image, static binary via musl)" guidance.
- **Alternatives considered**: Single-stage image using the full `rust` image at runtime — simplest to write but ships the entire Rust toolchain and source in the runtime image, failing FR-010 and bloating image size/attack surface (OWASP: minimize attack surface).

## 8. Toolchain pinning & dependency hygiene

- **Decision**: `rust-toolchain.toml` pinning the exact Rust version; `Cargo.lock` committed and CI runs `cargo build --locked`/`cargo test --locked`; Flutter side commits `pubspec.lock` and CI runs `flutter pub get --enforce-lockfile` (or equivalent check) failing on drift; `cargo audit` (and optionally `cargo deny`) run in CI per PR.
- **Rationale**: Directly satisfies FR-012/FR-013 and the edge cases about version mismatches and out-of-date lockfiles failing fast rather than silently upgrading.
- **Alternatives considered**: Floating toolchain versions ("always latest stable") — rejected because it reintroduces the exact "works on my machine" class of failures the constitution's "Incremental Quality" principle and the development plan's CI section are designed to prevent.

## Summary of resolved unknowns

No `[NEEDS CLARIFICATION]` markers remained in the spec; the research above finalizes the framework/library choices left open by the spec's Assumptions section (Axum, SeaORM) so Phase 1 design can proceed concretely.
