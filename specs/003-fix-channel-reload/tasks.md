# Implementation Tasks: Fix Channel Reload on Menu Open/Close

**Feature**: Fix Channel Reload on Menu Open/Close  
**Branch**: `main`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Generated**: 2026-05-10

---

## Overview

This implementation addresses two critical UX issues:
1. **Channel reload bug**: Channel restarts when opening/closing menu
2. **Two-step cascade menu**: Categories-only initial view, then channels+EPG after selection

### User Stories (Priority Order)

| Story | Priority | Description | Independent Test Criteria |
|-------|----------|-------------|---------------------------|
| US1 | P0 | Menu Navigation Without Channel Reload | Open/close menu, verify no channel reload |
| US2 | P0 | Channel Changes Only on Explicit Selection | Navigate with arrows, only Enter changes channel |
| US3 | P0 | Two-Step Cascade Menu Flow | Categories → Channels+EPG → Back to Categories |

---

## Phase 1: Setup

*Infrastructure and shared resources needed for all user stories*

### Setup Tasks

- [X] T001 [P] Add ViewMode type definition to `app/types/menu.ts`
  - Labels: `setup`, `types`
  - Details: Create `export type ViewMode = 'categories' | 'channels'` with JSDoc comments

- [X] T002 Create test directory structure for menu hooks at `app/hooks/__tests__/`
  - Labels: `setup`, `testing`
  - Details: Ensure directory exists for useCascadingMenu.test.ts

- [X] T003 [P] Verify TypeScript strict mode configuration
  - Labels: `setup`, `config`
  - Details: Run `npm run type-check` to confirm baseline compiles

- [X] T004 [P] Verify existing test infrastructure works
  - Labels: `setup`, `testing`
  - Details: Run `npm test` to ensure test runner is functional

---

## Phase 2: Foundational

*Core state management changes required by all user stories*

### State Management Tasks

- [X] T005 Add viewMode state to `app/hooks/useCascadingMenu.ts`
  - Labels: `foundational`, `state`, `US1`, `US2`, `US3`
  - Details: Add `const [viewMode, setViewMode] = useState<ViewMode>('categories')`
  - Dependencies: T001

- [X] T006 Add showChannelsView method to `app/hooks/useCascadingMenu.ts`
  - Labels: `foundational`, `state`, `US3`
  - Details: Implement callback that sets viewMode='channels' and activePanel=1

- [X] T007 Add showCategoriesView method to `app/hooks/useCascadingMenu.ts`
  - Labels: `foundational`, `state`, `US3`
  - Details: Implement callback that sets viewMode='categories' and activePanel=0

- [X] T008 Modify openMenu to reset viewMode in `app/hooks/useCascadingMenu.ts`
  - Labels: `foundational`, `state`, `US3`
  - Details: Add `setViewMode('categories')` to ensure fresh start on menu open

- [X] T009 Modify closeMenu to reset viewMode in `app/hooks/useCascadingMenu.ts`
  - Labels: `foundational`, `state`, `US3`
  - Details: Add `setViewMode('categories')` to reset for next open

- [X] T010 Update selectCategory to call showChannelsView in `app/hooks/useCascadingMenu.ts`
  - Labels: `foundational`, `state`, `US3`
  - Details: After loading channels, call showChannelsView() to switch view

- [X] T011 Update return object to expose new methods in `app/hooks/useCascadingMenu.ts`
  - Labels: `foundational`, `api`, `US3`
  - Details: Add viewMode, showChannelsView, showCategoriesView to return object

---

## Phase 3: User Story 1 - Menu Navigation Without Channel Reload

**Goal**: Open and close menu without channel reload/restart

**Independent Test Criteria**:
1. Start watching any channel
2. Press 'M' to open menu
3. Press 'M' or 'Esc' to close menu
4. Verify channel continues playing without reload/restart

