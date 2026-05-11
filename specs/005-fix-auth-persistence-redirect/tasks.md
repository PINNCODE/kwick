# Tasks: Fix Auth Persistence Redirect on Page Refresh

**Input**: Design documents from `/specs/005-fix-auth-persistence-redirect/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Included per constitution Principle III (Test-First Development).

**Organization**: Single user story (P1) — all tasks contribute to fixing the premature redirect on page refresh.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Not Required)

Project already exists. No setup tasks needed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add hydration tracking to the Zustand auth store. This is the core mechanism that prevents premature redirect before localStorage is read.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Add `_hasHydrated: boolean` field to `AuthState` interface in `app/hooks/useXtreamAuth.ts`
- [x] T002 Add `onRehydrateStorage` callback to persist config that sets `_hasHydrated = true` after state restoration in `app/hooks/useXtreamAuth.ts`
- [x] T003 Export `_hasHydrated` from the store's return state in `app/hooks/useXtreamAuth.ts`

**Checkpoint**: Hydration tracking ready — player page can wait for hydration before auth check

---

## Phase 3: User Story 1 — Mantener sesión activa al refrescar página (Priority: P1) 🎯 MVP

**Goal**: After page refresh, wait for Zustand hydration to complete, verify stored credentials against the API with a 5-second timeout, and keep the user on /player if credentials are valid. Show error/retry UI if API is unreachable instead of redirecting to /login.

**Independent Test**: Log in, navigate to /player, refresh the page (F5), and verify the user remains on /player without being redirected to /login.

### Tests for User Story 1 ⚠️

- [ ] T004 [P] [US1] Test `_hasHydrated` is `false` initially and becomes `true` after `onRehydrateStorage` fires in `app/hooks/__tests__/useXtreamAuth.test.ts`
- [ ] T005 [P] [US1] Test `checkStoredAuth` returns `true` and sets `isAuthenticated = true` when API responds successfully in `app/hooks/__tests__/useXtreamAuth.test.ts`
- [ ] T006 [P] [US1] Test `checkStoredAuth` sets `error` message (not redirect) when API times out after 5 seconds in `app/hooks/__tests__/useXtreamAuth.test.ts`
- [ ] T007 [P] [US1] Test `checkStoredAuth` clears credentials and redirects when API returns invalid credentials in `app/hooks/__tests__/useXtreamAuth.test.ts`
- [ ] T008 [US1] Test player page waits for `_hasHydrated` before evaluating auth state in `app/player/__tests__/page.test.tsx` or integration test

### Implementation for User Story 1

- [x] T009 [US1] Add `AbortController` with 5-second timeout to fetch calls in `checkStoredAuth` in `app/hooks/useXtreamAuth.ts`
- [x] T010 [US1] Modify `checkStoredAuth` catch block to preserve credentials and set error message on timeout/network error instead of clearing credentials in `app/hooks/useXtreamAuth.ts`
- [x] T011 [P] [US1] Create `SessionError` component with error message in Spanish and retry button in `app/components/auth/SessionError.tsx`
- [x] T012 [US1] Update player page to wait for `_hasHydrated` before auth check, call `checkStoredAuth()` on mount, show `SessionError` on API failure, and redirect to /login only when no credentials exist in `app/player/page.tsx`
- [x] T013 [US1] Add 5-second timeout to `/api/xtream/health` route handler in `app/api/xtream/health/route.ts`

**Checkpoint**: Page refresh preserves session, API verification works with timeout, error/retry UI displays on failure

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple aspects of the fix

- [x] T014 [P] Verify all user-facing messages in `SessionError` component are in Spanish per constitution Principle VI in `app/components/auth/SessionError.tsx`
- [x] T015 [P] Add JSDoc comments to `_hasHydrated` field and `onRehydrateStorage` callback explaining their purpose in `app/hooks/useXtreamAuth.ts`
- [x] T016 Run full test suite and verify all tests pass
- [x] T017 Run `npm run lint` and fix any warnings
- [x] T018 Run `npm run typecheck` and fix any type errors
- [x] T019 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Not required — project exists
- **Foundational (Phase 2)**: No dependencies — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **Polish (Phase 4)**: Depends on User Story 1 completion

### Within User Story 1

- Tests MUST be written and FAIL before implementation
- Store changes (T009, T010) before component changes (T011, T012)
- API timeout (T013) can run in parallel with store changes

### Parallel Opportunities

- T001–T003 (Foundational) must run sequentially (same file)
- T004–T007 (US1 tests) can run in parallel (same file, different test cases)
- T009–T010 (US1 store changes) can run in parallel with T011 (US1 component creation)
- T013 (API timeout) can run in parallel with T009–T012
- T014–T015 (Polish) can run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Test _hasHydrated initial/final state..." (T004)
Task: "Test checkStoredAuth success path..." (T005)
Task: "Test checkStoredAuth timeout behavior..." (T006)
Task: "Test checkStoredAuth invalid credentials..." (T007)

# Launch store changes and component creation together:
Task: "Add AbortController timeout to checkStoredAuth..." (T009)
Task: "Create SessionError component..." (T011)
Task: "Add timeout to health route handler..." (T013)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (hydration tracking)
2. Complete Phase 3: User Story 1 (wait for hydration, verify credentials, handle errors)
3. **STOP and VALIDATE**: Refresh /player — verify user stays on page with valid credentials
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Hydration tracking ready
2. Add API timeout to `checkStoredAuth` → Verification won't hang indefinitely
3. Add `SessionError` component → Error UI ready
4. Wire player page to wait for hydration → No more premature redirects
5. Polish → Spanish messages, JSDoc, full test pass

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The existing `checkStoredAuth` function already performs API verification — we only need to add timeout and modify error handling
- `_hasHydrated` is an internal flag — NOT persisted to localStorage (excluded from `partialize`)
