# ResolveIT — Enterprise IT Helpdesk & Incident Management System

[![CI Pipeline](https://github.com/example/resolveit/actions/workflows/ci.yaml/badge.svg)](https://github.com/example/resolveit/actions)
[![Java 21](https://img.shields.io/badge/Java-21%20LTS-orange.svg)](https://www.oracle.com/java/technologies/downloads/#java21)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

**ResolveIT** is a production-grade, full-lifecycle IT Service Management (ITSM) and Incident Management platform engineered for enterprise operational excellence. Built as a high-throughput **Modular Monolith** in Java 21 LTS with Spring Boot 3.4 and an interactive, accessible React 19 single-page application.

> 🇫🇷 **Guide d'installation locale :** Consultez le mode opératoire pas à pas en français dans [`docs/mode-operatoire-local-docker.md`](docs/mode-operatoire-local-docker.md) pour lancer 100% de la pile (Base de données, Backend, Frontend) via Docker Compose sans rien installer sur votre machine.

---

## 1. Core Capabilities & Feature Matrix

- **Incident & Service Request State Machine**:
  - Validated transitions: `OPEN` → `TRIAGED` → `IN_PROGRESS` → `PENDING_USER` / `PENDING_THIRD_PARTY` → `RESOLVED` → `CLOSED` (or `REOPENED`).
  - Precondition enforcement: Mandatory resolution summaries, automatic `firstResponseAt` stamping, and agent assignment checks.
- **SLA Engine & Prober**:
  - Dynamic deadline calculations based on priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and ticket type.
  - Scheduled prober scanning for SLA response and resolution breaches every 60 seconds with idempotent updates.
- **Role-Based Access Control (RBAC) & IDOR Protection**:
  - Server-enforced permissions for `ROLE_ADMIN`, `ROLE_IT_MANAGER`, `ROLE_IT_AGENT`, and `ROLE_EMPLOYEE`.
  - Object-level security: Employees are strictly restricted to their own tickets. Attempts to manipulate resource IDs return `403 Forbidden`.
- **Dual-Stream Communication**:
  - Public customer replies vs. confidential internal technician notes.
  - Internal notes are physically shielded and stripped from API payloads for employee users.
- **Enterprise Security**:
  - BCrypt (work factor 12) password hashing.
  - Short-lived JWT access tokens in memory paired with rotating refresh tokens in `HttpOnly`, `SameSite=Strict` cookies.
  - Refresh token reuse detection revoking all active sessions upon replay attack detection.
  - Immutable audit logs recording all security events and ticket status changes.
- **PostgreSQL 16 & Flyway**:
  - Explicit versioned migrations (`V1__initial_schema.sql`, `V2__seed_data.sql`). Optimistic locking with `@Version`.

---

## 2. Architecture & Monorepo Structure

```
it-helpdesk/
├── backend/                  # Java 21 LTS Spring Boot 3.4 Modular Monolith
│   ├── pom.xml               # Pinned Maven dependencies
│   ├── src/main/java/        # Package-by-feature domain code
│   └── src/main/resources/   # Flyway migrations and configurations
├── src/                      # React 19 + TypeScript + Tailwind CSS Frontend
├── infrastructure/           # Dockerfiles & Nginx reverse proxy configs
│   └── docker/
│       ├── backend/          # Multi-stage Java 21 runtime
│       ├── frontend/         # Multi-stage Node build + Nginx runtime
│       └── nginx/            # Reverse proxy & security headers
├── docs/                     # Architectural Decision Records (ADRs) & specs
│   ├── architecture.md
│   ├── database-design.md
│   ├── rbac-matrix.md
│   ├── ticket-lifecycle.md
│   ├── api.md
│   ├── security.md
│   ├── testing.md
│   └── deployment.md
├── scripts/                  # Backup, restore, and automated test runners
├── .github/workflows/        # CI/CD pipelines
├── compose.yaml              # Local development topology
├── compose.prod.yaml         # Production topology
├── Makefile                  # Developer CLI
└── README.md
```

---

## 3. Quick Start (Local Docker Compose)

### Prerequisites
- Docker Engine 24+ and Docker Compose v2+
- Git

### 1-Step Launch
```bash
# Clone the repository
git clone https://github.com/example/resolveit.git
cd resolveit

# Copy environment variables template
cp .env.example .env

# Launch all services (PostgreSQL, Backend, Frontend)
make up
```

Access the services:
- **Web Application**: [http://localhost:3000](http://localhost:3000)
- **API Base**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Actuator Health**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

---

## 4. Development Accounts (Seed Credentials)

| Role | Email | Password | Scope |
|---|---|---|---|
| **Administrator** | `admin@resolveit.internal` | `Password123!` | Global administration, user management, audit logs |
| **IT Manager** | `manager.sarah@resolveit.internal` | `Password123!` | Department queues, SLA reports, team reassignments |
| **IT Agent** | `agent.marcus@resolveit.internal` | `Password123!` | Triage, assignment, internal notes, resolution |
| **IT Agent** | `agent.elena@resolveit.internal` | `Password123!` | Frontline service desk, triage, comments |
| **Employee** | `employee.alex@resolveit.internal` | `Password123!` | Self-service portal, create tickets, view own tickets |
| **Employee** | `employee.chloe@resolveit.internal` | `Password123!` | Self-service portal, view assigned assets |

---

## 5. Development CLI (`make`)

| Command | Action |
|---|---|
| `make up` | Start full environment in background with health checks |
| `make down` | Gracefully terminate containers and networks |
| `make build` | Recompile and rebuild container images |
| `make logs` | Stream logs from all running containers |
| `make test` | Execute backend Testcontainers & frontend Vitest suites |
| `make test-backend` | Run Maven tests with Testcontainers PostgreSQL |
| `make lint` | Run TypeScript strict typechecking |
| `make health` | Query Spring Boot Actuator readiness probe |
| `make db-backup` | Export timestamped gzip SQL dump to `backups/` |
| `make db-restore` | Restore latest backup into active database container |

---

## 6. Testing Strategy

- **Unit Tests**: State machine transitions (`TicketStateMachineTest`), JWT generation and SHA-256 rotation (`JwtTokenProviderTest`), SLA deadline math (`SlaCalculationServiceTest`).
- **Integration Tests**: Spring Boot `@SpringBootTest` with **Testcontainers** running a real PostgreSQL 16 container, executing Flyway migrations from scratch.
- **E2E Journeys**: Playwright suites covering authentication, ticket intake, technician triage, resolution, and role-based data shielding.
