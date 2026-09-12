# API Contract: Health Check Endpoint

This is the only HTTP contract exposed by the backend in this foundation phase, used to validate the end-to-end pipeline (build → test → CI → container) per FR-011 and SC-004.

## `GET /health`

Returns the current operational status of the backend service, including database connectivity.

### Response `200 OK`

```json
{
  "status": "ok",
  "database": "connected",
  "version": "0.1.0"
}
```

### Response `503 Service Unavailable`

Returned when the database is unreachable.

```json
{
  "status": "degraded",
  "database": "unreachable",
  "version": "0.1.0"
}
```

### Schema

| Field      | Type   | Values                    | Description                                   |
|------------|--------|---------------------------|------------------------------------------------|
| `status`   | string | `ok`, `degraded`           | Overall service status                          |
| `database` | string | `connected`, `unreachable` | Result of a lightweight DB connectivity check   |
| `version`  | string | semver-like                | Backend crate version, for deployment tracing   |

### Contract Tests

- `GET /health` against a running instance with a reachable database MUST return `200` with `status: "ok"`.
- `GET /health` against an instance whose database is stopped/unreachable MUST return `503` with `status: "degraded"` (used to validate container health checks, FR-011).
- This endpoint MUST NOT require authentication (no auth exists yet in this phase).

### Future Evolution

Once `utoipa` is wired up (Primary Dependencies in plan.md), this contract will be regenerated as part of an OpenAPI document served at `/api-docs/openapi.json`; that automation is out of scope for this phase and tracked as a follow-up for the next feature that introduces real business endpoints.
