# Feature Specification: Enter Key Tests for Cascading Menu

**Feature Branch**: `007-enter-key-tests`  
**Created**: 2026-05-10  
**Status**: Draft  
**Input**: User description: "T016: Test Enter en categoría, T017: Test Enter en canal, T018: Test Enter con lista vacía"

## Clarifications

### Session 2026-05-10

- Q: Where should the Enter key handler logic live? → A: Enter handler lives in the hook, exported as `handleEnter` callback (consistent with existing navigation callbacks)
- Q: Should Enter tests replace existing T016-T018 or use new task numbers? → A: Add as new tasks T028-T030 in existing spec 006 alongside completed tests
- Q: Should Enter presses be ignored while channels are loading? → A: Ignore all Enter presses while channels are loading (no visual feedback needed)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select category with Enter key (Priority: P1)

As a user navigating categories with keyboard arrows, I want to press Enter to select the focused category so I can view its channels without using a mouse.

**Why this priority**: This is the primary action for category selection in keyboard navigation mode. Without it, users cannot progress from browsing categories to viewing channels.

**Independent Test**: Can be fully tested by opening the menu, navigating to a category with arrows, pressing Enter, and verifying the channels view loads for that category.

**Acceptance Scenarios**:

1. **Given** the menu is open showing categories with a focused category, **When** the user presses Enter, **Then** the focused category is selected and channels view loads
2. **Given** the menu is open on the first category, **When** the user presses Enter, **Then** that category is selected and its channels are displayed
3. **Given** the menu is open on the last category, **When** the user presses Enter, **Then** that category is selected and its channels are displayed

---

### User Story 2 - Select channel with Enter key (Priority: P2)

As a user navigating channels with keyboard arrows, I want to press Enter to select the focused channel so I can start watching it without using a mouse.

**Why this priority**: Once categories work, channel selection via Enter is the next logical step to complete the keyboard navigation flow.

**Independent Test**: Can be fully tested by selecting a category, navigating to a channel with arrows, pressing Enter, and verifying the channel playback starts.

**Acceptance Scenarios**:

1. **Given** the menu is showing channels with a focused channel, **When** the user presses Enter, **Then** the focused channel is selected and playback begins
2. **Given** the menu is showing channels with the first channel focused, **When** the user presses Enter, **Then** that channel is selected and playback begins
3. **Given** the menu is showing channels with the last channel focused, **When** the user presses Enter, **Then** that channel is selected and playback begins

---

### User Story 3 - Enter key on empty list (Priority: P3)

As a user, I expect pressing Enter on an empty category or channel list to do nothing without causing errors, so the application remains stable even with missing data.

**Why this priority**: Defensive behavior for edge cases ensures robustness and prevents crashes.

**Independent Test**: Can be fully tested by opening the menu with empty categories or selecting a category with no channels, pressing Enter, and verifying no errors occur.

**Acceptance Scenarios**:

1. **Given** the menu is open with an empty category list, **When** the user presses Enter, **Then** no error occurs and the menu remains open
2. **Given** a category with no channels is selected, **When** the user presses Enter, **Then** no error occurs and no channel is selected
3. **Given** the menu is closed with empty lists, **When** the user presses Enter, **Then** no error occurs and the menu does not open

---

### Edge Cases

- What happens when Enter is pressed rapidly multiple times? The system should handle debouncing gracefully without duplicate selections.
- What happens when Enter is pressed while a category is loading channels? The system MUST ignore the Enter press silently until loading completes.
- How does the system handle Enter when the focused index is out of bounds (e.g., after a list shrinks)? The system should safely handle this without errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `useCascadingMenu` hook MUST provide a `handleEnter` callback that handles Enter key actions based on the current view mode
- **FR-002**: When Enter is pressed in categories view, the system MUST select the category at `focusedCategoryIndex` and load its channels
- **FR-003**: When Enter is pressed in channels view, the system MUST select the channel at `focusedChannelIndex` and trigger playback via `onChannelChange`
- **FR-004**: When Enter is pressed with an empty category list, the system MUST NOT throw errors or cause unexpected behavior
- **FR-005**: When Enter is pressed with an empty channel list, the system MUST NOT throw errors or cause unexpected behavior
- **FR-006**: When Enter is pressed with a `focusedCategoryIndex` or `focusedChannelIndex` that exceeds the list bounds, the system MUST NOT throw errors
- **FR-007**: The Enter key action MUST respect the current `viewMode` (categories vs channels) and act on the appropriate list
- **FR-008**: When Enter is pressed while channels are loading, the system MUST silently ignore the press without triggering duplicate API calls

### Key Entities

- **focusedCategoryIndex**: The 0-based index of the currently focused category, used to determine which category to select on Enter
- **focusedChannelIndex**: The 0-based index of the currently focused channel, used to determine which channel to select on Enter
- **viewMode**: The current view state ('categories' or 'channels') that determines which list Enter acts upon

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select any category using only arrow keys + Enter in 100% of cases with non-empty lists
- **SC-002**: Users can select any channel using only arrow keys + Enter in 100% of cases with non-empty lists
- **SC-003**: Pressing Enter on empty lists produces zero errors or crashes in all test scenarios
- **SC-004**: All three new Enter key tests (T028, T029, T030) pass consistently in the test suite

## Assumptions

- The `useCascadingMenu` hook already has `focusedCategoryIndex`, `focusedChannelIndex`, and `viewMode` state available
- The hook already has `selectCategory` and `selectChannel` methods that can be called programmatically
- The consuming component (`page.tsx`) will handle the keyboard event listener for Enter and call the hook's `handleEnter` callback
- Channel loading via `selectCategory` is asynchronous but the hook handles loading state internally
- Visual focus indicators are handled by UI components, not this hook
