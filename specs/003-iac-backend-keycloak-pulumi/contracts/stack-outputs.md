# Contract: Stack Outputs

**Feature**: 003-iac-backend-keycloak-pulumi

The Pulumi program MUST export the following stack outputs from `index.ts`. These are the machine-readable interface downstream deployment steps consume (FR-009). **No output may contain a secret value** (FR-004/SC-006) — secrets stay in Key Vault; outputs only reference them by name/URI.

| Output name | Type | Secret? | Description |
|-------------|------|---------|-------------|
| `resourceGroupName` | string | no | Name of the environment's resource group. |
| `frontDoorEndpointHostname` | string | no | Front Door endpoint hostname (the only public entry point). |
| `backendUrl` | string | no | Public HTTPS URL of the backend API served through Front Door. |
| `keycloakBaseUrl` | string | no | Public HTTPS base URL of Keycloak served through Front Door. |
| `keycloakIssuerUrl` | string | no | OIDC issuer URL (base + realm path) for the backend to validate tokens. |
| `keyVaultName` | string | no | Name of the environment's Key Vault (values NOT exported). |
| `keyVaultUri` | string | no | Key Vault URI for managed-identity secret reads. |
| `backendContainerAppName` | string | no | Name of the backend Container App (for downstream image updates). |
| `keycloakContainerAppName` | string | no | Name of the Keycloak Container App. |
| `logAnalyticsWorkspaceId` | string | no | Workspace ID for diagnostics wiring. |

## Contract tests (Phase 2 will implement)

- **C-OUT-1**: Every output above is present and non-empty after `pulumi up`.
- **C-OUT-2**: No exported output value equals or contains any provisioned secret (DB password, Keycloak admin password) — asserted via unit test on the output map (SC-006).
- **C-OUT-3**: `keycloakIssuerUrl` resolves through Front Door (not a direct origin hostname) and returns valid OIDC discovery metadata after deploy (SC-008).
