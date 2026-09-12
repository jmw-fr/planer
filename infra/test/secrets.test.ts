import { describe, it, expect } from "vitest";
import * as pulumi from "@pulumi/pulumi";
import { createKeyVault } from "../src/keyVault";
import { createBackend } from "../src/backend";
import { buildOutputs } from "../src/outputs";
import { makeConfig, promiseOf } from "./fixtures";

const config = makeConfig("dev");
const keyVault = createKeyVault(config, "rg-test", "/subnets/pl", "/dns/kv");
const backend = createBackend(config, "rg-test", {
  managedEnvironmentId: "env-id",
  keyVault,
  dbConnectionString: pulumi.secret("postgresql://u:backend-pw@host/db"),
});

describe("secret handling (FR-004 / FR-020 / SC-006)", () => {
  it("wires the backend app to a user-assigned managed identity", async () => {
    const identity = await promiseOf(backend.app.identity as pulumi.Output<{ type: string }>);
    expect(identity?.type).toBe("UserAssigned");
  });

  it("references secrets via Key Vault URL, never inline values", async () => {
    const cfg = await promiseOf(backend.app.configuration as pulumi.Output<any>);
    const secret = cfg?.secrets?.[0];
    expect(secret?.keyVaultUrl).toContain("/secrets/");
    expect(secret?.identity).toBeDefined();
    // The raw password must not appear in the reference URL.
    expect(JSON.stringify(secret)).not.toContain("backend-pw");
  });

  it("addSecret returns a versionless Key Vault reference, supporting rotation (FR-021)", async () => {
    const ref = keyVault.addSecret("rot-test", pulumi.secret("rotate-me"));
    const uri = await promiseOf(ref);
    expect(uri).toContain("/secrets/");
    expect(uri).toContain("rot-test");
    expect(uri).not.toContain("rotate-me");
  });

  it("stack outputs contain no secret values (C-OUT-2)", async () => {
    const out = buildOutputs({
      resourceGroupName: "rg",
      frontDoorEndpointHostname: "ep.azurefd.net",
      keyVaultName: "kv",
      keyVaultUri: "https://kv.vault.azure.net/",
      backendContainerAppName: "ca-b",
      keycloakContainerAppName: "ca-k",
      keycloakRoutePath: "auth",
      keycloakRealm: "planer",
      logAnalyticsWorkspaceId: "law",
    });
    const combined = await promiseOf(
      pulumi
        .all([
          out.resourceGroupName,
          out.frontDoorEndpointHostname,
          out.backendUrl,
          out.keycloakBaseUrl,
          out.keycloakIssuerUrl,
          out.keyVaultName,
          out.keyVaultUri,
          out.backendContainerAppName,
          out.keycloakContainerAppName,
          out.logAnalyticsWorkspaceId,
        ])
        .apply((vals) => vals.join("|")),
    );
    expect(combined).not.toContain("backend-pw");
    expect(combined).not.toContain("admin-pw");
    expect(combined).toContain("https://ep.azurefd.net");
    expect(combined).toContain("/realms/planer");
  });
});
