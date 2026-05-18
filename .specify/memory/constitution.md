<!--
Version change: none → 1.0.0
Modified principles:
- Placeholder 1 → User Value First
- Placeholder 2 → Incremental Quality
- Placeholder 3 → Data Integrity & Privacy
- Placeholder 4 → Observability & Operational Resilience
- Placeholder 5 → Iteration Within Constraints
Added sections:
- Additional Constraints
- Development Workflow
Removed sections:
- None
Templates reviewed:
- .specify/templates/plan-template.md ✅
- .specify/templates/spec-template.md ✅
- .specify/templates/tasks-template.md ✅
- .specify/templates/constitution-template.md ✅
Follow-up TODOs:
- None
-->
# PlanerSport Constitution

## Core Principles

### User Value First
All work MUST be grounded in athlete, coach, or planning team outcomes. The project prioritizes features and fixes that deliver usable progress in each iteration; avoid speculative scope and maximize measurable value in every release.

### Incremental Quality
Every change MUST be safe, observable, and maintainable. Code is only accepted when it includes tests, documentation or a documented exception, and when it reduces future complexity rather than adding hidden debt.

### Data Integrity & Privacy
The project MUST protect training schedules, user identity, and session data through explicit validation, least-privilege access, and secure handling of sensitive data. Data correctness and privacy are non-negotiable requirements for all services.

### Observability & Operational Resilience
Production and development systems MUST provide clear visibility into failures, performance, and behavior. Logging, error reporting, and recovery behavior are required so issues can be diagnosed and remediated without guesswork.

### Iteration Within Constraints
The team MUST choose the simplest viable solution that meets requirements, respect the existing .NET architecture, and avoid introducing unrelated platform or framework risk. Scope decisions are governed by practical trade-offs, not by feature wish lists.

## Additional Constraints
The project is required to stay aligned with the existing PlanerSport architecture: .NET/C#, ASP.NET Core, gRPC/HTTP APIs, EF Core migrations, and the current solution structure. New technology or major platform changes MUST be explicitly approved and documented in the specification.

## Development Workflow
All changes MUST be delivered through feature branches, reviewed in PRs, and validated by automated builds and tests. PR descriptions MUST cite the applicable constitution principles, and any deviation from the principles MUST be justified in writing.

## Governance
This constitution is the authoritative source for project-level development expectations. Amendments MUST be documented, reviewed by the project owner, and accompanied by a version bump and migration rationale.

- New principles or materially expanded guidance require a MINOR version bump.
- Removals or redefinitions of principles require a MAJOR version bump.
- Clarifications, wording improvements, and non-substantive refinements require a PATCH version bump.
- PRs MUST reference impacted constitution principles if they change system design, architecture, security, or release behavior.

**Version**: 1.0.0 | **Ratified**: 2026-05-18 | **Last Amended**: 2026-05-18
