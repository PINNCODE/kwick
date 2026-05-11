# Quickstart: Fix Auth Persistence Redirect

## What You're Fixing

When a user refreshes `/player`, Zustand's persist middleware hasn't finished reading from localStorage before the auth check runs, causing `isAuthenticated` to be `false` and triggering a redirect to `/login`.

## Files to Modify

| File | Change |
|------|--------|
| `app/hooks/useXtreamAuth.ts` | Add `_hasHydrated` state + `onRehydrateStorage` callback + 5s timeout to `checkStoredAuth` |
| `app/player/page.tsx` | Wait for `_hasHydrated` before auth check, call `checkStoredAuth()` on mount, show error/retry UI |
| `app/lib/xtream-api.ts` | Add 5s timeout to API calls (if not already present) |

## Files to Create

| File | Purpose |
|------|---------|
| `app/components/auth/SessionError.tsx` | Error message + retry button for failed API verification |
| `app/hooks/__tests__/useXtreamAuth.test.ts` | Tests for hydration tracking and API verification |

## Key State (in `useXtreamAuth`)

```typescript
_hasHydrated: boolean // Set by onRehydrateStorage

// In persist config:
onRehydrateStorage: () => (state) => {
  if (state) {
    state._hasHydrated = true;
  }
}
```

## Player Page Flow

```typescript
// 1. Wait for hydration
if (!auth._hasHydrated) return <Loading />;

// 2. If not authenticated, call checkStoredAuth
useEffect(() => {
  if (!auth.isAuthenticated && !auth.isLoading) {
    auth.checkStoredAuth();
  }
}, [auth._hasHydrated]);

// 3. If error after verification, show SessionError component
if (auth.error) return <SessionError onRetry={auth.checkStoredAuth} />;

// 4. If still loading, show spinner
if (auth.isLoading) return <Loading />;

// 5. If not authenticated after all checks, redirect
if (!auth.isAuthenticated) router.push('/login');
```

## Run Checklist

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript strict
npm test           # Jest tests
```
