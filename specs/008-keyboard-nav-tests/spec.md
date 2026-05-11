# Feature Specification: Keyboard Navigation Tests and Polish

**Feature Branch**: `008-keyboard-nav-tests`  
**Created**: 2026-05-10  
**Status**: Draft  
**Input**: User description: "Add missing tests for left arrow navigation in categories (T021-T022), focus restoration when returning (T023-T024), and polish/validation items: hint text in UI (T027), preventDefault (T028), rapid key press (T029), focus indicator sync (T030), quickstart validation (T034)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate back with Left Arrow key (Priority: P1)

As a user browsing the cascading menu with keyboard navigation, I want to press Left Arrow to go back to categories or close the menu so I can navigate the menu hierarchy intuitively without using a mouse.

**Why this priority**: Left Arrow is the standard backward navigation key. Without proper tests, regressions in `movePreviousPanel` could break the core navigation flow.

**Independent Test**: Can be fully tested by opening the menu, navigating to channels, pressing Left Arrow, and verifying the view returns to categories with focus restored.

**Acceptance Scenarios**:

1. **Given** the menu is open showing channels (panel 1), **When** the user presses Left Arrow, **Then** the view returns to categories (panel 0) and focus is restored to the previously selected category
2. **Given** the menu is open showing categories (panel 0), **When** the user presses Left Arrow, **Then** the menu closes
3. **Given** the menu is closed, **When** the user presses Left Arrow, **Then** no action occurs and no errors are thrown

---

### User Story 2 - Focus restored when returning to categories (Priority: P2)

As a user who navigated from categories to channels, I expect my focus position to be restored when I return to categories so I can continue browsing from where I left off.

**Why this priority**: Focus restoration provides a seamless user experience. Without it, users lose their position when navigating back.

**Independent Test**: Can be fully tested by selecting a category, navigating to channels, pressing Left Arrow to return, and verifying the focused category index matches the previously selected category.

**Acceptance Scenarios**:

1. **Given** the user selected category at index 2 and is viewing channels, **When** the user presses Left Arrow to return to categories, **Then** `focusedCategoryIndex` is set to 2
2. **Given** the user selected the first category (index 0) and is viewing channels, **When** the user presses Left Arrow to return, **Then** `focusedCategoryIndex` is set to 0
3. **Given** `showCategoriesView` is called directly, **Then** focus is restored to the previously selected category

---

### User Story 3 - Keyboard navigation polish and edge cases (Priority: P3)

As a user, I expect keyboard navigation to feel responsive and polished, with proper event handling, visual feedback, and resilience to rapid inputs.

**Why this priority**: Polish items ensure the navigation feels professional and handles real-world usage patterns.

**Independent Test**: Each polish item can be tested independently (e.g., rapid key presses can be tested without testing preventDefault).

**Acceptance Scenarios**:

1. **Given** the user presses arrow keys rapidly, **When** multiple keydown events fire in quick succession, **Then** each keypress is handled correctly without skipping items or causing errors
2. **Given** an arrow key is pressed while the menu is open, **When** the keydown event fires, **Then** the default browser scroll behavior is prevented
3. **Given** the menu is open with a focused item, **When** focus state changes, **Then** the visual focus indicator syncs with the focused index state
4. **Given** the application starts, **When** the quickstart flow is executed, **Then** all keyboard navigation features work as documented

---

### Edge Cases

- What happens when Left Arrow is pressed while channels are loading? The system should handle the navigation gracefully without interrupting the loading process.
- What happens when the user presses multiple arrow keys simultaneously or in rapid succession? The system should process each event in order without race conditions.
- What happens when `showCategoriesView` is called but the previously selected category no longer exists in the list? The system should default to index 0 without errors.
- How does the system handle keyboard events when the menu is in a transitional state (e.g., between opening and fully rendered)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `movePreviousPanel` MUST close the menu when called on panel 0 (categories view)
- **FR-002**: `movePreviousPanel` MUST return to categories view (panel 0) when called on panel 1 (channels view)
- **FR-003**: `movePreviousPanel` MUST call `showCategoriesView` when returning from channels to categories, which restores focus to the previously selected category
- **FR-004**: `showCategoriesView` MUST set `focusedCategoryIndex` to the index of `selectedCategory` in the categories list
- **FR-005**: `showCategoriesView` MUST set `focusedCategoryIndex` to 0 if `selectedCategory` is null or not found in the categories list
- **FR-006**: Keyboard event handlers MUST call `preventDefault()` on arrow key events to prevent browser scroll behavior
- **FR-007**: The system MUST handle rapid successive key presses without skipping items or causing index out-of-bounds errors
- **FR-008**: The visual focus indicator MUST always reflect the current `focusedCategoryIndex` and `focusedChannelIndex` values
- **FR-009**: Keyboard navigation hint text MUST be visible in the UI when the menu is open to guide users
- **FR-010**: The quickstart flow MUST validate that all keyboard navigation features (arrow keys, Enter, Left Arrow) work correctly on first use

### Key Entities

- **activePanel**: Numeric state (0 or 1) representing the currently active panel — 0 for categories, 1 for channels
- **focusedCategoryIndex**: 0-based index of the currently focused category, restored when returning from channels view
- **selectedCategory**: The ID of the currently selected category, used to restore focus when navigating back
- **viewMode**: Current view state ('categories' or 'channels') that determines which panel is displayed

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All new tests for `movePreviousPanel` (T021, T022) pass consistently in the test suite
- **SC-002**: All new tests for focus restoration (T023, T024) pass consistently in the test suite
- **SC-003**: Rapid key press test (T029) verifies no items are skipped when 10+ keydown events fire within 100ms
- **SC-004**: preventDefault test (T028) confirms arrow key events do not trigger browser scroll behavior
- **SC-005**: Focus indicator sync test (T030) verifies visual indicator matches focused index in 100% of state transitions
- **SC-006**: Quickstart validation (T034) confirms all keyboard navigation features work on first application load

## Assumptions

- The `movePreviousPanel` and `showCategoriesView` implementations already exist in the `useCascadingMenu` hook and function correctly
- The consuming component (`page.tsx`) handles keyboard event listeners and maps Left Arrow to `movePreviousPanel`
- Visual focus indicators are rendered by UI components based on `focusedCategoryIndex` and `focusedChannelIndex` props
- The test patterns established in specs 006 and 007 will be followed (Jest + @testing-library/react)
- Keyboard hint text UI elements either exist or will be added as part of the polish work
- No changes to production hook logic are required — this spec focuses on test coverage and UI polish validation
