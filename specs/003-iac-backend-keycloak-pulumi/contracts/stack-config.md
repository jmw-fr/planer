# Contract: Stack Configuration (Inputs)

**Feature**: 003-iac-backend-keycloak-pulumi

Per-environment inputs the Pulumi program reads from Pulumi ESC / stack config. This is the configuration interface an operator sets before `pulumi up`. Secrets are supplied via ESC (materialized into Key Vault) and are **never** committed in `Pulumi.<stack>.yaml`.

## Non-secret config keys

| Key | Type | Required | Default | Constraint |
|-----|------|----------|---------|-----------|
| `environment` | enum(dev,staging,prod) | yes | — | Drives origin/WAF mode rules. |
| `location` | string | yes | — | Valid Azure region. |
| `resourceGroupName` | string | no | derived | — |
| `backend:image` | string | yes | — | Container image ref. |
| `backend:cpu` | number | no | 0.5 | > 0 |
| `backend:memory` | string | no | `1Gi` | — |
| `backend:minReplicas` | number | no | 1 | ≥ 0 |
| `backend:maxReplicas` | number | no | 3 | ≥ minReplicas |
| `keycloak:image` | string | yes | — | Container image ref. |
| `keycloak:cpu` | number | no | 0.5 | > 0 |
| `keycloak:memory` | string | no | `1Gi` | — |
| `keycloak:hostname` | string | yes | — | Front Door route host for the IdP (path/host on the Front Door endpoint); not a customer custom domain. |
| `postgres:sku` | string | no | env-specific | Valid Flexible Server SKU. |
| `postgres:storageGb` | number | no | 32 | ≥ 32 |
| `frontDoor:originMode` | enum(privateLink,lockedPublic) | no | prod⇒privateLink, else lockedPublic | prod MUST be privateLink. |
| `frontDoor:wafMode` | enum(Prevention,Detection) | no | prod⇒Prevention, else Detection | prod MUST be Prevention. |
| `tags` | map | no | `{}` | — |

## Secret config keys (via ESC → Key Vault, never plaintext in repo)

| Key | Description |
|-----|-------------|
| `backend:dbPassword` | Backend PostgreSQL admin/app password. |
| `keycloak:dbPassword` | Keycloak PostgreSQL password. |
| `keycloak:adminPassword` | Keycloak bootstrap admin password. |

## Contract tests (Phase 2 will implement)

- **C-CFG-1**: Missing a required key fails fast with an actionable error before any resource is created (edge case: invalid/missing config).
- **C-CFG-2**: `environment=prod` with `frontDoor:originMode=lockedPublic` or `frontDoor:wafMode=Detection` is rejected at config-validation time (enforces FR-018/D8 prod rules).
- **C-CFG-3**: Secret keys never appear in `Pulumi.<stack>.yaml` in plaintext; a lint/unit check asserts config files contain no plaintext secret values (SC-006).
