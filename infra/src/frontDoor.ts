import * as pulumi from "@pulumi/pulumi";
import * as cdn from "@pulumi/azure-native/cdn";
import * as network from "@pulumi/azure-native/network";
import { EnvironmentConfig } from "./config";

export interface FrontDoorService {
  /** Logical name, e.g. "backend" or "keycloak". */
  name: string;
  /** Internal FQDN of the Container App (origin host). */
  originHostName: pulumi.Input<string>;
  /** Route patterns, e.g. ["/*"] or ["/auth/*"]. */
  patternsToMatch: string[];
  /**
   * For privateLink origin mode: the resource id the Private Link origin targets
   * (the Container Apps managed environment). Ignored in lockedPublic mode.
   */
  privateLinkTargetId?: pulumi.Input<string>;
}

export interface FrontDoorResult {
  profile: cdn.Profile;
  endpoint: cdn.AFDEndpoint;
  endpointHostName: pulumi.Output<string>;
  wafPolicy: network.Policy;
}

/**
 * Azure Front Door Premium as the single public entry point (FR-017). Attaches a
 * WAF policy (managed default rule set) whose mode is per-environment (FR-022),
 * and wires one origin group + origin + route per service. In production the
 * origins are reached over Private Link (private origins); in dev/staging the
 * origins are public but expected to be locked to Front Door (FR-018).
 */
export function createFrontDoor(
  config: EnvironmentConfig,
  resourceGroupName: pulumi.Input<string>,
  services: FrontDoorService[],
): FrontDoorResult {
  const profile = new cdn.Profile("afd", {
    resourceGroupName,
    location: "global",
    sku: { name: cdn.SkuName.Premium_AzureFrontDoor },
    tags: config.tags,
  });

  const endpoint = new cdn.AFDEndpoint("afd-ep", {
    resourceGroupName,
    profileName: profile.name,
    location: "global",
    enabledState: cdn.EnabledState.Enabled,
  });

  // WAF policy name must be alphanumeric (no hyphens).
  const wafPolicy = new network.Policy(`planerwaf${config.environment}`, {
    resourceGroupName,
    policyName: `planerwaf${config.environment}`,
    location: "Global",
    sku: { name: "Premium_AzureFrontDoor" },
    policySettings: {
      enabledState: "Enabled",
      mode: config.frontDoor.wafMode,
    },
    managedRules: {
      managedRuleSets: [
        { ruleSetType: "Microsoft_DefaultRuleSet", ruleSetVersion: "2.1", ruleSetAction: "Block" },
      ],
    },
    tags: config.tags,
  });

  new cdn.SecurityPolicy("afd-waf", {
    resourceGroupName,
    profileName: profile.name,
    parameters: {
      type: "WebApplicationFirewall",
      wafPolicy: { id: wafPolicy.id },
      associations: [
        {
          domains: [{ id: endpoint.id }],
          patternsToMatch: ["/*"],
        },
      ],
    },
  });

  const usePrivateLink = config.frontDoor.originMode === "privateLink";

  for (const svc of services) {
    const originGroup = new cdn.AFDOriginGroup(`afd-og-${svc.name}`, {
      resourceGroupName,
      profileName: profile.name,
      loadBalancingSettings: {
        sampleSize: 4,
        successfulSamplesRequired: 3,
        additionalLatencyInMilliseconds: 50,
      },
      healthProbeSettings: {
        probePath: "/health",
        probeRequestType: cdn.HealthProbeRequestType.GET,
        probeProtocol: cdn.ProbeProtocol.Https,
        probeIntervalInSeconds: 100,
      },
    });

    new cdn.AFDOrigin(`afd-o-${svc.name}`, {
      resourceGroupName,
      profileName: profile.name,
      originGroupName: originGroup.name,
      hostName: svc.originHostName,
      originHostHeader: svc.originHostName,
      httpPort: 80,
      httpsPort: 443,
      priority: 1,
      weight: 1000,
      enabledState: cdn.EnabledState.Enabled,
      enforceCertificateNameCheck: true,
      // Production: reach the private origin over Private Link.
      sharedPrivateLinkResource:
        usePrivateLink && svc.privateLinkTargetId
          ? {
              privateLink: { id: svc.privateLinkTargetId },
              privateLinkLocation: config.location,
              groupId: "managedEnvironments",
              requestMessage: "Front Door Private Link to Container Apps",
            }
          : undefined,
    });

    new cdn.Route(`afd-r-${svc.name}`, {
      resourceGroupName,
      profileName: profile.name,
      endpointName: endpoint.name,
      originGroup: { id: originGroup.id },
      patternsToMatch: svc.patternsToMatch,
      supportedProtocols: [cdn.AFDEndpointProtocols.Http, cdn.AFDEndpointProtocols.Https],
      forwardingProtocol: cdn.ForwardingProtocol.HttpsOnly,
      linkToDefaultDomain: cdn.LinkToDefaultDomain.Enabled,
      httpsRedirect: cdn.HttpsRedirect.Enabled,
    });
  }

  return { profile, endpoint, endpointHostName: endpoint.hostName, wafPolicy };
}
