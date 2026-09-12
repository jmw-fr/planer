# Feature Specification: Infrastructure-as-Code for Backend & Keycloak on Azure

**Feature Branch**: `003-iac-backend-keycloak-pulumi`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "Implement IAC for backend and KeyCloak using Pulumi and Azure as cloud provider. Use Typescript language"

## Clarifications

### Session 2026-09-12

- Q: How should Azure Front Door reach the backend and Keycloak given neither may be publicly reachable? → A: Hybrid — production uses Front Door Premium with Private Link to fully private origins (no public endpoint); dev/staging keep a technically-public origin whose inbound is restricted to Front Door only (Front Door service tag + `X-Azure-FDID` header validation).
- Q: How is per-environment infrastructure state, configuration, and secrets managed? → A: Use Pulumi ESC (Environments, Secrets, and Configuration) to manage per-environment configuration and secrets and to broker them to consumers, with the Pulumi Cloud service as the managed, locked state backend — instead of a self-managed Azure Blob state backend.
- Q: At runtime, how do the deployed backend and Keycloak containers obtain their secrets? → A: Provision an Azure Key Vault per environment as the runtime secret store; Pulumi ESC populates it, and containers read secrets via managed identity. Rotation happens in Key Vault (via ESC) without committing secrets or redeploying.
- Q: Should the public entry point enforce a Web Application Firewall, and in what mode? → A: Yes — Front Door enforces a WAF using the managed default rule set; blocking (Prevention) mode in production and log-only (Detection) mode in dev/staging, configurable per environment.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provision the backend runtime environment from code (Priority: P1)

A platform/DevOps engineer defines the cloud environment for the Rust/Axum backend entirely in code and provisions it with a single command, obtaining a running, network-reachable API environment (compute, managed PostgreSQL database, networking, and the secrets it needs) without performing any manual steps in the cloud portal.

**Why this priority**: Without a reproducible backend runtime, nothing else (including Keycloak integration) can be deployed or tested in the cloud. This is the minimum viable slice that delivers a usable, repeatable environment.

**Independent Test**: Run the provisioning workflow against an empty Azure subscription/resource group and confirm the backend compute service, PostgreSQL database, and required networking come up healthy, with connection details surfaced as outputs — all without touching the portal.

**Acceptance Scenarios**:

1. **Given** an empty target environment and valid cloud credentials, **When** the engineer runs the provisioning workflow, **Then** the backend compute service, managed PostgreSQL database, and supporting networking are created and reported as successfully provisioned.
2. **Given** a previously provisioned environment, **When** the engineer re-runs the same provisioning workflow with no configuration changes, **Then** no resources are recreated or modified (idempotent, no-op result).
3. **Given** a successful provision, **When** the engineer inspects the workflow outputs, **Then** the backend service URL and database connection reference are available as machine-readable outputs.

---

### User Story 2 - Provision and configure the Keycloak identity provider (Priority: P2)

A platform/DevOps engineer provisions a self-hosted Keycloak identity provider — including its dedicated database and the secrets/credentials it requires — as part of the same infrastructure definition, so the backend can validate tokens against a running IdP.

**Why this priority**: Authentication is a core cross-cutting requirement, but it depends on the backend runtime and networking from P1 already existing. Delivering it second keeps each slice independently deployable.

**Independent Test**: Provision the Keycloak component into an environment that already has the P1 backend runtime, then confirm Keycloak starts, is reachable at its published address, and exposes its OIDC discovery/metadata endpoint.

**Acceptance Scenarios**:

1. **Given** a provisioned backend environment, **When** the engineer provisions the Keycloak component, **Then** a Keycloak instance and its dedicated database are created and Keycloak reports healthy/ready.
2. **Given** a running Keycloak instance, **When** the engineer requests its published address, **Then** the OIDC discovery endpoint is reachable and returns issuer metadata.
3. **Given** Keycloak administrative and database credentials, **When** the environment is provisioned, **Then** those secrets are stored in the managed secret store and are never written to source control or plaintext outputs.

