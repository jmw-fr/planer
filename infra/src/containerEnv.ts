import * as pulumi from "@pulumi/pulumi";
import * as app from "@pulumi/azure-native/app";
import { EnvironmentConfig } from "./config";
import { Observability } from "./observability";

/**
 * Internal (VNet-injected) Azure Container Apps managed environment. `internal: true`
 * keeps the environment off the public internet so app ingress is not directly public.
 */
export function createContainerEnv(
  config: EnvironmentConfig,
  resourceGroupName: pulumi.Input<string>,
  containerAppsSubnetId: pulumi.Input<string>,
  observability: Observability,
): app.ManagedEnvironment {
  return new app.ManagedEnvironment("cae", {
    resourceGroupName,
    location: config.location,
    appLogsConfiguration: {
      destination: "log-analytics",
      logAnalyticsConfiguration: {
        customerId: observability.customerId,
        sharedKey: observability.primarySharedKey,
      },
    },
    vnetConfiguration: {
      infrastructureSubnetId: containerAppsSubnetId,
      internal: true,
    },
    tags: config.tags,
  });
}
