// Copyright (c) WEEGER. GNU General Public License (GPL), version 3.

namespace PlanerSport.Infrastructure;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PlanerSport.Core.SportAggregate;

/// <summary>
/// Configures EF Core mapping for the <see cref="Sport"/> entity.
/// </summary>
public sealed class SportEntityTypeConfiguration : IEntityTypeConfiguration<Sport>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<Sport> builder)
    {
        builder.ToTable("Sports");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id)
            .ValueGeneratedNever();

        builder.Property(s => s.Name)
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(s => s.Code)
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(s => s.Description)
            .HasMaxLength(512);

        builder.Property(s => s.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.DeletedAtUtc);
        builder.Property(s => s.DeletedById)
            .HasMaxLength(128);

        builder.Property(s => s.CreatedAtUtc)
            .IsRequired();

        builder.Property(s => s.UpdatedAtUtc)
            .IsRequired();

        builder.HasQueryFilter(s => !s.IsDeleted);

        builder.HasIndex(s => s.Name)
            .IsUnique()
            .HasDatabaseName("IX_Sports_Name_Active")
            .HasFilter("\"IsDeleted\" = false");
    }
}