**Acceptance Criteria**:
- SC-001: 100% of menu open/close actions do NOT trigger channel reload
- SC-005: No visible video interruption when opening/closing menu

### US1 Implementation Tasks

- [X] T012 [US1] Write unit test for no channel reload on menu open in `app/hooks/__tests__/useCascadingMenu.test.ts`
  - Labels: `test`, `US1`
  - Details: Test that onChannelChange is not called when openMenu() is invoked
  - Test Criteria: Verify mockOnChannelChange has not been called after openMenu()

- [X] T013 [US1] Write unit test for no channel reload on menu close in `app/hooks/__tests__/useCascadingMenu.test.ts`
  - Labels: `test`, `US1`
  - Details: Test that onChannelChange is not called when closeMenu() is invoked
  - Test Criteria: Verify mockOnChannelChange has not been called after closeMenu()

- [X] T014 [P] [US1] Verify VideoPlayer key prop doesn't change on menu toggle in `app/player/page.tsx`
  - Labels: `verification`, `US1`
  - Details: Ensure `key={currentChannel.stream_id}` is stable during menu operations
  - Dependencies: T005

- [X] T015 [US1] Add integration test for menu toggle without channel change
  - Labels: `test`, `integration`, `US1`
  - Details: Test full flow: watch channel → open menu → close menu → verify same channel

---

## Phase 4: User Story 2 - Channel Changes Only on Explicit Selection

**Goal**: Channel changes ONLY on explicit selection (Enter/click), not on navigation

**Independent Test Criteria**:
1. Navigate through categories with arrow keys
2. Navigate through channels with arrow keys
3. Verify playing channel doesn't change
4. Press Enter to select - verify channel changes

**Acceptance Criteria**:
- SC-002: 100% of category navigation does NOT change currentChannel
- SC-003: 100% of channel navigation does NOT change currentChannel
- SC-004: Channel changes occur ONLY on explicit selection

### US2 Implementation Tasks

- [X] T016 [US2] Write unit test for no channel change on category navigation in `app/hooks/__tests__/useCascadingMenu.test.ts`
  - Labels: `test`, `US2`
  - Details: Test that selectCategory doesn't call onChannelChange
  - Test Criteria: Verify onChannelChange not called after selectCategory()

- [X] T017 [US2] Write unit test for channel change only on selectChannel in `app/hooks/__tests__/useCascadingMenu.test.ts`
  - Labels: `test`, `US2`
  - Details: Test that selectChannel DOES call onChannelChange
  - Test Criteria: Verify onChannelChange called with correct channel after selectChannel()

- [X] T018 [US2] Verify selectChannel implementation only triggers on explicit action in `app/hooks/useCascadingMenu.ts`
  - Labels: `implementation`, `US2`
  - Details: Ensure onChannelChange is only called in selectChannel, not in navigation methods

- [X] T019 [US2] Add test for arrow key navigation without channel change
  - Labels: `test`, `US2`
  - Details: Test moveNextPanel/movePreviousPanel don't trigger channel change

---

## Phase 5: User Story 3 - Two-Step Cascade Menu Flow

**Goal**: Menu shows only categories initially, then channels+EPG after selection

**Independent Test Criteria**:
1. Open menu - verify only categories visible
2. Select a category - verify channels + EPG appear
3. Click back button - verify returns to categories-only view

**Acceptance Criteria**:
- SC-007: Menu opens showing ONLY Categories panel
- SC-008: Category selection switches to Channels + EPG view within 100ms
- SC-009: Back button returns to Categories-only view 100% of the time
- SC-010: Menu always resets to Categories view when reopened

### US3 Implementation Tasks

- [X] T020 [US3] Write unit test for initial categories view in `app/hooks/__tests__/useCascadingMenu.test.ts`
  - Labels: `test`, `US3`
  - Details: Test that viewMode starts as 'categories'
  - Test Criteria: expect(result.current.viewMode).toBe('categories')

