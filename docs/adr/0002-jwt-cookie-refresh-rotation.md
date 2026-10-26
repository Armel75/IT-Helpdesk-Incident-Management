# ADR 0002: Short-Lived JWT Access Tokens with HttpOnly Rotating Refresh Tokens

## Status
Accepted

## Context
Web applications storing authentication tokens in `localStorage` or `sessionStorage` are vulnerable to Cross-Site Scripting (XSS) exfiltration. Conversely, relying purely on session cookies introduces CSRF challenges across separate API domains.

## Decision
1. **Access Token**: Short-lived (15 minutes), stateless JWT containing userId, email, and roles. Kept in browser memory (React state) only.
2. **Refresh Token**: Long-lived (7 days), stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie scoped exclusively to `/api/v1/auth`.
3. **Rotation & Reuse Detection**: Every refresh operation invalidates the existing token and generates a new one. Storing token hashes in PostgreSQL enables detecting replay attacks: if a revoked token is used, all tokens for that user are revoked immediately.

## Consequences
- **Positive**: Immune to localStorage script-scraping attacks. Stolen refresh tokens are rendered useless upon first legitimate use, and any reuse triggers immediate incident response.
- **Negative**: Requires a token refresh exchange when users refresh the browser page. Handled seamlessly by an upfront `/api/v1/auth/refresh` check on application bootstrap.