---

### User Story 3 - Manage multiple isolated environments (Priority: P3)

A platform/DevOps engineer provisions and maintains multiple named environments (e.g., development, staging, production) from the same code base, each with its own isolated configuration, secrets, and cloud resources, selecting the target environment at provision time.

**Why this priority**: Multiple environments are needed for a safe release path, but a single environment is enough to prove the tooling works. This extends P1/P2 rather than being a prerequisite.

**Independent Test**: Provision two differently named environments from the same code with different sizing/configuration values and confirm their resources are isolated (separately named, no shared state, independent secrets).

**Acceptance Scenarios**:

1. **Given** the same infrastructure definition, **When** the engineer selects a different target environment, **Then** a separate, isolated set of resources is provisioned without affecting other environments.
2. **Given** two provisioned environments, **When** the engineer changes configuration for one environment, **Then** only that environment's resources are updated and the others remain unchanged.

---

### User Story 4 - Preview, update, and safely tear down environments (Priority: P3)

A platform/DevOps engineer previews the exact changes an operation will make before applying them, applies incremental updates, and can fully tear down an environment so that no billable or orphaned resources remain.

**Why this priority**: Change-preview and clean teardown protect against accidental destruction and cost leakage, but the core value (provisioning) is already delivered by P1/P2. This hardens the day-2 operations experience.

**Independent Test**: Run a preview against an existing environment and confirm it lists intended additions/changes/deletions without applying them; then run teardown and confirm the environment's resource group/resources are removed.

**Acceptance Scenarios**:

1. **Given** a pending configuration change, **When** the engineer requests a preview, **Then** the workflow reports the resources to be added, changed, or removed without making any changes.
2. **Given** an existing environment that is no longer needed, **When** the engineer runs the teardown workflow, **Then** all resources created for that environment are removed and no orphaned resources remain.

---

### Edge Cases

