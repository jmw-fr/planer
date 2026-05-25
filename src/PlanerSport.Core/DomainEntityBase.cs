// Copyright (c) WEEGER. GNU General Public License (GPL), version 3.

namespace PlanerSport.Core;

/// <summary>
/// Provides reusable lifecycle metadata for domain entities.
/// </summary>
public abstract class DomainEntityBase
{
    /// <summary>
    /// A stable identifier for the entity.
    /// </summary>
    public Guid Id { get; protected set; }

    /// <summary>
    /// Indicates whether the entity has been logically deleted.
    /// </summary>
    public bool IsDeleted { get; protected set; }

    /// <summary>
    /// The UTC date and time when the entity was logically deleted.
    /// </summary>
    public DateTime? DeletedAtUtc { get; protected set; }

    /// <summary>
    /// The identifier of the user or process that performed the deletion.
    /// </summary>
    public string? DeletedById { get; protected set; }

    /// <summary>
    /// The UTC date and time when the entity was created.
    /// </summary>
    public DateTime CreatedAtUtc { get; protected set; }

    /// <summary>
    /// The UTC date and time when the entity was last updated.
    /// </summary>
    public DateTime UpdatedAtUtc { get; protected set; }

    /// <summary>
    /// Initializes a new instance of the <see cref="DomainEntityBase"/> class.
    /// </summary>
    protected DomainEntityBase()
    {
        Id = Guid.NewGuid();
        CreatedAtUtc = DateTime.UtcNow;
        UpdatedAtUtc = CreatedAtUtc;
    }

    /// <summary>
    /// Marks the entity as logically deleted.
    /// </summary>
    /// <param name="deletedById">The identifier of the actor performing the deletion.</param>
    public void MarkDeleted(string deletedById)
    {
        if (string.IsNullOrWhiteSpace(deletedById))
        {
            throw new ArgumentException("DeletedById is required when deleting an entity.", nameof(deletedById));
        }

        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
        DeletedById = deletedById.Trim();
        UpdatedAtUtc = DeletedAtUtc.Value;
    }

    /// <summary>
    /// Updates the last-updated timestamp.
    /// </summary>
    public void Touch()
    {
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
