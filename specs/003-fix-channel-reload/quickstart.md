# Quick Start: Cascade Menu View Mode Implementation

**Date**: 2026-05-10  
**Feature**: Fix Channel Reload on Menu Open/Close  
**Estimated Time**: 2-3 hours

---

## Prerequisites

Before starting implementation:
1. Read [spec.md](./spec.md) for requirements
2. Read [research.md](./research.md) for design decisions
3. Read [data-model.md](./data-model.md) for state structure
4. Have the codebase open and running locally

---

## Step-by-Step Implementation

### Step 1: Add ViewMode Type (5 minutes)

**File**: `app/types/menu.ts`

Add the ViewMode type definition:

```typescript
/**
 * Represents the current view mode of the cascade menu
 * - 'categories': Only categories panel is visible
 * - 'channels': Channels and EPG panels are visible
 */
export type ViewMode = 'categories' | 'channels';
```

**Verify**: TypeScript compiles without errors

---

### Step 2: Update useCascadingMenu Hook (30 minutes)

**File**: `app/hooks/useCascadingMenu.ts`

#### 2.1 Add imports
```typescript
import { ViewMode } from '../types/menu';
```

#### 2.2 Add state
```typescript
// After existing state declarations
const [viewMode, setViewMode] = useState<ViewMode>('categories');
```

#### 2.3 Add methods
```typescript
// Add after movePreviousPanel

const showChannelsView = useCallback(() => {
  setViewMode('channels');
  setActivePanel(1);
}, []);

const showCategoriesView = useCallback(() => {
  setViewMode('categories');
  setActivePanel(0);
}, []);
```

#### 2.4 Modify selectCategory
```typescript
const selectCategory = useCallback(async (categoryId: string) => {
  setSelectedCategory(categoryId);
  setIsLoadingChannels(true);
  setChannels([]);
  setEpg([]);
  
  try {
    const streams = await xtreamApi.getStreams(categoryId);
    setChannels(streams);
    if (streams.length > 0) {
      setSelectedChannel(streams[0].stream_id);
      // Optionally auto-load EPG for first channel
      setIsLoadingEpg(true);
      try {
        const epgData = await xtreamApi.getEPG(streams[0].stream_id);
        setEpg(epgData);
      } catch (error) {
        console.error('Error loading EPG:', error);
        setEpg([]);
      } finally {
        setIsLoadingEpg(false);
      }
    }
    // Switch to channels view after loading
    showChannelsView();
  } catch (error) {
    console.error('Error loading channels:', error);
  } finally {
    setIsLoadingChannels(false);
  }
}, [showChannelsView]);
```

#### 2.5 Modify openMenu
```typescript
const openMenu = useCallback(() => {
  setIsOpen(true);
  setActivePanel(0);
  setViewMode('categories'); // Ensure fresh start
}, []);
```

#### 2.6 Modify closeMenu
```typescript
const closeMenu = useCallback(() => {
  setIsOpen(false);
  setActivePanel(0);
  setViewMode('categories'); // Reset for next time
}, []);
```

#### 2.7 Update return object
```typescript
return {
  // ... existing properties
  viewMode,
  showChannelsView,
  showCategoriesView,
  // ... existing methods
};
```

**Verify**: TypeScript compiles, no errors

---

### Step 3: Update Player Page (20 minutes)

**File**: `app/player/page.tsx`

#### 3.1 Update MenuOverlay children rendering

Replace the existing MenuOverlay children (around line 225-248):

```tsx
{/* Cascading Menu */}
<MenuOverlay 
  isOpen={menu.isOpen} 
  onClose={menu.closeMenu}
  activePanel={menu.activePanel}
>
  {categories && (
    <>
      <CategoriesPanel
        categories={categories}
        selectedId={menu.selectedCategory}
        isActive={menu.activePanel === 0}
        onSelect={menu.selectCategory}
      />
      {menu.viewMode === 'channels' && (
        <>
          <ChannelsPanel
            channels={menu.channels}
            selectedId={menu.selectedChannel}
            isActive={menu.activePanel === 1}
            isLoading={menu.isLoadingChannels}
            onSelect={menu.selectChannel}
            onBack={menu.showCategoriesView}  // Changed: returns to categories view
          />
          <EPGPanel
            epg={menu.epg}
            isActive={menu.activePanel === 2}
            isLoading={menu.isLoadingEpg}
            onBack={() => menu.setActivePanel(1)}  // Still goes to channels panel
          />
        </>
      )}
    </>
  )}
</MenuOverlay>
```

**Verify**: UI renders correctly, TypeScript compiles

---

### Step 4: Write Tests (45 minutes)

**File**: `app/hooks/__tests__/useCascadingMenu.test.ts` (create if doesn't exist)

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCascadingMenu } from '../useCascadingMenu';
import { Category, LiveStream } from '../../types/xtream';

// Mock the xtream API
jest.mock('../../lib/xtream-api', () => ({
  xtreamApi: {
    getStreams: jest.fn(),
    getEPG: jest.fn(),
  },
}));

const mockCategories: Category[] = [
  { category_id: '1', category_name: 'Sports', parent_id: 0 },
  { category_id: '2', category_name: 'Movies', parent_id: 0 },
];

const mockChannels: LiveStream[] = [
  {
    num: 1,
    name: 'Channel 1',
    stream_type: 'live',
    stream_id: '101',
    stream_icon: '',
    epg_channel_id: 'epg1',
    added: '',
    category_id: '1',
    custom_sid: '',
    tv_archive: 0,
    direct_source: '',
    tv_archive_duration: 0,
  },
];

