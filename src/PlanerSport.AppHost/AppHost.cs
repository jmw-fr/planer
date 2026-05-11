var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.PlanerSport_Api>("planersport-api");

builder.AddProject<Projects.PlanerSport_Web>("planersport-web");

builder.Build().Run();
