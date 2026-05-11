// Copyright (c) WEEGER. GNU General Public License (GPL), version 3.

namespace PlanerSport.Infrastructure.Data;

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PlanerSport.Domain;

/// <summary>
/// EF Core database context for the application, inheriting from IdentityDbContext to include ASP.NET Core Identity features.
/// </summary>
/// <param name="options">The options to be used by a DbContext.</param>
public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
  : IdentityDbContext<ApplicationUser>(options)
{
}
