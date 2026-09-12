# Phase 1 — Technical Choices

## 1. Phase 1 objective
- Set up the technical foundation of the product.
- Deliver a stable backend API and a basic web prototype.
- Validate the stack choices, the development chain and the deployment strategy.
- Prioritize the architecture to allow evolution toward Phase 2 and 3.

## 2. Scope
- REST API backend in ASP.NET Core.
- Aspire project for the test environment,
- PostgreSQL database.
- Web frontend with Blazor WebAssembly.
- JWT authentication for now.
- Setup of unit tests.
- Setup of integration tests with Aspire.
- Initial architecture documentation.

## 3. Technology choices

### 3.1 Backend
- `ASP.NET Core` (C#) for the API.
- Reason: .NET maturity, C# productivity, good Azure integration, scalability.
- Recommended architecture:
  - API layer (controllers)
  - application/services layer
  - data layer (EF Core / simple repository)
  - shared model / DTOs

### 3.2 Database
- `PostgreSQL`
- Reason:
  - open source, robust, performant
  - good cloud and container support
  - easy to migrate to Azure Database for PostgreSQL or an equivalent managed service
  - support for advanced types useful later (JSONB, arrays, etc.)
- Phase 1 strategy:
  - local dev: Aspire
  - planned production: Azure Database for PostgreSQL or an equivalent managed service

### 3.3 ORM / data access
- `Entity Framework Core` + `Npgsql` for PostgreSQL
- Reason:
  - Data Access productivity
  - EF Core migrations
  - .NET compatibility

### 3.4 Web Frontend
- `Blazor WebAssembly`
- Reason:
  - C# skill sharing with the backend
  - fast prototyping
  - good fit for a coach/manager dashboard
- Phase 1: basic interface for login, dashboard, navigation and a few CRUD screens.

### 3.5 Mobile
- `Flutter` remains the mobile target.
- Phase 1: mobile API documentation, no priority mobile development.
- Objective: define the REST endpoints and data contracts usable by Flutter.

### 3.6 Authentication and security
- Phase 1: `JWT`
  - backend generates access tokens.
  - API secured by token.
- Users: organization, coach/athlete/admin role.
- Future phase: migration to Azure AD B2C if enterprise authentication is needed.

### 3.7 Notifications
- Phase 1: email notifications and internal event system.
- Real push and Notification Hubs in Phase 2/3.

### 3.8 Infrastructure and hosting
- Main option: `Azure`
  - App Service for the backend
  - Static Web Apps or App Service for Blazor
  - Azure Database for PostgreSQL
- Phase 1 can remain in local dev + simple hosting.
- CI pipeline: `GitHub Actions`.

## 4. Target architecture

### 4.1 Functional diagram
- Blazor web frontend <-> ASP.NET Core API
- API <-> PostgreSQL via EF Core
- JWT authentication handled in the API
- Business data: users, organizations, roles, plans, sessions, templates, feedback

### 4.2 Main Phase 1 entities
- Organization
- User
- Role
- Calendar / Schedule
- Session
- Exercise template
- Basic load / feedback

### 4.3 Principles
- decouple business logic from data access
- define stable API contracts
- favor simplicity and a solid foundation
- plan for extending the model toward advanced features

## 5. Development environment
- .NET 8+ or 9 (depending on availability)
- Visual Studio / VS Code
- Local PostgreSQL via Aspire
- GitHub repo + `main`, `dev`, `feature/*` branches

## 6. Tests and quality
- backend unit tests (service + data)
- simple integration tests for the API
- EF Core migration verification
- architecture and documentation review

## 7. Phase 1 schedule
- Week 1-2:
  - repo setup
  - project structure
  - backend / DB / authentication choices
- Week 3-4:
  - user/organization API
  - PostgreSQL data model
  - first CRUD routes
- Week 5-6:
  - Blazor frontend prototype
  - tests
  - technical documentation
  - architecture validation

## 8. Risks and mitigations
- Risk: poor backend structuring.
  - Mitigation: clear definition of layers and API contracts.
- Risk: unsuitable DB choice.
  - Mitigation: PostgreSQL chosen for flexibility and cloud readiness.
- Risk: authentication getting stuck.
  - Mitigation: start simple with JWT, replace progressively.

## 9. Recommendations
- Start with the API and the data model.
- Document the endpoints and the PostgreSQL schema.
- Do not try to deliver the whole product in Phase 1: validate the foundation.
- Prepare a clean base to move on to planning/calendar in Phase 2.
