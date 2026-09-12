import * as pulumi from "@pulumi/pulumi";
import * as dbforpostgresql from "@pulumi/azure-native/dbforpostgresql";
import { EnvironmentConfig } from "./config";

export interface DatabaseArgs {
  /** Logical name, e.g. "backend" or "keycloak". */
  name: string;
  adminLogin: string;
  adminPassword: pulumi.Input<string>;
  databaseName: string;
  postgresSubnetId: pulumi.Input<string>;
  postgresDnsZoneId: pulumi.Input<string>;
}

export interface Database {
  server: dbforpostgresql.Server;
  database: dbforpostgresql.Database;
  /** Full connection string (contains the password) — store only in Key Vault. */
  connectionString: pulumi.Output<string>;
}

/**
 * PostgreSQL Flexible Server with private (VNet-integrated) access and public
 * network access disabled (FR-015). Used for both the backend and Keycloak DBs.
 */
export function createDatabase(
  config: EnvironmentConfig,
  resourceGroupName: pulumi.Input<string>,
  args: DatabaseArgs,
): Database {
  const server = new dbforpostgresql.Server(`pg-${args.name}`, {
    resourceGroupName,
    location: config.location,
    version: "16",
    administratorLogin: args.adminLogin,
    administratorLoginPassword: args.adminPassword,
    createMode: "Default",
    sku: { name: config.postgres.sku, tier: "Burstable" },
    storage: { storageSizeGB: config.postgres.storageGb },
    network: {
      // VNet-injected (private access) server: not publicly reachable (FR-015).
      delegatedSubnetResourceId: args.postgresSubnetId,
      privateDnsZoneArmResourceId: args.postgresDnsZoneId,
    },
    highAvailability: { mode: "Disabled" },
    backup: { backupRetentionDays: 7, geoRedundantBackup: "Disabled" },
    tags: config.tags,
  });

  const database = new dbforpostgresql.Database(`pgdb-${args.name}`, {
    resourceGroupName,
    serverName: server.name,
    databaseName: args.databaseName,
    charset: "UTF8",
    collation: "en_US.utf8",
  });

  const connectionString = pulumi.interpolate`postgresql://${args.adminLogin}:${args.adminPassword}@${server.fullyQualifiedDomainName}:5432/${args.databaseName}?sslmode=require`;

  return { server, database, connectionString };
}
