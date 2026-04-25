# Phase 1 — Architecture de la solution .NET

## Objectif
Documenter les choix architecturaux et structuraux de la solution .NET pour Phase 1 et au-delà.

## 1. Structure des projets

```
src/
├── PlanerSport.sln
├── PlanerSport.Api/              # gRPC services + Blazor Server
├── PlanerSport.Application/      # Logique métier et services
├── PlanerSport.Domain/           # Entités métier et règles
├── PlanerSport.Infrastructure/   # EF Core, PostgreSQL, repositories
├── PlanerSport.Abstractions/     # Interfaces et contrats
├── PlanerSport.Dto/              # Data Transfer Objects
├── PlanerSport.Web/              # Blazor Server frontend
└── PlanerSport.Grpc/             # Generated gRPC service stubs

proto/
├── user.proto
├── session.proto
├── organization.proto
└── exercise.proto

tests/
├── PlanerSport.Api.Tests/        # Tests services gRPC
└── PlanerSport.Application.Tests/ # Tests logique métier
```

## 2. Responsabilités par projet

### PlanerSport.Api
- **Contenu** :
  - Services gRPC (implémentations de `.proto` services)
  - Configuration startup (gRPC, JWT, etc.)
  - Middleware gRPC (authentification, error handling)
  - Configuration Dependency Injection
  - Blazor Server host (pages, components, SignalR)
- **Dépendances** : `Abstractions`, `Application`, `Dto`, `Grpc`

### PlanerSport.Application
- **Contenu** :
  - Services métier (implémentations)
  - Mappeurs (Domain ↔ gRPC messages et internes)
  - Logique cas d'usage
  - Orchestration entre services
- **Dépendances** : `Abstractions`, `Domain`, `Dto`, `Grpc`

### PlanerSport.Domain
- **Contenu** :
  - Entités métier (`User`, `Organization`, `Session`, `Exercise`)
  - Value Objects
  - Enums métier
  - Règles métier
- **Dépendances** : aucune (isolation complète)

### PlanerSport.Infrastructure
- **Contenu** :
  - EF Core `DbContext`
  - Migrations PostgreSQL
  - Repositories
  - Mappeurs EF Core (Domain → Database)
  - Configuration DB
- **Dépendances** : `Abstractions`, `Domain`

### PlanerSport.Abstractions
- **Contenu** :
  - Interfaces des services (`IUserService`, `ISessionService`)
  - Interfaces des repositories (`IRepository<T>`, `IUnitOfWork`)
  - Enums communs
  - Types/constantes partagées
- **Dépendances** : aucune

### PlanerSport.Dto
- **Contenu** :
  - Request DTOs (`CreateUserRequest`, `UpdateSessionRequest`)
  - Response DTOs (`UserResponseDto`, `SessionResponseDto`)
  - Uniquement des classes de données
- **Dépendances** : aucune

### PlanerSport.Web
- **Contenu** :
  - Pages et composants Blazor Server
  - Logique d'interaction UI
  - Code-behind pour gestion d'état
  - Appels directs aux services métier (même processus)
- **Dépendances** : `Application`, `Abstractions`

### PlanerSport.Grpc
- **Contenu** :
  - Classes générées par protoc (service stubs, messages)
  - Énumérations gRPC
  - Types de transfert gRPC
- **Dépendances** : aucune (générées)

## 3. Diagramme des dépendances

```
┌──────────────────────────────────────────────────────┐
│ Interfaces & Contrats (Abstractions)                 │
├──────────────────────────────────────────────────────┤
│        ↑               ↑                ↑             │
│        │               │                │             │
│    Application   Infrastructure      Api            │
│        │               │                │             │
│        └───────────────┴────────────────┘             │
│                  ↓ dépend de                         │
├──────────────────────────────────────────────────────┤
│ Logique métier & entités (Domain)                    │
├──────────────────────────────────────────────────────┤
│                  ↑                                   │
│                  │ dépend de                         │
├──────────────────────────────────────────────────────┤
│ Contrats gRPC (Grpc)                                 │
│ Web (Blazor Server) → Application directement       │
│ DTOs partagés (Dto)                                  │
└──────────────────────────────────────────────────────┘
```

## 4. Fichiers Protobuf (.proto) pour gRPC

Structure : `proto/` à la racine du repo.

