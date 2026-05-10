# Data Model: Cascade Menu View Mode

**Date**: 2026-05-10  
**Feature**: Fix Channel Reload on Menu Open/Close

---

## Overview

This document describes the state changes required to implement the two-step cascade menu flow where:
1. Menu initially shows only categories
2. Selecting a category shows channels + EPG panels
3. Back button returns to categories-only view

---

## Type Definitions

### ViewMode Type

```typescript
// app/types/menu.ts (addition)

/**
 * Represents the current view mode of the cascade menu
 * - 'categories': Only categories panel is visible
 * - 'channels': Channels and EPG panels are visible
 */
export type ViewMode = 'categories' | 'channels';
```

### Updated CascadingMenuState Interface

```typescript
// app/hooks/useCascadingMenu.ts return type

interface CascadingMenuState {
  // ============================================
  // Existing State (unchanged)
  // ============================================
  
  /** Whether the menu overlay is visible */
  isOpen: boolean;
  
  /** Currently focused panel (0=Categories, 1=Channels, 2=EPG) */
  activePanel: number;
  
  /** Category currently selected/highlighted in menu */
  selectedCategory: string | null;
  
  /** Channel currently selected/highlighted in menu */
  selectedChannel: string | null;
  
  /** List of channels in selected category */
  channels: LiveStream[];
  
  /** EPG data for selected channel */
  epg: any[];
  
  /** Loading state for channels API call */
  isLoadingChannels: boolean;
  
  /** Loading state for EPG API call */
  isLoadingEpg: boolean;
  
  // ============================================
  // NEW: View Mode State
  // ============================================
  
  /** Current view mode - determines which panels are visible */
  viewMode: ViewMode;
  
  // ============================================
  // Methods (unchanged except additions)
  // ============================================
  
  /** Open menu and reset to categories view */
  openMenu: () => void;
  
  /** Close menu and reset view mode */
  closeMenu: () => void;
  
  /** Toggle menu open/closed */
  toggleMenu: () => void;
  
  /** Select a category, load its channels, switch to channels view */
  selectCategory: (categoryId: string) => Promise<void>;
  
  /** Select a channel, update player, load EPG */
  selectChannel: (channel: LiveStream) => Promise<void>;
  
  /** Move focus to next panel (right arrow) */
  moveNextPanel: () => void;
  
  /** Move focus to previous panel (left arrow) */
  movePreviousPanel: () => void;
  
  // ============================================
  // NEW: View Mode Methods
  // ============================================
  
  /** Switch to channels+EPG view */
  showChannelsView: () => void;
  
  /** Switch back to categories-only view */
  showCategoriesView: () => void;
}
```

---

## State Transitions

### State Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MENU CLOSED                                   │
│  (viewMode: 'categories', isOpen: false, channels: [], epg: [])         │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ openMenu()
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CATEGORIES VIEW                                  │
│  (viewMode: 'categories', isOpen: true, activePanel: 0)                 │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      CATEGORIES PANEL                            │   │
│  │  • Category 1                                                    │   │
│  │  • Category 2                                                    │   │
│  │  • Category 3 [selected]                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────┘
          │                       │
          │ selectCategory(id)    │ closeMenu()
          │                       ▼
          ▼               ┌───────────────┐
┌──────────────────┐      │  MENU CLOSED  │
│  CHANNELS VIEW   │      └───────────────┘
│  (viewMode:      │
│   'channels')    │
└──────────────────┴──────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────────┬────────────────────────────────────────┐  │
│  │    CHANNELS PANEL       │           EPG PANEL                    │  │
│  │  (activePanel: 1)       │          (activePanel: 2)              │  │
│  │                         │                                        │  │
│  │  • Channel 1            │  ┌─────────────────────────────────┐  │  │
│  │  • Channel 2            │  │  Programa Actual [EN VIVO]      │  │  │
│  │  • Channel 3 [selected] │  │  20:00 → 21:00                  │  │  │
│  │                         │  │                                 │  │  │
│  │  [← Back]               │  │  Próximo Programa               │  │  │
│  │                         │  │  21:00 → 22:00                  │  │  │
│  └─────────────────────────┴────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────┬───────────────────────────────────────┘
          │                       │
          │ showCategoriesView()  │ closeMenu()
          │ (Back button)         │
          │                       ▼
          ▼               ┌───────────────┐
