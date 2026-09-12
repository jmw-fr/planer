import * as resources from "@pulumi/azure-native/resources";
import { EnvironmentConfig } from "./config";

/** Create the per-environment resource group that contains every other resource. */
export function createResourceGroup(config: EnvironmentConfig): resources.ResourceGroup {
  return new resources.ResourceGroup("rg", {
    resourceGroupName: config.resourceGroupName,
    location: config.location,
    tags: config.tags,
  });
}
