# Quickstart: Provision & Validate the Backend + Keycloak Environment

**Feature**: 003-iac-backend-keycloak-pulumi | **Date**: 2026-09-12

This guide validates the infrastructure end-to-end. It references the design in [plan.md](./plan.md), [data-model.md](./data-model.md), and the [contracts](./contracts/). It is a run/validation guide — implementation lives in `infra/` and `tasks.md`.

## Prerequisites

- Node.js 20 LTS and the Pulumi CLI (`pulumi version` ≥ 3.x).
- Logged in to the Pulumi Cloud backend (`pulumi login`) and to the Pulumi ESC environment for the target stack.
- Azure credentials with rights to create the resources (a service principal locally, or OIDC federation in CI). `az login` or `ARM_*`/service-principal env vars set.
- From the repo root: `cd infra && npm ci`.

## 1. Preview a fresh environment (no changes applied)

```bash
cd infra
pulumi stack select dev            # or: pulumi stack init dev
pulumi preview
```

**Expected**: A plan listing resources to be **created** (resource group, VNet/subnets, 2× PostgreSQL Flexible Servers, Key Vault, Container Apps env, backend + keycloak apps, Front Door + WAF, Log Analytics). No resource is created (FR-006).

## 2. Provision the environment

```bash
pulumi up --yes
```

**Expected** (SC-001, SC-002 — under 30 min):
- All resources reach a healthy state; command exits 0.
- Stack outputs printed match [contracts/stack-outputs.md](./contracts/stack-outputs.md): `frontDoorEndpointHostname`, `backendUrl`, `keycloakBaseUrl`, `keycloakIssuerUrl`, `keyVaultName`, etc.
- No secret value appears in the output (SC-006).

## 3. Verify Front Door is the only public entry point

```bash
# Through Front Door → succeeds
curl -sf "$(pulumi stack output backendUrl)/health"

# Keycloak OIDC discovery through Front Door → returns issuer metadata (SC-008)
curl -sf "$(pulumi stack output keycloakIssuerUrl)/.well-known/openid-configuration"
```

**Expected**: Both succeed via Front Door. A direct request to a backend/Keycloak origin hostname (bypassing Front Door) is **refused/blocked** (SC-009, FR-019). In prod the origins have no public endpoint at all; in dev/staging the origin rejects requests lacking the correct `X-Azure-FDID`.

## 4. Verify databases are not public

Confirm each PostgreSQL Flexible Server reports `publicNetworkAccess = Disabled` and has no allow-all firewall rule (FR-015). This is also asserted by the `network.test.ts` unit test.

## 5. Verify secrets are in Key Vault (not in outputs/repo)

- `keyVaultName`/`keyVaultUri` are exported, but no secret **value** is (SC-006).
- Container Apps read secrets via managed identity (Key Vault Secrets User) — see [data-model.md](./data-model.md).

## 6. Idempotency check

```bash
pulumi up --yes
```

**Expected**: Zero resource changes (FR-005/SC-003).

## 7. Multi-environment isolation (optional)

```bash
pulumi stack select prod && pulumi up --yes
```

**Expected**: A separate, isolated resource set; changing dev config does not alter prod (SC-007). prod enforces Private Link origins + WAF Prevention (contract C-CFG-2).

## 8. Teardown

```bash
pulumi stack select dev
pulumi destroy --yes
```

**Expected**: 100% of the environment's resources removed, no orphans (FR-010/SC-005).

## Automated checks

- `npm test` in `infra/` runs mock-based unit tests: DBs not public, Front Door sole ingress + WAF attached, no plaintext secrets in outputs (see [contracts](./contracts/)).
- CI runs `npm ci`, `npm test`, and `pulumi preview` per environment as the pre-apply gate (FR-014).
