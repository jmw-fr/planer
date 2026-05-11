// Copyright (c) WEEGER. GNU General Public License (GPL), version 3.

namespace PlanerSport.Web.Components.Account;

/// <summary>
/// Model for the passkey input component.
/// </summary>
public class PasskeyInputModel
{
    /// <summary>
    /// Passkey Json credential.
    /// </summary>
    public string? CredentialJson { get; set; }

    /// <summary>
    /// Error.
    /// </summary>
    public string? Error { get; set; }
}
