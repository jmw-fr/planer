import * as pulumi from "@pulumi/pulumi";
import * as network from "@pulumi/azure-native/network";
import { EnvironmentConfig } from "./config";

export interface NetworkResources {
  vnet: network.VirtualNetwork;
  containerAppsSubnetId: pulumi.Output<string>;
  postgresSubnetId: pulumi.Output<string>;
  privateLinkSubnetId: pulumi.Output<string>;
  postgresDnsZoneId: pulumi.Output<string>;
  keyVaultDnsZoneId: pulumi.Output<string>;
}

const POSTGRES_DNS = "privatelink.postgres.database.azure.com";
const KEYVAULT_DNS = "privatelink.vaultcore.azure.net";

/**
 * VNet with dedicated subnets for Container Apps, PostgreSQL (delegated), and
 * private endpoints, plus private DNS zones so databases and Key Vault stay
 * off the public internet (FR-015).
 */
export function createNetwork(
  config: EnvironmentConfig,
  resourceGroupName: pulumi.Input<string>,
): NetworkResources {
  const vnet = new network.VirtualNetwork("vnet", {
    resourceGroupName,
    location: config.location,
    addressSpace: { addressPrefixes: ["10.20.0.0/16"] },
    tags: config.tags,
  });

  // Container Apps managed environment infrastructure subnet (needs a /23).
  const containerAppsSubnet = new network.Subnet("snet-apps", {
    resourceGroupName,
    virtualNetworkName: vnet.name,
    addressPrefix: "10.20.0.0/23",
  });

  // Delegated subnet for PostgreSQL Flexible Server VNet integration.
  const postgresSubnet = new network.Subnet(
    "snet-postgres",
    {
      resourceGroupName,
      virtualNetworkName: vnet.name,
      addressPrefix: "10.20.2.0/24",
      delegations: [{ name: "postgres", serviceName: "Microsoft.DBforPostgreSQL/flexibleServers" }],
    },
    { dependsOn: [containerAppsSubnet] },
  );

  // Subnet hosting private endpoints (Key Vault, prod Front Door origins).
  const privateLinkSubnet = new network.Subnet(
    "snet-privatelink",
    {
      resourceGroupName,
      virtualNetworkName: vnet.name,
      addressPrefix: "10.20.3.0/24",
      privateEndpointNetworkPolicies: network.VirtualNetworkPrivateEndpointNetworkPolicies.Disabled,
    },
    { dependsOn: [postgresSubnet] },
  );

  const postgresZone = new network.PrivateZone("pdns-postgres", {
    resourceGroupName,
    privateZoneName: POSTGRES_DNS,
    location: "global",
    tags: config.tags,
  });
  new network.VirtualNetworkLink("vnl-postgres", {
    resourceGroupName,
    privateZoneName: postgresZone.name,
    location: "global",
    virtualNetwork: { id: vnet.id },
    registrationEnabled: false,
    tags: config.tags,
  });

  const keyVaultZone = new network.PrivateZone("pdns-kv", {
    resourceGroupName,
    privateZoneName: KEYVAULT_DNS,
    location: "global",
    tags: config.tags,
  });
  new network.VirtualNetworkLink("vnl-kv", {
    resourceGroupName,
    privateZoneName: keyVaultZone.name,
    location: "global",
    virtualNetwork: { id: vnet.id },
    registrationEnabled: false,
    tags: config.tags,
  });

  return {
    vnet,
    containerAppsSubnetId: containerAppsSubnet.id,
    postgresSubnetId: postgresSubnet.id,
    privateLinkSubnetId: privateLinkSubnet.id,
    postgresDnsZoneId: postgresZone.id,
    keyVaultDnsZoneId: keyVaultZone.id,
  };
}
