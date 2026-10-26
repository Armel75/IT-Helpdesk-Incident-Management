# Role-Based Access Control (RBAC) Matrix & Authorization Policy

## 1. Roles Definition

ResolveIT defines four strictly partitioned enterprise roles:

| Role | Code | Responsibility Scope |
|---|---|---|
| **Administrator** | `ROLE_ADMIN` | Global system administration, user provisioning, role promotion, category management, SLA policy config, and security audit log inspection. |
| **IT Manager** | `ROLE_IT_MANAGER` | Department oversight, team queues, escalation management, SLA compliance reports, and cross-team ticket reassignments. |
| **IT Agent** | `ROLE_IT_AGENT` | Incident investigation, triage, ticket claiming, status transitions, adding public customer replies and private internal technician notes. |
| **Employee** | `ROLE_EMPLOYEE` | Self-service portal user. Can create tickets, view/reply to own tickets only, search published knowledge base articles, and view assigned company assets. |

---

## 2. Permission Matrix by Resource

| Action / Capability | `EMPLOYEE` | `IT_AGENT` | `IT_MANAGER` | `ADMIN` | Object-Level Authorization Rule |
|---|:---:|:---:|:---:|:---:|---|
| **View Tickets** | Own Only | Assigned / Team / Unassigned | All | All | Employee can ONLY access tickets where `requester_id == current_user.id`. IDOR strictly blocked with HTTP 403. |
| **Create Ticket** | Yes | Yes | Yes | Yes | Can create INCIDENT or SERVICE_REQUEST. Requester is forced to authenticated user unless created on behalf by Agent/Manager. |
| **Triage / Assign Ticket** | No | Yes (Self/Team) | Yes (Any) | Yes (Any) | Agent can claim unassigned or self; Manager/Admin can reassign across teams. |
| **Update Status (General)** | Reopen / Cancel Own | Yes (State Machine) | Yes (State Machine) | Yes (State Machine) | State machine preconditions strictly enforced (e.g., must provide `resolutionSummary` on `RESOLVED`). |
| **Resolve Ticket** | No | Yes | Yes | Yes | Mandatory resolution summary required. |
| **Close Ticket** | Yes (Own Resolved) | Yes | Yes | Yes | Employee can verify resolution and confirm closure. |
| **Add Public Comment** | Own Tickets | Any Visible Ticket | Any Visible Ticket | Any Visible Ticket | Employee can only comment on own open/resolved tickets. |
| **Add Internal Note** | **DENIED** | Yes | Yes | Yes | Internal notes are stripped from responses for `EMPLOYEE` users. |
| **View Internal Notes** | **DENIED** | Yes | Yes | Yes | Filtered at database/service boundary. |
| **View Ticket Audit History**| Public Events Only | Full History | Full History | Full History | Internal system transitions sanitized for employees. |
| **SLA Policy Management** | No | Read Only | Read / Update | Full CRUD | Only Admin and Manager can modify SLA thresholds. |
| **Knowledge Base (Search/View)**| Published Only | All (incl Draft) | All (incl Draft) | All | Employees only see `PUBLISHED` articles. |
| **Knowledge Base (Author/Publish)**| No | Author Draft | Author / Publish | Author / Publish | Agents draft; Managers/Admins approve & publish. |
| **Asset Directory** | Own Assigned Assets | Full Inventory | Full Inventory | Full CRUD | Employee can view assets linked to their account. |
| **Dashboard Metrics** | Personal Stats Only | Team / Agent Queue | Department SLA | Global Enterprise | Aggregations filtered by requester or team scope. |
| **User Provisioning & Roles**| No | No | No | Full CRUD | Only `ADMIN` can create, activate/deactivate, or grant roles. |
| **Security Audit Logs** | No | No | No | Read Only | Only `ADMIN` can query security audit logs. |

---

## 3. Object-Level Security Implementation

Spring Security `@PreAuthorize` annotations are backed by dedicated authorization evaluators:

```java
@PreAuthorize("@ticketSecurity.canView(authentication, #ticketId)")
@GetMapping("/{ticketId}")
public ResponseEntity<TicketResponse> getTicketById(@PathVariable UUID ticketId) { ... }

@PreAuthorize("@ticketSecurity.canComment(authentication, #ticketId, #request.commentType)")
@PostMapping("/{ticketId}/comments")
public ResponseEntity<CommentResponse> addComment(...) { ... }
```

In `TicketSecurityEvaluator`:
- If `authentication` has `ROLE_ADMIN` or `ROLE_IT_MANAGER` -> `return true`.
- If `authentication` has `ROLE_IT_AGENT` -> `return ticket.getAssignedAgentId() == user.getId() || ticket.getAssignedTeamId() in user.getTeamIds() || ticket.isUnassigned()`.
- If `authentication` has `ROLE_EMPLOYEE` -> `return ticket.getRequesterId().equals(user.getId())`.
- For internal notes: `if (type == CommentType.INTERNAL_NOTE && !hasTechnicianRole(user)) return false;`
