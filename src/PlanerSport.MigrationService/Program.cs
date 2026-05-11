// Copyright (c) WEEGER. GNU General Public License (GPL), version 3.

using PlanerSport.MigrationService;

var builder = Host.CreateApplicationBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddHostedService<Worker>();

builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddSource(Worker.ActivitySourceName));

await builder.Build().RunAsync();
