// Copyright (c) WEEGER. GNU General Public License (GPL), version 3.

namespace PlanerSport.MigrationService;

using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using PlanerSport.Infrastructure.Data;

/// <summary>
/// Migration worker that applies database migrations.
/// </summary>
/// <param name="serviceProvider">The service provider.</param>
/// <param name="hostApplicationLifetime">The host application lifetime.</param>
public class Worker(
    IServiceProvider serviceProvider,
    IHostApplicationLifetime hostApplicationLifetime) : BackgroundService
{
    /// <summary>
    /// The name of the activity source for OpenTelemetry tracing.
    /// </summary>
    public const string ActivitySourceName = "Migrations";

    private static readonly ActivitySource ActivitySource = new(ActivitySourceName);

    /// <inheritdoc/>
    protected override async Task ExecuteAsync(
            CancellationToken cancellationToken)
    {
        using var activity = ActivitySource.StartActivity(
            "Migrating database", ActivityKind.Client);

        try
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            await RunMigrationAsync(dbContext, cancellationToken);
        }
        catch (Exception ex)
        {
            activity?.AddException(ex);
            throw;
        }

        hostApplicationLifetime.StopApplication();
    }

    private static async Task RunMigrationAsync(
        ApplicationDbContext dbContext, CancellationToken cancellationToken)
    {
        var strategy = dbContext.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            // Run migration in a transaction to avoid partial migration if it fails.
            await dbContext.Database.MigrateAsync(cancellationToken);
        });
    }
}
