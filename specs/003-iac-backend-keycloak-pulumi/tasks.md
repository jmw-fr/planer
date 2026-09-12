---

description: "Task list for IaC backend & Keycloak on Azure (Pulumi/TypeScript)"
---

# Tasks: Infrastructure-as-Code for Backend & Keycloak on Azure

**Input**: Design documents from `/specs/003-iac-backend-keycloak-pulumi/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Test tasks ARE included — the plan (D11) and the contract docs explicitly require mock-based Pulumi unit tests and contract tests.

**Organization**: Tasks are grouped by user story (from [spec.md](./spec.md)) so each story is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US4 for user-story tasks; Setup/Foundational/Polish tasks carry no story label
- All paths are relative to the repository root; the IaC lives in the new top-level `infra/` folder

## Path Conventions

Pulumi TypeScript project under `infra/` (see [plan.md](./plan.md) Project Structure): program modules in `infra/src/`, unit tests in `infra/test/`, entrypoint `infra/index.ts`, per-stack config `infra/Pulumi.<stack>.yaml`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Pulumi TypeScript project and its tooling.

- [ ] T001 Create the `infra/` project skeleton (folders `infra/src/` and `infra/test/`) per [plan.md](./plan.md) Project Structure
- [ ] T002 Create `infra/package.json` with dependencies `@pulumi/pulumi`, `@pulumi/azure-native`, `@pulumi/azuread`, and devDeps `typescript`, `vitest`, `@types/node`, plus `test`/`build` scripts
- [ ] T003 [P] Create `infra/tsconfig.json` (target ES2022, module NodeNext, strict true, outDir excluded from Pulumi run)
- [ ] T004 [P] Create `infra/Pulumi.yaml` (name `planer-infra`, runtime `nodejs`, description) per [plan.md](./plan.md)
- [ ] T005 [P] Create `infra/vitest.config.ts` and an `infra/test/setup.ts` that registers Pulumi runtime mocks (`pulumi.runtime.setMocks`) for unmocked-deploy unit tests
- [ ] T006 [P] Create `infra/.gitignore` (ignore `node_modules/`, build output; ensure no `Pulumi.*.yaml` secret material is committed)
- [ ] T007 [P] Create `.github/workflows/infra-ci.yml` running `npm ci`, `npm test`, and `pulumi preview` per environment (login to Pulumi Cloud + Azure via OIDC), per [plan.md](./plan.md) FR-014
- [ ] T044 [P] Configure the Pulumi Cloud state backend and per-environment ESC environments (dev/staging/prod), verifying per-stack state locking is active; document `pulumi login` + ESC linking as an operator prerequisite (FR-011, [research.md](./research.md) D2/D3)

**Checkpoint**: `npm ci` and `npm test` (with no tests yet) run successfully in `infra/`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared modules every user story depends on. MUST complete before Phase 3.

**⚠️ CRITICAL**: No user story work can start until this phase is done.

- [ ] T008 Implement typed configuration in `infra/src/config.ts`: parse `EnvironmentConfig` from ESC/stack config with the fields and constraints in [data-model.md](./data-model.md) and [contracts/stack-config.md](./contracts/stack-config.md); enforce validation rules — `min >= 0`, `maxReplicas >= minReplicas`, `postgres.storageGb >= 32`, and **prod MUST have `frontDoor.originMode = privateLink` and `frontDoor.wafMode = Prevention`** (fail fast with actionable error on violation, FR-018/D8)
- [ ] T009 [P] Implement `infra/src/resourceGroup.ts`: create the per-environment resource group with common tags from config
- [ ] T010 [P] Implement `infra/src/observability.ts`: Log Analytics workspace for the environment
- [ ] T011 Implement `infra/src/network.ts`: VNet with `containerapps`, `postgres` (delegated), and `privatelink` subnets, plus private DNS zones `privatelink.postgres.database.azure.com` and `privatelink.vaultcore.azure.net` with VNet links (per [data-model.md](./data-model.md) Network)
- [ ] T012 Implement `infra/src/keyVault.ts`: RBAC-authorized Key Vault (purge protection on for prod), a private endpoint into the `privatelink` subnet, and diagnostic settings to Log Analytics; expose helper to write ESC-sourced secrets without emitting plaintext outputs (FR-004/FR-020)
- [ ] T013 Implement `infra/src/containerEnv.ts`: internal (VNet-injected) Azure Container Apps managed environment bound to the `containerapps` subnet, logs to Log Analytics
- [ ] T014 [P] Create `infra/src/outputs.ts` output-assembly skeleton exporting only the non-secret keys defined in [contracts/stack-outputs.md](./contracts/stack-outputs.md)
- [ ] T015 Create `infra/index.ts` entrypoint that loads config (T008) and wires the foundational modules (resource group, network, observability, key vault, container env); export outputs via T014
- [ ] T016 [P] Create a base `infra/Pulumi.dev.yaml` stack config (non-secret keys only) so foundational modules can be previewed/tested locally
- [ ] T017 [P] [Foundational tests] Add `infra/test/config.test.ts` asserting config validation rejects prod with `lockedPublic`/`Detection` and bad numeric ranges (contract C-CFG-1/C-CFG-2)

**Checkpoint**: `pulumi preview -s dev` renders the foundational resources; foundational unit tests pass.

---

## Phase 3: User Story 1 - Provision the backend runtime environment (Priority: P1) 🎯 MVP

**Goal**: A single provision brings up the backend Container App + its private PostgreSQL + networking + secrets, reachable only through Front Door, with connection details as outputs.

**Independent Test**: `pulumi up -s dev`, then reach the backend `/health` via `backendUrl` (Front Door); confirm the backend DB is not public and a direct-origin request is refused.

### Tests for User Story 1

- [ ] T018 [P] [US1] Add `infra/test/network.test.ts` asserting the backend PostgreSQL Flexible Server has `publicNetworkAccess = Disabled` and no allow-all firewall rule (FR-015)
- [ ] T019 [P] [US1] Add `infra/test/frontDoor.test.ts` asserting a Front Door profile exists, a WAF policy is associated, and the backend Container App ingress is not directly public (FR-017/FR-019)
- [ ] T020 [P] [US1] Add `infra/test/secrets.test.ts` asserting no exported output value contains a provisioned secret and the backend app references Key Vault via managed identity (contract C-OUT-2, FR-020)

### Implementation for User Story 1

- [ ] T021 [US1] Implement backend database in `infra/src/database.ts`: PostgreSQL Flexible Server `backend-db` with private access (VNet integration, public access disabled), a database, and password sourced from ESC into Key Vault (per [data-model.md](./data-model.md) BackendRuntime)
- [ ] T022 [US1] Implement `infra/src/backend.ts`: user-assigned managed identity + "Key Vault Secrets User" role assignment, and the backend Container App with **internal ingress**, Key Vault secret references, and the DB connection secret
- [ ] T023 [US1] Implement `infra/src/frontDoor.ts` (Premium) with the backend origin + route and an attached WAF policy (managed default rule set; mode from `frontDoor.wafMode`); for `lockedPublic` mode restrict origin access to the `AzureFrontDoor.Backend` service tag and require the `X-Azure-FDID` header (FR-017/FR-018/D7/D8)
- [ ] T024 [US1] Wire backend resources in `infra/index.ts` and export `resourceGroupName`, `frontDoorEndpointHostname`, `backendUrl`, `keyVaultName`, `keyVaultUri`, `backendContainerAppName`, `logAnalyticsWorkspaceId` via `infra/src/outputs.ts` (contract C-OUT-1)

**Checkpoint**: US1 is independently deployable — backend reachable via Front Door, DB private, US1 tests green.

---

## Phase 4: User Story 2 - Provision & configure Keycloak (Priority: P2)

**Goal**: Add a self-hosted Keycloak Container App with its own private PostgreSQL, exposing an OIDC issuer through Front Door.

**Independent Test**: With US1 deployed, provision Keycloak and fetch `keycloakIssuerUrl/.well-known/openid-configuration` through Front Door; confirm the Keycloak DB is private.

### Tests for User Story 2

- [ ] T025 [P] [US2] Extend `infra/test/network.test.ts` (or add `infra/test/keycloak.test.ts`) asserting the Keycloak PostgreSQL server has `publicNetworkAccess = Disabled` (FR-015)
- [ ] T026 [P] [US2] Add assertion that the Keycloak admin/db passwords are stored in Key Vault and never appear in outputs (FR-004/SC-006)

### Implementation for User Story 2

- [ ] T027 [US2] Add the Keycloak database to `infra/src/database.ts`: PostgreSQL Flexible Server `keycloak-db` (private access) + database, password via ESC → Key Vault
- [ ] T028 [US2] Implement `infra/src/keycloak.ts`: user-assigned managed identity + Key Vault role, Keycloak Container App (internal ingress) configured for the external DB and admin bootstrap secret, exposing the OIDC discovery endpoint (FR-013)
- [ ] T029 [US2] Extend `infra/src/frontDoor.ts` with the Keycloak origin + route (host `keycloak.hostname`), reusing the same WAF policy and origin-lockdown behavior
- [ ] T030 [US2] Wire Keycloak resources in `infra/index.ts` and export `keycloakBaseUrl`, `keycloakIssuerUrl`, `keycloakContainerAppName` (contract C-OUT-1/C-OUT-3)

**Checkpoint**: US1 + US2 deployable together; Keycloak issuer resolves through Front Door; all tests green.

---

## Phase 5: User Story 3 - Manage multiple isolated environments (Priority: P3)

**Goal**: One program provisions isolated `dev`/`staging`/`prod` stacks from ESC-backed per-environment config, with prod enforcing Private Link origins + WAF Prevention.

**Independent Test**: Provision two stacks with different sizing; confirm isolated resources and that a dev config change leaves prod unchanged.

- [ ] T031 [P] [US3] Create `infra/Pulumi.staging.yaml` and `infra/Pulumi.prod.yaml` stack configs, each linked to its Pulumi ESC environment for config/secrets (per [research.md](./research.md) D2/D3)
- [ ] T032 [US3] Implement the production Private Link origin path in `infra/src/frontDoor.ts`: when `originMode = privateLink`, create Private Endpoint/Private Link origins with approval and ensure the Container Apps have **no public endpoint** (FR-018)
- [ ] T033 [US3] Parameterize per-environment sizing/region/scaling across `database.ts`, `backend.ts`, `keycloak.ts`, and `containerEnv.ts` so environments differ via config only (FR-008), no duplicated definitions
- [ ] T034 [P] [US3] Add `infra/test/isolation.test.ts` asserting resource names/tags are environment-scoped and that prod resolves to `privateLink` + `Prevention` (SC-007, contract C-CFG-2)

**Checkpoint**: Stacks coexist and are isolated; prod enforces the stricter security posture.

---

## Phase 6: User Story 4 - Preview, update, and safe teardown (Priority: P3)

**Goal**: Safe day-2 operations — accurate previews, idempotent updates, and complete teardown with no orphans.

**Independent Test**: Run `pulumi preview` (lists diffs, no changes), re-run `pulumi up` (zero changes), then `pulumi destroy` (all resources removed).

- [ ] T035 [P] [US4] Add `infra/test/idempotency.test.ts` (or a CI step) asserting a no-op preview yields zero diffs on an unchanged stack (FR-005/SC-003)
- [ ] T045 [P] [US4] Add a rotation test/check asserting that updating a secret in Key Vault (via ESC) is picked up by the backend/Keycloak apps without a full redeploy and never surfaces in outputs (FR-021/SC-006)
- [ ] T036 [US4] Ensure teardown completeness in `infra/index.ts`/modules: set delete-safe options (e.g., no lingering `retainOnDelete`, resource-group-scoped resources) so `pulumi destroy` removes 100% of resources with no orphans (FR-010/SC-005)
- [ ] T037 [P] [US4] Add the `pulumi preview` pre-apply gate and an optional ephemeral `pulumi up`/`pulumi destroy` dev job to `.github/workflows/infra-ci.yml` (FR-006/FR-014)
- [ ] T038 [P] [US4] Document partial-failure re-run behavior and the preview→up→destroy flow in `infra/README.md`, cross-linking [quickstart.md](./quickstart.md) (FR-012)

**Checkpoint**: Preview/update/teardown validated; CI gates changes.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T039 [P] Create `infra/README.md` (prereqs, ESC/Pulumi Cloud login, per-env commands) aligned with [quickstart.md](./quickstart.md)
- [ ] T040 [P] Add npm lint/format (ESLint + Prettier) config in `infra/` and wire into `infra-ci.yml`
- [ ] T041 [P] Add a secret-leak check (unit test or CI grep) asserting no plaintext secret in `Pulumi.*.yaml` or exported outputs (contract C-CFG-3/SC-006)
- [ ] T042 Run the full [quickstart.md](./quickstart.md) validation against an ephemeral dev stack (up → verify Front Door-only ingress + private DBs + OIDC issuer → idempotency → destroy) and record results
- [ ] T046 [P] Validate WAF behavior: assert the WAF policy is attached with the managed default rule set and correct per-environment mode (Prevention in prod, Detection in non-prod), and confirm a signature-matching request is blocked at Front Door in prod (FR-022/SC-010)
- [ ] T043 Re-verify Constitution Check gates in [plan.md](./plan.md) still hold after implementation (private DBs, Front Door+WAF only ingress, secrets via managed identity, no app-code changes)

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** must finish before any user story.
- **US1 (Phase 3, P1)** depends only on Foundational — this is the MVP.
- **US2 (Phase 4, P2)** depends on Foundational + the Front Door module created in US1 (T023).
- **US3 (Phase 5, P3)** depends on US1/US2 modules existing (parameterizes them) and adds the Private Link origin path.
- **US4 (Phase 6, P3)** depends on a provisionable stack (US1 minimum) and CI from Setup.
- **Polish (Phase 7)** depends on all targeted stories being complete.

## Parallel Execution Examples

- **Setup**: T003, T004, T005, T006, T007 can run in parallel after T002 (all distinct files).
- **Foundational**: T009, T010, T014, T016, T017 in parallel (distinct files); T011→T012→T013 are sequential where they share network/env wiring; T015 last.
- **US1 tests**: T018, T019, T020 in parallel before implementation (T021–T024).
- **US2 tests**: T025, T026 in parallel before T027–T030.
- **Polish**: T039, T040, T041 in parallel.

## Implementation Strategy

- **MVP first**: Deliver Phases 1–3 (Setup + Foundational + US1) for a reproducible, Front-Door-fronted backend with a private database — the smallest independently valuable slice.
- **Increment**: Add US2 (Keycloak), then US3 (multi-env + prod Private Link), then US4 (day-2 ops hardening).
- **Security invariants are test-guarded** throughout: databases never public, Front Door the only public ingress + WAF, secrets only in Key Vault via managed identity.
