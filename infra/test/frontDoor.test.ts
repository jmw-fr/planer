import { describe, it, expect } from "vitest";
import * as pulumi from "@pulumi/pulumi";
import { createFrontDoor } from "../src/frontDoor";
import { makeConfig, promiseOf } from "./fixtures";

// Front Door is the single public ingress and MUST carry a WAF (FR-017/FR-022).
const config = makeConfig("dev");
const fd = createFrontDoor(config, "rg-test", [
  {
    name: "backend",
    originHostName: pulumi.output("backend.internal.azurecontainerapps.io"),
    patternsToMatch: ["/*"],
  },
  {
    name: "keycloak",
    originHostName: pulumi.output("keycloak.internal.azurecontainerapps.io"),
    patternsToMatch: ["/auth/*"],
  },
]);

describe("Front Door + WAF (FR-017 / FR-022 / SC-010)", () => {
  it("provisions a Premium Front Door profile as the public entry point", async () => {
    const sku = await promiseOf(fd.profile.sku);
    expect(sku?.name).toBe("Premium_AzureFrontDoor");
  });

  it("attaches a WAF policy in the environment's mode (Detection for dev)", async () => {
    const settings = await promiseOf(fd.wafPolicy.policySettings);
    expect(settings?.mode).toBe("Detection");
    expect(settings?.enabledState).toBe("Enabled");
  });

  it("uses the managed default rule set", async () => {
    const managed = await promiseOf(fd.wafPolicy.managedRules);
    expect(managed?.managedRuleSets?.[0]?.ruleSetType).toBe("Microsoft_DefaultRuleSet");
  });

  it("exposes an endpoint hostname", async () => {
    const host = await promiseOf(fd.endpointHostName);
    expect(host).toContain("azurefd.net");
  });
});
