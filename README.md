# Planer Sport

Planer Sport is a sports training planning management software: season planning, sessions, exercise templates, attendance/feedback tracking, and a real-time guided mode for athletes. The full requirements are described in [docs/PRD-logiciel-gestion-planning-entrainement.md](docs/PRD-logiciel-gestion-planning-entrainement.md).

## Repository structure

This repository contains two separate implementations of the same product:

- [`dotnet/`](dotnet/) - Historical implementation: ASP.NET Core (C#) backend + Blazor frontend, Flutter mobile app. See [docs/Plan-Developpement-C#.md](docs/Plan-Developpement-C%23.md).
- [`rust-flutter/`](rust-flutter/) - New implementation: Rust backend + Flutter frontend (web and mobile). See [docs/Plan-Developpement-Rust-Flutter.md](docs/Plan-Developpement-Rust-Flutter.md).

Security requirements applicable to both implementations are described in [docs/Plan-Securite.md](docs/Plan-Securite.md).

Each folder is self-contained (its own build, its own dependencies); refer to its README/development plan for specific instructions.

## .NET implementation

### Migrations

```powershell
dotnet ef migrations add CreateIdentitySchema --project dotnet/src/PlanerSport.Infrastructure --startup-project dotnet/src/PlanerSport.Api
```