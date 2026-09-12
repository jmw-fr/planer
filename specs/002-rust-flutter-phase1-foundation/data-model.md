# Phase 1 Data Model: Foundation Setup

This feature introduces **no business data entities** (per spec FR-014 — business features such as users, organizations, sessions, and templates are explicitly out of scope for this phase; they will be modeled in subsequent feature specs). The only persistence-related structures are the technical scaffolding needed to prove the database/migration pipeline works end-to-end.

## Technical Entities

### Migration History (SeaORM-managed)

- **Purpose**: Table automatically created/managed by `sea-orm-cli` (`seaql_migrations`) to track which migrations have been applied.
- **Fields**: `version` (string, migration identifier), `applied_at` (timestamp).
- **Lifecycle**: Created by the first `sea-orm-cli migrate up` run; read on every application startup to verify the schema is up to date.
- **Validation rules**: None business-specific; managed entirely by the SeaORM migration tooling.

### Health Check (in-memory, not persisted)

- **Purpose**: Represents the runtime status returned by the `/health` endpoint (see `contracts/health-check-api.md`).
- **Fields**: `status` (enum: `ok` | `degraded`), `database` (enum: `connected` | `unreachable`), `version` (string, backend build/crate version).
- **Lifecycle**: Computed on each request; not stored.
- **Validation rules**: `status` is `ok` only when `database` is `connected`.

## Notes for Future Phases

Real business entities (Organization, User, Role, Session, Exercise Template, Calendar/Schedule — see [specs/Phase1/Phase1-Technical-Choices.md](../Phase1/Phase1-Technical-Choices.md) §4.2 for the equivalent .NET-phase entities) will be introduced by a dedicated follow-up feature spec once this foundation is merged, keeping this phase focused purely on scaffolding.
