// Copyright (c) WEEGER. GNU General Public License (GPL), version 3.

namespace PlanerSport.Core.SportAggregate;

using System.Diagnostics.CodeAnalysis;

/// <summary>
/// Represents a sport domain entity with lifecycle metadata and validation invariants.
/// </summary>
public sealed class Sport : DomainEntityBase
{
    /// <summary>
    /// Gets the sport name.
    /// </summary>
    public string Name { get; private set; }

    /// <summary>
    /// Gets the sport code.
    /// </summary>
    public string Code { get; private set; }

    /// <summary>
    /// Gets the optional sport description.
    /// </summary>
    public string? Description { get; private set; }

    /// <summary>
    /// Initializes a new instance of the <see cref="Sport"/> class.
    /// </summary>
    /// <param name="name">The sport name.</param>
    /// <param name="code">The sport code.</param>
    /// <param name="description">The optional sport description.</param>
    public Sport(string name, string code, string? description = null)
    {
        Name = ValidateName(name);
        Code = ValidateCode(code);
        Description = NormalizeDescription(description);
    }

    /// <summary>
    /// Parameterless constructor used by EF Core.
    /// </summary>
    [SetsRequiredMembers]
    private Sport()
    {
        Name = string.Empty;
        Code = string.Empty;
    }

    /// <summary>
    /// Updates the sport metadata.
    /// </summary>
    /// <param name="name">The sport name.</param>
    /// <param name="code">The sport code.</param>
    /// <param name="description">The optional sport description.</param>
    public void Update(string name, string code, string? description = null)
    {
        Name = ValidateName(name);
        Code = ValidateCode(code);
        Description = NormalizeDescription(description);
        Touch();
    }

    /// <summary>
    /// Marks the sport as logically deleted.
    /// </summary>
    /// <param name="deletedById">The identifier of the actor performing the deletion.</param>
    public void Delete(string deletedById)
    {
        MarkDeleted(deletedById);
    }

    private static string ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Sport name is required.", nameof(name));
        }

        return name.Trim();
    }

    private static string ValidateCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Sport code is required.", nameof(code));
        }

        return code.Trim();
    }

    private static string? NormalizeDescription(string? description)
    {
        if (string.IsNullOrWhiteSpace(description))
        {
            return null;
        }

        return description.Trim();
    }
}
