# ADR 0003: Authoritative Database SLA State Machine and Scheduled Prober

## Status
Accepted

## Context
Helpdesk systems must track SLA response and resolution targets without relying on ephemeral in-memory timers, which fail across application restarts or multi-instance deployments.

## Decision
1. **Authoritative Database State**: When a ticket is created, the system queries the active `SlaPolicy` for its priority/type, calculates exact UTC deadlines (`response_deadline`, `resolution_deadline`), and persists them in the `ticket_sla` table.
2. **State Transition Triggers**: When a ticket moves to `TRIAGED` / `IN_PROGRESS` or an agent posts the first comment, `first_response_at` is stamped and response SLA is verified. When resolved, `resolved_at` is stamped.
3. **Idempotent Prober**: A Spring `@Scheduled` background worker runs every 60 seconds executing an indexed query:
   ```sql
   UPDATE ticket_sla 
   SET resolution_breached = TRUE, resolution_breached_at = NOW() 
   WHERE resolution_deadline < NOW() 
     AND resolution_breached = FALSE 
     AND ticket_id IN (SELECT id FROM tickets WHERE status NOT IN ('RESOLVED', 'CLOSED', 'CANCELLED'));
   ```
   This ensures zero duplicate notifications and survives service restarts.

## Consequences
- **Positive**: Resilient to restarts and zero-downtime rolling deployments. Real-time accuracy without loading thousands of tickets into memory.
- **Negative**: Small detection latency bounded by the 60-second cron interval (sufficient for SLA tracking).
