# Planer Infrastructure (Pulumi / TypeScript / Azure)

Infrastructure-as-Code for the Planer Sport backend and the Keycloak identity
provider on Azure. See the design docs under
`specs/003-iac-backend-keycloak-pulumi/` ([plan](../specs/003-iac-backend-keycloak-pulumi/plan.md),
[quickstart](../specs/003-iac-backend-keycloak-pulumi/quickstart.md)).

## What this provisions

Per environment (`dev` / `staging` / `prod`), a single `pulumi up` creates:

- A resource group, VNet with private subnets, and private DNS zones.
- Two Azure Database for PostgreSQL Flexible Servers (backend + Keycloak), **private access only**.
- An **internal** Azure Container Apps environment with the backend and Keycloak apps.
- An Azure Key Vault holding runtime secrets, read via **managed identity**.
- Azure **Front Door Premium** + **WAF** as the single public entry point.
- A Log Analytics workspace for diagnostics.

Production uses Front Door **Private Link** origins (fully private); dev/staging use a
locked-down public origin restricted to Front Door.

## Prerequisites

- Node.js 20 LTS and the Pulumi CLI (`pulumi version` >= 3.x).
- Logged in to the Pulumi Cloud backend: `pulumi login`.
- A Pulumi ESC environment per stack (`planer-infra-dev`, `-staging`, `-prod`) holding
  config + secrets (`backendDbPassword`, `keycloakDbPassword`, `keycloakAdminPassword`).
- Azure credentials with rights to create the resources (`az login` locally, or OIDC in CI).
- Install dependencies: `npm ci`.

State is stored in the **Pulumi Cloud** managed backend with per-stack locking, which
protects against concurrent conflicting modifications.

## Common commands

```bash
cd infra
npm ci

# Validate (lint, typecheck, unit/contract tests)
npm run lint && npm run build && npm test

# Select or create a stack
pulumi stack select dev   # or: pulumi stack init dev

# Preview changes (no mutation)
pulumi preview

# Provision / update
pulumi up

# Inspect outputs (non-secret only)
pulumi stack output

# Tear down (removes 100% of the stack's resources)
pulumi destroy
```

## Day-2 operations

- **Preview → up → destroy** is the standard flow; `pulumi preview` is the pre-apply
  gate enforced in CI (`.github/workflows/infra-ci.yml`).
- **Idempotency**: re-running `pulumi up` with no config change makes no resource changes.
- **Partial failure**: if an operation fails midway, fix the cause and re-run
  `pulumi up` — the operation resumes toward the desired state without silent partial
  success. `pulumi refresh` can reconcile drift before re-running.
- **Secret rotation**: update the secret in Key Vault (via ESC); Container Apps pick up
  the new value without a full redeploy. Never commit secrets to source control.

## Multiple environments

Each stack has its own `Pulumi.<stack>.yaml` linked to its ESC environment. Environments
are fully isolated (separate resource groups, secrets, and state). Production is enforced
in `src/config.ts` to use `privateLink` origins and `Prevention` WAF mode.
