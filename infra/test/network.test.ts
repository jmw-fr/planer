import { describe, it, expect } from "vitest";
import { createDatabase } from "../src/database";
import { makeConfig, promiseOf } from "./fixtures";

// Databases must never be publicly reachable (FR-015). Covers backend (US1) and
// Keycloak (US2) PostgreSQL Flexible Servers.
const config = makeConfig("dev");

const backendDb = createDatabase(config, "rg-test", {
  name: "backend",
  adminLogin: "pgadmin",
  adminPassword: config.secrets.backendDbPassword,
  databaseName: "backend",
  postgresSubnetId: "/subscriptions/x/subnets/postgres",
  postgresDnsZoneId: "/subscriptions/x/privateDnsZones/pg",
});

const keycloakDb = createDatabase(config, "rg-test", {
  name: "keycloak",
  adminLogin: "kcadmin",
  adminPassword: config.secrets.keycloakDbPassword,
  databaseName: "keycloak",
  postgresSubnetId: "/subscriptions/x/subnets/postgres",
  postgresDnsZoneId: "/subscriptions/x/privateDnsZones/pg",
});

describe("database networking (FR-015)", () => {
  it("makes the backend DB private via VNet injection (no public access)", async () => {
    const net = await promiseOf(backendDb.server.network);
    expect(net?.delegatedSubnetResourceId).toBeDefined();
    expect(net?.privateDnsZoneArmResourceId).toBeDefined();
  });

  it("makes the Keycloak DB private via VNet injection (no public access)", async () => {
    const net = await promiseOf(keycloakDb.server.network);
    expect(net?.delegatedSubnetResourceId).toBeDefined();
    expect(net?.privateDnsZoneArmResourceId).toBeDefined();
  });
});
