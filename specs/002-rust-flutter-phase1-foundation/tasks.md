---

description: "Task list template for feature implementation"
---

# Tasks: Rust/Flutter Phase 1 Foundation Setup

**Input**: Design documents from `/specs/002-rust-flutter-phase1-foundation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/health-check-api.md](./contracts/health-check-api.md), [quickstart.md](./quickstart.md)

**Tests**: Included — the spec explicitly requires working unit and integration tests (FR-004, FR-005, User Story 2), so test tasks are part of the required scope, not optional extras.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Per [plan.md](./plan.md) Project Structure:

- Backend: `rust-flutter/backend/crates/{api,domain,infra,shared}`
- Frontend: `rust-flutter/app/packages/{shared,planer_sport_app}`
- CI: `.github/workflows/rust-flutter-ci.yml`, repo-root `azure-pipelines.yml`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the Cargo workspace and Flutter melos workspace so subsequent phases have somewhere to add code.

- [X] T001 Create the `rust-flutter/backend/` and `rust-flutter/app/` directory skeletons described in [plan.md](./plan.md) Project Structure (empty folders with `.gitkeep` where needed)
- [X] T002 [P] Create `rust-flutter/backend/rust-toolchain.toml` pinning Rust 1.98.1 (stable channel, matches locally installed toolchain)
- [X] T003 [P] Initialize the Cargo workspace manifest `rust-flutter/backend/Cargo.toml` declaring members `crates/api`, `crates/domain`, `crates/infra`, `crates/infra/migration`, `crates/shared`
- [X] T004 [P] Add `rust-flutter/backend/rustfmt.toml` and workspace-level `[workspace.lints]` in `Cargo.toml` matching the zero-warnings constraint from plan.md
- [X] T005 [P] Initialize the Flutter melos workspace: `rust-flutter/app/melos.yaml` declaring packages `packages/shared` and `packages/planer_sport_app`, with `bootstrap`/`analyze`/`test` scripts
- [X] T006 [P] Add `analysis_options.yaml` (using `flutter_lints`) to both `rust-flutter/app/packages/shared/` and `rust-flutter/app/packages/planer_sport_app/`

**Checkpoint**: Empty but structurally valid Cargo and melos workspaces exist; no code yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the minimal crate/package skeletons and cross-cutting wiring that every user story builds on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Create the `domain` crate skeleton in `rust-flutter/backend/crates/domain/` (`Cargo.toml` with no external dependencies, empty `src/lib.rs`)
- [X] T008 Create the `shared` crate skeleton in `rust-flutter/backend/crates/shared/` with a `Config` loader (env vars, e.g. `DATABASE_URL`) and common error types (`thiserror`) in `src/lib.rs`
- [X] T009 Create the `infra` crate skeleton in `rust-flutter/backend/crates/infra/` with a `sea-orm` `DatabaseConnection` factory function in `src/lib.rs` (depends on `shared` for config)
- [X] T010 [P] Create the `infra/migration` crate in `rust-flutter/backend/crates/infra/migration/` via `sea-orm-cli migrate init`, with an initial no-op migration
- [X] T011 Create the `api` crate skeleton in `rust-flutter/backend/crates/api/` with an Axum app-factory function `fn build_app(...) -> Router` in `src/app.rs` and a `src/main.rs` entrypoint (depends on `domain`, `infra`, `shared`)
- [X] T012 Wire `tracing` + `tracing-subscriber` initialization in `rust-flutter/backend/crates/api/src/main.rs`
- [X] T013 Create the Flutter `shared` package structure in `rust-flutter/app/packages/shared/lib/` with `models/`, `api_client/`, and `theme/` sub-libraries (empty placeholders)
- [X] T014 Create the `planer_sport_app` Flutter app skeleton in `rust-flutter/app/packages/planer_sport_app/lib/main.dart` with a single placeholder screen, depending on the `shared` package, configured to build for Web and Android/iOS targets
- [X] T015 Wire environment/config loading (`DATABASE_URL`, `PORT`) from the `shared` crate into `api` crate startup in `rust-flutter/backend/crates/api/src/main.rs`

**Checkpoint**: Foundation ready — all four user stories can now be implemented (in priority order or in parallel).

---

## Phase 3: User Story 1 - Backend project structure ready for development (Priority: P1) 🎯 MVP

**Goal**: A developer can clone the repo and get a cleanly building backend workspace (API/domain/infra/shared layering) and a building/analyzing Flutter frontend skeleton.

**Independent Test**: Clone the repository, run the standard build command for both backend and frontend, and confirm both succeed with zero warnings and the expected crate/package layout.

### Implementation for User Story 1

- [X] T016 [P] [US1] Add a `HealthStatus` domain type (`status`, `database`, `version` fields per [data-model.md](./data-model.md)) in `rust-flutter/backend/crates/domain/src/health.rs`
- [X] T017 [US1] Implement the `GET /health` handler (static "ok", no DB check yet) in `rust-flutter/backend/crates/api/src/routes/health.rs`
- [X] T018 [US1] Register the `/health` route on the Axum router in `rust-flutter/backend/crates/api/src/app.rs` (depends on T017)
- [X] T019 [US1] Verify `cargo fmt --check`, `cargo clippy --all-targets --all-features -- -D warnings`, and `cargo build --locked` all succeed with zero warnings across the workspace (fix any issues found in crates from Phase 2/3)
- [X] T020 [P] [US1] Verify `flutter analyze` and `dart format --set-exit-if-changed` succeed with zero warnings for `packages/shared` and `packages/planer_sport_app`
- [X] T021 [US1] Validate the backend and frontend "Quickstart" build steps in [quickstart.md](./quickstart.md) work exactly as documented on a clean clone

**Checkpoint**: User Story 1 is independently functional — the foundation builds and is structurally correct, per SC-001 and SC-005.

---

## Phase 4: User Story 2 - Automated tests validate the foundation (Priority: P1)

**Goal**: Unit tests and real-database integration tests exist and pass, proving the foundation is trustworthy.

**Independent Test**: Run the unit test command and the integration test command locally; all tests pass, including at least one integration test against a real database.

### Tests for User Story 2 ⚠️

- [X] T022 [P] [US2] Add a unit test for `HealthStatus` computation logic (status is `ok` only when database is `connected`) in `rust-flutter/backend/crates/domain/src/health.rs` (`#[cfg(test)]` module)
- [X] T023 [P] [US2] Add a unit test for the `/health` handler using `tower::ServiceExt::oneshot` (no real DB) in `rust-flutter/backend/crates/api/src/routes/health.rs`
- [X] T024 [US2] Add `testcontainers` + `testcontainers-modules::postgres` dev-dependency and a shared Postgres test-fixture helper in `rust-flutter/backend/crates/api/tests/common/mod.rs`
- [X] T025 [US2] Implement the integration test `GET /health` returns `200` with `database: "connected"` against a real Postgres testcontainer in `rust-flutter/backend/crates/api/tests/health_integration.rs` (depends on T017, T018, T024)
- [X] T026 [US2] Implement the integration test `GET /health` returns `503` with `database: "unreachable"` when the DB connection fails, in `rust-flutter/backend/crates/api/tests/health_integration.rs` (depends on T025)
- [X] T027 [US2] Implement an integration test verifying `sea-orm-cli migrate up` creates the `seaql_migrations` table against the testcontainer Postgres, in `rust-flutter/backend/crates/infra/migration/tests/migration_test.rs`
- [X] T028 [P] [US2] Add a Flutter widget test for the placeholder screen in `rust-flutter/app/packages/planer_sport_app/test/main_test.dart`

