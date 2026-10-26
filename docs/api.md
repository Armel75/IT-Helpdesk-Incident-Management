# REST API Specification (/api/v1)

## 1. Design Standards

- **Base Path**: `/api/v1`
- **Authentication**: Bearer JWT in `Authorization` header (`Bearer <access_token>`).
- **Refresh Flow**: HttpOnly, Secure, SameSite=Strict cookie (`refresh_token`).
- **Standard Status Codes**:
  - `200 OK`: Successful read/update.
  - `201 Created`: Resource successfully created (with `Location` header where applicable).
  - `204 No Content`: Successful deletion or state change with empty response body.
  - `400 Bad Request`: Validation failure or malformed payload.
  - `401 Unauthorized`: Missing, expired, or invalid JWT.
  - `403 Forbidden`: Authenticated user lacks permission (RBAC or IDOR violation).
  - `404 Not Found`: Target resource does not exist.
  - `409 Conflict`: Optimistic lock mismatch or duplicate business key.
  - `422 Unprocessable Content`: Business rule or state machine transition violation.
  - `429 Too Many Requests`: Rate limit exceeded on authentication endpoints.

### RFC 9457 Problem Details Error Schema
```json
{
  "type": "https://api.resolveit.com/errors/business-rule-violation",
  "title": "Invalid Ticket State Transition",
  "status": 422,
  "detail": "Ticket cannot transition from OPEN directly to RESOLVED without triage and resolution summary.",
  "instance": "/api/v1/tickets/b91f0.../transition",
  "timestamp": "2026-10-26T15:00:00Z",
  "traceId": "req-98f219a1",
  "invalidParams": [
    {
      "name": "targetStatus",
      "reason": "Transition not permitted from OPEN"
    }
  ]
}
```

---

## 2. API Endpoint Directory

### Authentication & Identity (`/api/v1/auth`, `/api/v1/users`)
- `POST /api/v1/auth/login` — Public. Authenticates credentials. Returns access JWT in body, sets rotating refresh token in HttpOnly cookie.
- `POST /api/v1/auth/refresh` — Public (Cookie authenticated). Rotates refresh token and returns fresh access JWT.
- `POST /api/v1/auth/logout` — Authenticated. Revokes current refresh token and clears cookie.
- `GET /api/v1/auth/me` — Authenticated. Returns current authenticated user profile, roles, and teams.
- `GET /api/v1/users` — Role: `ADMIN`, `IT_MANAGER`, `IT_AGENT`. Paginated directory of users and agents.
- `POST /api/v1/users` — Role: `ADMIN`. Provisions a new user account.
- `PUT /api/v1/users/{id}` — Role: `ADMIN`. Updates user role, department, or active status.
- `POST /api/v1/users/{id}/deactivate` — Role: `ADMIN`. Deactivates user and invalidates all active sessions.

### Ticket Lifecycle (`/api/v1/tickets`)
- `GET /api/v1/tickets` — Authenticated. Paginated and filtered ticket list. Query params:
  - `page`, `size`, `sort` (e.g. `createdAt,desc`)
  - `status` (`OPEN`, `IN_PROGRESS`, etc.)
  - `priority` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  - `type` (`INCIDENT`, `SERVICE_REQUEST`)
  - `categoryId`, `assignedAgentId`, `assignedTeamId`, `requesterId`
  - `search` (matches ticket number, title, description)
  - `slaBreached` (`true` / `false`)
- `POST /api/v1/tickets` — Authenticated. Creates a new incident or service request.
- `GET /api/v1/tickets/{id}` — Authenticated (Object-level check). Returns full ticket detail.
- `PATCH /api/v1/tickets/{id}` — Authenticated. Updates ticket metadata (priority, category, title). Requires `version`.
- `POST /api/v1/tickets/{id}/transition` — Authenticated. Executes state transition with state-machine validation and optimistic locking.
- `POST /api/v1/tickets/{id}/assign` — Role: `IT_AGENT`, `IT_MANAGER`, `ADMIN`. Assigns to agent and/or team.

### Ticket Comments & Notes (`/api/v1/tickets/{id}/comments`)
- `GET /api/v1/tickets/{id}/comments` — Authenticated. Returns chronological comment stream. Automatically excludes internal notes for `EMPLOYEE` users.
- `POST /api/v1/tickets/{id}/comments` — Authenticated. Adds a public comment or internal note (`commentType: "PUBLIC" | "INTERNAL_NOTE"`).

### Ticket History & Audit (`/api/v1/tickets/{id}/history`)
- `GET /api/v1/tickets/{id}/history` — Authenticated. Returns chronological audit trail of state changes, assignments, and priority changes.

### SLA Configuration & Metrics (`/api/v1/sla`)
- `GET /api/v1/sla/policies` — Authenticated. Returns active SLA policies with target response and resolution hours.
- `PUT /api/v1/sla/policies/{id}` — Role: `ADMIN`. Updates SLA policy targets.
- `GET /api/v1/sla/metrics` — Role: `IT_MANAGER`, `ADMIN`. Aggregated SLA compliance rates, mean time to respond (MTTR), mean time to resolve (MTTD), and breached tickets.

### Knowledge Base (`/api/v1/knowledge-base`)
- `GET /api/v1/knowledge-base/articles` — Authenticated. Lists articles. `EMPLOYEE` sees only `PUBLISHED`.
- `GET /api/v1/knowledge-base/articles/{id}` — Authenticated. Reads article and increments view count.
- `POST /api/v1/knowledge-base/articles` — Role: `IT_AGENT`, `IT_MANAGER`, `ADMIN`. Creates draft or published article.
- `PUT /api/v1/knowledge-base/articles/{id}` — Role: `IT_AGENT`, `IT_MANAGER`, `ADMIN`. Updates article.

### Assets Inventory (`/api/v1/assets`)
- `GET /api/v1/assets` — Authenticated. Lists hardware/software assets. Filter by owner or tag.
- `POST /api/v1/assets` — Role: `ADMIN`. Creates an asset.

### Notifications (`/api/v1/notifications`)
- `GET /api/v1/notifications` — Authenticated. Returns unread notifications for authenticated user.
- `POST /api/v1/notifications/{id}/read` — Authenticated. Marks notification as read.
- `POST /api/v1/notifications/mark-all-read` — Authenticated. Marks all notifications as read.

### Dashboard & Analytics (`/api/v1/dashboard`)
- `GET /api/v1/dashboard/summary` — Authenticated (Scoped by role). Returns live counts: total open, critical, SLA breached, resolved today, average response time, backlog trends.

### System & Security Audit (`/api/v1/audit`)
- `GET /api/v1/audit/logs` — Role: `ADMIN`. Paginated query of security audit events (logins, deactivations, permission denials).