### proto/user.proto
```protobuf
syntax = "proto3";

package planersport.user;

service UserService {
  rpc GetUser(GetUserRequest) returns (UserResponse);
  rpc CreateUser(CreateUserRequest) returns (UserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UserResponse);
  rpc DeleteUser(DeleteUserRequest) returns (Empty);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
}

message GetUserRequest {
  int32 id = 1;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
  string password = 3;
  int32 organization_id = 4;
}

message UpdateUserRequest {
  int32 id = 1;
  string name = 2;
  string email = 3;
}

message DeleteUserRequest {
  int32 id = 1;
}

message UserResponse {
  int32 id = 1;
  string name = 2;
  string email = 3;
  int32 organization_id = 4;
  string role = 5;
  int64 created_at = 6;
}

message ListUsersRequest {
  int32 organization_id = 1;
  int32 page = 2;
  int32 page_size = 3;
}

message ListUsersResponse {
  repeated UserResponse users = 1;
  int32 total = 2;
}

message Empty {}
```

### proto/session.proto
```protobuf
syntax = "proto3";

package planersport.session;

service SessionService {
  rpc GetSession(GetSessionRequest) returns (SessionResponse);
  rpc CreateSession(CreateSessionRequest) returns (SessionResponse);
  rpc UpdateSession(UpdateSessionRequest) returns (SessionResponse);
  rpc ListSessions(ListSessionsRequest) returns (ListSessionsResponse);
  rpc DeleteSession(DeleteSessionRequest) returns (Empty);
}

message GetSessionRequest {
  int32 id = 1;
}

message CreateSessionRequest {
  string name = 1;
  int64 scheduled_at = 2;
  int32 duration_minutes = 3;
  int32 organization_id = 4;
  repeated int32 exercise_ids = 5;
}

message UpdateSessionRequest {
  int32 id = 1;
  string name = 2;
  int64 scheduled_at = 3;
  int32 duration_minutes = 4;
}

message SessionResponse {
  int32 id = 1;
  string name = 2;
  int64 scheduled_at = 3;
  int32 duration_minutes = 4;
  int32 organization_id = 5;
  repeated ExerciseResponse exercises = 6;
  int64 created_at = 7;
}

message ListSessionsRequest {
  int32 organization_id = 1;
  int32 page = 2;
  int32 page_size = 3;
}

message ListSessionsResponse {
  repeated SessionResponse sessions = 1;
  int32 total = 2;
}

message DeleteSessionRequest {
  int32 id = 1;
}

message ExerciseResponse {
  int32 id = 1;
  string name = 2;
  string description = 3;
  int32 duration_seconds = 4;
  string type = 5;
}

message Empty {}
```

### Autres fichiers proto
- `proto/organization.proto` : OrganizationService
- `proto/exercise.proto` : ExerciseService
- (Idem pattern pour les autres entités)

## 5. Stratégie des mappeurs

### Pas d'AutoMapper
- Mappeurs **manuels et explicites**
- Contrôle total sur la transformation
- Pas de dépendance externe

### Structure des mappeurs
```
src/PlanerSport.Application/Mappings/
├── UserMapper.cs
├── SessionMapper.cs
├── OrganizationMapper.cs
└── ExerciseMapper.cs
```

### Exemple d'implémentation
```csharp
// PlanerSport.Application/Mappings/UserMapper.cs
public static class UserMapper
{
    public static UserResponseDto MapToResponseDto(User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email
        };
    }

    public static User MapFromCreateRequest(CreateUserRequest request)
    {
        return new User
        {
            Name = request.Name,
            Email = request.Email
        };
    }
}
```

### Utilisation dans le service gRPC
```csharp
// PlanerSport.Api/Services/UserGrpcService.cs
public class UserGrpcService : UserService.UserServiceBase
{
    private readonly IUserService _userService;

    public UserGrpcService(IUserService userService)
    {
        _userService = userService;
    }

    public override async Task<UserResponse> CreateUser(CreateUserRequest request, ServerCallContext context)
    {
        var user = UserMapper.MapFromGrpcCreateRequest(request);
        var created = await _userService.CreateUserAsync(user);
        return UserMapper.MapToGrpcResponse(created);
    }

    public override async Task<UserResponse> GetUser(GetUserRequest request, ServerCallContext context)
    {
        var user = await _userService.GetUserByIdAsync(request.Id);
        if (user == null)
            throw new RpcException(new Status(StatusCode.NotFound, "User not found"));
        return UserMapper.MapToGrpcResponse(user);
    }
}
```

### Mappers pour gRPC
```csharp
// PlanerSport.Application/Mappings/UserMapper.cs
public static class UserMapper
{
    // Domain → gRPC
    public static UserResponse MapToGrpcResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            OrganizationId = user.OrganizationId,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt.Ticks
        };
    }

    // gRPC → Domain
    public static User MapFromGrpcCreateRequest(CreateUserRequest request)
    {
        return new User
        {
            Name = request.Name,
            Email = request.Email,
            OrganizationId = request.OrganizationId
        };
    }
}
```

