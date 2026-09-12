# Feature Specification: Rust/Flutter Phase 1 Foundation Setup

**Feature Branch**: `002-rust-flutter-phase1-foundation`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Staring implementing phase one of Ruster/Flutter plan. Limit to creating projects structures, ensuring unit and integration tests are functional and create a build pipeline for Github Actions and Azure devops. Also create docker image for the backend."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Backend project structure ready for development (Priority: P1)

As a backend developer joining the project, I need a working Rust workspace with clearly separated crates (API, domain, infrastructure, shared) so that I can start implementing business features in the correct layer without first having to set up tooling or guess where code belongs.

**Why this priority**: Nothing else (tests, pipelines, Docker image) can exist without a buildable project structure. This is the foundational deliverable that unblocks all other work.

**Independent Test**: Can be fully verified by cloning the repository, running the standard build command, and confirming the workspace compiles successfully with the expected crate layout and no business logic yet implemented.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository, **When** a developer runs the project's standard build command, **Then** the backend workspace compiles successfully with zero errors and zero warnings.
2. **Given** the workspace structure, **When** a developer inspects the repository, **Then** distinct areas exist for API/entry-point code, domain/business logic, infrastructure/data access, and shared/common code, matching the layering described in the project's architecture documentation.
3. **Given** the frontend project, **When** a developer runs the standard build/analyze command for the mobile+web client, **Then** it compiles/analyzes successfully with the expected project layout in place (even if screens are placeholders).

---

### User Story 2 - Automated tests validate the foundation (Priority: P1)

As a developer or reviewer, I need automated unit and integration tests that run successfully against the new project structure, so that I have confidence the foundation is sound and future changes can be validated automatically.

**Why this priority**: Establishing working, passing test suites (including a real database in integration tests) from day one prevents accumulating untested code and enforces the quality practices defined for this project going forward.

**Independent Test**: Can be fully verified by running the unit test command and the integration test command locally and observing that all tests pass, including at least one integration test that exercises a real database connection.

**Acceptance Scenarios**:

1. **Given** the backend workspace, **When** the unit test command is run, **Then** all unit tests pass with no failures.
2. **Given** the backend workspace and a running database instance, **When** the integration test command is run, **Then** all integration tests pass, including at least one test that reads/writes against the real database.
3. **Given** the test suites, **When** a developer intentionally breaks a piece of business logic, **Then** the corresponding test fails, demonstrating the tests provide real coverage rather than trivial checks.

---

### User Story 3 - Continuous integration pipelines validate every change (Priority: P2)

As a team lead, I need automated build pipelines on both GitHub Actions and Azure DevOps so that every code change is automatically built, linted, and tested before it can be merged, regardless of which platform hosts the repository.

**Why this priority**: Automated verification is essential to keep quality high as the team scales, but it depends on the project structure and tests already existing (User Stories 1 and 2).

**Independent Test**: Can be fully verified by opening a pull request with a trivial code change and observing that both the GitHub Actions workflow and the Azure DevOps pipeline trigger automatically, run the build/lint/test steps, and report a pass/fail status.

**Acceptance Scenarios**:

1. **Given** a pull request against the main branch, **When** the change is pushed, **Then** a GitHub Actions workflow automatically runs formatting checks, linting, build, and tests, and reports its result on the pull request.
2. **Given** the same repository mirrored/configured in Azure DevOps, **When** a change is pushed, **Then** an Azure DevOps pipeline automatically runs the equivalent formatting checks, linting, build, and tests, and reports its result.
3. **Given** a change that fails formatting, linting, build, or tests, **When** the pipelines run, **Then** the pipeline run is marked as failed, clearly indicating which step failed.

---

### User Story 4 - Backend deployable as a container image (Priority: P2)

As a DevOps engineer, I need the backend to be packaged as a Docker image so that it can be deployed consistently across environments (local, staging, cloud) without manual setup of the runtime.

**Why this priority**: Containerization is required for future deployment phases but is not needed until the backend structure and its build process are stable, so it follows the other stories.

**Independent Test**: Can be fully verified by building the Docker image locally, running the resulting container, and confirming the backend service starts and responds to a basic health check.

**Acceptance Scenarios**:

1. **Given** the backend source code, **When** the Docker image build command is run, **Then** the image builds successfully and produces a runnable container.
2. **Given** a running container built from the image, **When** a basic health/status check is performed against it, **Then** the service responds successfully, confirming the backend starts correctly inside the container.
3. **Given** the built image, **When** its size and contents are inspected, **Then** it contains only the compiled backend binary and its minimal runtime dependencies (no build toolchain or source code left in the final image).

---

### Edge Cases