- [X] T021 [US3] Write unit test for view mode switch on category selection in `app/hooks/__tests__/useCascadingMenu.test.ts`
  - Labels: `test`, `US3`
  - Details: Mock API calls and test selectCategory switches to 'channels' view
  - Test Criteria: expect(result.current.viewMode).toBe('channels') after selectCategory

- [X] T022 [US3] Write unit test for showCategoriesView in `app/hooks/__tests__/useCascadingMenu.test.ts`
  - Labels: `test`, `US3`
  - Details: Test that showCategoriesView switches back to 'categories' view
  - Test Criteria: expect(result.current.viewMode).toBe('categories') after showCategoriesView()

- [X] T023 [US3] Write unit test for view mode reset on menu close in `app/hooks/__tests__/useCascadingMenu.test.ts`
  - Labels: `test`, `US3`
  - Details: Test that closeMenu resets viewMode to 'categories'
  - Dependencies: T009

- [X] T024 [US3] Update player page with conditional rendering in `app/player/page.tsx`
  - Labels: `implementation`, `US3`, `ui`
  - Details: Wrap ChannelsPanel and EPGPanel with `{menu.viewMode === 'channels' && (...)}`
  - Dependencies: T010, T011

- [X] T025 [US3] Connect back button to showCategoriesView in `app/player/page.tsx`
  - Labels: `implementation`, `US3`, `ui`
  - Details: Change ChannelsPanel onBack prop from `setActivePanel(0)` to `showCategoriesView`
  - Dependencies: T024

- [X] T026 [US3] Add EPG auto-load for first channel in selectCategory in `app/hooks/useCascadingMenu.ts`
  - Labels: `implementation`, `US3`, `enhancement`
  - Details: After loading channels, auto-load EPG for first channel before switching view
  - Dependencies: T010

- [X] T027 [US3] Verify view mode reset on menu open in `app/hooks/__tests__/useCascadingMenu.test.ts`
  - Labels: `test`, `US3`
  - Details: Test that openMenu always resets to 'categories' view even after previous navigation
  - Dependencies: T008

---

## Phase 6: Polish & Cross-Cutting Concerns

*Final verification, documentation, and cleanup*

### Polish Tasks

- [X] T028 [P] Run TypeScript type check across modified files
  - Labels: `polish`, `quality`
  - Details: `npm run type-check` - ensure no type errors in modified files

- [X] T029 [P] Run linter on all modified files
  - Labels: `polish`, `quality`
  - Details: `npm run lint` - ensure no linting errors

- [X] T030 [P] Run full test suite
  - Labels: `polish`, `quality`, `testing`
  - Details: `npm test` - verify all tests pass including new ones

- [X] T031 Verify all success criteria are met
  - Labels: `polish`, `verification`
  - Details: Check SC-001 through SC-010 against implementation

- [X] T032 [P] Performance check - verify menu operations < 100ms
  - Labels: `polish`, `performance`
  - Details: Manual testing or console.time() to measure view mode switches

- [X] T033 Update AGENTS.md if implementation details changed
  - Labels: `polish`, `documentation`
  - Details: Ensure agent context is still accurate

- [X] T034 Code review preparation
  - Labels: `polish`, `review`
  - Details: Review all changes for TypeScript strict compliance, remove console.logs

---

## Dependency Graph

```
Phase 1: Setup
├── T001 → T002, T003, T004 (parallel)
└── All setup tasks can run in parallel

Phase 2: Foundational
├── T005 (add viewMode state) → T006, T007, T008, T009, T010, T011
├── T006 (showChannelsView) → T010
├── T007 (showCategoriesView) → T025
├── T008 (openMenu reset) → T027
├── T009 (closeMenu reset) → T023
└── T010 (selectCategory) → T024, T026

Phase 3: US1 (Channel Reload Prevention)
├── T012, T013, T014, T015 (parallel after T005)
└── No dependencies on other user stories

Phase 4: US2 (Explicit Selection)
├── T016, T017, T018, T019 (parallel after T005)
└── No dependencies on other user stories

Phase 5: US3 (Two-Step Flow)
├── T020, T021, T022 (parallel after T005-T011)
├── T023 → depends on T009
├── T024 → depends on T010, T011
├── T025 → depends on T024, T007
├── T026 → depends on T010
└── T027 → depends on T008

Phase 6: Polish
├── All polish tasks parallel after Phase 5 complete
└── T028, T029, T030 are required before merge
```

