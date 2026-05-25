# Implementation Plan: Fondation CRUD de l'entité Sport

**Branch**: `001-domain-entity-crud` | **Date**: 2026-05-25 | **Spec**: `specs/001-domain-entity-crud/spec.md`

**Input**: Feature specification from `/specs/001-domain-entity-crud/spec.md`

**Note**: Ce plan est généré par `/speckit.plan` et aligne la livraison sur l'architecture existante.

## Summary

Livrer un prototype `Sport` en tant que première entité de domaine complète dans PlanerSport, avec création, mise à jour et suppression logique. La mise en œuvre doit établir un socle réutilisable pour les futures entités, en s'appuyant sur le stack .NET existant (ASP.NET Core, EF Core, gRPC) et sur des métadonnées de cycle de vie partagées pour éviter la duplication.

## Technical Context

**Language/Version**: .NET 10 / C# (déjà utilisé dans le dépôt)

**Primary Dependencies**: ASP.NET Core, Entity Framework Core, gRPC, ASP.NET Core Identity, Npgsql/PostgreSQL.

**Storage**: PostgreSQL via EF Core `ApplicationDbContext` dans `src/PlanerSport.Infrastructure`.

**Testing**: xUnit (tests existants dans `tests/PlanerSport.Core.Tests` et `tests/PlanerSport.Api.Tests`), plus tests d'intégration gRPC et tests de validation métier.

**Target Platform**: Serveur Web ASP.NET Core avec API gRPC et interface Web existante.

**Project Type**: Web service / backend avec domaine .NET et API gRPC. Le projet principal est `src/PlanerSport.Api` et `src/PlanerSport.Web`l'interface Web utilisateur; `src/PlanerSport.AppHost` est le projet d'hébergement Aspire.

**Performance Goals**: modèle métier léger et cohérent pour un catalogue de sports; l'objectif est la qualité, la maintenabilité et l'intégrité des données.

**Constraints**: alignement strict avec l'architecture .NET/C# existante; pas de nouveau framework majeur; les sports supprimés doivent rester conservés pour l'historique tout en étant exclus des vues actives normales.

**Scale/Scope**: première entité de domaine dans la solution, socle pour la réutilisation du comportement d'identité, de validation et de suppression logique.

## Constitution Check

- `Language & Documentation` : la spécification est en français et les identifiants techniques sont en anglais.
- `Additional Constraints` : le plan reste dans l'architecture .NET/C# existante, sans introduction de plate-forme nouvelle.
- `Iteration Within Constraints` : la solution choisie réutilise les projets existants plutôt que de créer une nouvelle application.
- Point de clarification : la spécification mentionne `002-domain-entity-crud` alors que le dossier de feature et la branche active sont `001-domain-entity-crud`. Cette discordance doit être résolue.

## Project Structure

### Documentation (this feature)

```text
specs/001-domain-entity-crud/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── grpc-sport-service.md
└── spec.md
```

### Source Code (repository root)

```text
src/
├── PlanerSport.Api/              # projet principal gRPC API
│   └── Protos/
├── PlanerSport.Core/             # domaine et agrégats métier
│   └── ApplicationUserAggregate/
├── PlanerSport.Infrastructure/   # EF Core, ApplicationDbContext, migrations
├── PlanerSport.UseCases/         # logique de cas d'utilisation métier
├── PlanerSport.Web/              # interface utilisateur front-end Web
└── PlanerSport.AppHost/          # projet d'hébergement Aspire

tests/
├── PlanerSport.Core.Tests/       # tests de domaine
└── PlanerSport.Api.Tests/        # tests API / intégration
```

**Structure Decision**: Utiliser l'architecture existante du dépôt et ajouter `Sport` comme un agrégat de domaine dans `src/PlanerSport.Core`, un mapping EF Core dans `src/PlanerSport.Infrastructure`, un contrat gRPC dans `src/PlanerSport.Api`, et une logique métier dans `src/PlanerSport.UseCases`.

## Complexity Tracking

Aucun écart de constitution significatif n'est proposé. La solution reste alignée avec les principes du dépôt.
