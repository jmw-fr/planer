# Security Plan - Planer Sport Software

## 1. Overview
This document defines mandatory security practices for the Planer Sport project, applicable to **both** technology stacks under consideration: the **.NET/Blazor** solution ([Plan-Developpement-C#.md](Plan-Developpement-C%23.md)) and the **Rust/Flutter** solution ([Plan-Developpement-Rust-Flutter.md](Plan-Developpement-Rust-Flutter.md)). Security requirements are cross-cutting and must be enforced in CI/CD from Phase 1, not treated as a late-stage audit. This is particularly important given the project handles sensitive health/physiotherapy data.

## 2. Dependency / Supply Chain Security
### .NET
- **`dotnet list package --vulnerable`**: scans NuGet packages against known advisories, run in CI on every PR and on a weekly schedule
- **Dependabot** (GitHub, free): automated PRs for vulnerable/outdated NuGet packages
- **NuGet package source validation**: restrict to trusted feeds (nuget.org), lock file (`packages.lock.json`) committed and enforced (`dotnet restore --locked-mode`)

### Rust
- **`cargo audit`**: scans `Cargo.lock` against the RustSec advisory database, run in CI on every PR and weekly
- **`cargo deny`**: license compliance, banned/duplicate dependencies, advisory checks
- **`Cargo.lock` committed and enforced** via `cargo build --locked`
- **Dependabot/Renovate**: automated dependency update PRs

### Common
- No dependency added without a quick check of maintenance status and license
- Critical/high vulnerabilities block merge; medium/low tracked with a remediation deadline

## 3. Static Application Security Testing (SAST)
- **.NET**: Roslyn security analyzers (`Microsoft.CodeAnalysis.NetAnalyzers` with security rules enabled), or free **SonarQube Community Edition** / **SonarCloud** (free for open-source/public repos) for code smells and vulnerability patterns
- **Rust**: `clippy` security-relevant lints (e.g. `clippy::unwrap_used`, integer overflow checks), `cargo-geiger` to detect and audit `unsafe` code usage in the dependency tree
- **Flutter/Dart**: `flutter analyze` with `flutter_lints`/`very_good_analysis`, plus manual review of platform channel code (native bridges) which is the most likely place for memory/security issues
- **Secrets scanning**: **Gitleaks** or **TruffleHog** (both free/OSS) run in CI on every push to catch committed credentials/API keys

## 4. API Security
Applies identically to ASP.Net Core (.NET) and Axum/Actix (Rust) APIs:
- **Authentication**: JWT validation with correct signature/audience/issuer/expiration checks; short-lived access tokens + refresh token rotation
- **Authorization**: enforce role/organization-based access control on every endpoint (deny-by-default), with explicit tests for cross-organization data leakage (a coach must never access another organization's athletes)
- **Input validation**: strict validation/deserialization of all request bodies (`FluentValidation` in .NET, `validator` crate in Rust) to prevent injection and malformed-data attacks
- **Rate limiting**: per-IP/per-user throttling on authentication and public endpoints (ASP.Net Core built-in rate limiting middleware, or `tower-governor`/`actix-governor` in Rust) to mitigate brute-force and DoS
- **HTTPS/TLS everywhere**: enforced at the infrastructure level (Azure Container Apps / App Service), HSTS enabled
- **CORS**: explicit allow-list of origins (Flutter web app domains only), no wildcard `*` in production
- **Security headers**: CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` set on all HTTP responses
- **Sensitive data**: medical/physio notes encrypted at rest (database-level or application-level field encryption) and never logged
- **OWASP API Security Top 10**: used as the baseline checklist for API design and review, particularly BOLA/broken object-level authorization given the multi-tenant (organization) model

## 5. Application Attack Surface / Code-Level Checks
- **SQL injection**: parameterized queries enforced by ORM usage (EF Core / SeaORM / Diesel); no raw string-concatenated SQL allowed, enforced via code review checklist and linter rules where available
- **XSS**: Blazor/Flutter Web output encoding reviewed for any raw HTML rendering; Content Security Policy as defense in depth
- **CSRF**: anti-forgery tokens on state-changing Blazor Server endpoints; SPA/Flutter Web APIs protected via same-site cookies or bearer tokens (not cookie-based auth without CSRF protection)
- **Password storage**: `argon2` (Rust) or ASP.Net Core Identity's default hasher (PBKDF2, or upgraded to Argon2) — never plaintext or weak hashing (MD5/SHA1)
- **Least privilege**: database users/service accounts scoped to only the permissions they need (no shared "admin" DB credentials across services)

## 6. Dynamic Application Security Testing (DAST) & Penetration Testing
- **OWASP ZAP** (free/OSS): automated dynamic scan against staging environment, run before each major release and integrated into CI for baseline scans on every deploy to staging
- **Intrusion tests / penetration testing**: at minimum one external/manual penetration test before production launch (Phase 4 / go-live), covering authentication, authorization, API endpoints and medical data access paths; budget for a professional pentest given the health-data sensitivity (see PRD compliance requirements)
- **Bug bounty / responsible disclosure**: not required for MVP, but a `SECURITY.md` with a responsible disclosure contact should be published from launch

## 7. Container / Docker Image Security
Applies to both stacks since both are containerized (ASP.Net Core and Rust backends, deployed via Docker to Azure Container Apps/AKS):
- **`docker scout cve`** or **Trivy** (Aqua Security, free/OSS): scan every built image for OS and library vulnerabilities in CI, block deployment on critical/high findings
- **Minimal base images**: `mcr.microsoft.com/dotnet/aspnet:*-alpine` or distroless for .NET; `scratch`/`distroless`/`alpine` with a statically-linked `musl` binary for Rust — reduces attack surface significantly
- **Non-root user** in the final image (`USER` directive), read-only root filesystem where possible
- **No secrets baked into images**: all secrets injected at runtime via environment variables/secret stores (Azure Key Vault), never via `ARG`/`ENV` in the Dockerfile or committed `.env` files
- **Image signing/provenance**: consider `cosign` (Sigstore, free/OSS) for signing images once the pipeline matures
- **Multi-stage builds** mandatory to avoid shipping build tools/SDKs in the final runtime image

## 8. Infrastructure & Cloud Security
- **Azure Key Vault** (or equivalent) for all secrets/connection strings; never in source control or `appsettings.json`/`.env` files committed to git
- **Managed identities** for service-to-service Azure authentication instead of static credentials where possible
- **Network segmentation**: database not publicly accessible, private endpoints/VNet integration for production
- **Least-privilege IAM roles** on all Azure resources (RBAC), reviewed periodically
- **Audit logging**: access to sensitive medical data logged and retained per compliance requirements (see PRD)

## 9. CI/CD Security Gates
Minimal security pipeline, blocking merge/deploy on failure, run in parallel with the code-quality pipelines already defined per stack:
```
# Dependency & secrets
dependency vulnerability scan (dotnet list package --vulnerable / cargo audit)
gitleaks detect

# Static analysis
SAST scan (SonarCloud / clippy security lints / Roslyn analyzers)

# Container
docker build
trivy image <image> --severity CRITICAL,HIGH --exit-code 1

# Dynamic (staging only, on deploy)
OWASP ZAP baseline scan against staging URL
```

## 10. Compliance Considerations
- The application processes health-related data (physiotherapy notes); align with GDPR requirements (data minimization, right to erasure, data processing agreements with Azure)
- Data retention and deletion policies documented and implemented, not left to ad hoc decisions
- Access to medical notes restricted to authorized roles only, with audit trail (see section 8)

## 11. Summary Checklist (apply to both stacks)
- [ ] Dependency vulnerability scanning in CI (NuGet + npm/pub if applicable, or Cargo)
- [ ] Secrets scanning in CI (Gitleaks/TruffleHog)
- [ ] SAST integrated in CI (SonarCloud or equivalent)
- [ ] API authN/authZ tested for cross-tenant leakage (BOLA)
- [ ] Rate limiting on public/auth endpoints
- [ ] HTTPS/TLS + security headers enforced
- [ ] Docker images scanned (Trivy/Docker Scout), minimal base image, non-root user, no baked-in secrets
- [ ] DAST baseline scan (OWASP ZAP) against staging
- [ ] External penetration test before production launch
- [ ] Secrets managed via Azure Key Vault, not source control
- [ ] `SECURITY.md` published with responsible disclosure contact
