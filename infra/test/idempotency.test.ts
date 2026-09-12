import { describe, it, expect } from "vitest";
import { buildConfig } from "../src/config";
import { testSecrets } from "./fixtures";

// Idempotency at the config layer: identical inputs must yield an identical
// (deterministic) configuration, so `pulumi up` with no changes is a no-op
// (FR-005 / SC-003). Full plan-level idempotency is validated by `pulumi preview`
// in CI and the quickstart run.
const raw = {
  environment: "dev" as const,
  location: "westeurope",
  backend: { image: "registry/backend:test" },
  keycloak: { image: "registry/keycloak:test", hostname: "auth" },
};

function withoutSecrets(cfg: ReturnType<typeof buildConfig>) {
  const { secrets: _secrets, ...rest } = cfg;
  return rest;
}

describe("configuration determinism (FR-005 / SC-003)", () => {
  it("produces identical config for identical inputs", () => {
    const a = withoutSecrets(buildConfig(raw, testSecrets()));
    const b = withoutSecrets(buildConfig(raw, testSecrets()));
    expect(a).toEqual(b);
  });
});