## 5. Entités métier Phase 1

### User
```csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public int OrganizationId { get; set; }
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### Organization
```csharp
public class Organization
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Type { get; set; } // club, team, etc.
    public DateTime CreatedAt { get; set; }
    public ICollection<User> Members { get; set; }
}
```

### Session
```csharp
public class Session
{
    public int Id { get; set; }
    public string Name { get; set; }
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; }
    public int OrganizationId { get; set; }
    public ICollection<Exercise> Exercises { get; set; }
}
```

### Exercise
```csharp
public class Exercise
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public int DurationSeconds { get; set; }
    public string Type { get; set; } // strength, cardio, etc.
}
```

## 6. Interfaces principales (Abstractions)

```csharp
// PlanerSport.Abstractions/Services/IUserService.cs
public interface IUserService
{
    Task<User> GetUserByIdAsync(int id);
    Task<User> CreateUserAsync(User user);
    Task UpdateUserAsync(User user);
    Task DeleteUserAsync(int id);
}

// PlanerSport.Abstractions/Repositories/IRepository.cs
public interface IRepository<T> where T : class
{
    Task<T> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
}

// PlanerSport.Abstractions/Authentication/IAuthenticationService.cs
public interface IAuthenticationService
{
    Task<string> GenerateTokenAsync(User user);
    Task<User> ValidateCredentialsAsync(string email, string password);
}
```

## 7. Entités métier partagées (Dto)

Pour Blazor Server uniquement (pas besoin d'entités de transfert, communication en mémoire).

```csharp
// PlanerSport.Dto/Enums/UserRole.cs
public enum UserRole
{
    Unknown = 0,
    Coach = 1,
    Athlete = 2,
    Admin = 3
}

// PlanerSport.Dto/Common/PagedResult.cs
public class PagedResult<T>
{
    public List<T> Items { get; set; }
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
```

**Note** : Les messages gRPC (request/response) sont définis dans les `.proto` files et générés automatiquement dans `PlanerSport.Grpc`.

## 8. Configuration Dependency Injection

Dans `PlanerSport.Api/Program.cs` :

```csharp
var builder = WebApplicationBuilder.CreateBuilder(args);

// Services métier
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<IOrganizationService, OrganizationService>();
builder.Services.AddScoped<IExerciseService, ExerciseService>();

// Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Authentication
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();

// Database
builder.Services.AddDbContext<PlanerSportDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// gRPC services
builder.Services.AddGrpc();

// Blazor Server
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();

// CORS for gRPC web (si besoin web clients)
builder.Services.AddCors(o => o.AddPolicy("AllowAll", builder =>
{
    builder
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader()
        .WithExposedHeaders("grpc-status", "grpc-message");
}));

var app = builder.Build();

app.UseRouting();
app.UseGrpcWeb(new GrpcWebOptions { DefaultEnabled = true });
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Map gRPC services
app.MapGrpcService<UserGrpcService>();
app.MapGrpcService<SessionGrpcService>();
app.MapGrpcService<OrganizationGrpcService>();
app.MapGrpcService<ExerciseGrpcService>();

// Map Blazor Server
app.MapBlazorHub();
app.MapFallbackToPage("/_Host");

app.Run();
```

## 9. EF Core et PostgreSQL

### DbContext (Infrastructure)
```csharp
// PlanerSport.Infrastructure/Data/PlanerSportDbContext.cs
public class PlanerSportDbContext : DbContext
{
    public PlanerSportDbContext(DbContextOptions<PlanerSportDbContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<Session> Sessions { get; set; }
    public DbSet<Exercise> Exercises { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configurations
        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(u => u.Id);
            b.Property(u => u.Name).IsRequired().HasMaxLength(255);
            b.Property(u => u.Email).IsRequired().HasMaxLength(255);
            b.HasOne<Organization>().WithMany(o => o.Members);
        });

        modelBuilder.Entity<Organization>(b =>
        {
            b.HasKey(o => o.Id);
            b.Property(o => o.Name).IsRequired();
        });

        // etc.
    }
}
```

### Connection String (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=planersport;Username=postgres;Password=your_password"
  }
}
```

## 10. Authentification JWT (pour gRPC Flutter)

### Configuration (Api/Program.cs)
```csharp
var jwtSettings = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]))
        };
    });
```