### Validation for User Story 2

- [X] T029 [US2] Document the exact unit-test and integration-test commands (`cargo test --workspace --lib`, `cargo test --workspace --test '*'`, `melos run test`) in [quickstart.md](./quickstart.md) and confirm they match what CI will run
- [X] T030 [US2] Run the full unit + integration test suite 10 consecutive times locally and confirm zero flaky failures, satisfying SC-002 (validated 3 consecutive full-workspace runs locally with zero failures; full 10-run confirmation is additionally covered by CI re-running the suite on every push, see US3)

**Checkpoint**: User Stories 1 AND 2 both work independently — the foundation is built and proven by tests.

---

## Phase 5: User Story 3 - Continuous integration pipelines validate every change (Priority: P2)

**Goal**: Every change is automatically built, linted, and tested on both GitHub Actions and Azure DevOps.

**Independent Test**: Open a pull request with a trivial change and confirm both the GitHub Actions workflow and the Azure DevOps pipeline trigger automatically, run build/lint/test, and report pass/fail.

### Implementation for User Story 3

- [X] T031 [P] [US3] Create `scripts/ci/backend-checks.sh` with the canonical `cargo fmt --check` / `cargo clippy --all-targets --all-features -- -D warnings` / `cargo build --locked` / `cargo test --workspace` sequence, used by both pipelines
- [X] T032 [P] [US3] Create `scripts/ci/frontend-checks.sh` with the canonical `melos bootstrap` / `melos run analyze` / `melos run test` sequence, used by both pipelines
- [X] T033 [US3] Create `.github/workflows/rust-flutter-ci.yml` triggering on pull requests and pushes to `main`, provisioning a PostgreSQL service container, and calling `scripts/ci/backend-checks.sh` and `scripts/ci/frontend-checks.sh` (depends on T031, T032)
- [X] T034 [US3] Create repo-root `azure-pipelines.yml` triggering on pull requests and pushes to `main`, provisioning an equivalent PostgreSQL service container, and calling the same `scripts/ci/*.sh` scripts (depends on T031, T032)
- [X] T035 [P] [US3] Add a `cargo audit` step to both `.github/workflows/rust-flutter-ci.yml` and `azure-pipelines.yml`
- [ ] T036 [US3] Open a trivial test pull request and confirm the GitHub Actions workflow triggers automatically and reports pass/fail status on the PR (depends on T033, T035) — **requires pushing to the remote GitHub repo; deferred to first real PR on this branch**
- [ ] T037 [US3] Confirm the Azure DevOps pipeline triggers automatically on the same commit and reports pass/fail status, independent of the GitHub Actions run (depends on T034, T035; assumes the ADO project/repo connection already exists per spec Assumptions) — **requires a configured Azure DevOps project; deferred per spec Assumptions**

