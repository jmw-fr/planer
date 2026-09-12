import * as pulumi from "@pulumi/pulumi";
import * as authorization from "@pulumi/azure-native/authorization";
import * as keyvault from "@pulumi/azure-native/keyvault";
import * as network from "@pulumi/azure-native/network";
import { EnvironmentConfig } from "./config";

// Built-in role: "Key Vault Secrets User" (read secret values).
const KEY_VAULT_SECRETS_USER = "4633458b-17de-408a-b874-0445c86b69e6";

export interface KeyVault {
  vault: keyvault.Vault;
  vaultName: pulumi.Output<string>;
  vaultUri: pulumi.Output<string>;
  /** Store a secret value in the vault and return its versionless reference URI. */
  addSecret(logicalName: string, value: pulumi.Input<string>): pulumi.Output<string>;
  /** Grant a managed-identity principal read access to secrets (least privilege). */
  grantSecretsRead(logicalName: string, principalId: pulumi.Input<string>): void;
}

export function createKeyVault(
  config: EnvironmentConfig,
  resourceGroupName: pulumi.Input<string>,
  privateLinkSubnetId: pulumi.Input<string>,
  keyVaultDnsZoneId: pulumi.Input<string>,
): KeyVault {
  const clientConfig = authorization.getClientConfigOutput();
  const isProd = config.environment === "prod";

  // Key Vault names are globally unique and <= 24 chars.
  const vault = new keyvault.Vault("kv", {
    resourceGroupName,
    location: config.location,
    properties: {
      tenantId: clientConfig.tenantId,
      sku: { family: keyvault.SkuFamily.A, name: keyvault.SkuName.Standard },
      enableRbacAuthorization: true,
      enableSoftDelete: true,
      softDeleteRetentionInDays: 7,
      // Purge protection cannot be set back to false; only enable it for prod.
      enablePurgeProtection: isProd ? true : undefined,
      publicNetworkAccess: "Disabled",
      networkAcls: {
        bypass: keyvault.NetworkRuleBypassOptions.AzureServices,
        defaultAction: keyvault.NetworkRuleAction.Deny,
      },
    },
    tags: config.tags,
  });

  // Private endpoint so the vault is reachable only from within the VNet.
  const pe = new network.PrivateEndpoint("pe-kv", {
    resourceGroupName,
    location: config.location,
    subnet: { id: privateLinkSubnetId },
    privateLinkServiceConnections: [
      {
        name: "kv",
        privateLinkServiceId: vault.id,
        groupIds: ["vault"],
      },
    ],
    tags: config.tags,
  });
  new network.PrivateDnsZoneGroup("pdzg-kv", {
    resourceGroupName,
    privateEndpointName: pe.name,
    privateDnsZoneGroupName: "default",
    privateDnsZoneConfigs: [{ name: "vault", privateDnsZoneId: keyVaultDnsZoneId }],
  });

  const vaultName = vault.name;
  const vaultUri = vault.properties.apply((p) => p.vaultUri);

  const addSecret = (logicalName: string, value: pulumi.Input<string>): pulumi.Output<string> => {
    const secret = new keyvault.Secret(`secret-${logicalName}`, {
      resourceGroupName,
      vaultName,
      secretName: logicalName,
      properties: { value },
    });
    // Versionless Key Vault reference URI (never exposes the secret value).
    return pulumi.interpolate`${vaultUri}secrets/${secret.name}`;
  };

  const grantSecretsRead = (logicalName: string, principalId: pulumi.Input<string>): void => {
    new authorization.RoleAssignment(`ra-kv-${logicalName}`, {
      scope: vault.id,
      principalId,
      principalType: authorization.PrincipalType.ServicePrincipal,
      roleDefinitionId: pulumi.interpolate`/subscriptions/${clientConfig.subscriptionId}/providers/Microsoft.Authorization/roleDefinitions/${KEY_VAULT_SECRETS_USER}`,
    });
  };

  return { vault, vaultName, vaultUri, addSecret, grantSecretsRead };
}
