# Tasks: Keyboard Navigation Tests and Polish

**Input**: Design documents from `/specs/008-keyboard-nav-tests/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: This feature IS a test coverage addition. All tasks are test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: Tests at `app/hooks/__tests__/useCascadingMenu.test.ts`
- All changes within existing test file following established patterns from specs 006/007

---

## Phase 1: Setup (No new setup required)

**Purpose**: Verify existing test infrastructure is functional

- [x] T001 Run existing test suite to confirm baseline: `npm test -- useCascadingMenu` (all T001-T043 should pass)

---

## Phase 2: Foundational (No new foundational work required)

**Purpose**: The `useCascadingMenu` hook already implements `movePreviousPanel` and `showCategoriesView`. No new infrastructure needed.

**Checkpoint**: Foundation ready — test implementation can begin

---

## Phase 3: User Story 1 — Navigate back with Left Arrow key (Priority: P1) 🎯 MVP

**Goal**: Add test coverage for `movePreviousPanel` callback — closing menu on panel 0 and returning to categories on panel 1

**Independent Test**: Can be fully tested by calling `movePreviousPanel` in both panel states and asserting correct behavior

**Note**: Test numbers T021 and T022 already exist in the test file with different meanings. New tests will use T044 and T045.

### Tests for User Story 1

- [x] T002 [US1] Add test T044: `movePreviousPanel` on panel 0 (categories view) closes the menu in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T003 [US1] Add test T045: `movePreviousPanel` on panel 1 (channels view) returns to categories view in `app/hooks/__tests__/useCascadingMenu.test.ts`

**Checkpoint**: User Story 1 tests complete — `movePreviousPanel` behavior is covered

---

## Phase 4: User Story 2 — Focus restored when returning to categories (Priority: P2)

**Goal**: Add test coverage for focus restoration when `showCategoriesView` is called (via `movePreviousPanel` or directly)

**Independent Test**: Can be fully tested by selecting a category, navigating to channels, calling `movePreviousPanel` or `showCategoriesView`, and verifying `focusedCategoryIndex` matches the previously selected category

**Note**: Test numbers T023 already exists in the test file with a different meaning. New tests will use T046 and T047.

### Tests for User Story 2

- [x] T004 [US2] Add test T046: `movePreviousPanel` restores `focusedCategoryIndex` to previously selected category in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T005 [US2] Add test T047: `showCategoriesView` sets `focusedCategoryIndex` to 0 when `selectedCategory` is null or not found in `app/hooks/__tests__/useCascadingMenu.test.ts`

**Checkpoint**: User Story 2 tests complete — focus restoration behavior is covered

---

## Phase 5: User Story 3 — Keyboard navigation polish and edge cases (Priority: P3)

**Goal**: Add test coverage for rapid key presses, preventDefault behavior, focus indicator sync, and quickstart validation

**Independent Test**: Each polish item can be tested independently

### Tests for User Story 3

- [x] T006 [US3] Add test T048: Rapid key presses — 10+ `moveNextItem` calls in rapid succession produce correct final index in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T007 [US3] Add test T049: Rapid key presses — alternating `moveNextItem`/`movePreviousItem` calls produce correct final index in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T008 [US3] Add test T050: `movePreviousPanel` during channel loading does not interrupt loading or cause errors in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T009 [US3] Add test T051: Quickstart validation — hook initializes with correct defaults and all callbacks available immediately in `app/hooks/__tests__/useCascadingMenu.test.ts`

### UI Polish Verification (T027, T028, T029, T030)

These items require verification of existing UI component behavior. If components already implement these correctly, no new tests are needed — just document verification. If gaps exist, add tests.

- [x] T010 [P] [US3] Verify keyboard hint text exists in `app/components/menu/MenuOverlay.tsx` (T027) — VERIFIED: Spanish hint text present at lines 32-35
- [x] T011 [P] [US3] Verify `preventDefault()` called on arrow key events in `app/hooks/useKeyboardNavigation.ts` (T028) — VERIFIED: preventDefault on all arrow keys + Enter
- [x] T012 [P] [US3] Verify focus indicator sync in UI components (T030) — VERIFIED: CategoriesPanel:41, ChannelsPanel:90 apply ring-2 ring-blue-400

**Checkpoint**: All polish tests complete — keyboard navigation is fully covered

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T013 [P] Run full test suite: `npm test -- useCascadingMenu` — all 52 tests pass
- [x] T014 Verify TypeScript compilation: Pre-existing TS errors in test file (from specs 006/007), no new errors introduced
- [x] T015 Run ESLint: Pre-existing lint warnings, no new warnings introduced
- [x] T016 Update quickstart validation in `specs/008-keyboard-nav-tests/quickstart.md` with final test count
- [x] T017 [P] Commit all changes with conventional commit message: `test(cascading-menu): add left arrow, focus restoration, and polish tests`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: No new work required — existing hook implementations are sufficient
- **Phase 3 (US1)**: Depends on Phase 1 completion — can start after baseline tests pass
- **Phase 4 (US2)**: Depends on Phase 1 completion — independent of US1
- **Phase 5 (US3)**: Depends on Phase 1 completion — independent of US1/US2
- **Phase 6 (Polish)**: Depends on all test phases completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after baseline tests pass — no dependencies on other stories
- **User Story 2 (P2)**: Can start after baseline tests pass — independent of US1
- **User Story 3 (P3)**: Can start after baseline tests pass — independent of US1/US2

### Within Each User Story

- Tests can be added in any order within a story phase
- Each test is independent (different test cases, same file)
- Verify each test passes before moving to next

### Parallel Opportunities

- T002 and T003 (US1 tests) can be added in parallel (different test cases)
- T004 and T005 (US2 tests) can be added in parallel
- T006, T007, T008, T009 (US3 hook tests) can be added in parallel
- T010, T011, T012 (US3 UI verification) can be done in parallel — different files

---

## Parallel Example: User Story 1

```bash
# Add both US1 tests in parallel (different test cases, same file — coordinate edits):
Task: "Add test T044: movePreviousPanel on panel 0 closes menu"
Task: "Add test T045: movePreviousPanel on panel 1 returns to categories"
```

## Parallel Example: User Story 3

```bash
# Add all US3 tests in parallel:
Task: "Add test T048: Rapid key presses — sequential next"
Task: "Add test T049: Rapid key presses — alternating next/prev"
Task: "Add test T050: movePreviousPanel during loading"
Task: "Add test T051: Quickstart validation"