- What happens when a developer's local toolchain version differs from the version pinned for the project? The build should fail fast with a clear version mismatch rather than silently using a different version.
- How does the CI pipeline handle a pull request from a fork or branch that hasn't updated its lockfile? The build must fail rather than silently regenerating/upgrading dependencies.
- What happens if the integration test database is unavailable in CI? The pipeline must fail clearly with a database-connection error rather than reporting unrelated test failures.
- What happens when the Docker image build is run without network access to the dependency registry cache? The build must fail with a clear dependency-fetch error.
- How does the system handle two pipelines (GitHub Actions and Azure DevOps) both targeting the same commit? Both must be able to run independently without interfering with each other or requiring manual coordination.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST provide a backend workspace organized into separate, clearly bounded areas for API/entry-point code, domain/business logic, infrastructure/data access, and shared/common code.
- **FR-002**: The project MUST provide a frontend project skeleton covering both web and mobile targets from a shared codebase, with a modular structure separating shared code (models, API client, theming) from platform-specific screens.
- **FR-003**: The backend workspace MUST build successfully with zero compiler warnings and zero linter warnings as part of the standard build process.
- **FR-004**: The project MUST include a suite of automated unit tests covering the initial business logic and API handlers created during this phase, and these tests MUST all pass.
- **FR-005**: The project MUST include automated integration tests that exercise a real database instance, and these tests MUST all pass.
- **FR-006**: The project MUST include a documented, repeatable way to run unit tests and integration tests locally (a single command per suite).
- **FR-007**: The project MUST include a GitHub Actions workflow that automatically triggers on pull requests and pushes to the main branch, running formatting checks, linting, build, and both test suites.
- **FR-008**: The project MUST include an equivalent Azure DevOps pipeline definition that runs the same formatting checks, linting, build, and both test suites.
- **FR-009**: Both CI pipelines MUST report a clear pass/fail status and MUST fail the run when any step (formatting, linting, build, tests) fails.
- **FR-010**: The project MUST include a Docker image definition for the backend service that produces a minimal runtime image (build tools and source code excluded from the final image).
- **FR-011**: The built backend Docker image MUST start successfully as a container and respond to a basic health/status check.
- **FR-012**: The project MUST pin the backend toolchain version so that local builds and CI builds use the same version.
- **FR-013**: The project MUST commit dependency lockfiles for both backend and frontend, and builds (local and CI) MUST fail rather than silently update dependencies when the lockfile is out of date.
- **FR-014**: This phase MUST NOT include implementation of business features (authentication, planning, sessions, etc.) beyond the minimal scaffolding needed to demonstrate a working build, test, and deployment pipeline (e.g., a basic health-check endpoint and a placeholder screen).

### Key Entities

- **Backend Workspace**: The set of backend source modules (API, domain, infrastructure, shared) and their build/test configuration; no business data entities are introduced in this phase.
- **Frontend Project**: The shared web/mobile client project skeleton and its module boundaries; no business data entities are introduced in this phase.
- **CI Pipeline Definition**: The configuration describing automated build/test steps, one for GitHub Actions and one for Azure DevOps, both covering the same backend and frontend projects.
- **Container Image**: The packaged, runnable artifact of the backend service, built from the backend workspace.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new developer can clone the repository and get a fully building backend and frontend project on a first attempt, without needing undocumented manual steps.
- **SC-002**: 100% of unit and integration tests created for this phase pass consistently across at least 10 consecutive local or CI runs (no flaky failures).
- **SC-003**: Every pull request targeting the main branch triggers both the GitHub Actions and Azure DevOps pipelines automatically, with results visible within a few minutes of the push, without any manual trigger step.
- **SC-004**: The backend container image can be built and started successfully, and responds to a health check within a few seconds of container startup, on any machine with a container runtime installed.
- **SC-005**: Zero build warnings and zero lint warnings are present in the backend workspace and frontend project at the end of this phase.

## Assumptions

- The Rust web framework and ORM/data-access library choices (e.g., Axum vs. Actix Web, SeaORM vs. Diesel) will be finalized during this phase as part of setting up the workspace, per the existing Rust/Flutter development plan; this spec does not mandate a specific framework.
- A PostgreSQL instance is available (locally via a containerized test database, and in CI) for running integration tests; provisioning that instance is in scope, but production database hosting/configuration is out of scope for this phase.
- "Azure DevOps" refers to pipeline definitions compatible with an Azure DevOps project; provisioning/configuring the Azure DevOps organization and project itself is assumed to be handled outside this phase (out of scope), with only the pipeline-as-code definition being delivered here.
- The Docker image targets the backend service only; a container image for the Flutter web/mobile frontend is out of scope for this phase.
- No authentication, planning, or other business features are implemented in this phase beyond a minimal placeholder needed to prove the pipeline works end-to-end (consistent with Phase 1 scope in the existing development plan, which is otherwise covered by later, more detailed specs).
- Code quality gates already defined in the project's development plan (formatting, linting, warnings-as-errors, dependency audit) apply to this phase's CI pipelines from day one.
