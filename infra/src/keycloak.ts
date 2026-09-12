import * as pulumi from "@pulumi/pulumi";
import * as app from "@pulumi/azure-native/app";
import * as managedidentity from "@pulumi/azure-native/managedidentity";
import { EnvironmentConfig } from "./config";
import { KeyVault } from "./keyVault";

export interface KeycloakArgs {
  managedEnvironmentId: pulumi.Input<string>;
  keyVault: KeyVault;
  dbConnectionString: pulumi.Output<string>;
  adminPassword: pulumi.Output<string>;
}

export interface KeycloakResult {
  identity: managedidentity.UserAssignedIdentity;
  app: app.ContainerApp;
  appFqdn: pulumi.Output<string>;
}

/**
 * Keycloak Container App with internal ingress only. DB connection and admin
 * password come from Key Vault via a managed identity; the OIDC issuer is served
 * publicly only through Front Door (FR-013).
 */
export function createKeycloak(
  config: EnvironmentConfig,
  resourceGroupName: pulumi.Input<string>,
  args: KeycloakArgs,
): KeycloakResult {
  const identity = new managedidentity.UserAssignedIdentity("id-keycloak", {
    resourceGroupName,
    location: config.location,
    tags: config.tags,
  });

  args.keyVault.grantSecretsRead("keycloak", identity.principalId);
  const dbSecretRef = args.keyVault.addSecret("keycloak-db-connection", args.dbConnectionString);
  const adminSecretRef = args.keyVault.addSecret("keycloak-admin-password", args.adminPassword);

  const containerApp = new app.ContainerApp("ca-keycloak", {
    resourceGroupName,
    location: config.location,
    managedEnvironmentId: args.managedEnvironmentId,
    identity: {
      type: app.ManagedServiceIdentityType.UserAssigned,
      userAssignedIdentities: [identity.id],
    },
    configuration: {
      activeRevisionsMode: app.ActiveRevisionsMode.Single,
      ingress: {
        // lockedPublic (dev/staging): public FQDN reachable by Front Door only;
        // privateLink (prod): internal ingress reached via Front Door Private Link.
        external: config.frontDoor.originMode === "lockedPublic",
        targetPort: 8080,
        transport: app.IngressTransportMethod.Http,
        allowInsecure: false,
      },
      secrets: [
        { name: "db-url", keyVaultUrl: dbSecretRef, identity: identity.id },
        { name: "admin-password", keyVaultUrl: adminSecretRef, identity: identity.id },
      ],
    },
    template: {
      containers: [
        {
          name: "keycloak",
          image: config.keycloak.image,
          resources: { cpu: config.keycloak.cpu, memory: config.keycloak.memory },
          args: ["start", "--optimized"],
          env: [
            { name: "KC_DB", value: "postgres" },
            { name: "KC_DB_URL", secretRef: "db-url" },
            { name: "KC_HEALTH_ENABLED", value: "true" },
            { name: "KC_PROXY_HEADERS", value: "xforwarded" },
            { name: "KC_HTTP_ENABLED", value: "true" },
            // Hostname is fronted by Front Door; avoid a dependency cycle by not
            // strictly pinning it here (Front Door forwards the host headers).
            { name: "KC_HOSTNAME_STRICT", value: "false" },
            { name: "KEYCLOAK_ADMIN", value: "admin" },
            { name: "KEYCLOAK_ADMIN_PASSWORD", secretRef: "admin-password" },
          ],
        },
      ],
      scale: { minReplicas: 1, maxReplicas: 2 },
    },
    tags: config.tags,
  });

  const appFqdn = containerApp.configuration.apply((c) => c?.ingress?.fqdn ?? "");
  return { identity, app: containerApp, appFqdn };
}
