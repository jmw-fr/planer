import * as pulumi from "@pulumi/pulumi";

export type EnvName = "dev" | "staging" | "prod";
export type OriginMode = "privateLink" | "lockedPublic";
export type WafMode = "Prevention" | "Detection";

export interface BackendConfig {
  image: string;
  cpu: number;
  memory: string;
  minReplicas: number;
  maxReplicas: number;
}

export interface KeycloakConfig {
  image: string;
  cpu: number;
  memory: string;
  /** Front Door route host for the IdP (path/host on the Front Door endpoint), not a customer custom domain. */
  hostname: string;
}

export interface PostgresConfig {
  sku: string;
  storageGb: number;
}

export interface FrontDoorConfig {
  originMode: OriginMode;
  wafMode: WafMode;
}

export interface EnvironmentSecrets {
  backendDbPassword: pulumi.Output<string>;
  keycloakDbPassword: pulumi.Output<string>;
  keycloakAdminPassword: pulumi.Output<string>;
}

export interface EnvironmentConfig {
  environment: EnvName;
  location: string;
  resourceGroupName: string;
  backend: BackendConfig;
  keycloak: KeycloakConfig;
  postgres: PostgresConfig;
  frontDoor: FrontDoorConfig;
  tags: Record<string, string>;
  secrets: EnvironmentSecrets;
}

/** Raw (pre-validation) inputs, as read from Pulumi config / ESC. */
export interface RawConfig {
  environment: string;
  location: string;
  resourceGroupName?: string;
  backend: Partial<BackendConfig> & { image: string };
  keycloak: Partial<KeycloakConfig> & { image: string; hostname: string };
  postgres?: Partial<PostgresConfig>;
  frontDoor?: Partial<FrontDoorConfig>;
  tags?: Record<string, string>;
}

const ENV_NAMES: EnvName[] = ["dev", "staging", "prod"];

/**
 * Validate raw inputs and apply per-environment defaults. Throws a descriptive
 * error (fail-fast) on any violation so no resource is ever created from an
 * invalid configuration (contract C-CFG-1/C-CFG-2, FR-018).
 */
export function buildConfig(raw: RawConfig, secrets: EnvironmentSecrets): EnvironmentConfig {
  if (!ENV_NAMES.includes(raw.environment as EnvName)) {
    throw new Error(`Invalid environment "${raw.environment}"; expected one of ${ENV_NAMES.join(", ")}.`);
  }
  const environment = raw.environment as EnvName;
  const isProd = environment === "prod";

  if (!raw.location) {
    throw new Error("Config 'location' is required.");
  }
  if (!raw.backend?.image) {
    throw new Error("Config 'backend.image' is required.");
  }
  if (!raw.keycloak?.image) {
    throw new Error("Config 'keycloak.image' is required.");
  }
  if (!raw.keycloak?.hostname) {
    throw new Error("Config 'keycloak.hostname' is required.");
  }

  const backend: BackendConfig = {
    image: raw.backend.image,
    cpu: raw.backend.cpu ?? 0.5,
    memory: raw.backend.memory ?? "1Gi",
    minReplicas: raw.backend.minReplicas ?? 1,
    maxReplicas: raw.backend.maxReplicas ?? 3,
  };
  if (backend.minReplicas < 0) {
    throw new Error("backend.minReplicas must be >= 0.");
  }
  if (backend.maxReplicas < backend.minReplicas) {
    throw new Error("backend.maxReplicas must be >= backend.minReplicas.");
  }

  const keycloak: KeycloakConfig = {
    image: raw.keycloak.image,
    cpu: raw.keycloak.cpu ?? 0.5,
    memory: raw.keycloak.memory ?? "1Gi",
    hostname: raw.keycloak.hostname,
  };

  const postgres: PostgresConfig = {
    sku: raw.postgres?.sku ?? "Standard_B1ms",
    storageGb: raw.postgres?.storageGb ?? 32,
  };
  if (postgres.storageGb < 32) {
    throw new Error("postgres.storageGb must be >= 32.");
  }

  const originMode: OriginMode = raw.frontDoor?.originMode ?? (isProd ? "privateLink" : "lockedPublic");
  const wafMode: WafMode = raw.frontDoor?.wafMode ?? (isProd ? "Prevention" : "Detection");

  // Production must be fully isolated and blocking (FR-018, D8).
  if (isProd && originMode !== "privateLink") {
    throw new Error("Production requires frontDoor.originMode = 'privateLink'.");
  }
  if (isProd && wafMode !== "Prevention") {
    throw new Error("Production requires frontDoor.wafMode = 'Prevention'.");
  }

  const resourceGroupName = raw.resourceGroupName ?? `rg-planer-${environment}`;

  return {
    environment,
    location: raw.location,
    resourceGroupName,
    backend,
    keycloak,
    postgres,
    frontDoor: { originMode, wafMode },
    tags: { project: "planer", environment, managedBy: "pulumi", ...(raw.tags ?? {}) },
    secrets,
  };
}

/** Load configuration from Pulumi stack config / ESC (used by index.ts). */
export function loadConfig(): EnvironmentConfig {
  const c = new pulumi.Config();
  const raw: RawConfig = {
    environment: c.require("environment"),
    location: c.require("location"),
    resourceGroupName: c.get("resourceGroupName"),
    backend: c.requireObject<Partial<BackendConfig> & { image: string }>("backend"),
    keycloak: c.requireObject<Partial<KeycloakConfig> & { image: string; hostname: string }>("keycloak"),
    postgres: c.getObject<Partial<PostgresConfig>>("postgres"),
    frontDoor: c.getObject<Partial<FrontDoorConfig>>("frontDoor"),
    tags: c.getObject<Record<string, string>>("tags"),
  };
  const secrets: EnvironmentSecrets = {
    backendDbPassword: c.requireSecret("backendDbPassword"),
    keycloakDbPassword: c.requireSecret("keycloakDbPassword"),
    keycloakAdminPassword: c.requireSecret("keycloakAdminPassword"),
  };
  return buildConfig(raw, secrets);
}