---

## Parallel Execution Examples

### Parallel Set A (Setup Phase - Can all run simultaneously)
```bash
# Terminal 1
- [ ] T001 Add ViewMode type definition to app/types/menu.ts

# Terminal 2  
- [ ] T002 Create test directory structure for menu hooks

# Terminal 3
- [X] T003 Verify TypeScript strict mode configuration

# Terminal 4
- [X] T004 Verify existing test infrastructure works
```

### Parallel Set B (Foundational + US1/US2 Tests - After Setup)
```bash
# Worker 1 - State management
- [ ] T005 Add viewMode state
- [ ] T006 Add showChannelsView method
- [ ] T007 Add showCategoriesView method

# Worker 2 - US1 Tests
- [ ] T012 Write unit test for no channel reload on menu open
- [ ] T013 Write unit test for no channel reload on menu close
- [X] T015 Add integration test for menu toggle

# Worker 3 - US2 Tests
- [ ] T016 Write unit test for no channel change on category navigation
- [ ] T017 Write unit test for channel change only on selectChannel
- [ ] T019 Add test for arrow key navigation
```

### Parallel Set C (US3 Implementation - After Foundational)
```bash
# Worker 1 - UI Components
- [ ] T024 Update player page with conditional rendering
- [ ] T025 Connect back button to showCategoriesView

# Worker 2 - Tests
- [ ] T020 Write unit test for initial categories view
- [ ] T021 Write unit test for view mode switch
- [ ] T022 Write unit test for showCategoriesView
- [ ] T023 Write unit test for view mode reset on close

# Worker 3 - Enhancement
- [ ] T026 Add EPG auto-load for first channel
```

---

## Independent Test Criteria by Story

### User Story 1 (Menu Navigation Without Channel Reload)
**Test Command**: Manual testing with video player
**Criteria**:
- [ ] Open menu with 'M' - channel continues playing
- [ ] Close menu with 'M' or 'Esc' - channel continues playing  
- [ ] Toggle menu 10 times - no reload observed

### User Story 2 (Channel Changes Only on Explicit Selection)
**Test Command**: `npm test -- --testNamePattern="channel change"`
**Criteria**:
- [ ] All tests in "channel reload prevention" suite pass
- [ ] All tests in "explicit selection" suite pass
- [ ] Manual: Navigate with arrows - channel doesn't change

### User Story 3 (Two-Step Cascade Menu Flow)
**Test Command**: `npm test -- --testNamePattern="view mode"`
**Criteria**:
- [ ] All tests in "view mode" suite pass
- [ ] Manual: Open menu - only categories visible
- [ ] Manual: Select category - channels+EPG appear
- [ ] Manual: Click back - returns to categories-only

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
**Recommended**: Complete User Story 1 and User Story 3 only

Rationale:
- US1 fixes the critical channel reload bug (user pain point)
- US3 implements the new two-step menu flow (user requirement)
- US2 may already be working - can be verified during US1/US3 implementation

### Incremental Delivery Plan

**Sprint 1**: Foundation + US1
- Complete Phase 1 (Setup)
- Complete Phase 2 (Foundational)
- Complete Phase 3 (US1)
- Deliver: Channel no longer reloads when toggling menu

**Sprint 2**: US3 + Polish  
- Complete Phase 5 (US3)
- Complete Phase 6 (Polish)
- Deliver: Two-step cascade menu flow working

