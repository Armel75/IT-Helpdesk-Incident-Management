# Testing Strategy & Quality Assurance Guide

## 1. Testing Pyramid

ResolveIT employs a layered testing strategy across both backend and frontend codebases:

```
          / \
         / E2E \       Playwright End-to-End Critical Journeys (9 workflows)
        /-------\
       /  Integ  \     Spring Boot + Testcontainers PostgreSQL Integration Tests
      /-----------\
     /    Unit     \   JUnit 5, Mockito, Vitest, React Testing Library
    /---------------\
```

---

## 2. Test Suites Execution Commands

| Scope | Command | Description |
|---|---|---|
| **All Tests** | `make test` | Runs backend and frontend test suites. |
| **Backend Unit & Integration** | `make test-backend` | Executes `mvn clean test verify` with Testcontainers. |
| **Frontend Unit & Component** | `make test-frontend` | Executes `vitest run` and React Testing Library. |
| **Frontend Typecheck & Lint** | `make lint` | Runs `tsc --noEmit` and ESLint checks. |
| **End-to-End User Journeys** | `npx playwright test` | Executes cross-role browser automation tests. |

---

## 3. End-to-End Critical User Journeys

The following 9 core journeys are tested end to end:

1. **User Provisioning & Password Policy**: Admin provisions a new employee; system enforces password complexity and generates user records.
2. **Authentication & Token Lifecycle**: User logs in, receives access JWT and HttpOnly refresh token; calls `/auth/refresh` to verify token rotation; tests logout revocation.
3. **Ticket Submission**: Employee submits a new INCIDENT with category, asset tag, and priority; system calculates and assigns SLA deadlines.
4. **Queue & Assignment**: IT Agent views unassigned queue, claims ticket, transitioning state from `OPEN` to `IN_PROGRESS`.
5. **Customer Reply vs Internal Note**: Agent posts a public reply and a confidential internal technician note; verification proves employee user cannot see internal note.
6. **Object-Level Authorization (IDOR Defense)**: Unauthorized Employee B attempts `GET /api/v1/tickets/{ticketA_id}` and is rejected with `403 Forbidden`.
7. **Resolution Enforcement**: Agent attempts resolving without a resolution summary and is rejected (`422 Unprocessable Content`); agent supplies detailed summary and succeeds.
8. **Manager SLA & Reporting**: IT Manager loads dashboard analytics; verifies MTTR, SLA compliance rates, and priority distribution match database aggregates.
9. **Token Invalidation on Deactivation**: Admin deactivates an agent account; subsequent API calls with existing tokens are rejected immediately.