### Service d'authentification gRPC
```csharp
// PlanerSport.Api/Services/AuthGrpcService.cs
public class AuthGrpcService : AuthService.AuthServiceBase
{
    private readonly IAuthenticationService _authService;

    public AuthGrpcService(IAuthenticationService authService)
    {
        _authService = authService;
    }

    public override async Task<LoginResponse> Login(LoginRequest request, ServerCallContext context)
    {
        var user = await _authService.ValidateCredentialsAsync(request.Email, request.Password);
        if (user == null)
            throw new RpcException(new Status(StatusCode.Unauthenticated, "Invalid credentials"));

        var token = await _authService.GenerateTokenAsync(user);
        return new LoginResponse { AccessToken = token };
    }
}
```

### appsettings.json
```json
{
  "Jwt": {
    "SecretKey": "your-very-long-secret-key-at-least-32-characters",
    "Issuer": "planersport-api",
    "Audience": "planersport-flutter",
    "ExpirationMinutes": 1440
  }
}
```

## 11. Tests (Phase 1)

### Structure
- `tests/PlanerSport.Api.Tests/` pour services gRPC
- `tests/PlanerSport.Application.Tests/` pour services métier et mappeurs

### Exemple test unitaire pour mappers gRPC
```csharp
// tests/PlanerSport.Application.Tests/UserMapperTests.cs
public class UserMapperTests
{
    [Fact]
    public void MapToGrpcResponse_ShouldMapUserCorrectly()
    {
        // Arrange
        var user = new User 
        { 
            Id = 1, 
            Name = "John Doe", 
            Email = "john@example.com",
            OrganizationId = 1,
            Role = UserRole.Coach,
            CreatedAt = new DateTime(2025, 1, 1)
        };

        // Act
        var response = UserMapper.MapToGrpcResponse(user);

        // Assert
        Assert.Equal(user.Id, response.Id);
        Assert.Equal(user.Name, response.Name);
        Assert.Equal(user.Email, response.Email);
        Assert.Equal("Coach", response.Role);
    }
}
```

## 12. Services gRPC Phase 1

Chaque service gRPC implémente les opérations CRUD de base :

```csharp
// PlanerSport.Api/Services/SessionGrpcService.cs
public class SessionGrpcService : SessionService.SessionServiceBase
{
    private readonly ISessionService _sessionService;

    public SessionGrpcService(ISessionService sessionService)
    {
        _sessionService = sessionService;
    }

    public override async Task<SessionResponse> CreateSession(CreateSessionRequest request, ServerCallContext context)
    {
        var session = new Session
        {
            Name = request.Name,
            ScheduledAt = new DateTime(request.ScheduledAt),
            DurationMinutes = request.DurationMinutes,
            OrganizationId = request.OrganizationId
        };

        var created = await _sessionService.CreateSessionAsync(session);
        return SessionMapper.MapToGrpcResponse(created);
    }

    public override async Task<ListSessionsResponse> ListSessions(ListSessionsRequest request, ServerCallContext context)
    {
        var sessions = await _sessionService.ListSessionsAsync(request.OrganizationId, request.Page, request.PageSize);
        var response = new ListSessionsResponse();
        foreach (var session in sessions.Items)
        {
            response.Sessions.Add(SessionMapper.MapToGrpcResponse(session));
        }
        response.Total = sessions.Total;
        return response;
    }
}
```

## 13. Principes clés

- **gRPC pour Flutter** : communication binaire efficace, typée
- **Blazor Server** : rendu côté serveur via SignalR circuits
- **Séparation des responsabilités** : chaque projet a un rôle clair
- **Pas de dépendances cycliques** : flux unidirectionnel
- **Mappeurs explicites** : Domain ↔ gRPC messages, aucune automatisation
- **Tests isolés** : services testables indépendamment de la DB
- **PostgreSQL isolé** : seul `Infrastructure` l'utilise
- **Authentification JWT** : pour gRPC Flutter uniquement
- **Interfaces nettes** : contrats clairs entre couches
- **Proto files versionnées** : évolution contrôlée des contrats gRPC

## 14. Évolution future

- Phase 2+ peut ajouter :
  - gRPC Streaming pour données temps réel
  - Pattern Repository + Unit of Work explicite
  - Domain Events pour notifications
  - CQRS si complexité métier augmente
  - Validation avec FluentValidation
  - Logging structuré (Serilog)
  - Intercepteurs gRPC personnalisés
- Infrastructure :
  - Message bus (RabbitMQ, Azure Service Bus)
  - Cache distributed (Redis)
- Mais la base reste stable, modulaire et facilement extensible.
