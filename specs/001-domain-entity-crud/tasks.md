# Tasks: Fondation CRUD de l'entité Sport

**Input**: Design documents from `/specs/001-domain-entity-crud/`

**Prerequisites**: `specs/001-domain-entity-crud/spec.md`, `specs/001-domain-entity-crud/plan.md`, `specs/001-domain-entity-crud/data-model.md`, `specs/001-domain-entity-crud/contracts/`, `specs/001-domain-entity-crud/research.md`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Établir la base de code partagée pour Sport, la configuration EF Core, le contrat gRPC et la seed réexécutable.

- [X] T001 Create `src/PlanerSport.Core/DomainEntityBase.cs` with reusable lifecycle metadata, soft-delete fields, and creation/update timestamps
- [X] T002 Create `src/PlanerSport.Core/SportAggregate/Sport.cs` with `Id`, `Name`, `Code`, `Description`, `IsDeleted`, `DeletedAtUtc`, `DeletedById`, `CreatedAtUtc`, `UpdatedAtUtc`, and constructor/invariants for required fields
- [X] T003 Update `src/PlanerSport.Infrastructure/ApplicationDbContext.cs` to add `DbSet<Sport> Sports`
- [X] T004 Create `src/PlanerSport.Infrastructure/SportEntityTypeConfiguration.cs` to configure EF Core mapping for `Sport` with a global query filter for `IsDeleted = false`, unique index on `Name` for active sports, and column mappings for lifecycle metadata
- [X] T005 Create `src/PlanerSport.Infrastructure/SportSeedData.cs` and integrate it into startup so default sports are seeded idempotently without duplicates
- [X] T006 Create `src/PlanerSport.Api/Protos/sport.proto` defining `SportService` with `CreateSport`, `UpdateSport`, `DeleteSport`, `GetSport`, and `ListSports`, plus message contracts for `SportResponse`, `CreateSportRequest`, `UpdateSportRequest`, `DeleteSportRequest`, `GetSportRequest`, and `ListSportsRequest`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Construire les abstractions partagées de cas d'utilisation et configurer le projet principal `PlanerSport.Api` ainsi que l'hébergement Aspire.

- [ ] T007 Create `src/PlanerSport.UseCases/Sport/ISportRepository.cs` with methods for `AddAsync`, `UpdateAsync`, `DeleteAsync`, `GetByIdAsync`, and `ListActiveAsync`
- [ ] T008 Create `src/PlanerSport.UseCases/Sport/SportRepository.cs` implementing `ISportRepository` using `ApplicationDbContext`
- [ ] T009 Create `src/PlanerSport.UseCases/Sport/SportService.cs` with methods for `CreateSportAsync`, `UpdateSportAsync`, and `DeleteSportAsync` that enforce validation, uniqueness, identity stability, and logical deletion rules
- [ ] T010 Update `src/PlanerSport.AppHost/AppHost.cs` to register `ISportRepository`, `SportRepository`, and `SportService` in dependency injection and to execute sport seeding during startup
- [ ] T011 Add `src/PlanerSport.Api/Services/SportMapper.cs` to translate between gRPC messages and domain objects
- [ ] T012 Add `src/PlanerSport.Api/Services/SportService.cs` skeleton that references `SportService` use cases and exposes the gRPC methods defined in `sport.proto`

---

## Phase 3: User Story 1 - Créer un sport disponible (Priority: P1) 🎯 MVP

**Goal**: Livrer une création de sport valide et visible dans les listes actives.

**Independent Test**: Créer un sport valide, vérifier qu'il apparaît dans `ListSports` et que la requête de création respecte la validation.

### Tests

- [ ] T013 [P] [US1] Add unit tests for sport creation validation in `tests/PlanerSport.Core.Tests/SportCreateTests.cs`
- [ ] T014 [P] [US1] Add integration test for `CreateSport` gRPC in `tests/PlanerSport.Api.Tests/SportServiceIntegrationTests.cs`

### Implementation

- [ ] T015 [US1] Implement `CreateSportAsync` in `src/PlanerSport.UseCases/Sport/SportService.cs` with validation for required fields, uniqueness, and stable identity
- [ ] T016 [US1] Implement `CreateSport` gRPC handling in `src/PlanerSport.Api/Services/SportService.cs` and map request/response using `SportMapper.cs`
- [ ] T017 [US1] Ensure `Sport` is stored active (`IsDeleted = false`) and appears in active listings by default

**Checkpoint**: User Story 1 should be testable independently once the above tasks are complete.

---

## Phase 4: User Story 2 - Mettre à jour un sport existant (Priority: P2)

**Goal**: Permettre la mise à jour d'un sport actif tout en conservant son identité.

**Independent Test**: Mettre à jour un champ valide d'un sport actif et vérifier la nouvelle valeur sans créer de doublon.

### Tests

- [ ] T018 [P] [US2] Add unit tests for sport update validation in `tests/PlanerSport.Core.Tests/SportUpdateTests.cs`
- [ ] T019 [P] [US2] Add integration test for `UpdateSport` gRPC in `tests/PlanerSport.Api.Tests/SportServiceIntegrationTests.cs`

### Implementation

- [ ] T020 [US2] Implement `UpdateSportAsync` in `src/PlanerSport.UseCases/Sport/SportService.cs` with checks for active state, identity stability, validation, and uniqueness
- [ ] T021 [US2] Implement `UpdateSport` gRPC handling in `src/PlanerSport.Api/Services/SportService.cs` and map request/response via `SportMapper.cs`
- [ ] T022 [US2] Ensure updates to a deleted sport are rejected and active sports retain the same `Id`

