# Development Plan - Planer Sport Software (Rust + Flutter Stack)

## 1. Overview
Based on the established PRD, this plan details the MVP delivery in 4 main phases over 4-5 months, with a team of 4-5 developers, replacing the .NET/Blazor stack with a **Rust** (backend) and **Flutter** (web + mobile frontend) stack.
Unlike the C# version, Flutter is used here for both mobile (iOS/Android) and web (coach/manager/admin), in order to maximize UI code sharing, since the backend is no longer C# and can no longer share code with Blazor.

## 2. Final Technology Stack
- **Web Frontend**: Flutter Web - Coach/manager/admin interface
- **Mobile Frontend**: Flutter - iOS/Android applications (athlete and field coach)
- **Backend**: Rust (**Axum** or **Actix Web** framework) - RESTful API (+ optional gRPC via **Tonic** for real-time streams)
- **ORM / data access**: **SeaORM** or **Diesel**
- **Database**: PostgreSQL (Azure Database for PostgreSQL)
- **Real-time**: native Rust WebSockets (tokio-tungstenite) or gRPC streaming (Tonic) for the guided mode
- **Authentication**: JWT (`jsonwebtoken` crate) + possibly Azure AD B2C in front
- **Notifications**: Azure Notification Hubs (called from the Rust backend via REST API)
- **DB migrations**: `sqlx-cli` or `sea-orm-cli`
- **Containerization**: Docker (multi-stage Rust image, static binary via `musl`)
- **Observability**: `tracing` + OpenTelemetry

### Why this choice
- Rust brings high performance and strong memory safety, relevant for a backend that handles health data (physio) and real-time features (guided mode).
- Unified Flutter (web + mobile) reduces UI duplication and the number of languages used by the team, compensating for the loss of C#/Blazor code sharing.
- PostgreSQL is the most mature native choice in the Rust ecosystem (via `sqlx`/`SeaORM`/`Diesel`), simpler than SQL Server on the Rust tooling side.

## 3. Code Quality Requirements
Use of the Rust **core toolchain** is mandatory for all backend code, from day one of Phase 1 onward, and enforced in CI (no merge to `main` without passing checks).

