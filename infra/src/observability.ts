import * as pulumi from "@pulumi/pulumi";
import * as operationalinsights from "@pulumi/azure-native/operationalinsights";
import { EnvironmentConfig } from "./config";

export interface Observability {
  workspace: operationalinsights.Workspace;
  workspaceId: pulumi.Output<string>;
  customerId: pulumi.Output<string>;
  primarySharedKey: pulumi.Output<string>;
}

/** Log Analytics workspace used for Container Apps and Front Door/WAF diagnostics. */
export function createObservability(
  config: EnvironmentConfig,
  resourceGroupName: pulumi.Input<string>,
): Observability {
  const workspace = new operationalinsights.Workspace("logs", {
    resourceGroupName,
    location: config.location,
    sku: { name: "PerGB2018" },
    retentionInDays: 30,
    tags: config.tags,
  });

  const sharedKeys = pulumi
    .all([resourceGroupName, workspace.name])
    .apply(([rg, name]) => operationalinsights.getSharedKeys({ resourceGroupName: rg, workspaceName: name }));

  return {
    workspace,
    workspaceId: workspace.id,
    customerId: workspace.customerId,
    primarySharedKey: sharedKeys.apply((k) => k.primarySharedKey ?? ""),
  };
}
