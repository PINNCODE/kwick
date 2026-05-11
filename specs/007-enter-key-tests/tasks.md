# Tasks: Enter Key Tests for Cascading Menu

**Input**: Design documents from `/specs/007-enter-key-tests/`
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

**Purpose**: Verify `selectFocusedItem` callback exists and review its current behavior

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T028 [P] Verify `selectFocusedItem` callback exists in `app/hooks/useCascadingMenu.ts` and handles categories view
- [x] T029 [P] Verify `selectFocusedItem` callback handles channels view and calls `closeMenu()` after selection
- [x] T030 Verify `selectFocusedItem` includes `isLoadingChannels` guard to prevent duplicate API calls (add guard if missing per research.md finding)

**Checkpoint**: Foundation verified — `selectFocusedItem` behavior confirmed and loading guard in place

---

## Phase 3: User Story 1 - Select category with Enter key (Priority: P1) 🎯 MVP

**Goal**: Enable category selection via Enter key when navigating categories with arrow keys

**Independent Test**: Open the menu, navigate to a category with arrows, press Enter, and verify channels view loads for that category

### Tests for User Story 1

- [x] T031 [US1] Add test: `selectFocusedItem` selects category at `focusedCategoryIndex` when `viewMode === 'categories'` in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T032 [US1] Add test: `selectFocusedItem` calls `selectCategory` with correct category ID in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T033 [US1] Add test: `selectFocusedItem` on first category (index 0) selects it correctly in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T034 [US1] Add test: `selectFocusedItem` on last category selects it correctly in `app/hooks/__tests__/useCascadingMenu.test.ts`

**Checkpoint**: User Story 1 should be fully testable — Enter key selects categories with proper API calls

---

## Phase 4: User Story 2 - Select channel with Enter key (Priority: P2)

**Goal**: Enable channel selection via Enter key when navigating channels with arrow keys

**Independent Test**: Select a category, navigate to a channel with arrows, press Enter, and verify channel playback starts and menu closes

### Tests for User Story 2

- [x] T035 [US2] Add test: `selectFocusedItem` selects channel at `focusedChannelIndex` when `viewMode === 'channels'` in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T036 [US2] Add test: `selectFocusedItem` calls `onChannelChange` with selected channel in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T037 [US2] Add test: `selectFocusedItem` closes menu after channel selection in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T038 [US2] Add test: `selectFocusedItem` on first channel (index 0) selects it correctly in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T039 [US2] Add test: `selectFocusedItem` on last channel selects it correctly in `app/hooks/__tests__/useCascadingMenu.test.ts`

**Checkpoint**: User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Enter key on empty list (Priority: P3)

**Goal**: Ensure Enter key on empty category or channel lists does nothing without causing errors

**Independent Test**: Open menu with empty categories or select category with no channels, press Enter, and verify no errors occur

### Tests for User Story 3

- [x] T040 [P] [US3] Add test: `selectFocusedItem` with empty categories list does not throw in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T041 [P] [US3] Add test: `selectFocusedItem` with empty channels list does not throw in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T042 [US3] Add test: `selectFocusedItem` does not call `onChannelChange` when channels list is empty in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T043 [US3] Add test: `selectFocusedItem` is no-op when `isLoadingChannels === true` in `app/hooks/__tests__/useCascadingMenu.test.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T044 Run full test suite and verify all new tests pass
- [x] T045 Run TypeScript compiler (`npx tsc --noEmit`) and verify no type errors
- [x] T046 Run ESLint (`npm run lint`) and verify zero warnings
- [x] T047 Verify no `console.log` statements in production code or tests

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

- Foundational tasks T028, T029 can run in parallel (both verification-only)
- T030 depends on T028/T029 findings (may require code change)
- US3 tests T040, T041 can run in parallel (different test cases, same file)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)

---

## Parallel Example: User Story 1

```bash
# Launch all US1 tests together (different test cases):
Task: "selectFocusedItem selects category at focusedCategoryIndex" (T031)
Task: "selectFocusedItem calls selectCategory with correct ID" (T032)
Task: "selectFocusedItem on first category" (T033)
Task: "selectFocusedItem on last category" (T034)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (verify existing code, add loading guard)
2. Complete Phase 3: User Story 1 (category selection tests)
3. **STOP and VALIDATE**: Run tests, confirm Enter selects categories
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
- All changes are in two files: `app/hooks/useCascadingMenu.ts` (potential guard fix) and `app/hooks/__tests__/useCascadingMenu.test.ts` (new tests)
- Task numbering continues from spec 006 (T027 was last), starting at T028
- The hook implementation mostly exists — this feature is primarily verification + test coverage + one potential guard fix
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
