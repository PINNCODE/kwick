# Research: TV Menu Keyboard Navigation

## Decision Record

### 1. Item Focus Tracking Approach

**Decision**: Add `focusedCategoryIndex` and `focusedChannelIndex` state to `useCascadingMenu` hook
**Rationale**: The existing hook already manages all menu state (isOpen, viewMode, activePanel, selectedId). Adding integer index tracking for focused items within each panel is the minimal change that integrates with existing patterns. Uses existing `useState` + `useCallback` pattern.
**Alternatives considered**: 
- Separate focus state in a new hook: Over-engineered for two integer values.
- DOM-based focus management (tabindex, refs): More complex, harder to test, mixes concerns.

### 2. Focus vs Selection Semantics

**Decision**: Maintain separate focus index and selection ID — focus is where the keyboard cursor is (blue highlight with border), selection is the actively playing channel or opened category (blue background fill)
**Rationale**: The user needs to preview items with arrow keys before committing with Enter. This matches standard TV menu behavior.
**Alternatives considered**: 
- Focus = selection: Loses the ability to preview without changing channel.
- Selection only: Already exists, but doesn't support keyboard navigation.

### 3. Visual Focus Indicator

**Decision**: Use a distinct visual style for keyboard focus (ring/border highlight) vs selected state (solid background)
**Rationale**: Users need to distinguish "where the cursor is" from "what's currently selected". This matches smart TV conventions.
**Alternatives considered**: 
- Same style as hover: Keyboard and mouse should look different.
- No focus indicator: Violates SC-004 (visible focus feedback within 100ms).

### 4. Edge Navigation Behavior

**Decision**: Focus stops at edges (no wrap-around), as clarified during spec review
**Rationale**: Explicit user decision. Match spec.
**Alternatives considered**: Wrap-around (rejected by user).

### 5. Panel Transition Rules

**Decision**: 
- Right arrow in categories: Opens category, moves to channels panel
- Left arrow in categories: Closes menu
- Left arrow in channels: Back to categories, focus returns to the previously selected category
- Right arrow in channels: No-op
- Enter on category: Opens it (same as Right arrow)
- Enter on channel: Selects it, closes menu

**Rationale**: All clarified in spec.

### 6. Throttle / Key Repeat

**Decision**: Keep existing 150ms throttle in `useKeyboardNavigation` hook
**Rationale**: Already implemented, works well. The spec requires handling rapid key presses without erratic behavior — the throttle handles this.
**Alternatives considered**: 
- requestAnimationFrame-based: Over-engineered for menu navigation.
- Key repeat detection via keydown count: More complex, same result.
