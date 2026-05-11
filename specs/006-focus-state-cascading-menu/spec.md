# Feature Specification: Focus State for Cascading Menu

**Feature Branch**: `006-focus-state-cascading-menu`  
**Created**: 2026-05-10  
**Status**: Draft  
**Input**: User description: "T001-T006: Agregar estado de foco a useCascadingMenu"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate categories with keyboard arrows (Priority: P1)

As a user browsing TV channels, I want to move through the category list using Up and Down arrow keys so I can select a category without using a mouse.

**Why this priority**: This is the foundational interaction that enables all keyboard navigation in the cascading menu. Without focus tracking, arrow key navigation is impossible.

**Independent Test**: Can be fully tested by opening the menu and pressing Up/Down arrows; the visual focus indicator should move through categories correspondingly.

**Acceptance Scenarios**:

1. **Given** the menu is open showing categories, **When** the user presses Down arrow, **Then** the focus moves to the next category in the list
2. **Given** the menu is open showing categories, **When** the user presses Up arrow, **Then** the focus moves to the previous category in the list
3. **Given** focus is on the first category, **When** the user presses Up arrow, **Then** focus remains on the first category (no wrap-around)
4. **Given** focus is on the last category, **When** the user presses Down arrow, **Then** focus remains on the last category (no wrap-around)

---

### User Story 2 - Navigate channels with keyboard arrows (Priority: P2)

As a user who has selected a category, I want to move through the channel list using Up and Down arrow keys so I can browse channels within that category.

**Why this priority**: Once categories work, channel navigation is the next logical step in the cascading menu flow.

**Independent Test**: Can be fully tested by selecting a category and pressing Up/Down arrows; the visual focus indicator should move through channels correspondingly.

**Acceptance Scenarios**:

1. **Given** the menu is showing channels for a selected category, **When** the user presses Down arrow, **Then** the focus moves to the next channel in the list
2. **Given** the menu is showing channels for a selected category, **When** the user presses Up arrow, **Then** the focus moves to the previous channel in the list
3. **Given** focus is on the first channel, **When** the user presses Up arrow, **Then** focus remains on the first channel
4. **Given** focus is on the last channel, **When** the user presses Down arrow, **Then** focus remains on the last channel

---

### User Story 3 - Focus resets appropriately (Priority: P3)

As a user, I expect the focus position to reset to the first item when opening the menu or changing categories, so I always start from a predictable position.

**Why this priority**: Ensures consistent and predictable behavior across menu interactions.

**Independent Test**: Can be fully tested by opening/closing the menu and switching categories; focus should reset to index 0 each time.

**Acceptance Scenarios**:

1. **Given** the menu is closed, **When** the user opens the menu, **Then** focus starts on the first category
2. **Given** a category is selected and channels are displayed, **When** the user selects a different category, **Then** focus resets to the first channel in the new list
3. **Given** the menu is open with focus on any item, **When** the user closes the menu, **Then** both category and channel focus indices reset to 0

---

### Edge Cases

- What happens when the category list is empty? Focus index should remain at 0 without errors.
- What happens when the channel list is empty after selecting a category? Focus index should remain at 0 without errors.
- How does the system handle rapid key presses? Focus should update correctly without skipping items or causing index out-of-bounds errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `useCascadingMenu` hook MUST maintain a `focusedCategoryIndex` state that tracks which category currently has keyboard focus
- **FR-002**: The `useCascadingMenu` hook MUST maintain a `focusedChannelIndex` state that tracks which channel currently has keyboard focus
- **FR-003**: The hook MUST provide a `moveNextItem` callback that increments the focused index by 1 for the current view (categories or channels), stopping at the last item
- **FR-004**: The hook MUST provide a `movePreviousItem` callback that decrements the focused index by 1 for the current view, stopping at the first item (index 0)
- **FR-005**: When a category is selected via `selectCategory`, the `focusedChannelIndex` MUST reset to 0
- **FR-006**: When the menu is opened via `openMenu`, both `focusedCategoryIndex` and `focusedChannelIndex` MUST reset to 0
- **FR-007**: When the menu is closed via `closeMenu`, both `focusedCategoryIndex` and `focusedChannelIndex` MUST reset to 0
- **FR-008**: All new state variables and callbacks MUST be exported from the hook's return object for use by consuming components

### Key Entities

- **focusedCategoryIndex**: A numeric state (0-based) representing the currently focused category in the categories panel
- **focusedChannelIndex**: A numeric state (0-based) representing the currently focused channel in the channels panel

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate through all categories using only Up/Down arrow keys without errors
- **SC-002**: Users can navigate through all channels in a selected category using only Up/Down arrow keys without errors
- **SC-003**: Focus index never exceeds array bounds (no index out-of-range errors during navigation)
- **SC-004**: Focus resets to 0 on menu open, menu close, and category change in 100% of cases

## Assumptions

- The consuming component (`page.tsx`) will handle keyboard event listeners and call the appropriate callbacks (`moveNextItem`, `movePreviousItem`)
- Visual focus indicators (CSS styling) are handled by the UI components, not this hook
- The existing `viewMode` state correctly distinguishes between categories and channels views
- Categories and channels arrays are already loaded and available when the menu is open
