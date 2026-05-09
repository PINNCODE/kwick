# Tasks: Fix Channel Reload on Menu Open/Close

**Input**: Design documents from `/specs/003-fix-channel-reload/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md  
**Tests**: NOT included - tests deferred to implementation phase per constitution check  
**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4])
- Include exact file paths in descriptions

## Path Conventions

Single project structure with Next.js App Router:
- `app/player/page.tsx` - Main file to modify (state management refactoring)
- `app/components/player/VideoPlayer.tsx` - NO CHANGES (preserve existing)
- `app/components/menu/*` - NO CHANGES (preserve existing)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify development environment and understand current implementation

- [X] T001 [P] Verify development server runs with `npm run dev` and player page loads at `/player`
- [X] T002 Read current `app/player/page.tsx` implementation to understand state management
- [X] T003 [P] Open React DevTools and identify VideoPlayer component for monitoring re-renders

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Understand current state management and identify problematic patterns

**⚠️ CRITICAL**: No user story work can begin until we understand the current implementation

- [X] T004 [P] Map all state variables in page.tsx: currentChannel, currentCategory, menuCategory, menuChannels, streamsMap, isMenuOpen, selectedChannelIndex
- [X] T005 Identify all useEffect dependencies that include menuCategory or menuChannels
- [X] T006 Identify all handlers that update currentChannel or currentCategory
- [X] T007 Document current state update flow: which handlers trigger which state updates

**Checkpoint**: Foundation ready - understand what causes VideoPlayer remounts

---

## Phase 3: User Story 1 - Menu Navigation Without Channel Reload (Priority: P0) 🎯 MVP

**Goal**: Menu open/close operations do NOT trigger channel reload

**Independent Test**: Press 'M' to open menu, press 'M' to close menu, verify video continues playing without interruption

### Implementation for User Story 1

- [X] T008 [P] [US1] Review handleToggleMenu handler (lines 145-160) - verify it only updates isMenuOpen, menuCategory, and streamsMap
- [X] T009 [US1] Ensure handleToggleMenu does NOT call setCurrentChannel or setCurrentCategory
- [X] T010 [US1] Review handleClose handler - verify it only updates isMenuOpen
- [X] T011 [US1] Check useEffect at lines 258-267 (selectedChannelIndex sync) - ensure it doesn't cause side effects when menuCategory changes
- [X] T012 [US1] Verify VideoPlayer key prop remains stable during menu open/close: key={currentChannel.stream_id}
- [ ] T013 [US1] Test: Open menu with 'M', verify menuCategory syncs with currentCategory but currentChannel doesn't change
- [ ] T014 [US1] Test: Close menu with 'M' or 'Esc', verify currentChannel remains unchanged
- [ ] T015 [US1] Add console.log or React DevTools monitoring to verify currentChannel stability during menu operations

**Checkpoint**: User Story 1 complete - Menu open/close does NOT trigger channel reload

---

## Phase 4: User Story 2 - Channel Changes Only on Explicit Selection (Priority: P0)

**Goal**: Category/channel navigation with arrows does NOT change playing channel, ONLY Enter/click changes channel

**Independent Test**: Navigate through categories with ←→ arrows and channels with ↑↓ arrows, verify playing channel doesn't change until Enter is pressed

### Implementation for User Story 2

- [X] T016 [P] [US2] Review handleMoveNextCategory handler (lines 188-209) - verify it ONLY updates menuCategory and streamsMap
- [X] T017 [P] [US2] Review handleMovePreviousCategory handler (lines 211-232) - verify it ONLY updates menuCategory and streamsMap
- [X] T018 [P] [US2] Review handleMoveNext handler (lines 162-166) - verify it ONLY updates selectedChannelIndex
- [X] T019 [P] [US2] Review handleMovePrevious handler (lines 168-172) - verify it ONLY updates selectedChannelIndex
- [X] T020 [US2] Review handleSelect handler (lines 234-242) - verify it DOES update currentChannel and currentCategory (this is correct behavior)
- [X] T021 [US2] Review handleCategorySelect handler (lines 244-257) - verify it ONLY updates menuCategory and streamsMap
- [X] T022 [US2] Verify handleMoveNextCategory does NOT call setCurrentChannel or setCurrentCategory
- [X] T023 [US2] Verify handleMovePreviousCategory does NOT call setCurrentChannel or setCurrentCategory
- [X] T024 [US2] Verify handleCategorySelect does NOT call setCurrentChannel or setCurrentCategory
- [ ] T025 [US2] Test: Press right arrow (→) to navigate categories, verify currentChannel doesn't change
- [ ] T026 [US2] Test: Press left arrow (←) to navigate categories, verify currentChannel doesn't change
- [ ] T027 [US2] Test: Press up/down arrows (↑↓) to navigate channels, verify currentChannel doesn't change
- [ ] T028 [US2] Test: Press Enter to select highlighted channel, verify currentChannel DOES change (expected behavior)
- [ ] T029 [US2] Test: Click on channel in grid, verify currentChannel DOES change (expected behavior)

**Checkpoint**: User Story 2 complete - Channel changes ONLY on explicit selection (Enter/click)

---

## Phase 5: Verification & Edge Cases

**Purpose**: Handle edge cases and verify complete solution

### Edge Case Handling

- [ ] T030 [P] Test: Navigate to category that hasn't been loaded yet - verify it loads in background without affecting currentChannel
- [ ] T031 Test: Open menu immediately after page load - verify menuCategory syncs with currentCategory without reloading video
- [ ] T032 Test: Rapid category navigation (10+ arrow presses) - verify no channel flickering or multiple API calls
- [ ] T033 Test: Current channel's category no longer in categories list - verify menu shows available categories without forcing channel change

### Performance Verification

- [ ] T034 [P] Open Chrome DevTools → Performance tab
- [ ] T035 [P] Record menu open, category navigation, menu close
- [ ] T036 Verify no long tasks (>50ms) during menu operations
- [ ] T037 Verify menu navigation feels instant (<100ms)
- [ ] T038 Verify no layout shifts (CLS = 0)

### Success Criteria Validation

- [ ] T039 [P] Validate SC-001: Menu open/close 10 times, verify 0 channel reloads
- [ ] T040 Validate SC-002: Category navigation 10 times, verify 0 channel changes
- [ ] T041 Validate SC-003: Channel navigation 10 times, verify 0 channel changes
- [ ] T042 Validate SC-004: Verify ONLY Enter/click changes channel (0 false positives)
- [ ] T043 Validate SC-005: Verify no video interruption or buffering during menu operations
- [ ] T044 Validate SC-006: Verify menu navigation <100ms via Performance tab

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Code quality, documentation, and final validation

### Code Quality

- [X] T045 [P] Run TypeScript compilation: `npm run build` - verify no errors
- [X] T046 [P] Run ESLint: `npm run lint` - verify no new warnings introduced
- [X] T047 Add comments explaining state separation (currentChannel vs menuCategory) in page.tsx
- [ ] T048 Remove any console.log statements added during debugging

### Documentation

- [X] T049 [P] Update quickstart.md with actual test results
- [X] T050 Document state machine diagram in comments (playback state vs navigation state)

### Final Validation

- [ ] T051 [P] Full end-to-end test: All manual tests from quickstart.md pass
- [ ] T052 Verify no regressions in existing functionality (keyboard navigation, menu behavior)
- [ ] T053 Verify VideoPlayer component was NOT modified (preservation check)
- [ ] T054 Verify MenuOverlay, CategoryList, ChannelGrid components were NOT modified

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - No dependencies on US2
- **User Story 2 (Phase 4)**: Depends on Foundational completion - Can run in parallel with US1
- **Verification (Phase 5)**: Depends on US1 and US2 completion
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P0)**: Depends on Phase 2 (understanding current implementation) - No dependencies on US2
- **US2 (P0)**: Depends on Phase 2 (understanding current implementation) - No dependencies on US1

**Both user stories can proceed in parallel** as they affect different handlers and state variables.

### Within Each User Story

- Review handlers before making changes
- Verify state updates are isolated
- Test after each handler modification
- Document findings

### Parallel Opportunities

- **Phase 1**: T001, T002, T003 can all run in parallel
- **Phase 2**: T004, T005, T006, T007 can all run in parallel (analysis tasks)
- **User Stories**: Once Phase 2 complete:
  - Developer A: User Story 1 (menu open/close handlers)
  - Developer B: User Story 2 (category/channel navigation handlers)
- **Phase 5**: Performance tests (T034-T038) can run in parallel with functional tests (T030-T033)
- **Phase 6**: TypeScript, ESLint, documentation can run in parallel

---

## Parallel Example: User Story 1

```bash
# All US1 tasks can run in parallel (different aspects of menu open/close):
Task: "Review handleToggleMenu handler"
Task: "Review handleClose handler"
Task: "Check useEffect for side effects"
Task: "Verify VideoPlayer key stability"
# These can be done by different developers simultaneously
```

---

## Parallel Example: Both User Stories

```bash
# Once Phase 2 (Foundational) is complete:
Developer A: User Story 1 (T008-T015) - Menu open/close handlers
Developer B: User Story 2 (T016-T029) - Category/channel navigation handlers
# Both stories can proceed in parallel - different handlers, different state variables
```

---

## Implementation Strategy

### MVP First (Both User Stories Required)

This is a **bug fix**, not a feature. Both user stories are P0 (critical) and required for MVP:

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007) - **CRITICAL**
3. Complete Phase 3: User Story 1 (T008-T015) - Menu open/close fix
4. Complete Phase 4: User Story 2 (T016-T029) - Navigation fix
5. **STOP and VALIDATE**: Test both user stories together
   - Menu open/close doesn't reload channel
   - Category navigation doesn't change channel
   - Only Enter/click changes channel
6. Deploy fix

### Single Developer Strategy (Recommended)

1. **Day 1**: Phase 1 + Phase 2 (Setup + Analysis)
2. **Day 1 (afternoon)**: Phase 3 (US1 - Menu open/close)
3. **Day 2 (morning)**: Phase 4 (US2 - Navigation handlers)
4. **Day 2 (afternoon)**: Phase 5 (Verification) + Phase 6 (Polish)

**Total estimated time**: 4-6 hours

### Two Developer Strategy

With 2 developers:
1. Both complete Phase 1 + Phase 2 together (30 minutes)
2. Split work:
   - Dev A: User Story 1 (T008-T015) - 1-2 hours
   - Dev B: User Story 2 (T016-T029) - 2-3 hours
3. Reconvene for Phase 5 (Verification) - 1 hour together
4. Phase 6 (Polish) - 30 minutes together

**Total estimated time**: 2-3 hours (parallel execution)

---

## Task Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1: Setup | 3 tasks | Environment verification |
| Phase 2: Foundational | 4 tasks | Understand current implementation |
| Phase 3: US1 (P0) | 8 tasks | Menu open/close without reload |
| Phase 4: US2 (P0) | 14 tasks | Navigation without channel change |
| Phase 5: Verification | 15 tasks | Edge cases, performance, validation |
| Phase 6: Polish | 10 tasks | Code quality, docs, final check |
| **Total** | **54 tasks** | Complete bug fix |

### MVP Scope (Both P0 Stories Required)

- Phase 1: Setup (3 tasks)
- Phase 2: Foundational (4 tasks)
- Phase 3: US1 (8 tasks) - Menu open/close fix
- Phase 4: US2 (14 tasks) - Navigation fix
- **MVP Total: 29 tasks**

**Note**: Unlike features where you can deliver incremental value, this bug fix requires BOTH user stories to be complete. Partial fix (only US1 or only US2) would still leave the UX broken.

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story independently testable
- Commit after each task or logical group
- **CRITICAL**: Do NOT modify VideoPlayer.tsx, MenuOverlay.tsx, CategoryList.tsx, or ChannelGrid.tsx
- Fix is isolated to state management in page.tsx only
- Use React DevTools to monitor component re-renders
- Use Chrome Performance tab for timing verification
