# Data Model: Keyboard Navigation Tests and Polish

**Date**: 2026-05-10
**Feature**: specs/008-keyboard-nav-tests

## Entities

This feature does not introduce new data entities. It tests and validates existing state management in the `useCascadingMenu` hook. The following existing entities are relevant:

### activePanel

- **Type**: `number` (0 or 1)
- **Purpose**: Tracks which panel is currently active in the cascading menu
- **Values**: `0` = categories panel, `1` = channels panel
- **State transitions**:
  - `openMenu()` → sets to 0
  - `closeMenu()` → sets to 0
  - `showChannelsView()` → sets to 1
  - `showCategoriesView()` → sets to 0
  - `moveNextPanel()` → 0 → 1 (via `selectCategory`)
  - `movePreviousPanel()` → 1 → 0 (via `showCategoriesView`), 0 → close menu

### focusedCategoryIndex

- **Type**: `number` (0-based index)
- **Purpose**: Tracks which category currently has keyboard focus
- **Validation**: Must be >= 0 and < categories.length (when categories exist)
- **State transitions**:
  - `openMenu()` → resets to 0
  - `closeMenu()` → resets to 0
  - `moveNextItem()` (in categories view) → increments by 1, capped at categories.length - 1
  - `movePreviousItem()` (in categories view) → decrements by 1, minimum 0
  - `showCategoriesView()` → restores to index of `selectedCategory`
  - `selectCategory()` → no change (category focus preserved)

### focusedChannelIndex

- **Type**: `number` (0-based index)
- **Purpose**: Tracks which channel currently has keyboard focus
- **Validation**: Must be >= 0 and < channels.length (when channels exist)
- **State transitions**:
  - `openMenu()` → resets to 0
  - `closeMenu()` → resets to 0
  - `selectCategory()` → resets to 0
  - `moveNextItem()` (in channels view) → increments by 1, capped at channels.length - 1
  - `movePreviousItem()` (in channels view) → decrements by 1, minimum 0

### selectedCategory

- **Type**: `string | null` (category ID)
- **Purpose**: Tracks which category is currently selected (for focus restoration)
- **Relationships**: Used by `showCategoriesView()` to restore `focusedCategoryIndex`

### viewMode

- **Type**: `'categories' | 'channels'`
- **Purpose**: Determines which view is currently displayed
- **State transitions**:
  - `openMenu()` → 'categories'
  - `closeMenu()` → 'categories'
  - `showChannelsView()` → 'channels'
  - `showCategoriesView()` → 'categories'
  - `selectCategory()` → 'channels' (after loading)

## Validation Rules

1. **Index bounds**: `focusedCategoryIndex` and `focusedChannelIndex` must never exceed their respective array bounds
2. **Empty list handling**: Navigation callbacks are no-ops when the relevant list is empty
3. **Loading state**: `selectFocusedItem` is a no-op when `isLoadingChannels` is true
4. **Focus restoration**: `showCategoriesView` defaults to index 0 if `selectedCategory` is null or not found

## State Machine

```
[CLOSED]
  │
  ├─ openMenu() → [CATEGORIES, panel=0, focus=0]
  │                    │
  │                    ├─ moveNextItem() → [CATEGORIES, focus+1]
  │                    ├─ movePreviousItem() → [CATEGORIES, focus-1]
  │                    ├─ selectCategory() → [CHANNELS, panel=1, focus=0]
  │                    │                          │
  │                    │                          ├─ moveNextItem() → [CHANNELS, focus+1]
  │                    │                          ├─ movePreviousItem() → [CHANNELS, focus-1]
  │                    │                          └─ showCategoriesView() → [CATEGORIES, focus=selectedCategory.index]
  │                    │
  │                    └─ movePreviousPanel() → [CLOSED]
  │
  └─ closeMenu() → [CLOSED, focus=0]
```
