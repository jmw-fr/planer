# Implementation Plan: Infrastructure-as-Code for Backend & Keycloak on Azure

**Branch**: `003-iac-backend-keycloak-pulumi` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-iac-backend-keycloak-pulumi/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## Summary

Provision the full Azure cloud environment for the Rust/Axum backend and a self-hosted Keycloak identity provider as version-controlled Infrastructure-as-Code, authored with Pulumi in TypeScript. A single `pulumi up` per environment stands up: a VNet with private subnets, Azure Database for PostgreSQL Flexible Server instances (one for the backend, one for Keycloak) with no public access, two Azure Container Apps (backend + Keycloak) inside an internal Container Apps Environment, an Azure Key Vault holding runtime secrets (read via managed identity), and an Azure Front Door Premium that is the single public entry point. Per-environment configuration and secrets come from Pulumi ESC; Pulumi state lives in the managed Pulumi Cloud backend with per-stack locking. Production wires Front Door to the origins over Private Link (fully private origins); dev/staging keep a technically-public origin locked to Front Door only (service tag + `X-Azure-FDID`). No application/business code is written or changed — this feature delivers only the infrastructure definition, its multi-environment configuration, and the outputs downstream deploy steps consume.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS (Pulumi program language, as explicitly requested)

**Primary Dependencies**: Pulumi CLI 3.x; `@pulumi/pulumi`, `@pulumi/azure-native` (Azure Resource Manager provider), `@pulumi/azuread` (managed identity / RBAC where needed); Pulumi ESC for environments/secrets/config; Pulumi Cloud as the state backend. Azure resources: Virtual Network, Azure Container Apps (+ internal Managed Environment), Azure Database for PostgreSQL Flexible Server, Azure Key Vault, Azure Front Door (Premium) + WAF policy, Private Link/Private Endpoints, Log Analytics workspace.

**Storage**: Azure Database for PostgreSQL Flexible Server ×2 (backend DB, Keycloak DB), private-access only. Pulumi state stored in Pulumi Cloud (not in the target Azure tenant). Secrets in Azure Key Vault (runtime) sourced from Pulumi ESC.

**Testing**: Pulumi unit tests with mocks (`@pulumi/pulumi/testing`) run via a Node test runner (`vitest` or `jest`) for resource-shape/property assertions (e.g., "DB has no public network access", "Front Door is the only public ingress"); `pulumi preview` in CI as an integration gate; optional `pulumi up` against an ephemeral dev stack for end-to-end validation.

**Target Platform**: Microsoft Azure (single subscription, one resource group per environment). Author/run from Linux/Windows dev machines and CI runners.

**Project Type**: Infrastructure-as-Code project (Pulumi TypeScript program) — a new top-level `infra/` folder alongside the existing `dotnet/` and `rust-flutter/` stacks.

**Performance Goals**: A from-scratch `pulumi up` of a fresh environment completes in under 30 minutes (SC-002); `pulumi preview` on an unchanged stack reports zero diffs (SC-003).

**Constraints**: Backend & Keycloak MUST NOT be publicly reachable except through Front Door (FR-017–FR-019); databases MUST have no public network access (FR-015); no secret in source control/logs/outputs (FR-004, SC-006); idempotent provisioning (FR-005); safe, complete teardown (FR-010, SC-005); runnable unattended in CI and locally with equivalent results (FR-014).

**Scale/Scope**: At least two environments (dev, prod), staging optional, from one parameterized program (FR-007/FR-008). Scope is infrastructure only — no application/business logic and no changes to existing app code (FR-016).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **User Value First**: Satisfied indirectly — this feature delivers no direct end-user feature, but it is the required platform prerequisite for deploying the backend + auth to the cloud. Scope is deliberately infrastructure-only (FR-016) to avoid speculative work.
- **Incremental Quality**: Satisfied — the plan mandates Pulumi unit tests (mock-based property assertions) plus `pulumi preview` as a CI gate before any apply, and the definition is version-controlled and reviewable. Idempotency (FR-005) and safe teardown (FR-010) reduce future operational debt.
- **Data Integrity & Privacy**: Strongly reinforced — databases are private-only (FR-015), all identity/DB secrets live in Key Vault and are read via managed identity, never committed (FR-004/FR-020), and Front Door + WAF is the only public surface (FR-017). This directly serves the GDPR/health-data emphasis in the project's security plans.
- **Observability & Operational Resilience**: Satisfied — a Log Analytics workspace + Container Apps/Front Door diagnostics are provisioned; partial-failure behavior is re-runnable (FR-012); state is locked against concurrent corruption (FR-011).
- **Iteration Within Constraints**: In tension with the constitution's "Additional Constraints" (mandates the .NET/C# stack and requires explicit approval for new technology). Introducing Pulumi/TypeScript + Azure IaC is a new technology surface.
  - **Resolution**: This was explicitly requested by the product owner for this feature and directly supports the already-approved Rust/Flutter track (feature 002) and the Keycloak identity decision documented in [docs/Plan-Security-OAuth.md](../../docs/Plan-Security-OAuth.md). The IaC lives isolated in its own top-level `infra/` folder and changes no existing application code (FR-016). Recorded in Complexity Tracking; not a blocker.

