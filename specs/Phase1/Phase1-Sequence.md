# Phase 1 — Sequence of steps

## Objective
Describe the order of work for phase 1 to kick off development, validate the architecture and enable a clean transition to phase 2.

## 1. Preparation and initial scoping (Week 1)

1. Review the PRD and the technical choices document.
2. Create or validate the Git repo structure.
3. Define the main Git branches: `main`, `dev`, `feature/*`.
4. Validate the tools and environments: .NET, Docker, VS Code/Visual Studio, local PostgreSQL.

## 2. Backend setup (Week 1-2)

1. Initialize the ASP.NET Core project.
2. Create the base structure: API, services, data, shared models.
3. Add EF Core and Npgsql for PostgreSQL.
4. Define the initial Phase 1 data model: organization, user, role, session, template.
5. Implement the PostgreSQL connection configuration and the first migration.

## 3. Authentication and security (Week 2)

1. Implement simple JWT authentication.
2. Create the user and role entities.
3. Protect the main API routes with authorization.
4. Add organization management.

## 4. Basic API endpoints (Week 2-3)

1. Implement the CRUD endpoints for:
   - organizations
   - users
   - roles
   - exercise templates
   - sessions
2. Add basic pagination/filtering if needed.
3. Validate the API contracts and document the routes.

## 5. Backend tests (Week 3-4)

1. Create the base unit tests for services and business logic.
2. Add simple integration tests for the API.
3. Verify migrations and PostgreSQL behavior.

## 6. Phase 1 frontend setup (Week 4-6)

1. Initialize the Blazor WebAssembly project.
2. Implement the login/sign-in flow.
3. Create a simple dashboard for coach/manager.
4. Add basic CRUD screens for organizations, users, sessions and templates.
5. Consume the backend API and verify the data flow.

## 7. Integration and pipeline (Week 5-6)

1. Configure a GitHub Actions pipeline for build and tests.
2. Verify the backend and frontend build.
3. Automate unit test execution.
4. Validate a basic deployment on a dev or local environment.

## 8. Phase 1 delivery (End of week 6)

1. Perform an architecture review of the delivered components.
2. Documents: architecture, API endpoints, database schema.
3. Verify compliance with the defined technical choices.
4. Prepare the transition to Phase 2.

## Notes
- Prioritize the elements that bring the most value and stability.
- Do not over-complicate the first deliverables: the goal is a solid foundation.
- All elements must remain easily extensible for Phase 2.
