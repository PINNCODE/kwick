# Hook Interface Contract: useCascadingMenu

**Date**: 2026-05-10
**Feature**: `specs/006-focus-state-cascading-menu/spec.md`

## Hook Signature

```typescript
interface UseCascadingMenuProps {
  categories: Category[];
  currentCategory: string;
  onChannelChange: (channel: LiveStream) => void;
}

interface UseCascadingMenuReturn {
  // Existing state
  isOpen: boolean;
  activePanel: number;
  selectedCategory: string | null;
  selectedChannel: string | null;
  channels: LiveStream[];
  epg: any[];
  isLoadingChannels: boolean;
  isLoadingEpg: boolean;
  viewMode: ViewMode;

  // NEW: Focus state
  focusedCategoryIndex: number;
  focusedChannelIndex: number;

  // Existing actions
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  selectCategory: (categoryId: string) => Promise<void>;
  selectChannel: (channel: LiveStream) => Promise<void>;
  setActivePanel: (panel: number) => void;
  showChannelsView: () => void;
  showCategoriesView: () => void;

  // NEW: Focus navigation actions
  moveNextItem: () => void;
  movePreviousItem: () => void;
  selectFocusedItem: () => void;
  moveNextPanel: () => void;
  movePreviousPanel: () => void;
}

function useCascadingMenu(props: UseCascadingMenuProps): UseCascadingMenuReturn;
```

## New Contract Additions

### Focus State Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `focusedCategoryIndex` | `number` | `0` | Index of currently focused category |
| `focusedChannelIndex` | `number` | `0` | Index of currently focused channel |

### Focus Navigation Actions

| Action | Signature | Description |
|--------|-----------|-------------|
| `moveNextItem` | `() => void` | Increments focused index for current view, clamped to array bounds |
| `movePreviousItem` | `() => void` | Decrements focused index for current view, clamped to minimum 0 |
| `selectFocusedItem` | `() => void` | Selects the item at the current focused index in the current view |

## Invariants

1. `focusedCategoryIndex` is always `>= 0` and `< categories.length` (when categories exist)
2. `focusedChannelIndex` is always `>= 0` and `< channels.length` (when channels exist)
3. When `viewMode === 'categories'`, `moveNextItem`/`movePreviousItem` only affect `focusedCategoryIndex`
4. When `viewMode === 'channels'`, `moveNextItem`/`movePreviousItem` only affect `focusedChannelIndex`
5. `selectCategory()` resets `focusedChannelIndex` to `0`
6. `openMenu()` and `closeMenu()` reset both indices to `0`