┌──────────────────┐      │  MENU CLOSED  │
│  CATEGORIES VIEW │      │  (resets to   │
│  (returns to     │      │   categories) │
│   categories)    │      └───────────────┘
└──────────────────┘
```

### Transition Rules

| Current State | Action | New State | Side Effects |
|---------------|--------|-----------|--------------|
| Menu Closed | `openMenu()` | Categories View | `isOpen: true`, `viewMode: 'categories'`, `activePanel: 0` |
| Categories View | `selectCategory(id)` | Channels View | Load channels API, `viewMode: 'channels'`, `activePanel: 1`, select first channel |
| Categories View | `closeMenu()` | Menu Closed | `isOpen: false`, reset view mode |
| Channels View | `showCategoriesView()` | Categories View | `viewMode: 'categories'`, `activePanel: 0` |
| Channels View | `selectChannel(ch)` | Channels View | Update player, load EPG, close menu |
| Channels View | `closeMenu()` | Menu Closed | `isOpen: false`, reset view mode |
| Any | `toggleMenu()` | Toggle | Same as open/close depending on current state |

---

## Component Props

### CategoriesPanel Props (unchanged)

```typescript
interface CategoriesPanelProps {
  categories: Category[];
  selectedId: string | null;
  isActive: boolean;
  onSelect: (categoryId: string) => void;
}
```

### ChannelsPanel Props (modified onBack)

```typescript
interface ChannelsPanelProps {
  channels: LiveStream[];
  selectedId: string | null;
  isActive: boolean;
  isLoading: boolean;
  onSelect: (channel: LiveStream) => void;
  onBack: () => void;  // Changed: Now calls showCategoriesView instead of setActivePanel(0)
}
```

### EPGPanel Props (unchanged)

```typescript
interface EPGPanelProps {
  epg: any[];
  isActive: boolean;
  isLoading: boolean;
  onBack: () => void;  // Still goes to channels panel (activePanel 1)
}
```

---

## State Dependencies

### Internal Dependencies (within useCascadingMenu)

```
viewMode
  ├── affects: visibility of ChannelsPanel + EPGPanel in UI
  ├── set by: selectCategory(), showCategoriesView(), closeMenu()
  └── used by: openMenu(), player/page.tsx

activePanel
  ├── affects: which panel has focus highlight
  ├── set by: moveNextPanel(), movePreviousPanel(), selectCategory()
  └── independent of: viewMode (always 0 in categories view, 1-2 in channels view)

selectedCategory
  ├── affects: which channels to load
  ├── set by: selectCategory()
  └── triggers: API call to load channels

selectedChannel  
  ├── affects: EPG loading, player state
  ├── set by: selectCategory() (first channel), selectChannel()
  └── triggers: API call to load EPG
```

### External Dependencies

```
useCascadingMenu
  ├── depends on: categories[] (prop), currentCategory (prop)
  ├── depends on: onChannelChange callback (prop)
  └── provides state to: player/page.tsx

player/page.tsx
  ├── depends on: menu.viewMode for conditional rendering
  ├── depends on: menu.showCategoriesView for back button
  └── provides: currentChannel state, handleChannelChange callback
```

---

## Validation Rules

### State Validation

1. **When `viewMode === 'categories'`**:
   - `activePanel` MUST be 0
   - Channels and EPG panels MUST NOT be rendered
   - `selectedCategory` MAY be null initially

2. **When `viewMode === 'channels'`**:
   - `activePanel` SHOULD be 1 or 2
   - Channels and EPG panels MUST be rendered
   - `selectedCategory` MUST NOT be null
   - `channels` array SHOULD be loaded (not empty unless category is empty)

3. **When `isOpen === false`**:
   - All menu panels MUST NOT be rendered
   - `viewMode` SHOULD reset to 'categories' for next open

### Type Safety

```typescript
// Type guards (optional but recommended)
function isCategoriesView(state: CascadingMenuState): boolean {
  return state.viewMode === 'categories';
}

function isChannelsView(state: CascadingMenuState): boolean {
  return state.viewMode === 'channels';
}

function canShowChannels(state: CascadingMenuState): boolean {
  return state.viewMode === 'channels' && state.channels.length > 0;
}
```

---

## Persistence

### Non-Persistent State

The following state is **NOT persisted** (intentionally):
- `viewMode` - Reset to 'categories' on every menu open
- `activePanel` - Reset to 0 on menu open/close
- `selectedChannel` in menu - Only playing channel persists

### Persisted State (unchanged)

- `currentChannel` - Saved to LocalStorage via `useChannelPersistence`
- `currentCategory` - Derived from currentChannel
- Credentials - Saved to LocalStorage

---

## Implementation Notes

### Key Implementation Details

1. **ViewMode Default**: Always start with `'categories'` when menu opens
2. **Category Auto-Select**: When entering Channels view, first channel auto-selected for EPG
3. **Loading States**: Show loading spinner while channels/EPG load
4. **Error Handling**: If category load fails, stay in categories view with error
5. **Back Button**: ChannelsPanel back returns to categories view, not just panel focus
6. **Keyboard Nav**: Right arrow from categories enters channels view

### Performance Considerations

- Channels are cached by category ID (already implemented in xtreamApi)
- EPG is loaded per channel selection
- View mode switch is synchronous (no API calls)
- Panel visibility controlled by conditional rendering (not CSS display)

---

## Testing State Transitions

### Test Scenarios

```typescript
describe('view mode state transitions', () => {
  it('should start in categories view when menu opens', () => {
    // Initial: menu closed
    // Action: openMenu()
    // Expected: viewMode === 'categories', activePanel === 0
  });

  it('should switch to channels view when category selected', async () => {
    // Initial: categories view
    // Action: selectCategory('123')
    // Expected: viewMode === 'channels', activePanel === 1, channels loaded
  });

  it('should return to categories view when back button clicked', () => {
    // Initial: channels view
    // Action: showCategoriesView()
    // Expected: viewMode === 'categories', activePanel === 0
  });

  it('should reset to categories view when menu closes', () => {
    // Initial: channels view
    // Action: closeMenu()
    // Expected: isOpen === false, viewMode === 'categories' (for next open)
  });
});
```
