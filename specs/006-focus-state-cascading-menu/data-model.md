# Data Model: Focus State for Cascading Menu

**Date**: 2026-05-10
**Feature**: `specs/006-focus-state-cascading-menu/spec.md`

## State Entities

### focusedCategoryIndex

- **Type**: `number`
- **Default**: `0`
- **Valid Range**: `0` to `categories.length - 1` (clamped, never exceeds bounds)
- **Purpose**: Tracks which category in the categories panel currently has keyboard focus
- **Reset Triggers**: `openMenu()`, `closeMenu()`
- **Update Triggers**: `moveNextItem()` (when `viewMode === 'categories'`), `movePreviousItem()` (when `viewMode === 'categories'`)

### focusedChannelIndex

- **Type**: `number`
- **Default**: `0`
- **Valid Range**: `0` to `channels.length - 1` (clamped, never exceeds bounds)
- **Purpose**: Tracks which channel in the channels panel currently has keyboard focus
- **Reset Triggers**: `openMenu()`, `closeMenu()`, `selectCategory()`
- **Update Triggers**: `moveNextItem()` (when `viewMode === 'channels'`), `movePreviousItem()` (when `viewMode === 'channels'`)

## State Transitions

```
Menu Closed
  └─ openMenu() → focusedCategoryIndex = 0, focusedChannelIndex = 0
       └─ Categories View (viewMode = 'categories')
            ├─ moveNextItem() → focusedCategoryIndex = min(prev + 1, categories.length - 1)
            ├─ movePreviousItem() → focusedCategoryIndex = max(prev - 1, 0)
            └─ selectCategory() / moveNextPanel() → Channels View
                 └─ (focusedChannelIndex already reset to 0 by selectCategory)
       └─ Channels View (viewMode = 'channels')
            ├─ moveNextItem() → focusedChannelIndex = min(prev + 1, channels.length - 1)
            ├─ movePreviousItem() → focusedChannelIndex = max(prev - 1, 0)
            └─ movePreviousPanel() → Categories View
                 └─ (focus restored to previously selected category index)
  └─ closeMenu() → focusedCategoryIndex = 0, focusedChannelIndex = 0
```

## Validation Rules

- Both indices MUST be non-negative integers
- Indices MUST never exceed their respective array lengths
- Empty arrays: indices remain at 0 (no errors)