**Initial gate result**: PASS (with documented, justified new-technology exception).

**Post-design re-check (after Phase 1)**: PASS — the design keeps databases private, routes all public traffic through Front Door + WAF, stores secrets only in Key Vault via managed identity, and adds no application code. No new violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
infra/                                  # NEW top-level Pulumi TypeScript IaC project
├── Pulumi.yaml                          # project definition (runtime: nodejs)
├── Pulumi.dev.yaml                      # dev stack config (ESC-linked)
├── Pulumi.staging.yaml                  # staging stack config (optional)
├── Pulumi.prod.yaml                     # prod stack config (ESC-linked)
├── package.json                         # @pulumi/pulumi, @pulumi/azure-native, @pulumi/azuread, test deps
├── tsconfig.json
├── vitest.config.ts                     # unit-test runner config (Pulumi runtime mocks)
├── .eslintrc.cjs                        # ESLint config (TypeScript lint)
├── .prettierrc                          # Prettier formatting config
├── .gitignore                           # ignores node_modules/, build output, local secrets
├── README.md                            # prereqs + per-env commands (mirrors quickstart.md)
├── index.ts                             # program entrypoint: wires components, exports outputs
├── src/
│   ├── config.ts                        # typed per-environment config (from ESC/stack config)
│   ├── resourceGroup.ts                 # resource group + common tags
│   ├── network.ts                       # VNet, subnets, private DNS zones, private endpoints
│   ├── database.ts                      # PostgreSQL Flexible Server ×2 (private access only)
│   ├── keyVault.ts                      # Key Vault + access via managed identity
│   ├── observability.ts                 # Log Analytics workspace + diagnostic settings
│   ├── containerEnv.ts                  # internal Container Apps managed environment
│   ├── backend.ts                       # backend Container App (private ingress) + identity
│   ├── keycloak.ts                      # Keycloak Container App (private ingress) + identity
│   ├── frontDoor.ts                     # Front Door Premium + WAF + routes/origins (Private Link | locked public)
│   └── outputs.ts                       # assembles exported stack outputs
└── test/
    ├── setup.ts                         # registers Pulumi runtime mocks for unit tests
    ├── config.test.ts                   # asserts config validation (prod rules, numeric ranges)
    ├── network.test.ts                  # asserts DBs/origins are not publicly reachable
    ├── frontDoor.test.ts                # asserts Front Door is the sole public ingress + WAF present
    ├── isolation.test.ts                # asserts per-environment resource isolation + prod posture
    ├── idempotency.test.ts              # asserts no-op preview yields zero diffs
    └── secrets.test.ts                  # asserts no plaintext secrets in outputs; Key Vault + managed identity wiring

.github/
└── workflows/
    └── infra-ci.yml                     # GitHub Actions: install, unit tests, `pulumi preview` per env

azure-pipelines-infra.yml                # Azure DevOps equivalent (preview on PR, up on main-gated) — optional mirror
```

**Structure Decision**: A new top-level `infra/` folder holds the Pulumi TypeScript program, matching the repository's convention of one top-level folder per concern (`dotnet/`, `rust-flutter/`, and now `infra/`). The program is decomposed into small component modules under `src/` (network, database, key vault, container env, backend, keycloak, front door, outputs) so each Azure concern is independently testable and reviewable; `index.ts` wires them and exports outputs. Multi-environment support uses Pulumi stacks (`dev`/`staging`/`prod`) whose config/secrets are supplied by Pulumi ESC, keeping one program with per-stack parameters (FR-007/FR-008). Project tooling lives at the `infra/` root (`vitest.config.ts`, `.eslintrc.cjs`, `.prettierrc`, `.gitignore`, and a `README.md` mirroring [quickstart.md](./quickstart.md)). CI lives at the conventional locations (`.github/workflows/` for GitHub Actions; an optional repo-root `azure-pipelines-infra.yml` mirror) and runs mock-based unit tests plus `pulumi preview` as the pre-apply gate.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New technology surface (Pulumi + TypeScript + Azure IaC) beyond the constitution's mandated .NET/C# stack | The product owner explicitly requested Pulumi/TypeScript IaC for this feature; it is the platform prerequisite for deploying the approved Rust/Flutter backend (feature 002) and the chosen Keycloak IdP to Azure | Hand-clicking the Azure portal or ad-hoc scripts would violate reproducibility/idempotency/teardown requirements (FR-005/FR-010) and the "no manual portal steps" requirement (FR-001); using .NET-based IaC (e.g., Pulumi C#) was rejected because TypeScript was explicitly requested |
| Additional isolated top-level project folder (`infra/`) | Keeps IaC lifecycle, dependencies (Node/Pulumi), and CI separate from the app stacks and touches no application code (FR-016) | Embedding IaC inside `rust-flutter/` would couple unrelated toolchains (Node vs Cargo/Flutter) and blur ownership; a separate folder mirrors the existing per-stack layout |
