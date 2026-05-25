// Copyright (c) WEEGER. GNU General Public License (GPL), version 3.

namespace PlanerSport.Infrastructure;

using Microsoft.EntityFrameworkCore;
using PlanerSport.Core.SportAggregate;

/// <summary>
/// Provides idempotent seed data for the sport domain.
/// </summary>
public static class SportSeedData
{
    private static readonly IReadOnlyList<(string Name, string Code, string Description)> DefaultSports = new[]
    {
        ("Football", "FOOTBALL", "Football is a team sport played with a spherical ball."),
        ("Basketball", "BASKETBALL", "Basketball is a fast-paced game played on a court.")
    };

    /// <summary>
    /// Ensures default sports exist in the database without creating duplicates.
    /// </summary>
    /// <param name="dbContext">The application database context.</param>
    /// <param name="cancellationToken">A cancellation token.</param>
    public static async Task EnsureSeedDataAsync(ApplicationDbContext dbContext, CancellationToken cancellationToken = default)
    {
        var existingNames = await dbContext.Sports
            .Select(s => s.Name)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        var missingSports = DefaultSports
            .Where(item => !existingNames.Contains(item.Name, StringComparer.OrdinalIgnoreCase))
            .Select(item => new Sport(item.Name, item.Code, item.Description))
            .ToList();

        if (missingSports.Count == 0)
        {
            return;
        }

        await dbContext.Sports.AddRangeAsync(missingSports, cancellationToken).ConfigureAwait(false);
        await dbContext.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }

}
