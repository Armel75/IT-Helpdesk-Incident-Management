# Application Security Architecture & Defenses

## 1. Authentication & Token Lifecycle

### 1.1 Password Storage
- **Algorithm**: BCrypt with work factor 12 (or Argon2id).
- Passwords must be at least 10 characters with upper, lower, digits, and special characters.

### 1.2 Access Token vs. Refresh Token Strategy
```
+-------------+                 +--------------------+                 +---------------+
|   Browser   |                 | Spring Security GW |                 |  PostgreSQL   |
+-------------+                 +--------------------+                 +---------------+
       |                                  |                                    |
       | 1. POST /auth/login              |                                    |
       |--------------------------------->| Verify credentials                 |
       |                                  | Hash comparison                    |
       | 2. 200 OK + Body: Access JWT     |                                    |
       |    Set-Cookie: refresh_token     | Save SHA-256(token) to DB -------->|
       |<---------------------------------|                                    |
       |                                  |                                    |
       | 3. API Calls: Bearer <JWT>       |                                    |
       |--------------------------------->| Verify signature & claims          |
       |                                  | (Stateless check in memory)        |
       |                                  |                                    |
       | 4. JWT Expires (15 mins)         |                                    |
       |    POST /auth/refresh (Cookie)   |                                    |
       |--------------------------------->| Check SHA-256 hash in DB ---------->|
       |                                  | Check revocation & expiration      |
       |                                  | Revoke old token & generate new    |
       | 5. 200 OK + New Access JWT       | Save new hash in DB -------------->|
       |    Set-Cookie: new_refresh_token |                                    |
       |<---------------------------------|                                    |
```

- **Access Token**: Short-lived (15 minutes). Contains `sub` (userId), `email`, `role`, `jti`. Stored strictly in browser memory (React state/closure), NEVER in `localStorage` or `sessionStorage` (preventing XSS exfiltration).
- **Refresh Token**: Long-lived (7 days). Stored exclusively in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie with path restricted to `/api/v1/auth`.
- **Token Rotation & Reuse Detection**:
  - Every call to `/api/v1/auth/refresh` immediately invalidates the consumed refresh token and issues a new one.
  - If an already revoked refresh token is presented (indicating theft or token replay attack), the system automatically revokes ALL active refresh tokens for that user account and logs a high-severity `SECURITY_AUDIT` event.
- **Revocation on Logout**:
  - `POST /api/v1/auth/logout` explicitly flags the stored token hash as `revoked=true` in PostgreSQL and overwrites the client cookie with an expired `Max-Age=0`.

---

## 2. Threat Mitigations Matrix

| OWASP Top 10 Threat | Mitigation Implemented |
|---|---|
| **A01: Broken Access Control (IDOR)** | Server-side `@PreAuthorize("@ticketSecurity.canView(...)")` checks. Employees cannot view or modify tickets outside `requesterId == principal.id`. Technicians can only access assigned/team tickets. |
| **A02: Cryptographic Failures** | Strong BCrypt (work factor 12) + SHA-256 token hashing. JWT signed with HMAC-SHA256 using 256-bit+ random secret loaded via environment variable. |
| **A03: Injection (SQL / Command)** | Spring Data JPA with parameterized Hibernate queries. Flyway versioned migrations. Input validation via Bean Validation (`@NotNull`, `@Size`, `@Pattern`). |
| **A04: Insecure Design** | Strict state machine enforces transition rules (e.g., ticket cannot be resolved without a summary). SLA deadlines computed via authoritative database clock. |
| **A05: Security Misconfiguration** | Actuator exposes only `/health` and `/info` by default. Nginx enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, and CSP. |
| **A06: Vulnerable Dependencies** | Pinned dependency versions in `pom.xml` and `package.json`. OWASP Dependency-Check configured in CI. |
| **A07: Identification & Auth Failures** | Rate limiting (Bucket4j / in-memory sliding window) on `/auth/login` to thwart brute-force password guessing. Refresh token rotation with reuse detection. |
| **A08: Software & Data Integrity** | Database constraints (`UNIQUE`, `CHECK`, `NOT NULL`) and Flyway migration checksum verification. |
| **A09: Security Logging & Monitoring** | `security_audit_logs` table records failed logins, role modifications, account deactivations, and token reuse anomalies with actor ID, IP address, and timestamp. |
| **A10: Server-Side Request Forgery** | No outbound external webhooks permitted without domain allowlist. |

---

## 3. CORS & CSRF Defense

- **CORS**: Explicit allowed origins configured via Spring Security (`corsConfigurationSource`). Wildcards (`*`) with credentials (`allowCredentials=true`) are forbidden.
- **CSRF**: When refresh tokens are passed via cookies, the cookie uses `SameSite=Strict`. For any cookie-authenticated mutating endpoints, Spring Security requires a double-submit CSRF token or custom header check (`X-Requested-With: XMLHttpRequest`).
