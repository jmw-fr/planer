// Copyright (c) WEEGER. GNU General Public License (GPL), version 3.

namespace PlanerSport.Web.Components.Account;

/// <summary>
/// Passkey operation type.
/// </summary>
public enum PasskeyOperation
{
    /// <summary>
    /// Create a new passkey.
    /// </summary>
    Create = 0,

    /// <summary>
    /// Request an existing passkey.
    /// </summary>
    Request = 1,
}
