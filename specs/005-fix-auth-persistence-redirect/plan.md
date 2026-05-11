# Implementation Plan: Fix Auth Persistence Redirect on Page Refresh

**Branch**: `005-fix-auth-persistence-redirect` | **Date**: 2026-05-10 | **Spec**: `specs/005-fix-auth-persistence-redirect/spec.md`
**Input**: Feature specification from `/specs/005-fix-auth-persistence-redirect/spec.md`

## Summary

Fix premature redirect to `/login` on page refresh by ensuring Zustand's persist middleware completes hydration from localStorage before the auth check evaluates `isAuthenticated`. Add a hydration tracking flag (`_hasHydrated`) to the store, use `onRehydrateStorage` to signal completion, and call `checkStoredAuth()` on player page mount to verify credentials against the API with a 5-second timeout. If API verification fails, show a retry UI instead of redirecting.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js 16.2.6, React 19.2.4
**Primary Dependencies**: Zustand 5.0.13 (with persist middleware), SWR 2.4.1
**Storage**: localStorage (via `app/lib/storage.ts` and Zustand persist)
**Testing**: Jest + @testing-library/react (see `app/hooks/__tests__/`)
**Target Platform**: Modern web browsers (desktop)
**Project Type**: Web application (Next.js App Router, `/player` page)
**Performance Goals**: Session restoration < 500ms, API verification timeout 5s, INP < 200ms
**Constraints**: No changes to login/logout flow; Spanish-first UI for all user-facing messages
**Scale/Scope**: Single-user session, one auth store instance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. TypeScript-First | PASS | All changes in .ts/.tsx, strict mode, explicit types for new state fields |
| II. Component-Driven | PASS | New error/retry component follows co-location pattern |
| III. Test-First | PASS | Tests required for hydration tracking and API verification flow |
| IV. Framework-Aware | PASS | Uses Zustand `onRehydrateStorage` — standard persist API |
| V. Simplicity & Maintainability | PASS | Minimal change: add `_hasHydrated` flag + `useEffect` in player page |
| VI. Spanish-First | PASS | All new UI messages in Spanish |
| Quality Gate 1: TS strict | PASS | No `any` introduced |
| Quality Gate 2: ESLint | PASS | Follows existing patterns |
| Quality Gate 3: All tests pass | MUST VERIFY | Run after implementation |
| Quality Gate 4: No console.log | PASS | No console.log in production code |
| Quality Gate 5: Tests or waiver | PASS | New tests required |
| Quality Gate 6: Lighthouse 90+ | PASS | No visual/performance regression expected |

## Project Structure

### Documentation (this feature)

```text
specs/005-fix-auth-persistence-redirect/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty for this feature)
└── tasks.md             # Created by /speckit.tasks
```

### Source Code (repository root)

```text
app/
├── hooks/
│   ├── useXtreamAuth.ts          # [MODIFY] Add _hasHydrated, onRehydrateStorage
│   └── __tests__/
│       └── useXtreamAuth.test.ts # [ADD] Tests for hydration + checkStoredAuth
├── components/
│   └── auth/
│       └── SessionError.tsx      # [ADD] Error/retry UI for failed API verification
├── lib/
│   └── xtream-api.ts             # [MODIFY] Add timeout to health/auth calls (5s)
└── player/
    └── page.tsx                  # [MODIFY] Wait for hydration, call checkStoredAuth, handle error state
```

**Structure Decision**: Single frontend project (Next.js App Router). All changes within existing files following established patterns. One new component for error/retry UI.

## Complexity Tracking

No constitution violations — this is a bug fix with minimal state addition (`_hasHydrated` boolean flag).