describe('useCascadingMenu', () => {
  const mockOnChannelChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('view mode', () => {
    it('should start in categories view', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      expect(result.current.viewMode).toBe('categories');
    });

    it('should open menu in categories view', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      act(() => {
        result.current.openMenu();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.viewMode).toBe('categories');
      expect(result.current.activePanel).toBe(0);
    });

    it('should switch to channels view when category selected', async () => {
      const { xtreamApi } = require('../../lib/xtream-api');
      xtreamApi.getStreams.mockResolvedValue(mockChannels);
      xtreamApi.getEPG.mockResolvedValue([]);

      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      await act(async () => {
        await result.current.selectCategory('1');
      });

      expect(result.current.viewMode).toBe('channels');
      expect(result.current.activePanel).toBe(1);
      expect(result.current.channels).toEqual(mockChannels);
    });

    it('should return to categories view when showCategoriesView called', async () => {
      const { xtreamApi } = require('../../lib/xtream-api');
      xtreamApi.getStreams.mockResolvedValue(mockChannels);

      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      // First switch to channels view
      await act(async () => {
        await result.current.selectCategory('1');
      });

      expect(result.current.viewMode).toBe('channels');

      // Then go back
      act(() => {
        result.current.showCategoriesView();
      });

      expect(result.current.viewMode).toBe('categories');
      expect(result.current.activePanel).toBe(0);
    });

    it('should reset to categories view when menu closed', async () => {
      const { xtreamApi } = require('../../lib/xtream-api');
      xtreamApi.getStreams.mockResolvedValue(mockChannels);

      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      // Open and switch to channels
      act(() => {
        result.current.openMenu();
      });

      await act(async () => {
        await result.current.selectCategory('1');
      });

      expect(result.current.viewMode).toBe('channels');

      // Close menu
      act(() => {
        result.current.closeMenu();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.viewMode).toBe('categories');
    });
  });

  describe('channel reload prevention', () => {
    it('should not call onChannelChange when menu opens', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      act(() => {
        result.current.openMenu();
      });

      expect(mockOnChannelChange).not.toHaveBeenCalled();
    });

    it('should not call onChannelChange when menu closes', () => {
      const { result } = renderHook(() =>
        useCascadingMenu({
          categories: mockCategories,
          currentCategory: '1',
          onChannelChange: mockOnChannelChange,
        })
      );

      act(() => {
        result.current.openMenu();
        result.current.closeMenu();
      });

      expect(mockOnChannelChange).not.toHaveBeenCalled();
    });
  });
});
```

**Verify**: All tests pass with `npm test`

---

### Step 5: Manual Testing (30 minutes)

#### Test Scenarios

1. **Categories-Only Initial View**
   - Open menu (press M)
   - Verify only Categories panel visible
   - Verify no channels or EPG shown

2. **Category Selection Flow**
   - Click on a category
   - Verify loading spinner appears briefly
   - Verify Channels + EPG panels appear
   - Verify first channel is selected
   - Verify EPG shows for selected channel

3. **Back Button Behavior**
   - In Channels+EPG view, click back button
   - Verify returns to Categories-only view
   - Verify previously selected category still highlighted

4. **Menu Close/Open Reset**
   - Select category (now in channels view)
   - Close menu (press M or Esc)
   - Reopen menu
   - Verify shows Categories-only view (not channels view)

5. **Channel Change**
   - Select category
   - Click different channel
   - Verify video player changes to new channel
   - Verify menu closes automatically

6. **No Channel Reload**
   - Watch a channel
   - Open menu
   - Close menu
   - Verify same channel continues playing without reload

---

### Step 6: Run Quality Checks (15 minutes)

```bash
# TypeScript check
npm run type-check

# Lint check
npm run lint

# Tests
npm test

# Build (if applicable)
npm run build
```

**All checks must pass before submitting PR**

---

## Common Issues & Solutions

### Issue: TypeScript Error - ViewMode not found

**Solution**: Ensure you added the export to `app/types/menu.ts`

```typescript
export type ViewMode = 'categories' | 'channels';
```

### Issue: Panels don't appear when selecting category

**Solution**: Check conditional rendering in `player/page.tsx`:

```tsx
{menu.viewMode === 'channels' && (
  <>
    <ChannelsPanel ... />
    <EPGPanel ... />
  </>
)}
```

### Issue: Back button doesn't work

**Solution**: Ensure `onBack={menu.showCategoriesView}` is passed to ChannelsPanel

### Issue: Menu doesn't reset to categories on reopen

**Solution**: Verify `closeMenu` sets `setViewMode('categories')`

---

## Files Modified

| File | Lines Changed | Purpose |
|------|---------------|---------|
| `app/types/menu.ts` | +5 | Add ViewMode type |
| `app/hooks/useCascadingMenu.ts` | +25/-5 | Add view mode state and logic |
| `app/player/page.tsx` | +8/-8 | Conditional panel rendering |
| `app/hooks/__tests__/useCascadingMenu.test.ts` | +120 (new) | Test coverage |

---

## Next Steps After Implementation

1. Run full test suite
2. Perform manual testing checklist
3. Submit PR with description referencing this spec
4. Request code review
5. Merge after approval

---

## References

- [spec.md](./spec.md) - Full requirements
- [research.md](./research.md) - Design decisions
- [data-model.md](./data-model.md) - State structure
