# Data Model: Fix Auth Persistence Redirect

## New State: Hydration Flag

One new boolean field added to the `useXtreamAuth` Zustand store:

| Property | Type | Default | Description |
|---|---|---|---|
| `_hasHydrated` | `boolean` | `false` | Set to `true` by `onRehydrateStorage` callback after Zustand restores state from localStorage |

## Behavior Rules

### Hydration Lifecycle

```
Page Load
  → Zustand store initializes with default values (_hasHydrated = false)
  → persist middleware reads localStorage asynchronously
  → onRehydrateStorage fires → _hasHydrated = true
  → Player page detects _hasHydrated === true
  → Player page calls checkStoredAuth()
  → API verification completes (or times out at 5s)
  → isAuthenticated set accordingly
```

### State Transitions

```
Initial State: { isAuthenticated: false, isLoading: false, _hasHydrated: false }
  → persist reads localStorage → onRehydrateStorage → _hasHydrated = true
  → if credentials exist: isLoading = true → API call → success → isAuthenticated = true
  → if credentials exist: isLoading = true → API call → fail → isAuthenticated = false, error = message
  → if no credentials: _hasHydrated = true, isAuthenticated = false (redirect to /login)
```

### API Verification Timeout

- All fetch calls during `checkStoredAuth` use `AbortController` with 5-second timeout
- On timeout: set `error` message with retry option, do NOT clear credentials
- On network error: same behavior — preserve credentials, show retry UI

## Relationship to Existing State

- `_hasHydrated` is NOT persisted to localStorage (internal flag only)
- `isAuthenticated` is persisted (existing behavior)
- `isLoading` is NOT persisted (resets on page load — existing behavior)
- `error` is NOT persisted (resets on page load — existing behavior)