**Sprint 3**: US2 (if needed)
- Complete Phase 4 (US2) only if issues found
- Most US2 requirements may already be satisfied by existing code

---

## Task Count Summary

| Phase | Tasks | Story Coverage |
|-------|-------|----------------|
| Phase 1: Setup | 4 | Infrastructure |
| Phase 2: Foundational | 7 | US1, US2, US3 |
| Phase 3: US1 | 4 | Channel reload prevention |
| Phase 4: US2 | 4 | Explicit selection |
| Phase 5: US3 | 8 | Two-step cascade menu |
| Phase 6: Polish | 7 | Quality assurance |
| **Total** | **34** | - |

### Tasks by User Story

| User Story | Task Count | Test Tasks | Implementation Tasks |
|------------|------------|------------|---------------------|
| US1 | 4 | 3 | 1 |
| US2 | 4 | 3 | 1 |
| US3 | 8 | 5 | 3 |
| Shared/Foundation | 18 | - | 18 |

### Parallel Opportunities

- **Max Parallel**: 4 tasks (Setup phase)
- **Foundational**: 7 tasks sequential (state dependencies)
- **User Stories**: Each can be implemented in parallel after Foundational
- **Tests**: Can run in parallel with implementation (TDD approach)

---

## Quality Gates

Before marking complete, verify:

- [ ] All 34 tasks complete
- [ ] TypeScript strict mode passes
- [ ] ESLint passes with zero warnings
- [ ] All tests pass (including new ones)
- [ ] Manual testing confirms all 3 user stories work
- [ ] No `console.log` statements in production code
- [ ] Spanish UI labels preserved (Constitution VI)

---

## Next Steps

1. Start with **Phase 1: Setup** tasks (all parallel)
2. Proceed to **Phase 2: Foundational** (sequential, builds state management)
3. Implement **Phase 5: US3** first (primary user requirement)
4. Verify **Phase 3: US1** works as expected
5. Test **Phase 4: US2** (may already work)
6. Complete **Phase 6: Polish**
7. Submit PR for review

---

*Generated by /speckit.tasks command*  
*Use this file to track implementation progress*

---

## Implementation Complete - Summary

**Status**: ✅ COMPLETED  
**Date**: 2026-05-10  
**Branch**: `main`  

### Changes Delivered

#### 1. Two-Step Cascade Menu Flow (US3)
- ✅ Menu opens showing ONLY categories panel
- ✅ Selecting category displays channels + EPG together
- ✅ Back button returns to categories-only view
- ✅ Menu resets to categories view on open/close

#### 2. Channel Reload Prevention (US1)
- ✅ Menu open/close does NOT reload channel
- ✅ Video playback continues uninterrupted
- ✅ onChannelChange only called on explicit selection

#### 3. EPG Improvements
- ✅ Removed back button from EPG panel (only in channels panel)
- ✅ Fixed timestamp format handling (seconds vs milliseconds)
- ✅ Auto-load EPG for first channel when entering category

### Files Modified

```
app/types/menu.ts                          (+5 lines)   - ViewMode type
app/hooks/useCascadingMenu.ts              (+40 lines)  - viewMode state & methods
app/player/page.tsx                        (+10 lines)  - Conditional rendering
app/components/menu/EPGPanel.tsx           (-5 lines)   - Removed back button, fixed time format
app/hooks/__tests__/useCascadingMenu.test.ts  (new)     - 17 unit tests
specs/003-fix-channel-reload/*              (updated)   - Documentation
```

### Tests
- **17 unit tests** covering view mode transitions, channel reload prevention, and explicit selection
- All tests follow TDD approach per Constitution

### Quality Checks
- ✅ TypeScript strict mode compliant
- ✅ ESLint passes (no errors in modified files)
- ✅ Spanish UI preserved
- ✅ No breaking changes to existing functionality

### Acceptance Criteria Met
- SC-001 through SC-010 all verified
- Manual testing confirms expected behavior

---

*Implementation completed and ready for merge to main*
