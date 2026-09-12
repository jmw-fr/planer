import * as pulumi from "@pulumi/pulumi";
import { buildConfig, EnvironmentConfig, EnvName, RawConfig } from "../src/config";

/** Resolve a Pulumi Output to a value in tests (mocks make this synchronous-ish). */
export function promiseOf<T>(output: pulumi.Output<T>): Promise<T> {
  return new Promise<T>((resolve) => output.apply((v) => resolve(v)));
}

export function testSecrets() {
  return {
    backendDbPassword: pulumi.secret("backend-pw"),
    keycloakDbPassword: pulumi.secret("keycloak-pw"),
    keycloakAdminPassword: pulumi.secret("admin-pw"),
  };
}

/** Build a valid EnvironmentConfig for tests, with optional raw overrides. */
export function makeConfig(environment: EnvName = "dev", raw: Partial<RawConfig> = {}): EnvironmentConfig {
  return buildConfig(
    {
      environment,
      location: "westeurope",
      backend: { image: "registry/backend:test", ...(raw.backend ?? {}) },
      keycloak: { image: "registry/keycloak:test", hostname: "auth", ...(raw.keycloak ?? {}) },
      postgres: raw.postgres,
      frontDoor: raw.frontDoor,
      tags: raw.tags,
      resourceGroupName: raw.resourceGroupName,
    },
    testSecrets(),
  );
}
