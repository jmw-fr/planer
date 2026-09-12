// Copyright (c) WEEGER. GNU General Public License (GPL), version 3.

var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
  .WithDbGate();

var postgresdb = postgres.AddDatabase("planersportdb");

builder.AddProject<Projects.PlanerSport_Api>("planersport-api")
    .WithReference(postgresdb);

builder.AddProject<Projects.PlanerSport_Web>("planersport-web")
    .WithReference(postgresdb);

await builder.Build().RunAsync();
