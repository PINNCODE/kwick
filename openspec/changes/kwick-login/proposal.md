# Proposal: Login UI Feature

## Intent

Add a login UI at `/login` route to complete the authentication flow. The IPTV backend (LoginUseCase, CredentialDbAdapter, WebCryptoAdapter) already exists but is unusable without a UI. This change makes authentication accessible to users.

## Scope

### In Scope
- New `AuthComponent` (standalone, reactive form) at `/login`
- Auth guard protecting `/player` route (redirect to `/login` if unauthenticated)
- Connect UI to existing `LoginUseCase` via `AuthService` implementation
- Visual design from provided HTML template (glass panel, dark theme, parallax glow)
- Session restore flow on component init
- Logout capability via AuthService

### Out of Scope
- Modifying existing IPTV specs (backend auth is spec'd and tested separately)
- Adding new domain entities or use cases
- Implementing "Remember Provider" checkbox persistence beyond already-specified credential storage
- QR code functionality (template placeholder only, not connected to any backend)
- Social login or SSO

## Capabilities

### New Capabilities
- `user-auth`: Login UI with form validation, error display, loading states, session restore, logout

### Modified Capabilities
- None at spec level (auth backend already specced in IPTV spec)

## Approach

Create `src/app/features/auth/` feature module:

1. **Route**: Add `/login` to `app.routes.ts` via `loadComponent` (lazy, standalone)
2. **AuthComponent**: Standalone Angular component with reactive form (host, username, password, masterPassword)
3. **AuthService**: Implementation of `AuthService` port wired to `LoginUseCase`
4. **AuthGuard**: Functional guard checking session validity, redirecting to `/login`
5. **Visual Design**: SCSS matching the glass-panel dark template (no Tailwind)
6. **Session Restore**: On init, check for stored credentials and attempt restore

Architecture decision: Feature folder is `auth` (not `login`) since logout and session management belong to the same domain.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/features/auth/` | New | LoginComponent, AuthService, AuthGuard |
| `src/app/app.routes.ts` | Modified | Add `/login` route and guard |
| `src/styles.scss` | Modified | Global theme variables (if needed) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Session restore fails silently | Low | Show login form with "Session expired" message |
| Auth guard race condition on init | Low | Guard returns `false` and redirects; component handles loading state |
| Form validation edge cases | Medium | Validate host format, non-empty fields before submit |

## Rollback Plan

1. Remove `/login` route entry from `app.routes.ts`
2. Delete `src/app/features/auth/` folder
3. Revert any global style changes
4. No database migrations needed (credential storage unaffected)

## Dependencies

- `LoginUseCase` at `src/core/application/use-cases/login.use-case.ts`
- `AuthService` port at `src/core/ports/inbound/auth.service.port.ts`
- `CredentialDbAdapter` at `src/infrastructure/storage/credential-db.adapter.ts`

## Success Criteria

- [ ] Navigate to `/login` shows login form
- [ ] Submit with valid credentials redirects to `/player`
- [ ] Submit with invalid credentials shows error message
- [ ] Navigate to `/player` without credentials redirects to `/login`
- [ ] "Remember Provider" checkbox persists credentials via Dexie
- [ ] Session restore on `/login` init reconnects if credentials stored
- [ ] Logout clears credentials and redirects to `/login`