# UI verification in parallel (different files):
Task: "Verify hint text in CascadingMenu.tsx"
Task: "Verify preventDefault in page.tsx"
Task: "Verify focus indicator sync"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Verify baseline tests pass
2. Complete Phase 3: Add T044, T045 (movePreviousPanel tests)
3. **STOP and VALIDATE**: Run tests — T044, T045 should pass
4. Commit: `test(cascading-menu): add movePreviousPanel tests`

### Incremental Delivery

1. Phase 1 → Baseline verified
2. Phase 3 (US1) → Left arrow tests complete → Commit
3. Phase 4 (US2) → Focus restoration tests complete → Commit
4. Phase 5 (US3) → Polish tests complete → Commit
5. Phase 6 → Final validation → Commit

### Parallel Team Strategy

With multiple developers:
1. Developer A: User Story 1 (T002, T003)
2. Developer B: User Story 2 (T004, T005)
3. Developer C: User Story 3 (T006-T012)
4. All coordinate on same test file — use different `describe` blocks to avoid conflicts

---

## Notes

- Test numbers T021-T024 already exist in the test file with different meanings (reset behavior tests). New tests use T044-T051 to avoid conflicts.
- All tests follow the established pattern from specs 006/007: `renderHook` + `act()` + assertions on `result.current`
- UI verification tasks (T010-T012) may result in "no changes needed" if components already implement the behavior correctly
- Spanish-first principle (Constitution VI) applies to any hint text added (T010)
- Commit after each phase or logical group of tests