### Mandatory tools
- **`rustfmt`** (`cargo fmt --check`): consistent code formatting, no manual style debates. Run as a pre-commit hook and CI gate.
- **`clippy`** (`cargo clippy --all-targets --all-features -- -D warnings`): linting for correctness, performance and idiomatic style. Zero warnings allowed on `main`.
- **`cargo check`**/**`cargo build`**: warnings treated as errors project-wide (`#![deny(warnings)]` or `RUSTFLAGS="-D warnings"` in CI), no exceptions merged to `main`.
- **`cargo test`**: unit and integration tests required for all business logic (domain crate) and API handlers.
- **`cargo doc`**: doc comments (`///`) are mandatory on every public function, struct, enum and trait in all workspace crates; `#![deny(missing_docs)]` enabled crate-wide and enforced in CI (`cargo doc --no-deps`).
- **`cargo audit`**: dependency vulnerability scan (RustSec advisory database), run in CI on every PR and on a weekly schedule.

### Recommended complementary tools (free/open-source)
- **`cargo deny`**: license compliance and banned/duplicate dependency checks
- **`cargo tarpaulin`** or **`cargo llvm-cov`**: code coverage reporting (target >80%, see section 12)
- **`cargo outdated`**: flags outdated dependencies
- **`rust-analyzer`**: required editor integration (VS Code) for real-time linting and inline docs
- **`cargo-mutants`**: periodic mutation testing to validate that tests actually catch bugs, not just chase coverage numbers

### Architecture & design practices
- Enforce crate boundaries (`domain`/`infra`/`api`/`shared`) with `pub(crate)` visibility by default; only expose what must cross crate boundaries
- Strong typing / newtype pattern (e.g. `UserId(Uuid)`) to prevent mixing up IDs and raw values at compile time
- `clippy::unwrap_used` and `clippy::expect_used` denied in `api`/`domain` crates (tests exempted) to avoid panics in production code paths
- Domain errors via `thiserror`, application-boundary errors via `anyhow`, instead of stringly-typed errors

### Review & process
- Mandatory PR review (at least 1 approver) before merge to `main`, no direct pushes
- Small, focused PRs to keep reviews effective
- `CODEOWNERS` file routing reviews to the right people (backend vs Flutter)
- Architecture Decision Records (ADRs) for significant technical choices (e.g. Axum vs Actix, SeaORM vs Diesel), versioned in the repo
- `CONTRIBUTING.md` documenting local setup, mandatory toolchain commands and PR expectations

### Testing depth
- Integration tests against a real PostgreSQL instance (`testcontainers-rs`) rather than mocks only, to catch SQL/schema issues early
- Contract tests against the generated OpenAPI spec (`utoipa`) to prevent silent breaking changes for Flutter clients

### Dependency & supply chain hygiene
- `rust-toolchain.toml` pinning the Rust version for reproducible builds across dev machines and CI
- `Cargo.lock` committed and enforced via `cargo build --locked` in CI
- Automated dependency update PRs (Renovate or Dependabot)

### Flutter-side quality (same rigor as backend)
- `flutter analyze` and `dart format --set-exit-if-changed` as CI gates
- `very_good_analysis` or `flutter_lints` for a strict, free lint set

### CI enforcement (from Phase 1)
Minimal pipeline run on every pull request, with `RUSTFLAGS="-D warnings"` set so compiler warnings fail the build the same way as clippy warnings:
```
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --locked
cargo doc --no-deps
cargo test
cargo audit
```

## 4. Recommended Team
- **1 Lead Developer** (Rust): Technical coordination, backend architecture, code reviews
- **1 Backend Developer** (Rust): API, database, security, real-time
- **2 Frontend Developers** (Flutter): 1 focused on web (coach/manager), 1 focused on mobile (athlete/field coach) - with strong code sharing (shared widgets, common packages)
- **1 Product Owner/Designer**: Specifications, UX/UI, business validation
- **Support**: DevOps (optional), QA testing

### Team risk
- The pool of experienced Rust developers is smaller than for .NET: plan for a ramp-up period or targeted recruitment.

## 5. Phase 1 - Foundation (Weeks 1-6)
### Objectives
- Base architecture and authentication
- Data structure and base API
- Shared Flutter web and mobile skeleton

### Deliverables
- ✅ Git repository with Cargo workspace structure (crates: `api`, `domain`, `infra`, `shared`)
- ✅ PostgreSQL database designed and deployed (`sqlx` migrations)
- ✅ Rust authentication API (sign-up/sign-in, `argon2` hashing)
- ✅ Role and organization management (Axum/Actix authorization middleware)
- ✅ Multi-target Flutter project (web + mobile) with modular architecture (shared packages: models, API client, theme)
- ✅ Web interface: Basic dashboard, navigation
- ✅ Rust unit tests (`tokio::test` crate) for core API

### Dedicated team
- Lead Developer: Cargo workspace architecture and CI setup
- Backend Developer: Auth API and database
- Flutter Frontend (web): Basic interface + shared design system

### Risks
- Rust learning curve (ownership, async/await with Tokio) for the team
- Choice and stabilization of the Rust web framework (Axum vs Actix Web) to validate in week 1
- Flutter Web setup with rendering and performance considerations (CanvasKit vs HTML renderer)

## 6. Phase 2 - Core Features (Weeks 7-13)
### Objectives
- Planning and calendar
- Session and template management
- Basic mobile application

### Deliverables
- ✅ Session creation/modification (Rust API)
- ✅ Exercise templates (CRUD)
- ✅ Season planning with phases (mesocycles/microcycles)
- ✅ Individual/collective calendar (Flutter web, drag & drop)
- ✅ Basic notifications (email via a third-party service called from Rust)
- ✅ Flutter mobile app: Schedule viewing, profile
- ✅ Google/Outlook calendar integration (`reqwest` HTTP crates + OAuth2)
- ✅ API integration tests (`reqwest`/`httpmock` crates)

### Dedicated team
- Backend: Planning, seasons/phases and templates API
- Web Frontend: Planning interface
- Mobile: Viewing app
- PO: Planning UX validation

### Risks
- Complexity of the planning business logic (mesocycles/microcycles) in idiomatic Rust
- Calendar performance with large volumes (pagination, PostgreSQL indexes)
- Maturity of third-party integration crates (Google/Outlook) less rich than in .NET/Node

## 7. Phase 3 - Advanced Features (Weeks 14-17)
### Objectives
- Real-time guided mode
- Special sessions (physio, recovery)
- Finalization and optimization

### Deliverables
- ✅ Mobile guided mode (WebSocket/gRPC streaming Rust <-> Flutter)
- ✅ Physiotherapy sessions (with private medical notes, strict access control)
- ✅ Recovery sessions
- ✅ Push notifications (Azure Notification Hubs from the Rust backend)
- ✅ Basic reporting dashboard (Flutter web)
- ✅ CSV data export (generated on the Rust side, `csv` crate)
- ✅ End-to-end tests
- ✅ API documentation (OpenAPI generated via `utoipa`)

### Dedicated team
- Mobile: Guided mode and advanced features
- Backend: Real-time, reporting and exports
- Web Frontend: Analytics dashboard
- QA: Full testing

### Risks
- Complexity of bidirectional real-time (WebSocket/gRPC) between Rust and Flutter
- Managing reconnections and latency in mobile guided mode
- Sensitivity of medical data: enhanced security audit on physio endpoints

## 8. Phase 4 - Stabilization and Launch (Weeks 18-20)
### Objectives
- Testing, fixes and production preparation
- Team training and documentation

### Deliverables
- ✅ Bug fixes and performance optimizations (Rust profiling with `tokio-console`/`flamegraph`)
- ✅ Load testing (e.g. `k6`, `drill`) and security (`cargo audit`)
- ✅ User documentation
- ✅ Production deployment (Docker containers on Azure Container Apps/AKS)
- ✅ Monitoring and logging configured (`tracing` + Azure Monitor/Application Insights)
- ✅ Support team training

### Dedicated team
- Whole team: Fixes and testing
- Lead Developer: Deployment and monitoring

### Risks
- Last-minute bug discovery
- Production performance issues

## 9. Detailed Timeline
```
Week 1-2: Cargo workspace setup, framework choice (Axum/Actix), PostgreSQL database
Week 3-4: Authentication and user management (Rust)
Week 5-6: Flutter web/mobile skeleton, core API
Week 7-9: Exercise templates, session CRUD, seasons/phases
Week 10-11: Calendar and notifications
Week 12-13: Mobile viewing app, external calendar integrations
Week 14-15: Real-time guided mode (WebSocket/gRPC)
Week 16-17: Physio/recovery sessions, reporting
Week 18-19: Testing and fixes
Week 20: Stabilization and launch
```

## 10. Estimated Budget (excluding infrastructure)
- **5-person team x 5 months**: ~€200,000 (possible 5-10% increase due to the scarcity of experienced Rust profiles)
- **Tools and licenses**: ~€8,000 (fewer paid licenses, mostly open-source Rust ecosystem)
- **User testing**: ~€5,000
- **Rust training (team ramp-up)**: ~€6,000
- **Total estimate**: ~€219,000

## 11. Risks and Mitigation
### Technical
- **Rust learning curve (ownership/borrow checker, async)**: Initial training, pair programming, strict code reviews
- **Rust web ecosystem less mature than ASP.Net Core** (fewer "off-the-shelf" middlewares): favor proven crates (Axum, Tower, SeaORM) and prototype early
- **Flutter mobile/web performance**: Early optimization, load testing
- **Medical data security**: External security audit, review of permissions at the Rust handler level

### Business
- **Change in user habits**: Pilot tests with partner clubs
- **Mobile adoption**: Ultra-simple UX, user feedback

### Project
- **Recruiting Rust developers**: Anticipate sourcing from project kickoff, consider internal mentoring
- **Tight deadlines**: 20-25% buffer in planning (additional margin due to the stack change), short iterations
- **External dependencies**: Contracts established early (Azure Notification Hubs, Azure)

## 12. Tracking Metrics
- **Team velocity**: Story points per week (target 35-45, adjusted downward during Rust ramp-up)
- **Code quality**: Test coverage >80% (`cargo tarpaulin`), 0 critical bugs, `cargo clippy` with no blocking warnings
- **Performance**: API response time <300ms (Rust generally faster than .NET), Flutter app load <2s
- **Satisfaction**: Team NPS >7/10, weekly user feedback

## 13. Success Criteria by Phase
- **Phase 1**: Functional Rust API, navigable Flutter interface (web + mobile)
- **Phase 2**: Complete schedule can be created, notifications operational
- **Phase 3**: Smooth guided mode (WebSocket/gRPC), basic reporting
- **Phase 4**: 0 blocking bugs, validated performance

## 14. External Dependencies
- **Azure**: Account setup and deployment (1 week)
- **Azure Notification Hubs**: Notification configuration (2 days)
- **Crate registry**: Verification of licenses and active maintenance of critical Rust dependencies
- **Domains**: SSL purchase and configuration (1 day)
- **Business team**: Availability for validation (2h/week)

## 15. Recovery Plan
- **High risk**: Reduced MVP focus, Phase 1-2 delivery only, temporary switch to a simpler Rust framework (e.g. Actix Web) if Axum becomes a blocker
- **Medium risk**: Timeline extension to 6 months
- **Communication**: Weekly progress review, early alerts

## 16. Recommendations for Batch 2
- Team extension for parallelization (Rust backend and Flutter frontend in parallel as soon as API contracts are stabilized, via OpenAPI)
- Automated CI/CD setup from Phase 1 (`cargo build`/`cargo test`/`cargo clippy` + Flutter build in the same pipeline)
- Pilot user tests from Phase 2
- Modular architecture in Rust crates (domain/infra/api separated) for scalability and testability
- Explore `flutter_rust_bridge` if shared compute-intensive needs emerge between mobile and backend (e.g. complex load calculation on the client side)

## 17. Infrastructure Comparison

### 16.1 Azure (Microsoft Azure) - RECOMMENDED
**Key services for Planer Sport:**
- **Compute**: Azure Container Apps or AKS for the Rust backend (Docker image)
- **Database**: Azure Database for PostgreSQL - Flexible Server
- **Frontend**: Azure Static Web Apps for Flutter Web
- **Mobile**: Azure Notification Hubs for push
- **Storage**: Blob Storage
- **Authentication**: Azure AD B2C or internal JWT

**Advantages:**
- Good managed PostgreSQL support
- Container Apps well suited to a containerized Rust binary (scale-to-zero possible)
- Enterprise security and compliance
- Continuity with the infrastructure already considered for the C# version

**Disadvantages:**
- Less "native" integration than with .NET (no Visual Studio tooling advantage specific to Rust)
- Requires building the Rust Docker image yourself (multi-stage build)

**Estimated costs (MVP - 100 active users):**
- Container Apps: ~$120/month (lower Rust memory/CPU footprint than ASP.Net Core)
- PostgreSQL Flexible Server: ~$90/month
- Storage: ~$15/month
- Notification Hubs: ~$5/month
- **Estimated total**: ~$230/month

**Recommendation:** RECOMMENDED. Since Rust binaries are lightweight and performant, compute costs are generally lower than the .NET equivalent, while keeping the Azure ecosystem already planned (Notification Hubs, storage).

### 16.2 AWS (Amazon Web Services)
**Key services for Planer Sport:**
- **Compute**: ECS Fargate or App Runner for the containerized Rust backend
- **Database**: RDS PostgreSQL or Aurora PostgreSQL
- **Frontend**: S3 + CloudFront for Flutter Web
- **Mobile**: SNS or Amazon Pinpoint for push notifications
- **Storage**: S3 for files/media
- **Authentication**: Cognito

**Advantages:**
- Excellent PostgreSQL support (Aurora)
- Mature ecosystem for lightweight containers (Fargate/App Runner well suited to Rust)
- Good worldwide scalability

**Disadvantages:**
- More complex console for a small team
- Less predictable costs
- Requires replacing Azure Notification Hubs with an equivalent (SNS/Pinpoint), notification porting effort

**Estimated costs (MVP - 100 active users):**
- Compute (Fargate): ~$150/month
- Database (Aurora PostgreSQL): ~$140/month
- Storage: ~$20/month
- Notifications: ~$10/month
- **Estimated total**: ~$320/month

**Recommendation:** Good alternative if the team already has AWS experience or aims for rapid international expansion.

### 16.3 Fly.io / Render (lightweight Rust-oriented option)
**Key services for Planer Sport:**
- **Compute**: Fly.io Machines or Render Web Services (direct deployment of containerized Rust binaries, very fast cold start)
- **Database**: Fly Postgres or managed Render PostgreSQL
- **Frontend**: Flutter Web deployment on Render Static Site or Cloudflare Pages
- **Mobile**: Firebase Cloud Messaging for push (independent of the backend cloud)
- **Storage**: Cloudflare R2 or AWS S3

**Advantages:**
- Very fast startup for an MVP, simple and predictable pricing
- Excellent fit with Rust binaries (near-instant deployment, low footprint)
- Significantly lower costs for a low-traffic MVP

**Disadvantages:**
- Less suited to strict enterprise compliance (GDPR/health) without thorough checks
- More limited ecosystem of managed services (no direct equivalent to Notification Hubs)
- Less relevant if the product needs to quickly scale to large organizations

**Estimated costs (MVP - 100 active users):**
- Compute: ~$30-50/month
- Database: ~$20-40/month
- Storage: ~$5/month
- Notifications (Firebase, free up to a certain volume): ~$0/month
- **Estimated total**: ~$60-100/month

**Recommendation:** Interesting for a prototype/POC or a very low-budget launch, but should be reassessed before scaling toward the PRD's business objectives (100 organizations, 50,000 athletes).

## 18. Summary of differences compared to the C#/.NET version
| Aspect | C# version (Blazor + ASP.Net Core) | Rust + Flutter version |
|---|---|---|
| Web/backend code sharing | Yes (C# shared between Blazor/API) | No (different languages), but strong sharing between web and mobile via Flutter |
| Database | SQL Server | PostgreSQL |
| Raw backend performance | Good | Generally superior (latency, memory footprint) |
| Web ecosystem maturity | Very mature (ASP.Net Core) | Mature but less "high-level" tooling (choose carefully: Axum/Actix) |
| Developer availability | Large .NET talent pool | Smaller Rust talent pool, higher recruitment/training cost |
| Real-time (guided mode) | SignalR | Native Rust WebSocket or gRPC (Tonic) |
| Overall project risk | Moderate | Slightly higher (Rust ramp-up, less "off-the-shelf" ecosystem) |
