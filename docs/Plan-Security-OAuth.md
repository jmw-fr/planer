# OAuth / Authentication Plan - Planer Sport

## 1. Context

This document recommends an authentication solution for the Planer Sport application, tailored to its architecture:

- **Backend**: Rust / Axum (with the .NET / ASP.NET Core solution as an alternative)
- **Client**: Flutter (web + mobile)
- **Model**: multi-tenant (organization) with coach / athlete / admin roles
- **Data sensitivity**: health / physiotherapy data (GDPR-relevant)
- **Hosting**: Azure (containerized deployment)

It refines the Phase 1 plan ("JWT now, Azure AD B2C later" — see [Phase1-Technical-Choices.md](../specs/Phase1/Phase1-Technical-Choices.md)) and complements the cross-cutting requirements in [Plan-Securite.md](Plan-Securite.md).

## 2. Short Answer

**Do not build OAuth/OIDC yourself. Use a managed or self-hosted identity provider (IdP) and make the Rust API a pure OAuth2/OIDC *resource server* that only validates JWTs.**

The Phase 1 plan already anticipated "JWT now, Azure AD B2C later". The key correction: **Azure AD B2C is now deprecated for new tenants**, so a modern alternative must be chosen.

## 3. Recommended Options (ranked for this project)

### 3.1 Keycloak (self-hosted) — best fit for control + no per-user cost
- Full OIDC/OAuth2, refresh token rotation, PKCE, social logins, TOTP/MFA out of the box.
- **Multi-tenancy** maps naturally to the organization model via *realms* or *groups/roles* — important for the BOLA / cross-tenant requirements in [Plan-Securite.md](Plan-Securite.md).
- Runs as a container next to the Rust backend (already containerized for Azure Container Apps).
- Free/OSS, GDPR-friendly since identity data stays in the Azure tenant (matters for health data).
- Cost: self-operated (DB + container), no per-MAU billing.

### 3.2 Microsoft Entra External ID — best if a fully managed Azure service is preferred
- The **successor to Azure AD B2C** (which is closed to new tenants). Since hosting targets Azure, this is the natural managed path the original plan intended.
- Managed MFA, social/enterprise federation, generous free tier.
- Trade-off: less flexible multi-tenant modeling than Keycloak; organizations modeled via app roles / custom claims.

### 3.3 Auth0 / Clerk / Logto — fastest to ship
- **Logto** (OSS, self-hostable or cloud) is a strong modern middle ground with good multi-tenant / "organizations" support and first-class SDKs.
- Auth0 / Clerk are the quickest but get expensive at scale and store user data outside the tenant (a GDPR consideration for health data).

## 4. Architecture Pattern (applies to any choice)

```
Flutter (web + mobile)                Rust/Axum API                IdP (Keycloak / Entra External ID)
   Authorization Code + PKCE  ───────────────────────────────────────►  login, MFA, consent
        │  access + refresh tokens ◄──────────────────────────────────  issues JWT (RS256)
        │
        └─ Bearer access token ──►  validate signature/iss/aud/exp
                                     via JWKS (cached), enforce org/role
```

Key implementation points:

- **Flutter**: use Authorization Code flow **with PKCE** (never implicit or password grant). Packages: `flutter_appauth` (mobile) / `openid_client` or `oauth2` (web). Store tokens in `flutter_secure_storage` (Keychain / Keystore), **not** shared preferences.
- **Rust/Axum**: validate JWTs with `jsonwebtoken` + a JWKS cache (`jwks-client` / `reqwest`), or a `tower` middleware layer. Check `iss`, `aud`, `exp`, and enforce the organization claim on every endpoint (deny-by-default) — directly satisfies the BOLA / cross-tenant tests required in section 4 of [Plan-Securite.md](Plan-Securite.md).
- **Short-lived access tokens** (5–15 min) + **refresh token rotation** — handled by the IdP, not reimplemented.

## 5. Recommendation

Given health data + GDPR + multi-tenant + already self-hosting containers on Azure: **Keycloak**. It keeps all identity data in the tenant, models organizations cleanly, costs nothing per user, and turns the Rust API into a simple JWT resource server.

Choose **Entra External ID** instead only if operating an IdP is undesirable and a fully managed Azure service is preferred.

## 6. Decision

**The project will use [Keycloak](https://www.keycloak.org/) (self-hosted) as its identity provider** (option 3.1).

Keycloak was selected over the alternatives above because it keeps all identity data in the Azure tenant (GDPR-relevant for health data), models the multi-tenant organization structure cleanly via realms/groups, costs nothing per user, fits the already-containerized deployment, and turns the Rust API into a simple JWT resource server.

Follow-up work:
- Scaffold the Axum JWT-validation middleware (Keycloak JWKS + `iss`/`aud`/`exp` checks + org/role claim enforcement, deny-by-default).
- Implement the Flutter PKCE auth flow against Keycloak (`flutter_appauth` / `openid_client`) with secure token storage.
- Stand up a Keycloak container + PostgreSQL for local development, then plan production deployment on Azure Container Apps with Key Vault-managed secrets.
- Add cross-tenant (BOLA) authorization tests per [Plan-Securite.md](Plan-Securite.md) section 4.
