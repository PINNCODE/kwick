# Tasks: Login Feature

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~400-500 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | not-applicable |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: not-applicable
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full login feature | PR 1 | All tasks below; single PR |

## Phase 1: Foundation

- [ ] 1.1 Create `src/app/features/auth/auth.routes.ts` with route: `/login` -> `AuthComponent` (lazy load)
- [ ] 1.2 Create `src/app/features/auth/auth.guard.ts` functional guard using `CanActivateFn`
- [ ] 1.3 Inject `CredentialStoragePort` in guard, check `exists()` -> allow or redirect to `/login`
- [ ] 1.4 Add `canActivate: [authGuard]` to `/player` route in `app.routes.ts`

## Phase 2: AuthService Adapter

- [ ] 2.1 Create `src/infrastructure/adapters/auth-service.adapter.ts` implementing `AuthService` port
- [ ] 2.2 Inject `LoginUseCase`, `IptvApiPort`, `EncryptionPort`, `CredentialStoragePort`
- [ ] 2.3 Implement `login(credentials, masterPassword)` -> wires to `LoginUseCase.execute()`
- [ ] 2.4 Implement `restoreSession(masterPassword)` -> decrypt stored credentials, verify with API
- [ ] 2.5 Implement `logout()` -> clears credentials via `CredentialStoragePort.delete()`

## Phase 3: AuthComponent

- [ ] 3.1 Create `src/app/features/auth/auth.component.ts` (standalone, `loadComponent` lazy)
- [ ] 3.2 Add signals: `isLoading`, `errorMessage`, `isAuthenticated`
- [ ] 3.3 Create reactive form with fields: `host` (URL validator), `username`, `password`, `rememberProvider`
- [ ] 3.4 Implement `onSubmit()` -> calls `AuthService.login(form.value, masterPassword)`
- [ ] 3.5 On success -> `Router.navigate('/player')`, on error -> `errorMessage.set(error)`
- [ ] 3.6 On init: if session exists -> redirect to `/player`

## Phase 4: Templates & Styles

- [ ] 4.1 Create `src/app/features/auth/auth.component.html` with glass panel, form fields, QR placeholder
- [ ] 4.2 Create `src/app/features/auth/auth.component.scss`:
  - Glass panel: `background: rgba(30,31,35,0.4); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.1)`
  - Dark background: `radial-gradient(#1e1f23, #121317)`
  - Glow overlay with parallax mouse tracking
  - Input focus: `border-color: #adc6ff; box-shadow: 0 0 0 2px rgba(173,198,255,0.2)`
  - Submit button: full-width, white bg, `border-radius: 9999px`
  - Material Symbols icons, Inter font

## Phase 5: Integration

- [ ] 5.1 Add `/login` route to `app.routes.ts` with `loadComponent`
- [ ] 5.2 Import `AuthComponent` in `auth.routes.ts`
- [ ] 5.3 Add `provideRouter(routes)` with `withComponentInputBinding()` in `app.config.ts`
- [ ] 5.4 Test full flow: `/login` -> submit -> `/player` redirect

## Dependencies

| Task | Depends On |
|------|------------|
| 3 (AuthComponent) | 2 (AuthServiceAdapter) |
| 4 (Styles) | 3 (AuthComponent template structure) |
| 5 (Wire together) | 1, 2, 3, 4 |

## Notes

- Component interacts ONLY through inbound ports (AuthService), no direct infrastructure calls
- Guard uses `CredentialStoragePort` directly (Dexie/IndexedDB access is an adapter detail)
- Session restore on init: check `CredentialStoragePort.exists()` before showing form