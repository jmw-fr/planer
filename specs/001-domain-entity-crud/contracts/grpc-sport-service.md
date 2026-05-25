# contracts/grpc-sport-service.md

## SportService gRPC contract

### Service: SportService

- `rpc CreateSport(CreateSportRequest) returns (SportResponse)`
- `rpc UpdateSport(UpdateSportRequest) returns (SportResponse)`
- `rpc DeleteSport(DeleteSportRequest) returns (Empty)`
- `rpc GetSport(GetSportRequest) returns (SportResponse)`
- `rpc ListSports(ListSportsRequest) returns (ListSportsResponse)`

### Messages

#### SportResponse
- `string id`
- `string name`
- `string code`
- `string description`
- `bool isDeleted`
- `google.protobuf.Timestamp createdAtUtc`
- `google.protobuf.Timestamp updatedAtUtc`
- `google.protobuf.Timestamp deletedAtUtc`
- `string deletedById`

#### CreateSportRequest
- `string name` (required)
- `string code` (optional)
- `string description` (optional)

#### UpdateSportRequest
- `string id` (required)
- `string name` (required)
- `string code` (optional)
- `string description` (optional)

#### DeleteSportRequest
- `string id` (required)

#### GetSportRequest
- `string id` (required)

#### ListSportsRequest
- `int32 pageNumber` (optional, default = 1)
- `int32 pageSize` (optional, default = 20)
- `bool includeDeleted` (optional, default = false)

#### ListSportsResponse
- `repeated SportResponse sports`
- `int32 totalCount`

### Contract semantics

- `CreateSport` valide les champs requis et renvoie une erreur de validation claire en cas d'échec.
- `UpdateSport` ne doit pas permettre de modifier l'identité de l'entité et doit refuser les mises à jour sur un sport supprimé.
- `DeleteSport` effectue une suppression logique et n'efface pas les données, afin que l'historique reste disponible pour l'audit.
- `GetSport` renvoie un sport actif ou supprimé selon le contexte de la requête.
- `ListSports` renvoie uniquement les sports actifs par défaut et inclut les sports supprimés lorsque `includeDeleted = true`.

### Notes

- Ce contrat est conçu pour s'intégrer dans l'architecture gRPC déjà présente dans `src/PlanerSport.Api`.
- Le service doit fournir des retours d'erreur explicites pour les cas de doublon, sport introuvable, sport déjà supprimé, et validations métier.