**Checkpoint**: User Story 2 should be independently testable with a valid update scenario and invalid update rejection.

---

## Phase 5: User Story 3 - Supprimer un sport sans perdre l'historique (Priority: P3)

**Goal**: Support logical deletion of sports while preserving historical records.

**Independent Test**: Supprimer un sport actif, vérifier qu'il n'apparaît plus dans `ListSports` et que l'historique reste stocké.

### Tests

- [ ] T023 [P] [US3] Add unit tests for soft delete behavior in `tests/PlanerSport.Core.Tests/SportDeleteTests.cs`
- [ ] T024 [P] [US3] Add integration test for `DeleteSport` gRPC and active view filtering in `tests/PlanerSport.Api.Tests/SportServiceIntegrationTests.cs`

### Implementation

- [ ] T025 [US3] Implement `DeleteSportAsync` in `src/PlanerSport.UseCases/Sport/SportService.cs` to set `IsDeleted = true`, `DeletedAtUtc`, and `DeletedById` while preventing normal updates
- [ ] T026 [US3] Implement `DeleteSport` gRPC handling in `src/PlanerSport.Api/Services/SportService.cs`
- [ ] T027 [US3] Ensure `ListSports` and active queries exclude logically deleted sports by default

**Checkpoint**: User Story 3 should be independently testable with deletion and active-list exclusion.

---

## Phase 6: User Story 4 - Réutiliser le comportement commun des entités futures (Priority: P4)

**Goal**: Document and solidifier la base réutilisable de l'entité pour les futures entités de domaine.

**Independent Test**: Vérifier que la documentation et les commentaires signalent clairement comment de nouvelles entités doivent réutiliser `DomainEntityBase` et le comportement de suppression logique.

### Implementation

- [ ] T028 [US4] Add documentation comments in `src/PlanerSport.Core/DomainEntityBase.cs` explaining reuse expectations for future entities
- [ ] T029 [US4] Add comments in `src/PlanerSport.Core/SportAggregate/Sport.cs` that describe the entity lifecycle and validation contract
- [ ] T030 [US4] Update `specs/001-domain-entity-crud/quickstart.md` to document how future entities should reuse `DomainEntityBase` and logical delete patterns
- [ ] T031 [US4] Update `specs/001-domain-entity-crud/data-model.md` to make the reusable entity foundation explicit and give examples of future entity reuse

**Checkpoint**: User Story 4 should be independently testable by reviewing the documentation and verifying the reusable foundation.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, documentation, test execution, and branch naming consistency.

- [ ] T032 [P] Review `src/PlanerSport.Api/Protos/sport.proto`, `src/PlanerSport.Api/Services/SportService.cs`, and use-case integration for consistency and API contract accuracy
- [ ] T033 [P] Update `specs/001-domain-entity-crud/plan.md` to correct the branch naming and finalize architecture notes
- [ ] T034 [P] Run `dotnet test tests/PlanerSport.Core.Tests/PlanerSport.Core.Tests.csproj` and `dotnet test tests/PlanerSport.Api.Tests/PlanerSport.Api.Tests.csproj`
- [ ] T035 [P] Confirm `specs/001-domain-entity-crud/quickstart.md` matches the final implementation and startup flow

---

## Dependencies & Execution Order

### Phase Dependencies

- `Phase 1: Setup` can begin immediately
- `Phase 2: Foundational` depends on completion of Phase 1
- `Phase 3+` user stories depend on completion of Phase 2
- `Phase 7: Polish` depends on completion of all user stories

### User Story Dependencies

- `US1` can begin after `Phase 2` and does not depend on other stories
- `US2` can begin after `Phase 2`; it should remain independently testable from `US1`
- `US3` can begin after `Phase 2`; it should remain independently testable from `US1` and `US2`
- `US4` can begin after `Phase 2`; it documents the shared foundation and is independently testable by review

### Parallel Opportunities

- `T001`, `T002`, `T003`, `T004`, `T005`, and `T006` can be worked in parallel where team capacity allows
- `T007`, `T008`, `T009`, `T010`, `T011`, and `T012` can be worked in parallel once Setup is complete
- `US1`, `US2`, `US3`, and `US4` phases can proceed in parallel after Foundational phase completion
- Test creation tasks within each story are marked `[P]` and can execute in parallel with implementation tasks

### Parallel Example: User Story 1

```bash
# In parallel:
# - Add unit tests for CreateSport
# - Add integration tests for CreateSport
# - Implement CreateSport business logic
# - Implement CreateSport gRPC mapping
```

### Parallel Example: User Story 2

```bash
# In parallel:
# - Add unit tests for UpdateSport
# - Add integration tests for UpdateSport
# - Implement UpdateSport business logic
# - Implement UpdateSport gRPC mapping
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2
2. Deliver User Story 1 and validate independently
3. Stop for review before adding US2 and US3

### Incremental Delivery

1. Deliver Phase 1 + Phase 2 as shared foundation
2. Deliver US1 as the first usable slice
3. Deliver US2 and US3 as additional increments
4. Deliver US4 as the reusable foundation and documentation increment

### Final Validation

- Verify `CreateSport`, `UpdateSport`, and `DeleteSport` behaviors through unit and integration tests
- Verify logically deleted sports are excluded from active view by default
- Verify the seed is repeatable and does not create duplicates
- Verify the API contract in `src/PlanerSport.Api/Protos/sport.proto` matches the implementation