- What happens when provisioning fails partway (e.g., the database is created but Keycloak fails to start)? The workflow MUST report the failure clearly and leave the environment in a state that can be safely re-run to completion or rolled back, without silent partial success.
- How does the system handle invalid or missing cloud credentials? Provisioning MUST fail fast with an actionable error and MUST NOT create partial resources.
- How does the system handle a name/quota/region conflict (e.g., a globally-unique resource name already taken, or a subscription quota exceeded)? The failure MUST be surfaced with the offending resource identified.
- What happens when two engineers run an operation against the same environment concurrently? The workflow MUST prevent conflicting concurrent modifications from corrupting environment state.
- How are secrets rotated? Updating a secret value in the runtime secret store MUST propagate to the consuming services without requiring secrets to be committed to source control or a full redeploy.
- What happens on teardown if a resource has deletion protection or an active dependency? The workflow MUST report which resource blocked teardown rather than leaving an inconsistent environment.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The infrastructure for the backend runtime and the Keycloak identity provider MUST be fully defined as version-controlled code, with no required manual configuration steps in the cloud provider portal.
- **FR-002**: A single provisioning workflow MUST create the backend compute service, a managed PostgreSQL database for the backend, and all supporting networking required for the backend to run and be reachable.
- **FR-003**: The provisioning workflow MUST create a self-hosted Keycloak identity provider together with its own dedicated database.
- **FR-004**: All sensitive values (database credentials, Keycloak admin credentials, service secrets) MUST be stored in a managed secret store and MUST NOT appear in source control, logs, or plaintext outputs.
- **FR-005**: Provisioning MUST be idempotent: re-running with unchanged configuration MUST result in no resource changes.
- **FR-006**: The workflow MUST support previewing the set of resource additions, changes, and deletions before any change is applied.
- **FR-007**: The workflow MUST support multiple isolated, independently-named environments (at minimum development and production) selectable at provision time, each with its own configuration and secrets.
- **FR-008**: Environment-specific configuration (e.g., resource sizing, region, scaling limits) MUST be parameterized so environments can differ without duplicating the infrastructure definition.
- **FR-009**: The workflow MUST expose machine-readable outputs including the backend service URL, the Keycloak base URL / OIDC issuer, and references to created resources needed by downstream deployment steps.
- **FR-010**: The workflow MUST support safe teardown of an environment such that all resources it created are removed and no orphaned or billable resources remain.
- **FR-011**: Infrastructure state MUST be persisted durably and protected against concurrent conflicting modifications so that team members cannot corrupt an environment by running operations simultaneously.
- **FR-012**: On partial failure, the workflow MUST report the failure clearly and leave the environment in a re-runnable, non-silently-partial state.
- **FR-013**: The Keycloak instance MUST expose a reachable OIDC discovery/metadata endpoint once provisioned, so the backend can validate tokens against it.
- **FR-014**: The infrastructure definition MUST be executable in an automated pipeline (unattended, using credentials from the environment) as well as by an engineer locally, producing equivalent results.
- **FR-015**: Networking MUST enforce least-privilege access: the backend database and the Keycloak database MUST NOT be publicly reachable, and only intended services/ports MUST be exposed publicly.
- **FR-016**: The scope of this feature is provisioning and configuring cloud infrastructure only; it MUST NOT include application business logic, and MUST leave the existing backend/frontend application code unchanged.
- **FR-017**: Azure Front Door MUST be the single public entry point for both the backend API and Keycloak; neither service MAY be directly reachable by clients bypassing Front Door.
- **FR-018**: In production, the backend and Keycloak origins MUST have no public endpoint and MUST be reachable only via Front Door over a private connection (Private Link). In dev/staging, origins MAY retain a technically-public endpoint but MUST reject any inbound traffic that does not originate from the environment's Front Door instance (validated via Front Door service tag and the `X-Azure-FDID` identifier header).
- **FR-019**: Any attempt to reach the backend or Keycloak directly (not through Front Door) MUST be denied in every environment.
- **FR-020**: Each environment MUST provision a dedicated managed secret store (Azure Key Vault) that holds runtime secrets; the backend and Keycloak MUST read their secrets from it using a managed identity, with no secrets embedded in images or committed configuration.
- **FR-021**: Rotating a secret in the runtime secret store MUST propagate to the consuming services without a full redeploy and without exposing the secret in source control, logs, or plaintext outputs.
- **FR-022**: The public entry point (Front Door) MUST enforce a Web Application Firewall using a managed default rule set. The WAF MUST run in blocking (Prevention) mode in production; non-production environments MAY run it in log-only (Detection) mode. The mode MUST be an environment-level configuration value.

### Key Entities *(include if feature involves data)*

