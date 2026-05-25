// Copyright (c) WEEGER. GNU General Public License (GPL), version 3.

namespace PlanerSport.Infrastructure;

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PlanerSport.Core.ApplicationUserAggregate;
using PlanerSport.Core.SportAggregate;

/// <summary>
/// EF Core database context for the application, inheriting from IdentityDbContext to include ASP.NET Core Identity features.
/// </summary>
public sealed class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ApplicationDbContext"/> class.
    /// </summary>
    /// <param name="options">The options to be used by a DbContext.</param>
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Gets or sets the sports stored in the application database.
    /// </summary>
    public DbSet<Sport> Sports { get; set; } = null!;

    /// <inheritdoc />
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfiguration(new SportEntityTypeConfiguration());
    }
}
