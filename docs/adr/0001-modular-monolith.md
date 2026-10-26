# ADR 0001: Modular Monolith Backend Architecture

## Status
Accepted

## Context
An enterprise IT helpdesk system manages cross-cutting concerns: identity, tickets, comments, SLA compliance, assets, knowledge articles, and audit logs. A microservices architecture introduces network latency, distributed transactions (Sagas/2PC), split migrations, and high operational overhead without an initial scalability driver.

## Decision
We implement a **Modular Monolith** using Java 21 LTS and Spring Boot 3.4. Domain boundaries are enforced via package-by-feature modules (`identity`, `ticket`, `sla`, `comment`, etc.), with explicit service interfaces and shared transactional boundaries.

## Consequences
- **Positive**: Single deployable artifact, atomic database transactions across ticket state changes and SLA updates, zero network serialization penalty between modules, straightforward Flyway migrations.
- **Negative**: Requires strict module boundary discipline to avoid circular dependencies between packages.
