# Database Design & Schema Specification

## 1. Schema Overview

The ResolveIT database is hosted on PostgreSQL 16. Primary keys use UUIDs for non-sequential, tamper-resistant identifiers, while tickets also maintain a human-readable unique sequential reference (e.g., `INC-2026-00142`).

All timestamps are stored in UTC using `TIMESTAMP WITH TIME ZONE`.

---

## 2. Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : has
    USERS ||--o{ TICKETS : requests
    USERS ||--o{ TICKETS : assigned_to
    USERS ||--o{ COMMENTS : authors
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ TEAM_MEMBERSHIPS : belongs_to
    
    TEAMS ||--o{ TEAM_MEMBERSHIPS : includes
    TEAMS ||--o{ TICKETS : assigned_team
    
    CATEGORIES ||--o{ CATEGORIES : parent_child
    CATEGORIES ||--o{ TICKETS : categorizes
    CATEGORIES ||--o{ KNOWLEDGE_ARTICLES : categorizes
    
    ASSETS ||--o{ TICKETS : affects
    
    TICKETS ||--o{ COMMENTS : contains
    TICKETS ||--o{ TICKET_HISTORY : tracks
    TICKETS ||--|| TICKET_SLA : governed_by
    
    SLA_POLICIES ||--o{ TICKET_SLA : defines
    
    USERS {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar full_name
        varchar role
        varchar department
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    REFRESH_TOKENS {
        uuid id PK
        uuid user_id FK
        varchar token_hash UK
        timestamp expires_at
        boolean revoked
        timestamp created_at
    }

    CATEGORIES {
        uuid id PK
        uuid parent_id FK
        varchar name
        varchar code UK
        text description
        boolean active
    }

    TEAMS {
        uuid id PK
        varchar name UK
        text description
        uuid lead_user_id FK
        boolean active
    }

    TICKETS {
        uuid id PK
        varchar ticket_number UK
        varchar title
        text description
        varchar ticket_type
        varchar priority
        varchar severity
        varchar status
        uuid requester_id FK
        uuid assigned_agent_id FK
        uuid assigned_team_id FK
        uuid category_id FK
        uuid asset_id FK
        text resolution_summary
        timestamp first_response_at
        timestamp resolved_at
        timestamp closed_at
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    COMMENTS {
        uuid id PK
        uuid ticket_id FK
        uuid author_id FK
        text content
        varchar comment_type
        timestamp created_at
    }

    TICKET_HISTORY {
        uuid id PK
        uuid ticket_id FK
        uuid actor_id FK
        varchar event_type
        varchar field_changed
        text old_value
        text new_value
        timestamp created_at
    }

    SLA_POLICIES {
        uuid id PK
        varchar name UK
        varchar priority
        varchar ticket_type
        int response_time_hours
        int resolution_time_hours
        boolean active
    }

    TICKET_SLA {
        uuid id PK
        uuid ticket_id FK
        uuid policy_id FK
        timestamp response_deadline
        timestamp resolution_deadline
        boolean response_breached
        boolean resolution_breached
        timestamp response_breached_at
        timestamp resolution_breached_at
        bigint version
    }

    KNOWLEDGE_ARTICLES {
        uuid id PK
        varchar title
        text content
        uuid category_id FK
        uuid author_id FK
        varchar status
        int view_count
        timestamp published_at
        timestamp created_at
    }

    ASSETS {
        uuid id PK
        varchar asset_tag UK
        varchar name
        varchar asset_type
        varchar status
        uuid owner_id FK
        varchar serial_number
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        varchar title
        text message
        varchar type
        uuid reference_id
        boolean read
        timestamp created_at
    }

    SECURITY_AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        varchar action
        varchar resource_type
        varchar resource_id
        varchar ip_address
        varchar status
        text details
        timestamp created_at
    }
```

---

## 3. Indexing & Performance Strategy

1. **Ticket Filtering Indexes**:
   - `CREATE INDEX idx_tickets_status ON tickets(status);`
   - `CREATE INDEX idx_tickets_priority ON tickets(priority);`
   - `CREATE INDEX idx_tickets_requester ON tickets(requester_id);`
   - `CREATE INDEX idx_tickets_assigned ON tickets(assigned_agent_id);`
   - `CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);`
   - `CREATE UNIQUE INDEX idx_tickets_number ON tickets(ticket_number);`
2. **SLA Breach Prober Optimization**:
   - `CREATE INDEX idx_sla_unresolved ON ticket_sla(resolution_deadline) WHERE resolution_breached = FALSE;`
   - `CREATE INDEX idx_sla_unresponded ON ticket_sla(response_deadline) WHERE response_breached = FALSE;`
3. **Comments & History**:
   - `CREATE INDEX idx_comments_ticket ON comments(ticket_id, created_at ASC);`
   - `CREATE INDEX idx_history_ticket ON ticket_history(ticket_id, created_at ASC);`
4. **Audit & Notifications**:
   - `CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;`
   - `CREATE INDEX idx_audit_created ON security_audit_logs(created_at DESC);`
