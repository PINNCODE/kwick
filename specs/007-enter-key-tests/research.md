# Research: Enter Key Tests for Cascading Menu

## Decision: Use existing `selectFocusedItem` callback for Enter key tests

**Rationale**: The `useCascadingMenu` hook already has a `selectFocusedItem` callback (line 151-164 in `useCascadingMenu.ts`) that handles Enter key selection behavior:
- In categories view: calls `selectCategory` with the focused category
- In channels view: calls `selectChannel` with the focused channel and closes the menu
- Both paths include null guards (`if (category)` / `if (channel)`) that handle empty lists and out-of-bounds indices gracefully

No new production code is needed — only test coverage for this existing callback.

**Alternatives considered**:
- Create a new `handleEnter` callback — rejected because `selectFocusedItem` already does this exact job
- Add Enter handling in the consuming component — rejected per clarification that logic should live in the hook

## Decision: Test loading state behavior via `isLoadingChannels` flag

**Rationale**: The spec clarifies that Enter presses during loading should be ignored. The `selectFocusedItem` callback calls `selectCategory` which sets `isLoadingChannels = true`. However, `selectFocusedItem` itself does NOT check `isLoadingChannels` before proceeding. This means rapid Enter presses could trigger duplicate `selectCategory` calls.

**Gap identified**: `selectFocusedItem` should guard against calling `selectCategory` while `isLoadingChannels` is true. This is a minor bug fix, not just a test addition.

**Resolution**: T028-T030 tests should also verify that `selectFocusedItem` is a no-op when `isLoadingChannels` is true. If the guard doesn't exist, it should be added as part of this feature.

## Decision: Test patterns follow existing US1-US3 test structure

**Rationale**: The existing test file uses `describe` blocks grouped by user story (US1, US2, US3). New Enter key tests should follow the same pattern with a `describe('focus state - Enter key selection (US4)')` block.

**Alternatives considered**:
- Separate test file for Enter key tests — rejected because it would split related hook tests
- Inline tests within existing describe blocks — rejected because Enter selection is a distinct user story
