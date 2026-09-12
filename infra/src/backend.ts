import * as pulumi from "@pulumi/pulumi";
import * as app from "@pulumi/azure-native/app";
import * as managedidentity from "@pulumi/azure-native/managedidentity";
import { EnvironmentConfig } from "./config";
import { KeyVault } from "./keyVault";

export interface BackendArgs {
  managedEnvironmentId: pulumi.Input<string>;
  keyVault: KeyVault;
  dbConnectionString: pulumi.Output<string>;
}

export interface BackendResult {
  identity: managedidentity.UserAssignedIdentity;
  app: app.ContainerApp;
  appFqdn: pulumi.Output<string>;
}

/**
 * Backend Container App with internal ingress only. Its DB connection string is
 * stored in Key Vault and read at runtime via a user-assigned managed identity
 * (no secrets baked into the image, FR-020).
 */
export function createBackend(
  config: EnvironmentConfig,
  resourceGroupName: pulumi.Input<string>,
  args: BackendArgs,
): BackendResult {
  const identity = new managedidentity.UserAssignedIdentity("id-backend", {
    resourceGroupName,
    location: config.location,
    tags: config.tags,
  });

  args.keyVault.grantSecretsRead("backend", identity.principalId);
  const dbSecretRef = args.keyVault.addSecret("backend-db-connection", args.dbConnectionString);

  const containerApp = new app.ContainerApp("ca-backend", {
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
      secrets: [{ name: "db-connection", keyVaultUrl: dbSecretRef, identity: identity.id }],
    },
    template: {
      containers: [
        {
          name: "backend",
          image: config.backend.image,
          resources: { cpu: config.backend.cpu, memory: config.backend.memory },
          env: [{ name: "DATABASE_URL", secretRef: "db-connection" }],
        },
      ],
      scale: { minReplicas: config.backend.minReplicas, maxReplicas: config.backend.maxReplicas },
    },
    tags: config.tags,
  });

  const appFqdn = containerApp.configuration.apply((c) => c?.ingress?.fqdn ?? "");
  return { identity, app: containerApp, appFqdn };
}
