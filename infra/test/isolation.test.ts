import { describe, it, expect } from "vitest";
import { makeConfig } from "./fixtures";

// Environments must be isolated and prod must enforce the stricter posture
// (SC-007, contract C-CFG-2).
describe("environment isolation & posture (SC-007)", () => {
  it("scopes resource group name and tags per environment", () => {
    const dev = makeConfig("dev");
    const prod = makeConfig("prod");
    expect(dev.resourceGroupName).not.toBe(prod.resourceGroupName);
    expect(dev.tags.environment).toBe("dev");
    expect(prod.tags.environment).toBe("prod");
  });

  it("prod resolves to privateLink origins + Prevention WAF", () => {
    const prod = makeConfig("prod");
    expect(prod.frontDoor.originMode).toBe("privateLink");
    expect(prod.frontDoor.wafMode).toBe("Prevention");
  });

  it("dev uses the lower-cost locked public posture", () => {
    const dev = makeConfig("dev");
    expect(dev.frontDoor.originMode).toBe("lockedPublic");
    expect(dev.frontDoor.wafMode).toBe("Detection");
  });
});
