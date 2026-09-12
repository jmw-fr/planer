# Phase 0 Research: IaC for Backend & Keycloak on Azure (Pulumi/TypeScript)

**Feature**: 003-iac-backend-keycloak-pulumi | **Date**: 2026-09-12

This document records the technical decisions that resolve the plan's Technical Context. Fixed constraints (Azure, Pulumi, TypeScript, Keycloak) come from the feature request and the clarification session in [spec.md](./spec.md); the remaining choices are resolved below.

## D1. IaC tool & language

- **Decision**: Pulumi 3.x with TypeScript (Node.js 20 LTS), using the `@pulumi/azure-native` provider.
- **Rationale**: Explicitly requested. `azure-native` maps 1:1 to Azure Resource Manager (full/day-0 resource coverage) versus the classic `@pulumi/azure` (Terraform-based) provider. TypeScript gives typed config and unit-testable components.
- **Alternatives considered**: Bicep/ARM (Azure-native but not Pulumi, not requested); Terraform (not requested); Pulumi C#/Python (language not requested); `@pulumi/azure` classic provider (slower to get new resource properties, rejected in favor of `azure-native`).

## D2. State backend & concurrency

- **Decision**: Pulumi Cloud managed backend, one stack per environment (`dev`/`staging`/`prod`), relying on Pulumi's built-in per-stack state locking.
- **Rationale**: Clarified in the spec session. Managed backend removes the need to bootstrap/secure a self-managed store and provides locking to satisfy FR-011. Pairs natively with Pulumi ESC.
- **Alternatives considered**: Self-managed Azure Blob backend (more setup, must secure/lock manually) — rejected per clarification; local state (no locking, unsafe for teams).

## D3. Configuration & secrets management

- **Decision**: Pulumi ESC (Environments, Secrets, and Configuration) is the source of truth for per-environment config and secrets; the Pulumi program imports the matching ESC environment per stack.
- **Rationale**: Clarified in the spec session. Centralizes config/secrets outside source control and brokers them to the program and to Azure Key Vault (FR-004/FR-020).
- **Alternatives considered**: Plain `Pulumi.<stack>.yaml` encrypted secrets only (works but no central brokering/rotation story); committing config (violates FR-004).

## D4. Runtime secret store

- **Decision**: One Azure Key Vault per environment holds runtime secrets (DB credentials, Keycloak admin credentials, service secrets). Pulumi ESC populates Key Vault; Container Apps read secrets via a user-assigned managed identity with an RBAC "Key Vault Secrets User" role.
- **Rationale**: Clarified (Option A). Keeps secrets in-tenant, supports rotation without redeploy (FR-021/SC-006), Azure-native managed-identity access (no secrets in images).
- **Alternatives considered**: ESC-injected env vars only (rotation needs redeploy) — rejected; access via access-policies instead of RBAC — RBAC preferred for least-privilege and auditability.

## D5. Compute for backend & Keycloak

- **Decision**: Azure Container Apps in a single **internal** Container Apps managed environment (VNet-injected), one app for the backend and one for Keycloak, each with **internal ingress** only.
- **Rationale**: Both workloads are already containerized; Container Apps gives managed scaling, revisions, health probes, and VNet integration without operating Kubernetes. Internal ingress keeps origins off the public internet (FR-018).
- **Alternatives considered**: AKS (heavier ops, over-scoped); Azure Container Instances (no built-in ingress/scaling/Private Link story); App Service (less suited to the Keycloak container + internal-only topology).

## D6. Databases

- **Decision**: Two Azure Database for PostgreSQL **Flexible Server** instances (backend, Keycloak), deployed with **private access (VNet integration)** and public network access disabled; connectivity via a delegated subnet + private DNS zone.
- **Rationale**: Managed Postgres matching the app's storage choice; private access satisfies FR-015 (databases never publicly reachable). Separate servers keep blast radius and credentials isolated per the spec's "dedicated database" requirements (FR-003).
- **Alternatives considered**: Single shared server with two databases (weaker isolation); public access + firewall rules (violates FR-015).

## D7. Public entry point & origin lockdown (hybrid)

- **Decision**: Azure **Front Door Premium** is the only public ingress for both services.
  - **Production**: Front Door reaches each Container App over **Private Link** (Private Endpoint approval); origins have no public endpoint.
  - **Dev/staging**: Container Apps use a technically-public internal-environment endpoint, but ingress is restricted to Front Door only via the `AzureFrontDoor.Backend` service tag plus mandatory validation of the `X-Azure-FDID` header (requests without the correct Front Door ID are rejected).
- **Rationale**: Clarified (Option C). Premium is required for Private Link origins; the dev/staging lockdown avoids Private Link cost while still denying direct access (FR-017/FR-018/FR-019).
- **Alternatives considered**: Application Gateway + WAF (regional, no global anycast/Private Link-to-Container-Apps story as clean); Private Link everywhere (higher cost for non-prod, rejected per clarification).

## D8. Web Application Firewall (WAF)

- **Decision**: Attach an Azure Front Door **WAF policy** using the Azure-managed default rule set. **Prevention (blocking)** mode in production; **Detection (log-only)** mode in dev/staging (mode is a per-environment config value).
- **Rationale**: "Secure them behind Front Door" implies a WAF; blocking in prod matches the GDPR/health-data posture, while log-only in non-prod avoids blocking during development. Confirmed in the [spec.md](./spec.md) clarification session and captured as FR-022/SC-010; the mode is a per-environment config value.
- **Alternatives considered**: Prevention everywhere (risk of blocking dev traffic); no WAF (weakens the "secure them" intent) — both rejected as defaults but reachable via config.

## D9. Observability

- **Decision**: Provision a Log Analytics workspace per environment; wire Container Apps environment logs and Front Door/WAF diagnostics to it.
- **Rationale**: Satisfies the constitution's Observability principle and gives visibility into WAF blocks and container health from day one.
- **Alternatives considered**: No centralized logging (rejected — violates Observability principle).

## D10. Identity/RBAC for provisioning & runtime

- **Decision**: Provisioning uses an Azure service principal (or OIDC federated credential in CI) supplied out-of-band. Runtime uses **user-assigned managed identities** for the backend and Keycloak Container Apps, granted least-privilege Key Vault RBAC.
- **Rationale**: Separates deploy-time from run-time identity; managed identities avoid runtime secrets for Key Vault access (FR-020). CI OIDC avoids storing cloud credentials in the pipeline.
- **Alternatives considered**: Single shared identity (violates least-privilege); system-assigned identity (harder to pre-grant RBAC before the app exists).

## D11. Testing strategy

- **Decision**: Mock-based Pulumi unit tests (`@pulumi/pulumi` runtime mocks) executed with `vitest`, asserting security-critical properties: DBs have `publicNetworkAccess = Disabled`; Container Apps ingress is internal/locked; Front Door WAF is attached; no plaintext secret appears in exported outputs. `pulumi preview` runs in CI as an integration gate; an optional ephemeral `pulumi up`/`pulumi destroy` on a throwaway dev stack validates end-to-end and clean teardown (SC-005).
- **Rationale**: Fast property tests catch regressions on the non-public/secret invariants (the highest-risk requirements) without deploying; preview gates drift.
- **Alternatives considered**: Only manual verification (not repeatable); full deploy on every PR (slow/costly) — reserved for the ephemeral optional job.

## Resolved unknowns

All Technical Context items are resolved; no `NEEDS CLARIFICATION` markers remain. The WAF-mode decision (D8) is confirmed via the spec clarification session (FR-022/SC-010) and parameterized per environment.
