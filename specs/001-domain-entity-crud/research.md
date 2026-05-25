# research.md

## Decision: Use existing .NET/C# architecture with EF Core soft-delete foundation

- Chosen implementation platform: .NET 10 / C# using ASP.NET Core, EF Core, gRPC, and the existing solution structure.
- Reason: The repository already aligns with this stack, and the constitution explicitly requires staying within the existing .NET architecture and avoiding unrelated platform risk.
- Alternative rejected: Implementing sport persistence in a new data platform or using database-specific scripts instead of EF Core would violate the constitution and add unnecessary platform risk.

## Decision: Model `Sport` as a first domain aggregate with shared lifecycle metadata

- Chosen design: Create a `Sport` aggregate backed by a reusable domain base type for identity, timestamps, and logical deletion state.
- Reason: The feature requirement is explicitly about establishing a reusable entity foundation for future domain objects, so the first entity must prove the pattern and avoid duplication.
- Alternatives considered: Exposing a plain data table with delete flags only at API level; rejected because it would not provide a reusable domain contract for future entities.

## Decision: Implement logical deletion with EF Core global query filters

- Chosen behavior: Use `IsDeleted` (or equivalent) plus `DeletedAtUtc` and `DeletedById` to represent soft deletion, with global query filters on active reads.
- Reason: The requirement mandates that deleted sports are hidden from normal active views while preserving history; global filters enforce that across queries and reduce accidental exposure.
- Alternatives considered: Soft delete handled only in service layer, not in EF Core; rejected because it leaves too much responsibility to call sites and increases the chance of inconsistent exposure.

## Decision: Seed default sports through EF Core migration/initializer

- Chosen seed strategy: Provide a repeatable EF Core data seed or initializer that creates default sports and avoids duplicates on rerun.
- Reason: The spec requires seeding default sports and the ability to rerun the seed safely without duplicates.
- Alternatives considered: One-time seed script outside EF Core; rejected because the repository already uses EF Core migrations and the seed should ride the same database lifecycle.

## Decision: Define gRPC contract for sport CRUD and keep UI integration optional

- Chosen contract: Add a `SportService` gRPC contract in `src/PlanerSport.Api/Protos` as the primary external interface for sport CRUD operations.
- Reason: The current API layer already contains gRPC definitions and the service will integrate cleanly with the existing `PlanerSport.Api` project.
- Alternatives considered: Implement REST-only endpoints; rejected because the repository is already wired for gRPC and the contract should remain consistent with existing service patterns.

## Alternatives considered and rejected

- Using physical deletion instead of logical deletion: rejected because the feature explicitly requires keeping deleted sports for history and audit.
- Carrying `Sport` directly in UI-only state without a domain model: rejected because the feature needs a reusable foundation and domain-level validation.
- Adding a generic repository abstraction before the first entity exists: rejected because it would over-engineer the first implementation without proven reuse.

## Outcome summary

The project will extend the current .NET solution by adding a domain aggregate in `src/PlanerSport.Core`, EF Core mapping and migration support in `src/PlanerSport.Infrastructure`, a gRPC contract in `src/PlanerSport.Api`, and use-case boundaries in `src/PlanerSport.UseCases`. This keeps the implementation aligned with the constitution while delivering the required entity lifecycle and reusable foundations.
