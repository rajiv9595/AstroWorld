# Phase 9 — Mainline Convergence & Security

## Objective

Phase 9 begins the production-convergence track. Its first gate is identity:
the server must decide which user is authenticated, and every protected
resource must use that server-derived identity.

This phase does not change the validated astrology models. It changes the
security boundary around them.

## Implemented

### Server-trusted authentication
- Supabase access tokens are verified server-side with `auth.getUser(token)`.
- Browser sessions use HttpOnly access and refresh cookies.
- Cross-site production deployments use `SameSite=None; Secure` cookies.
- A backend-issued CSRF token protects unsafe cookie-authenticated requests.
- Bearer authentication remains supported for non-browser API clients.
- Silent refresh preserves the user's Remember Me lifetime.

### Authorization and tenant isolation
- AI consultation, memory, conversation, chart, and server-side calculation
  routes are authenticated.
- User identity is no longer read from `x-user-id`, query-string userId, or
  request-body userId fields.
- Conversation reads/deletes are limited to conversations owned by the
  authenticated user within the active service instance.
- Operational metrics are admin-only.

### Authentication correctness
- Duplicate signup no longer deletes and recreates an existing account.
- Signup creates a session when Supabase immediately returns one.
- `GET /api/auth/session` reconstructs browser auth state from the verified
  server session.
- `POST /api/auth/logout` clears the protected session cookies.

### Browser security
- Frontend clients send credentialed requests and CSRF headers for mutations.
- Supabase auth tokens are not placed into localStorage.
- Broken guest-login UI was removed because the backend endpoint did not exist.
- Saved-chart localStorage fallback was removed to avoid treating browser cache
  as authoritative user data.

### HTTP boundary
- Production CORS now uses an explicit origin allowlist from
  `CORS_ORIGINS` / `PUBLIC_WEB_ORIGIN`.
- Express trust-proxy configuration is explicit for deployed environments.
- JSON body size was reduced from 10MB to 1MB.

## Regression gate

From `backend`:

```
npm run test:phase9:security
```

The structural gate verifies that unsafe identity fallbacks, destructive
signup behavior, wildcard credentialed CORS, missing session verification,
missing CSRF handling, and dead guest-login code do not return unnoticed.

## Still required before Phase 9 is complete

The security code must pass actual local build/type checks and live integration
tests against the configured Supabase project. The next Phase 9 slices cover
engine convergence, time/place validation, and those integration tests.

No merge to `main` occurs automatically.
