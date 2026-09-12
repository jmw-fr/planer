# Phase 1 Data Model: IaC for Backend & Keycloak on Azure

**Feature**: 003-iac-backend-keycloak-pulumi | **Date**: 2026-09-12

For an IaC project the "data model" is the graph of infrastructure resources and the typed configuration that drives them. Entities below map the spec's Key Entities ([spec.md](./spec.md)) to concrete Azure resources and Pulumi component modules.

## Configuration entities (inputs)

### EnvironmentConfig (per stack: dev | staging | prod)

Typed config resolved from Pulumi ESC / stack config. Consumed by `src/config.ts`.

| Field | Type | Notes / Validation |
|-------|------|--------------------|
| `environment` | `"dev" \| "staging" \| "prod"` | Selects behavior (e.g., Private Link vs locked public origin). |
| `location` | string (Azure region) | Required. |
| `resourceGroupName` | string | Derived from a naming convention if not set. |
| `backend.image` | string (container ref) | Backend container image + tag. |
| `backend.cpu` / `backend.memory` | number / string | Container App sizing. |
| `backend.minReplicas` / `backend.maxReplicas` | number | `min >= 0`, `max >= min`. |
| `keycloak.image` | string | Keycloak container image + tag. |
| `keycloak.cpu` / `keycloak.memory` | number / string | Sizing. |
| `keycloak.hostname` | string | Front Door route host for the IdP (path/host on the Front Door endpoint); NOT a customer-owned custom domain (custom domains out of scope). |
| `postgres.sku` | string | Flexible Server SKU (per-env sizing). |
| `postgres.storageGb` | number | `>= 32`. |
| `frontDoor.originMode` | `"privateLink" \| "lockedPublic"` | `privateLink` required for prod; `lockedPublic` allowed for dev/staging. |
| `frontDoor.wafMode` | `"Prevention" \| "Detection"` | Default `Prevention` for prod, `Detection` otherwise. |
| `tags` | map<string,string> | Common tags applied to all resources. |

**Validation rules**:
- If `environment == "prod"` then `frontDoor.originMode` MUST be `privateLink` and `frontDoor.wafMode` MUST be `Prevention` (enforced in `config.ts`).
- Secrets (DB passwords, Keycloak admin password) are NOT part of `EnvironmentConfig`; they are ESC secrets materialized into Key Vault (never plaintext in config/outputs).

## Resource entities (provisioned) & relationships

### Environment (Stack)
- Root aggregate. One Pulumi stack ⇒ one Resource Group holding all resources below.
- Relationships: **contains** every resource entity; isolated from other stacks (FR-007/SC-007).

### Network
- **VirtualNetwork** with subnets: `containerapps` (delegated to Container Apps env), `postgres` (delegated to Flexible Server), `privatelink` (private endpoints for prod Front Door origins + Key Vault).
- **PrivateDnsZones**: `privatelink.postgres.database.azure.com`, `privatelink.vaultcore.azure.net` (+ VNet links).
- Relationships: **hosts** the Container Apps environment, both databases, and private endpoints.

### Observability
- **LogAnalyticsWorkspace** + diagnostic settings.
- Relationships: **receives** logs from Container Apps env and Front Door/WAF.

### SecretStore (Key Vault)
- **KeyVault** (RBAC authorization, purge protection on for prod).
- **Secrets**: `backend-db-connection`, `keycloak-db-connection`, `keycloak-admin-password`, `keycloak-db-password`, service secrets — values sourced from ESC.
- Relationships: **read by** backend and Keycloak managed identities (Key Vault Secrets User); **populated from** ESC.

### BackendRuntime
- **PostgresFlexibleServer** `backend-db` (private access, `publicNetworkAccess=Disabled`) + **Database**.
- **ContainerApp** `backend` (internal ingress) + **UserAssignedIdentity**.
- Relationships: app **reads secrets from** Key Vault; app **connects to** `backend-db` over the private subnet; app is an **origin of** Front Door.

### IdentityProvider (Keycloak)
- **PostgresFlexibleServer** `keycloak-db` (private access) + **Database**.
- **ContainerApp** `keycloak` (internal ingress, exposes OIDC discovery) + **UserAssignedIdentity**.
- Relationships: same pattern as BackendRuntime; **exposes** OIDC issuer via Front Door (FR-013/SC-008).

### PublicEntryPoint (Front Door)
- **FrontDoorProfile (Premium)** + **Endpoint**.
- **OriginGroups/Origins**: backend + keycloak. prod ⇒ Private Link origins (with **PrivateLinkService/PrivateEndpoint** approval); dev/staging ⇒ public origin locked by service tag + `X-Azure-FDID`.
- **Routes**: path/host routing to backend and Keycloak origins.
- **WafPolicy** (managed default rule set; mode per `frontDoor.wafMode`) associated via **SecurityPolicy**.
- Relationships: **only public ingress** (FR-017); **routes to** both Container Apps; **protected by** WAF.

## State transitions (operations)

| Operation | Precondition | Result |
|-----------|-------------|--------|
| `pulumi preview` | valid config/creds | Reports add/change/delete diff, no mutation (FR-006). |
| `pulumi up` (fresh) | empty target | All entities created, healthy, outputs exported (US1/US2, SC-001). |
| `pulumi up` (no change) | existing stack | Zero diffs (idempotent, FR-005/SC-003). |
| `pulumi up` (config change) | existing stack | Only affected resources updated (US3). |
| `pulumi destroy` | existing stack | All entities removed, no orphans (FR-010/SC-005). |
| partial failure | mid-apply error | Re-runnable state, surfaced error (FR-012). |

## Outputs (exported) — see [contracts/stack-outputs.md](./contracts/stack-outputs.md)

Non-secret references only: Front Door endpoint hostname, backend public URL (via Front Door), Keycloak base URL / OIDC issuer, resource group name, Key Vault name/URI (not secret values), Container App names.
