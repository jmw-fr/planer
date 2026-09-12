import * as pulumi from "@pulumi/pulumi";

/** Non-secret inputs used to assemble stack outputs. Secrets are intentionally absent. */
export interface StackOutputInputs {
  resourceGroupName: pulumi.Input<string>;
  frontDoorEndpointHostname: pulumi.Input<string>;
  keyVaultName: pulumi.Input<string>;
  keyVaultUri: pulumi.Input<string>;
  backendContainerAppName: pulumi.Input<string>;
  keycloakContainerAppName: pulumi.Input<string>;
  /** Front Door route path for Keycloak (e.g. "auth"). */
  keycloakRoutePath: string;
  /** Keycloak realm used to build the OIDC issuer URL. */
  keycloakRealm: string;
  logAnalyticsWorkspaceId: pulumi.Input<string>;
}

export interface StackOutputs {
  resourceGroupName: pulumi.Output<string>;
  frontDoorEndpointHostname: pulumi.Output<string>;
  backendUrl: pulumi.Output<string>;
  keycloakBaseUrl: pulumi.Output<string>;
  keycloakIssuerUrl: pulumi.Output<string>;
  keyVaultName: pulumi.Output<string>;
  keyVaultUri: pulumi.Output<string>;
  backendContainerAppName: pulumi.Output<string>;
  keycloakContainerAppName: pulumi.Output<string>;
  logAnalyticsWorkspaceId: pulumi.Output<string>;
}

/**
 * Assemble the exported stack outputs (contract stack-outputs.md). By construction
 * this only ever receives non-secret references, so no secret can leak via outputs
 * (contract C-OUT-2 / SC-006).
 */
export function buildOutputs(i: StackOutputInputs): StackOutputs {
  const backendUrl = pulumi.interpolate`https://${i.frontDoorEndpointHostname}`;
  const keycloakBaseUrl = pulumi.interpolate`https://${i.frontDoorEndpointHostname}/${i.keycloakRoutePath}`;
  return {
    resourceGroupName: pulumi.output(i.resourceGroupName),
    frontDoorEndpointHostname: pulumi.output(i.frontDoorEndpointHostname),
    backendUrl,
    keycloakBaseUrl,
    keycloakIssuerUrl: pulumi.interpolate`${keycloakBaseUrl}/realms/${i.keycloakRealm}`,
    keyVaultName: pulumi.output(i.keyVaultName),
    keyVaultUri: pulumi.output(i.keyVaultUri),
    backendContainerAppName: pulumi.output(i.backendContainerAppName),
    keycloakContainerAppName: pulumi.output(i.keycloakContainerAppName),
    logAnalyticsWorkspaceId: pulumi.output(i.logAnalyticsWorkspaceId),
  };
}
