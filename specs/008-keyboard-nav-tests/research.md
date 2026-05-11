# Research: Keyboard Navigation Tests and Polish

**Date**: 2026-05-10
**Feature**: specs/008-keyboard-nav-tests

## Technical Context Resolution

All unknowns from the implementation plan have been resolved through analysis of existing codebase patterns and specs 006/007.

### Decision: Test patterns for `movePreviousPanel` (T021-T022)

**Rationale**: The `movePreviousPanel` callback already exists in `useCascadingMenu.ts` (lines 180-190). It uses `setActivePanel` with a functional update that:
- Closes the menu when on panel 0 via `closeMenu()`
- Calls `showCategoriesView()` when on panel 1 to return to categories

Tests will follow the same pattern as T007-T020 in the existing test file: use `renderHook`, manipulate state via `act()`, and assert on returned values.

**Alternatives considered**: 
- Integration testing via component rendering — rejected because unit tests for the hook are sufficient and faster
- Mocking `setActivePanel` — rejected because we need to test actual state transitions

### Decision: Focus restoration tests (T023-T024)

**Rationale**: `showCategoriesView` (lines 61-71) already implements focus restoration by finding the index of `selectedCategory` in the categories list and setting `focusedCategoryIndex`. Tests will verify:
- Focus is restored to the correct index when returning from channels
- Focus defaults to 0 if `selectedCategory` is null or not found

**Alternatives considered**: None — the implementation is clear and testable.

### Decision: preventDefault testing (T028)

**Rationale**: Arrow key event handlers in the consuming component (`page.tsx`) should call `event.preventDefault()` to prevent browser scroll behavior. Testing approach:
- Create a mock keyboard event with `preventDefault` spy
- Simulate arrow key press on the menu container
- Verify `preventDefault` was called

This is an integration-level test that may require rendering the component rather than just the hook.

**Alternatives considered**:
- Unit test the event handler function directly — rejected because the handler lives in the page component, not the hook
- Use `@testing-library/user-event` — preferred over manual event dispatch for realism

### Decision: Rapid key press testing (T029)

**Rationale**: React's state batching and the synchronous nature of `moveNextItem`/`movePreviousItem` should handle rapid key presses correctly. Test approach:
- Fire multiple `moveNextItem` calls in rapid succession within a single `act()` block
- Verify the final index is correct (no skipped items)
- Fire calls across `act()` boundaries to simulate real event timing

**Alternatives considered**:
- Using `setTimeout` to simulate real timing — rejected because React state updates are synchronous in tests
- Testing at the DOM event level — rejected because the hook callbacks are the unit under test

### Decision: Focus indicator sync (T030)

**Rationale**: Visual focus indicators are handled by UI components, not the hook. The hook provides `focusedCategoryIndex` and `focusedChannelIndex` as return values. Testing approach:
- Verify that after each state change (`moveNextItem`, `movePreviousItem`, `selectCategory`), the returned index values are correct
- The UI component's responsibility to sync visual indicators with these values is validated through component tests (out of scope for this spec)

**Alternatives considered**:
- Full component rendering with visual assertion — rejected because this is a hook-level spec
- Snapshot testing — rejected because focus state is dynamic, not static

### Decision: Keyboard hint text (T027)

**Rationale**: Hint text should be visible in the UI when the menu is open. This is a UI component concern, not a hook concern. The test will:
- Render the menu component
- Verify hint text is present when `isOpen` is true
- Verify hint text is absent when `isOpen` is false

This may require component-level testing rather than hook testing.

**Alternatives considered**:
- Test hint text content in Spanish — aligned with Constitution Principle VI (Spanish-First)

### Decision: Quickstart validation (T034)

**Rationale**: Quickstart validation ensures all keyboard navigation features work on first application load. This is an end-to-end or integration-level test. For this spec, we'll validate that:
- The hook initializes with correct default state
- All callbacks are available and functional immediately after render
- No setup or initialization steps are required before keyboard navigation works

**Alternatives considered**:
- Full E2E test with Playwright/Cypress — rejected as out of scope for this spec
- Manual testing checklist — rejected because automated validation is preferred

## Best Practices Identified

1. **Test isolation**: Each test should render a fresh hook instance to avoid state leakage
2. **Mock API calls**: Use `jest.fn()` for `xtreamApi.getStreams` and `xtreamApi.getEPG` to control async behavior
3. **Act wrapping**: All state mutations must be wrapped in `act()` for React 19 compatibility
4. **Async handling**: Use `await act(async () => ...)` for operations that trigger async side effects
5. **Spanish content**: Any hint text assertions should verify Spanish text per Constitution Principle VI

## Integration Patterns

1. **Hook testing pattern**: Follow the established pattern from specs 006/007 — `renderHook` + `act()` + assertions on `result.current`
2. **Component verification**: For T027-T030, verify the consuming component exists and uses the hook correctly (no code changes expected)
3. **Event handling**: Arrow key events should be handled at the component level, calling hook callbacks