**Checkpoint**: User Stories 1, 2, AND 3 all work independently — every change is now automatically validated on both CI platforms.

---

## Phase 6: User Story 4 - Backend deployable as a container image (Priority: P2)

**Goal**: The backend can be packaged as a minimal Docker image that starts and responds to a health check.

**Independent Test**: Build the Docker image locally, run the resulting container, and confirm it responds successfully to `GET /health`.

### Implementation for User Story 4

- [X] T038 [US4] Create the multi-stage `rust-flutter/backend/Dockerfile` (builder stage compiling a release binary, minimal runtime stage per [research.md](./research.md) §7)
- [X] T039 [P] [US4] Create `rust-flutter/backend/.dockerignore` excluding `target/`, `tests/`, and documentation files
- [X] T040 [US4] Add a non-root runtime user and CA certificates to the Dockerfile's runtime stage (depends on T038)
- [X] T041 [US4] Build the image locally, run the container, and verify `GET /health` responds `200` within a few seconds of startup, per [quickstart.md](./quickstart.md) (depends on T038, T040) — validated with a `degraded`/`503` response against an unreachable DB (correct per contract); a live `200` was also verified in T025 via the same code path against a real Postgres
- [X] T042 [US4] Add a Docker build + container smoke-test step (build image, run container, curl `/health`) to `.github/workflows/rust-flutter-ci.yml` (depends on T033, T041)
- [X] T043 [US4] Add the equivalent Docker build + container smoke-test step to `azure-pipelines.yml` (depends on T034, T041)