- **Environment (Stack)**: A named, isolated instance of the full infrastructure (e.g., dev, staging, prod). Owns its own configuration values, secrets, resources, and state; is independently provisionable and destroyable.
- **Backend Runtime**: The compute service that hosts the backend API, plus its managed PostgreSQL database and networking; parameterized by environment (sizing, region, scale).
- **Identity Provider (Keycloak)**: The self-hosted Keycloak instance and its dedicated database; exposes an OIDC issuer/discovery endpoint and holds admin credentials in the secret store.
- **Secret Store**: The per-environment managed store (Azure Key Vault) holding all runtime sensitive values (DB credentials, Keycloak admin credentials, service secrets); populated from Pulumi ESC, consumed by the runtime services via managed identity, and never exposed in plaintext.
- **Infrastructure State**: The durable record of what resources exist for an environment, used to compute previews and updates and protected from concurrent modification; managed by the Pulumi Cloud state backend with per-environment locking.
- **Configuration Set**: The per-environment parameter values (region, sizing, scaling, feature toggles) that drive how resources are provisioned; sourced from Pulumi ESC environments.
- **Public Entry Point (Front Door)**: The Azure Front Door instance that is the only public ingress for the backend API and Keycloak; routes external traffic to otherwise-private/locked-down origins, enforces a Web Application Firewall (managed rule set), and is the single publicly-exposed surface.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A complete environment (backend runtime + PostgreSQL + Keycloak + Keycloak database + networking + secrets) can be provisioned from an empty target into a healthy, reachable state via a single workflow, with zero manual portal steps.
- **SC-002**: Provisioning a fresh environment from scratch completes in under 30 minutes.
- **SC-003**: Re-running provisioning with no configuration changes results in zero resource modifications (verified idempotency) 100% of the time.
- **SC-004**: An engineer new to the project can provision a working environment following the documented steps in under 1 hour, without needing tribal knowledge or manual portal configuration.
- **SC-005**: Tearing down an environment removes 100% of the resources it created, leaving no orphaned or billable resources.
- **SC-006**: No secret value ever appears in source control, workflow logs, or plaintext outputs across provisioning, update, and teardown operations.
- **SC-007**: Two or more named environments can coexist with fully isolated resources, configuration, and secrets, with a change to one environment causing no change to another.
- **SC-008**: After provisioning, the Keycloak OIDC discovery endpoint returns valid issuer metadata, confirming the identity provider is ready for the backend to validate tokens.
- **SC-009**: In every environment, a request sent directly to the backend or Keycloak origin (bypassing Front Door) is denied, while the same request through Front Door succeeds — confirming Front Door is the only usable public entry point.
- **SC-010**: In production, a request matching a WAF managed-rule signature is blocked at Front Door before reaching the backend or Keycloak, and the block is recorded in diagnostics.

## Assumptions

- The cloud provider is Microsoft Azure and the infrastructure is authored with Pulumi using TypeScript, as explicitly requested; these are fixed project constraints for this feature.
- The backend is the existing Rust/Axum service (containerized) from the `rust-flutter/backend` workspace; this feature provisions the environment to run it but does not modify its application code.
- Keycloak is deployed as a self-hosted container-based identity provider, consistent with the project's identity decision in [docs/Plan-Security-OAuth.md](../../docs/Plan-Security-OAuth.md) (Keycloak selected in section 6).
- Container-based Azure compute (e.g., Azure Container Apps) and Azure Database for PostgreSQL are the intended managed services, consistent with the Phase 1 plan; exact service selection is a planning/design detail.
- Infrastructure state is managed by the Pulumi Cloud service (managed backend) with per-environment state locking to satisfy the concurrency-protection requirement, keeping state out of source control.
- Per-environment configuration and secrets are managed with Pulumi ESC (Environments, Secrets, and Configuration) rather than committed configuration; ESC is the source of truth for config/secret values consumed by provisioning.
- Each environment provisions a dedicated Azure Key Vault as the runtime secret store; Pulumi ESC populates it and the backend/Keycloak containers read secrets via managed identity (no secrets baked into images).
- At least two environments (development and production) are required; staging is optional and enabled via the same parameterized definition.
- Cloud credentials with sufficient permissions to create the required resources are provided out-of-band (locally and in CI) and are not part of this feature's deliverables.
- Application deployment (pushing built container images and running database migrations) is a downstream concern; this feature provisions the platform and exposes the outputs those steps consume.
- DNS/custom-domain and TLS certificate management beyond provider-default endpoints is out of scope for the initial slice unless later prioritized. Backend and Keycloak are distinguished at Front Door by route (path/host on the Front Door endpoint), not by customer-owned custom domains.
- Azure Front Door is the sole public ingress for the backend and Keycloak. Production isolates origins fully via Front Door Premium + Private Link; dev/staging use a lower-cost locked-down public origin restricted to Front Door only. This refines the earlier "only intended services/ports exposed publicly" networking assumption: the only publicly-exposed surface is Front Door itself.
