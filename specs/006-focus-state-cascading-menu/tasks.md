# Tasks: Focus State for Cascading Menu

**Input**: Design documents from `/specs/006-focus-state-cascading-menu/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED per constitution Principle III (Test-First Development).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `app/` at repository root

---

## Phase 1: Setup (No tasks needed)

Project structure and dependencies already exist. No setup work required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify existing focus state implementation and add comprehensive test coverage

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Verify `focusedCategoryIndex` and `focusedChannelIndex` state exist in `app/hooks/useCascadingMenu.ts`
- [x] T002 [P] Verify `moveNextItem` callback increments focused index with boundary clamping in `app/hooks/useCascadingMenu.ts`
- [x] T003 [P] Verify `movePreviousItem` callback decrements focused index with boundary clamping in `app/hooks/useCascadingMenu.ts`
- [x] T004 Verify `selectCategory` resets `focusedChannelIndex` to 0 in `app/hooks/useCascadingMenu.ts`
- [x] T005 Verify `openMenu` and `closeMenu` reset both focused indices to 0 in `app/hooks/useCascadingMenu.ts`
- [x] T006 Verify all new state variables and callbacks are exported from `useCascadingMenu` return object in `app/hooks/useCascadingMenu.ts`

**Checkpoint**: Foundation verified — all focus state and callbacks confirmed present and correct

---

## Phase 3: User Story 1 - Navigate categories with keyboard arrows (Priority: P1) 🎯 MVP

**Goal**: Enable keyboard navigation through the category list using Up/Down arrow keys with proper boundary handling

**Independent Test**: Open the menu and press Up/Down arrows; focus moves through categories, stops at edges without wrap-around

### Tests for User Story 1

- [x] T007 [US1] Add test: `moveNextItem` increments `focusedCategoryIndex` when `viewMode === 'categories'` in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T008 [US1] Add test: `movePreviousItem` decrements `focusedCategoryIndex` when `viewMode === 'categories'` in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T009 [US1] Add test: `moveNextItem` stops at last category (no wrap-around) in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T010 [US1] Add test: `movePreviousItem` stops at first category (index 0, no wrap-around) in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T011 [US1] Add test: `moveNextItem` and `movePreviousItem` do not affect `focusedChannelIndex` when in categories view in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T012 [US1] Add test: `moveNextItem` with empty categories list does not cause errors in `app/hooks/__tests__/useCascadingMenu.test.ts`

**Checkpoint**: User Story 1 should be fully testable — category navigation works with boundary protection

---

## Phase 4: User Story 2 - Navigate channels with keyboard arrows (Priority: P2)

**Goal**: Enable keyboard navigation through the channel list using Up/Down arrow keys with proper boundary handling

**Independent Test**: Select a category, then press Up/Down arrows; focus moves through channels, stops at edges without wrap-around

### Tests for User Story 2

- [x] T013 [P] [US2] Add test: `moveNextItem` increments `focusedChannelIndex` when `viewMode === 'channels'` in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T014 [P] [US2] Add test: `movePreviousItem` decrements `focusedChannelIndex` when `viewMode === 'channels'` in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T015 [US2] Add test: `moveNextItem` stops at last channel (no wrap-around) in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T016 [US2] Add test: `movePreviousItem` stops at first channel (index 0, no wrap-around) in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T017 [US2] Add test: `moveNextItem` and `movePreviousItem` do not affect `focusedCategoryIndex` when in channels view in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T018 [US2] Add test: `moveNextItem` with empty channels list does not cause errors in `app/hooks/__tests__/useCascadingMenu.test.ts`

**Checkpoint**: User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Focus resets appropriately (Priority: P3)

**Goal**: Ensure focus position resets to first item on menu open, menu close, and category change for predictable behavior

**Independent Test**: Open/close menu and switch categories; focus resets to index 0 each time

### Tests for User Story 3

- [x] T019 [P] [US3] Add test: `openMenu` resets `focusedCategoryIndex` and `focusedChannelIndex` to 0 in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T020 [P] [US3] Add test: `closeMenu` resets `focusedCategoryIndex` and `focusedChannelIndex` to 0 in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T021 [US3] Add test: `selectCategory` resets `focusedChannelIndex` to 0 in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T022 [US3] Add test: Focus indices remain at 0 when category list is empty in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T023 [US3] Add test: `focusedChannelIndex` remains at 0 when channel list is empty after selecting category in `app/hooks/__tests__/useCascadingMenu.test.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T024 Run full test suite and verify all new tests pass
- [x] T025 Run TypeScript compiler (`npx tsc --noEmit`) and verify no type errors
- [ ] T026 Run ESLint (`npm run lint`) and verify zero warnings
- [x] T027 Verify no `console.log` statements in production code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — skipped (project already exists)
- **Foundational (Phase 2)**: No dependencies — can start immediately. BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user story phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — No dependencies on US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — No dependencies on US1/US2

### Within Each User Story

- Tests MUST be written and FAIL before implementation verification
- All tasks within a story target the same files (hook + test file)

### Parallel Opportunities

- Foundational tasks T001, T002, T003 can run in parallel (all verification-only, no interdependencies)
- US2 tests T013, T014 can run in parallel (different test cases, same file)
- US3 tests T019, T020 can run in parallel (different test cases, same file)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)

---

## Parallel Example: User Story 1

```bash
# Launch all US1 tests together (different test cases):
Task: "Add test: moveNextItem increments focusedCategoryIndex" (T007)
Task: "Add test: movePreviousItem decrements focusedCategoryIndex" (T008)
Task: "Add test: moveNextItem stops at last category" (T009)
Task: "Add test: movePreviousItem stops at first category" (T010)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (verify existing code)
2. Complete Phase 3: User Story 1 (category navigation tests)
3. **STOP and VALIDATE**: Run tests, confirm category navigation works
4. Commit changes

### Incremental Delivery

1. Complete Foundational → Foundation verified
2. Add User Story 1 tests → Test independently → Commit
3. Add User Story 2 tests → Test independently → Commit
4. Add User Story 3 tests → Test independently → Commit
5. Each story adds test coverage without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational verification together
2. Once Foundational is done:
   - Developer A: User Story 1 tests
   - Developer B: User Story 2 tests
   - Developer C: User Story 3 tests
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- All changes are in two files: `app/hooks/useCascadingMenu.ts` and `app/hooks/__tests__/useCascadingMenu.test.ts`
- The hook implementation already exists — this feature is primarily verification + test coverage
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
