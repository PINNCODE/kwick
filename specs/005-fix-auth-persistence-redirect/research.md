# Research: Fix Auth Persistence Redirect on Page Refresh

## Decision Record

### 1. Hydration Tracking Approach

**Decision**: Add `_hasHydrated` boolean to the Zustand store, set via `onRehydrateStorage` callback from persist middleware
**Rationale**: Zustand's persist middleware provides `onRehydrateStorage` which fires after localStorage state is restored. This is the official mechanism to detect hydration completion. Adding a boolean flag is minimal and doesn't change the store's public API.
**Alternatives considered**:
- Zustand `useStore.persist.hasHydrated()` method: Requires importing the persist extension — more complex than a simple flag.
- Custom `useEffect` with `getCredentials()`: Duplicates logic already in Zustand persist.

### 2. API Verification on Page Load

**Decision**: Call `checkStoredAuth()` in a `useEffect` on player page mount, after hydration completes
**Rationale**: `checkStoredAuth()` already exists in the store and performs the exact verification needed (POST to `/api/xtream/auth`). Reusing it avoids code duplication.
**Alternatives considered**:
- Create a new `verifyStoredCredentials` action: Unnecessary — `checkStoredAuth` already does this.
- Use SWR to verify auth: Over-engineered for a single verification call.

### 3. API Timeout (5 seconds)

**Decision**: Add `AbortController` with 5-second timeout to fetch calls in `checkStoredAuth` and the health check
**Rationale**: `AbortController` is the standard browser API for request cancellation. 5 seconds matches the existing health check timeout in `/api/xtream/health/route.ts`.
**Alternatives considered**:
- Server-side timeout only: Client needs its own timeout to avoid hanging UI.
- `Promise.race` with `setTimeout`: Less clean than `AbortController`, doesn't actually cancel the network request.

### 4. Error UI on API Verification Failure

**Decision**: Create a new `SessionError` component showing error message + retry button, displayed inline on the player page instead of redirecting to /login
**Rationale**: Redirecting to /login when credentials are valid but the API is unreachable is confusing. An inline error with retry preserves the user's context and credentials.
**Alternatives considered**:
- Redirect to /login with error query param: Loses user context, forces re-entering credentials.
- Show toast notification: Less prominent — user might miss it while waiting for video.

### 5. Loading State During Verification

**Decision**: Reuse existing `isLoading` state from `useXtreamAuth` — the player page already shows "Verificando sesión..." spinner when `isAuthLoading` is true
**Rationale**: No new UI needed — the existing loading state covers this case. Just need to ensure `isLoading` is set correctly during `checkStoredAuth`.
**Alternatives considered**:
- New `isVerifying` state: Redundant with `isLoading`.
- Separate loading component: Unnecessary complexity.
