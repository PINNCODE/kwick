# Research: Cascade Menu View Mode Feature

**Date**: 2026-05-10  
**Feature**: Fix Channel Reload on Menu Open/Close + Two-Step Menu Flow  
**Researcher**: Planning Agent

---

## Decisions Made

### 1. View Mode State Pattern

**Decision**: Implement a `viewMode` state with values `'categories' | 'channels'`

**Rationale**:
- Simple boolean-like state that's easy to understand and test
- Clearly represents the two distinct UI states requested by user
- Can be extended to more views in the future if needed
- Integrates cleanly with existing `activePanel` state for sub-navigation

**Location**: Added to `useCascadingMenu` hook return value

**Implementation**:
```typescript
type ViewMode = 'categories' | 'channels';
const [viewMode, setViewMode] = useState<ViewMode>('categories');
```

---

### 2. Keyboard Navigation Behavior

**Decision**: Keep existing keyboard navigation mostly unchanged

**Current Behavior Analysis** (from `useKeyboardNavigation.ts`):
- Arrow Up/Down: Navigate items within current panel
- Arrow Left/Right: Move between panels (0→1→2)
- Enter: Select current item
- Escape: Close menu
- M: Toggle menu

**Proposed Behavior for New Flow**:

**When in Categories View (`viewMode = 'categories'`)**:
- Arrow Up/Down: Navigate categories
- Arrow Right: Select category → switch to Channels view
- Enter: Select category → switch to Channels view
- Escape: Close menu

**When in Channels View (`viewMode = 'channels'`)**:
- Arrow Up/Down: Navigate channels
- Arrow Left: Go back to Categories view
- Arrow Right: Move focus to EPG panel
- Enter: Select channel → change channel and close menu
- Escape: Close menu

**Rationale**:
- Maintains intuitive spatial navigation
- Right arrow from categories advances to next step
- Left arrow from channels goes back (standard UX pattern)
- Minimal changes needed to keyboard handler

---

### 3. EPG Loading Strategy

**Decision**: Load EPG automatically for the selected/highlighted channel in Channels view

**Rationale**:
- User wants to see EPG when viewing channels ("panel de canales mas el epg")
- Current implementation already loads EPG on channel selection
- Keep this behavior - it's what users expect in a TV guide
- EPG loads for the currently highlighted channel, not just the playing channel

**Implementation**:
- Keep existing `selectChannel` logic that loads EPG
- EPG panel shows "No hay información" if no channel selected yet

---

### 4. View Transition Animation

**Decision**: Use CSS transitions/animations for panel appearance

**Options Considered**:
1. **Instant switch** - No animation, immediate render
2. **Slide in/out** - Panels slide from right
3. **Fade in/out** - Opacity transition
4. **Scale** - Subtle zoom effect

**Decision**: Start with simple instant switch or subtle fade

**Rationale**:
- User didn't specify animation requirements
- Keep it simple first (Constitution V - Simplicity)
- Can enhance later if needed
- Avoids layout shift issues during transition
- Instant is better for accessibility (reduced motion)

**Implementation Note**: Use Tailwind classes like `transition-opacity duration-200` if animation desired

---

### 5. Back Button Behavior

**Decision**: Back button in Channels+EPG view returns to Categories-only view

**Current Behavior**:
- ChannelsPanel back button: `setActivePanel(0)` - moves focus to categories panel
- EPGPanel back button: `setActivePanel(1)` - moves focus to channels panel

**New Behavior**:
- ChannelsPanel back button: `showCategoriesView()` - hides channels+EPG, shows only categories
- EPGPanel back button: `setActivePanel(1)` - still moves focus back to channels (within same view)

**Rationale**:
- User specifically requested: "el boton back de este panel debe de cerrarse y volver solo a categorias"
- ChannelsPanel back is the primary "go back to categories" action
- EPGPanel back moves within the channels+EPG view

---

### 6. Category Selection Trigger

**Decision**: Category selection triggers view mode change AND loads channels

**Flow**:
1. User clicks/enters on category
2. `selectCategory(categoryId)` called
3. Channels load from API
4. `viewMode` switches to 'channels'
5. Channels+EPG panels appear
6. First channel auto-selected (for EPG display)

**Rationale**:
- Matches user expectation: select category → see its content
- Loading state shown during API call
- First channel selected by default so EPG has content to show
- User can immediately navigate channels with up/down

---

### 7. State Reset on Menu Close

**Decision**: Reset to categories view when menu closes

**Implementation**:
```typescript
const closeMenu = useCallback(() => {
  setIsOpen(false);
  setActivePanel(0);
  setViewMode('categories');  // Reset for next open
}, []);
```

**Rationale**:
- Fresh start every time menu opens
- User always sees categories first
- Avoids confusion about current state
- Simpler mental model: Menu = Categories → Select → Channels

---

## Alternatives Considered

### Alternative 1: Keep All 3 Panels Always Visible

**Status**: Rejected

**Why**: User explicitly requested two-step flow. Current 3-panel view is overwhelming and doesn't match the TV guide pattern they want.

---

### Alternative 2: Use React Router for View State

**Status**: Rejected

**Why**: Overkill for this feature. State is local to menu component, not URL-state worthy. Would complicate implementation unnecessarily.

---

### Alternative 3: Separate Categories into Own Component/Page

**Status**: Rejected

**Why**: Would break existing architecture. Current MenuOverlay is designed as a single overlay. User wants cascade behavior within same menu.

---

## Open Questions (None)

All unknowns from Phase 0 have been resolved:

1. ✅ Keyboard navigation: Right arrow to advance, Left to go back
2. ✅ EPG loading: Auto-load for selected channel
3. ✅ Animation: Start simple (instant or fade)

---

## Technical Constraints Verified

1. ✅ TypeScript strict mode: All new code will be typed
2. ✅ No new dependencies: Using existing state management
3. ✅ Spanish-first: UI labels already in Spanish
4. ✅ Framework compatible: Next.js 16.2.6 patterns followed
5. ✅ Test-first: Tests will be written per Constitution

---

## Next Steps

Proceed to Phase 1: Design data model and create contracts