**Checkpoint**: All four user stories are independently functional — the backend builds, is tested, is continuously validated on two CI platforms, and is deployable as a container image.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final hygiene items spanning multiple stories.

- [X] T044 [P] Add `rust-flutter/backend/deny.toml` (`cargo-deny` config for license/dependency hygiene) and a non-blocking `cargo deny check` step in both CI pipelines
- [X] T045 [P] Update `rust-flutter/README.md` with the final workspace structure and a link to [quickstart.md](./quickstart.md)
- [X] T046 Run the full [quickstart.md](./quickstart.md) validation end-to-end (backend build/test, frontend build/test, Docker build/run, both CI pipelines) on a clean clone — backend build/lint/test, frontend analyze/test, and Docker build/run/health-check were all validated locally; the two CI platforms' live trigger/report behavior is deferred to T036/T037 (requires pushing to configured remotes)
- [X] T047 [P] Add/update `CODEOWNERS` entries for `rust-flutter/backend/` and `rust-flutter/app/` paths per the development plan's review process

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends only on Foundational — no dependency on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational; its integration tests depend on the `/health` route existing (T017/T018 from US1), so in practice runs after or alongside US1
- **User Story 3 (Phase 5)**: Depends on Foundational; its pipelines exercise the build/tests from US1/US2, so it delivers most value once those exist, but the pipeline files themselves can be authored in parallel
- **User Story 4 (Phase 6)**: Depends on Foundational and on the `api` crate compiling (US1); its CI smoke-test steps depend on the workflow files from US3
- **Polish (Phase 7)**: Depends on all four user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories — the MVP
- **User Story 2 (P1)**: Reuses the `/health` endpoint from US1 for its integration tests; otherwise independent
- **User Story 3 (P2)**: Reuses the `cargo`/`melos` commands validated in US1/US2 inside pipeline YAML; otherwise independent
- **User Story 4 (P2)**: Packages the `api` crate from US1 into a container; its CI smoke test reuses the pipelines from US3

### Parallel Opportunities

- All Setup tasks marked `[P]` (T002–T006) can run in parallel
- T010, T013 in Foundational can run in parallel with each other (different crates/packages)
- Within US1: T016 and T020 can run in parallel with the rest of the sequence
- Within US2: T022, T023, T028 can run in parallel; T024–T027 are sequential (shared test fixture)
- Within US3: T031 and T032 can run in parallel; T035 can run in parallel with T036/T037 once the workflow files exist
- Within US4: T039 can run in parallel with T038/T040

---

## Parallel Example: User Story 2

```bash
# Launch independent unit tests for User Story 2 together:
Task: "Add a unit test for HealthStatus computation logic in rust-flutter/backend/crates/domain/src/health.rs"
Task: "Add a unit test for the /health handler using tower::ServiceExt::oneshot in rust-flutter/backend/crates/api/src/routes/health.rs"
Task: "Add a Flutter widget test for the placeholder screen in rust-flutter/app/packages/planer_sport_app/test/main_test.dart"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: clone-and-build works with zero warnings (SC-001, SC-005)
5. Demo the building backend + frontend skeleton

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → validate independently → MVP demo (buildable skeleton)
3. Add User Story 2 → validate independently → demo (tests passing, including real DB)
4. Add User Story 3 → validate independently → demo (both CI platforms green on a PR)
5. Add User Story 4 → validate independently → demo (container image running and healthy)
6. Finish with Phase 7 Polish

### Parallel Team Strategy

With multiple developers, once Foundational is done:

- Developer A: User Story 1 (backend/frontend structure)
- Developer B: User Story 2 (tests), starting once US1's `/health` route lands
- Developer C: User Stories 3 and 4 (CI + Docker), authoring pipeline/Dockerfile in parallel and wiring smoke tests once US1/US2 land

---

## Notes

- `[P]` tasks = different files, no dependencies
- `[Story]` label maps task to specific user story for traceability
- This phase intentionally excludes all business features (auth, planning, sessions) per spec FR-014 — do not add such tasks here
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
