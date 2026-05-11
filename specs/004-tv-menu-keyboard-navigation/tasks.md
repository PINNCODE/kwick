# Tasks: TV Menu Keyboard Navigation

**Input**: Design documents from `/specs/004-tv-menu-keyboard-navigation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Included per constitution Principle III (Test-First Development).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Not Required)

Project already exists. No setup tasks needed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add focus state management to `useCascadingMenu` hook. This is the core state layer that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Add `focusedCategoryIndex` and `focusedChannelIndex` state to `useCascadingMenu` in `app/hooks/useCascadingMenu.ts`
- [x] T002 Implement `moveNextItem` callback (increments focused index for current panel, stops at edge) in `app/hooks/useCascadingMenu.ts`
- [x] T003 Implement `movePreviousItem` callback (decrements focused index for current panel, stops at edge) in `app/hooks/useCascadingMenu.ts`
- [x] T004 Update `selectCategory` to reset `focusedChannelIndex` to 0 when channels load in `app/hooks/useCascadingMenu.ts`
- [x] T005 Update `openMenu` and `closeMenu` to reset both focused indices to 0 in `app/hooks/useCascadingMenu.ts`
- [x] T006 Export new callbacks (`moveNextItem`, `movePreviousItem`, `focusedCategoryIndex`, `focusedChannelIndex`) from `useCascadingMenu` return object in `app/hooks/useCascadingMenu.ts`

**Checkpoint**: Focus state layer ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Navigate TV Menu with Keyboard (Priority: P1) 🎯 MVP

**Goal**: ArrowUp/ArrowDown keys move focus between items within the categories and channels panels, with visible focus indicators. Right arrow opens the focused category.

**Independent Test**: Open the menu, press ArrowDown/ArrowUp and verify focus moves between items with a visible ring indicator. Focus stops at first/last item (no wrap). Press Right arrow on a category — channels panel appears.

### Tests for User Story 1 ⚠️

- [ ] T007 [P] [US1] Test `moveNextItem` increments focusedCategoryIndex and stops at last item in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [ ] T008 [P] [US1] Test `movePreviousItem` decrements focusedCategoryIndex and stops at first item in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [ ] T009 [P] [US1] Test `moveNextItem`/`movePreviousItem` for channels panel with same edge-stopping behavior in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [ ] T010 [US1] Test `focusedChannelIndex` resets to 0 when `selectCategory` is called in `app/hooks/__tests__/useCascadingMenu.test.ts`

### Implementation for User Story 1

- [x] T011 [US1] Update `CategoriesPanel` to accept `focusedIndex` prop and render `ring-2 ring-blue-400` on the focused item in `app/components/menu/CategoriesPanel.tsx`
- [x] T012 [US1] Update `ChannelsPanel` to accept `focusedIndex` prop and render `ring-2 ring-blue-400` on the focused item in `app/components/menu/ChannelsPanel.tsx`
- [x] T013 [US1] Wire `onMoveNext` to `menu.moveNextItem` and `onMovePrevious` to `menu.movePreviousItem` in `app/player/page.tsx`
- [x] T014 [US1] Pass `focusedCategoryIndex` to `CategoriesPanel` and `focusedChannelIndex` to `ChannelsPanel` in `app/player/page.tsx`
- [x] T015 [US1] Update `moveNextPanel` to call `selectCategory(categories[focusedCategoryIndex].category_id)` when `viewMode === 'categories'` so Right arrow opens the focused category in `app/hooks/useCascadingMenu.ts`

**Checkpoint**: Arrow navigation with focus indicators and Right-to-open is fully functional

---

## Phase 4: User Story 2 — Select Menu Items with Enter (Priority: P1)

**Goal**: Pressing Enter on a focused category opens it (shows channels). Pressing Enter on a focused channel selects it and closes the menu.

**Independent Test**: Navigate to a category with arrow keys, press Enter — channels panel appears. Navigate to a channel, press Enter — menu closes and channel plays.

### Tests for User Story 2 ⚠️

- [ ] T016 [P] [US2] Test Enter on focused category calls `selectCategory` with correct category ID in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [ ] T017 [P] [US2] Test Enter on focused channel calls `selectChannel` with correct channel and closes menu in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [ ] T018 [US2] Test Enter when channels list is empty does nothing in `app/hooks/__tests__/useCascadingMenu.test.ts`

### Implementation for User Story 2

- [x] T019 [US2] Implement `selectFocusedItem` callback in `useCascadingMenu` that calls `selectCategory` or `selectChannel` based on current `viewMode` and focused index, then closes menu on channel selection in `app/hooks/useCascadingMenu.ts`
- [x] T020 [US2] Wire `onSelect` to `menu.selectFocusedItem` in `app/player/page.tsx`

**Checkpoint**: Enter key selection works for both categories and channels

---

## Phase 5: User Story 3 — Close Menu with Left Arrow in Categories Panel (Priority: P2)

**Goal**: Left arrow in categories panel closes the menu. Left arrow in channels panel returns to categories (already wired via `movePreviousPanel`).

**Independent Test**: Open menu in categories view, press Left arrow — menu closes. Open menu, navigate to channels, press Left arrow — returns to categories view.

**Note**: Panel-level Left/Right arrow navigation is already implemented in `useCascadingMenu` (`movePreviousPanel` closes menu at panel 0, returns to panel 0 at panel 1). This phase verifies it works correctly with the new focus state.

### Tests for User Story 3 ⚠️

- [ ] T021 [P] [US3] Test `movePreviousPanel` closes menu when `activePanel === 0` in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [ ] T022 [P] [US3] Test `movePreviousPanel` returns to categories view when `activePanel === 1` in `app/hooks/__tests__/useCascadingMenu.test.ts`

**Checkpoint**: Left arrow correctly closes menu from categories and returns from channels

---

## Phase 6: User Story 4 — Navigate Back to Categories from Channels with Focus Restoration (Priority: P2)

**Goal**: When returning from channels panel to categories panel via Left arrow, focus should be on the previously selected category.

**Independent Test**: Open a category, navigate to channels, press Left arrow — focus returns to the category that was opened (not reset to index 0).

### Tests for User Story 4 ⚠️

- [ ] T023 [P] [US4] Test `showCategoriesView` restores `focusedCategoryIndex` to the index of `selectedCategory` in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [ ] T024 [P] [US4] Test re-opening same category after returning to categories works correctly in `app/hooks/__tests__/useCascadingMenu.test.ts`

### Implementation for User Story 4

- [x] T025 [US4] Update `showCategoriesView` to calculate and set `focusedCategoryIndex` to the index of `selectedCategory` in the categories list in `app/hooks/useCascadingMenu.ts`
- [x] T026 [US4] Wire `movePreviousPanel` to call `showCategoriesView` (not just decrement panel) when `activePanel === 1` so focus is restored in `app/hooks/useCascadingMenu.ts`

**Checkpoint**: Focus is correctly restored when navigating back from channels to categories

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T027 [P] Add keyboard navigation hint text to `MenuOverlay` footer in Spanish in `app/components/menu/MenuOverlay.tsx`
- [x] T028 [P] Verify `useKeyboardNavigation` hook `preventDefault()` behavior does not conflict with existing browser shortcuts in `app/hooks/useKeyboardNavigation.ts`
- [ ] T029 [P] Add test verifying rapid key presses (key repeat) do not skip items or cause erratic focus jumps in `app/hooks/__tests__/useCascadingMenu.test.ts`
- [x] T030 [P] Verify focus indicator renders synchronously (no async state updates delay visual feedback) by confirming `ring-2 ring-blue-400` is applied via direct className, not conditional async logic in `app/components/menu/CategoriesPanel.tsx` and `app/components/menu/ChannelsPanel.tsx`
- [x] T031 Run full test suite and verify all tests pass
- [x] T032 Run `npm run lint` and fix any warnings
- [x] T033 Run `npm run typecheck` and fix any type errors
- [x] T034 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Not required — project exists
- **Foundational (Phase 2)**: No dependencies — BLOCKS all user stories
- **User Stories (Phase 3–6)**: All depend on Foundational phase completion
  - US1 (P1): Can start after Foundational — no dependencies on other stories
  - US2 (P1): Can start after Foundational — depends on US1 focus state being wired
  - US3 (P2): Can start after Foundational — mostly verification of existing behavior
  - US4 (P2): Can start after Foundational — depends on focus state from US1
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — core navigation
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — selection builds on focus state
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — verification of existing panel navigation
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) — focus restoration builds on focus state

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- State changes before component updates
- Component updates before page wiring
- Core implementation before integration

### Parallel Opportunities

- T001–T006 (Foundational) must run sequentially (same file)
- T007–T010 (US1 tests) can run in parallel (same file, different test cases)
- T011–T012 (US1 components) can run in parallel (different files)
- T016–T018 (US2 tests) can run in parallel
- T021–T022 (US3 tests) can run in parallel
- T023–T024 (US4 tests) can run in parallel
- T027–T030 (Polish) can run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Test moveNextItem increments focusedCategoryIndex..." (T007)
Task: "Test movePreviousItem decrements focusedCategoryIndex..." (T008)
Task: "Test moveNextItem/movePreviousItem for channels..." (T009)

# Launch both component updates together:
Task: "Update CategoriesPanel to accept focusedIndex..." (T011)
Task: "Update ChannelsPanel to accept focusedIndex..." (T012)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (focus state layer)
2. Complete Phase 3: User Story 1 (arrow navigation + focus indicators + Right-to-open)
3. **STOP and VALIDATE**: Open menu, press ArrowUp/Down — focus moves with visible indicator
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Focus state ready
2. Add User Story 1 → Arrow navigation works → Test independently → Demo
3. Add User Story 2 → Enter selection works → Test independently → Demo
4. Add User Story 3 → Left arrow behavior verified → Test independently → Demo
5. Add User Story 4 → Focus restoration works → Test independently → Demo
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The `useKeyboardNavigation` hook requires NO changes — it already handles all key events correctly
- `menu.ts` types require NO changes — no new types needed
