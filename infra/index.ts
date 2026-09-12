import { loadConfig } from "./src/config";
import { createResourceGroup } from "./src/resourceGroup";
import { createObservability } from "./src/observability";
import { createNetwork } from "./src/network";
import { createKeyVault } from "./src/keyVault";
import { createContainerEnv } from "./src/containerEnv";
import { createDatabase } from "./src/database";
import { createBackend } from "./src/backend";
import { createKeycloak } from "./src/keycloak";
import { createFrontDoor } from "./src/frontDoor";
import { buildOutputs } from "./src/outputs";

const KEYCLOAK_REALM = "planer";

const config = loadConfig();

// --- Foundational shared infrastructure ---
const rg = createResourceGroup(config);
const net = createNetwork(config, rg.name);
const obs = createObservability(config, rg.name);
const keyVault = createKeyVault(config, rg.name, net.privateLinkSubnetId, net.keyVaultDnsZoneId);
const containerEnv = createContainerEnv(config, rg.name, net.containerAppsSubnetId, obs);

// --- Backend runtime (US1) ---
const backendDb = createDatabase(config, rg.name, {
  name: "backend",
  adminLogin: "pgadmin",
  adminPassword: config.secrets.backendDbPassword,
  databaseName: "backend",
  postgresSubnetId: net.postgresSubnetId,
  postgresDnsZoneId: net.postgresDnsZoneId,
});
const backend = createBackend(config, rg.name, {
  managedEnvironmentId: containerEnv.id,
  keyVault,
  dbConnectionString: backendDb.connectionString,
});

// --- Keycloak identity provider (US2) ---
const keycloakDb = createDatabase(config, rg.name, {
  name: "keycloak",
  adminLogin: "kcadmin",
  adminPassword: config.secrets.keycloakDbPassword,
  databaseName: "keycloak",
  postgresSubnetId: net.postgresSubnetId,
  postgresDnsZoneId: net.postgresDnsZoneId,
});
const keycloak = createKeycloak(config, rg.name, {
  managedEnvironmentId: containerEnv.id,
  keyVault,
  dbConnectionString: keycloakDb.connectionString,
  adminPassword: config.secrets.keycloakAdminPassword,
});

// --- Public entry point: Front Door + WAF (US1/US2) ---
const frontDoor = createFrontDoor(config, rg.name, [
  {
    name: "keycloak",
    originHostName: keycloak.appFqdn,
    patternsToMatch: [`/${config.keycloak.hostname}/*`],
    privateLinkTargetId: containerEnv.id,
  },
  {
    name: "backend",
    originHostName: backend.appFqdn,
    patternsToMatch: ["/*"],
    privateLinkTargetId: containerEnv.id,
  },
]);

// --- Exported stack outputs (non-secret only) ---
const outputs = buildOutputs({
  resourceGroupName: rg.name,
  frontDoorEndpointHostname: frontDoor.endpointHostName,
  keyVaultName: keyVault.vaultName,
  keyVaultUri: keyVault.vaultUri,
  backendContainerAppName: backend.app.name,
  keycloakContainerAppName: keycloak.app.name,
  keycloakRoutePath: config.keycloak.hostname,
  keycloakRealm: KEYCLOAK_REALM,
  logAnalyticsWorkspaceId: obs.workspaceId,
});

export const resourceGroupName = outputs.resourceGroupName;
export const frontDoorEndpointHostname = outputs.frontDoorEndpointHostname;
export const backendUrl = outputs.backendUrl;
export const keycloakBaseUrl = outputs.keycloakBaseUrl;
export const keycloakIssuerUrl = outputs.keycloakIssuerUrl;
export const keyVaultName = outputs.keyVaultName;
export const keyVaultUri = outputs.keyVaultUri;
export const backendContainerAppName = outputs.backendContainerAppName;
export const keycloakContainerAppName = outputs.keycloakContainerAppName;
export const logAnalyticsWorkspaceId = outputs.logAnalyticsWorkspaceId;
