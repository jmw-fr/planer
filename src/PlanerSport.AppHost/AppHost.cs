// Copyright (c) WEEGER. GNU General Public License (GPL), version 3.

var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
  .WithDbGate();

var postgresdb = postgres.AddDatabase("planersportdb");

var migration = builder.AddProject<Projects.PlanerSport_MigrationService>("planersport-migrationservice")
    .WithReference(postgresdb)
    .WaitFor(postgresdb);

builder.AddProject<Projects.PlanerSport_Api>("planersport-api")
    .WithReference(postgresdb)
    .WaitForCompletion(migration);

builder.AddProject<Projects.PlanerSport_Web>("planersport-web")
    .WithReference(postgresdb)
    .WaitForCompletion(migration);

await builder.Build().RunAsync();
