# Research: Focus State for Cascading Menu

**Date**: 2026-05-10
**Feature**: `specs/006-focus-state-cascading-menu/spec.md`

## Technical Context Review

All unknowns in the Technical Context section were resolved from existing codebase analysis. No external research was required.

## Decisions

### Decision 1: Focus State Representation

**Decision**: Use numeric index state (`focusedCategoryIndex: number`, `focusedChannelIndex: number`) initialized to 0.

**Rationale**: 
- Numeric indices are the simplest representation for ordered list navigation
- Already partially present in the existing `useCascadingMenu.ts` code
- Directly maps to array access patterns (`categories[focusedCategoryIndex]`)
- No additional data structures or objects needed

**Alternatives considered**:
- Track focused item by ID instead of index — rejected because categories/channels are already ordered arrays and index-based navigation is more natural for arrow keys
- Use a single focus state object — rejected because the two-panel model (categories vs channels) benefits from separate indices that can be managed independently

### Decision 2: Boundary Behavior

**Decision**: Focus stops at edges (no wrap-around). Up arrow at index 0 stays at 0. Down arrow at last index stays at last index.

**Rationale**:
- Matches standard desktop application behavior (file explorers, list boxes)
- Prevents user confusion from unexpected focus jumps
- Simpler implementation and testing

**Alternatives considered**:
- Wrap-around navigation — rejected because it can disorient users who expect linear navigation

### Decision 3: Focus Reset Strategy

**Decision**: Reset both indices to 0 on menu open, menu close, and category change.

**Rationale**:
- Provides predictable starting position for every interaction
- Matches the existing behavior in `openMenu()` and `closeMenu()` callbacks
- Category change resets channel index because the channel list is entirely new

### Decision 4: View Mode Awareness

**Decision**: `moveNextItem` and `movePreviousItem` check `viewMode` to determine which index to update.

**Rationale**:
- Already implemented in existing code
- Clean separation: categories view updates `focusedCategoryIndex`, channels view updates `focusedChannelIndex`
- No need for additional parameters or separate callback pairs
