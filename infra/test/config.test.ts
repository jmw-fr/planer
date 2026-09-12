import { describe, it, expect } from "vitest";
import { buildConfig } from "../src/config";
import { testSecrets } from "./fixtures";

const base = {
  location: "westeurope",
  backend: { image: "registry/backend:test" },
  keycloak: { image: "registry/keycloak:test", hostname: "auth" },
};

describe("buildConfig validation (C-CFG-1 / C-CFG-2)", () => {
  it("accepts a valid dev config with defaults", () => {
    const cfg = buildConfig({ environment: "dev", ...base }, testSecrets());
    expect(cfg.frontDoor.originMode).toBe("lockedPublic");
    expect(cfg.frontDoor.wafMode).toBe("Detection");
    expect(cfg.resourceGroupName).toBe("rg-planer-dev");
  });

  it("defaults prod to privateLink + Prevention", () => {
    const cfg = buildConfig({ environment: "prod", ...base }, testSecrets());
    expect(cfg.frontDoor.originMode).toBe("privateLink");
    expect(cfg.frontDoor.wafMode).toBe("Prevention");
  });

  it("rejects prod with lockedPublic origin mode", () => {
    expect(() =>
      buildConfig({ environment: "prod", ...base, frontDoor: { originMode: "lockedPublic" } }, testSecrets()),
    ).toThrow(/privateLink/);
  });

  it("rejects prod with Detection WAF mode", () => {
    expect(() =>
      buildConfig({ environment: "prod", ...base, frontDoor: { wafMode: "Detection" } }, testSecrets()),
    ).toThrow(/Prevention/);
  });

  it("rejects storageGb < 32", () => {
    expect(() =>
      buildConfig({ environment: "dev", ...base, postgres: { storageGb: 10 } }, testSecrets()),
    ).toThrow(/storageGb/);
  });

  it("rejects maxReplicas < minReplicas", () => {
    expect(() =>
      buildConfig(
        { environment: "dev", ...base, backend: { ...base.backend, minReplicas: 5, maxReplicas: 2 } },
        testSecrets(),
      ),
    ).toThrow(/maxReplicas/);
  });

  it("rejects an unknown environment", () => {
    expect(() => buildConfig({ environment: "qa", ...base }, testSecrets())).toThrow(/Invalid environment/);
  });
});
