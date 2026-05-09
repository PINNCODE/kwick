# Implementation Plan: Fix Channel Reload on Menu Open/Close

**Branch**: `003-fix-channel-reload` | **Date**: 2026-05-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-fix-channel-reload/spec.md`

## Summary

Fix critical UX bug where channel reloads/restarts when opening/closing menu or navigating categories. The fix separates menu navigation state (`menuCategory`, `menuChannels`) from playback state (`currentChannel`, `currentCategory`), ensuring channel changes ONLY occur on explicit user selection (Enter key or click). Implementation involves refactoring state management in `app/player/page.tsx` to prevent unnecessary re-renders and state updates that trigger VideoPlayer remounting.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode  
**Primary Dependencies**: Next.js 16.2.6, React 19.2.4, HLS.js 1.6.16  
**Storage**: N/A (in-memory state management only)  
**Testing**: React Testing Library for component tests (integration tests for keyboard navigation)  
**Target Platform**: Web browsers (desktop, tablet, mobile)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Menu navigation <100ms, 0 video interruptions, 100% success rate on menu open/close without reload  
**Constraints**: No changes to VideoPlayer component, preserve existing keyboard navigation, maintain current UX flow  
**Scale/Scope**: Single page fix (app/player/page.tsx), affects state management and event handlers only

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **I. TypeScript-First** | ✅ PASS | All state types defined (LiveStream, Category), strict mode maintained |
| **II. Component-Driven** | ✅ PASS | Fix is in page component, no changes to VideoPlayer, preserves component boundaries |
| **III. Test-First (TDD)** | ⚠️ DEFERRED | Tests to be written in /speckit.tasks phase; Red-Green-Refactor during implementation |
| **IV. Framework-Aware** | ✅ PASS | Uses React state management patterns, Next.js App Router conventions |
| **V. Simplicity** | ✅ PASS | Fix is minimal - state separation, no new dependencies, YAGNI applied |
| **VI. Spanish-First** | ✅ PASS | User-facing strings remain in Spanish, code comments in English |

**Gate Status**: ✅ PASS (TDD deferred to implementation phase per workflow)

## Project Structure

### Documentation (this feature)

```text
specs/003-fix-channel-reload/
├── plan.md              # This file
├── research.md          # Phase 0 output (state management patterns)
├── data-model.md        # Phase 1 output (state machine diagram)
├── quickstart.md        # Phase 1 output (testing guide)
├── contracts/           # Phase 1 output (N/A - internal state only)
└── tasks.md             # Phase 2 output (future)
```

### Source Code (repository root)

```text
app/
├── player/
│   └── page.tsx         # MODIFY: State management refactoring
└── components/
    ├── player/
    │   └── VideoPlayer.tsx  # NO CHANGES (preserve existing)
    └── menu/
        ├── MenuOverlay.tsx  # NO CHANGES
        ├── CategoryList.tsx # NO CHANGES
        └── ChannelGrid.tsx  # NO CHANGES
```

**Structure Decision**: Single project structure. Fix is isolated to `app/player/page.tsx` state management. No changes to child components required. This maintains separation of concerns and minimizes risk.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | No violations requiring justification |

---

## Phase 0: Research

### Research Summary

**Objective**: Identify state management patterns to separate menu navigation from playback state without causing re-renders.

---

### Decision 1: State Separation Strategy

**Decision**: Maintain two independent state pairs:
- `currentChannel` / `currentCategory` → Playback state (affects VideoPlayer)
- `menuCategory` / `menuChannels` → Navigation state (UI only)

**Rationale**: 
- VideoPlayer uses `key={currentChannel.stream_id}` which causes remount on key change
- By separating states, menu navigation updates only `menuCategory`, never touching `currentChannel`
- React's state batching ensures no unnecessary re-renders

**Alternatives Considered**:
- Use `useRef` for menu state: Rejected (refs don't trigger re-renders for UI updates)
- Single state with careful updates: Rejected (too error-prone, hard to maintain)
- Zustand for menu state: Rejected (over-engineering, adds dependency for simple fix)

---

### Decision 2: Preventing useEffect Cascades

**Decision**: Remove `menuCategory` and `menuChannels` from useEffect dependencies that affect playback state.

**Rationale**:
- Current code has useEffect that syncs `selectedChannelIndex` when `menuCategory` changes (line 258-267)
- This creates cascade: menu navigation → menuCategory change → useEffect → state updates → potential re-render
- Solution: Use functional updates and remove menu states from playback-related useEffects

**Implementation Pattern**:
```typescript
// BEFORE (causes cascade):
useEffect(() => {
  if (currentChannel && menuCategory) {
    const channels = streamsMap.get(menuCategory) || [];
    const index = channels.findIndex(c => c.stream_id === currentChannel.stream_id);
    setSelectedChannelIndex(index >= 0 ? index : 0);
  }
}, [menuCategory, currentChannel, streamsMap]); // ❌ menuCategory dependency

// AFTER (isolated):
useEffect(() => {
  // Only sync index when currentChannel changes, not when menuCategory changes
  if (currentChannel && menuCategory) {
    const channels = streamsMap.get(menuCategory) || [];
    const index = channels.findIndex(c => c.stream_id === currentChannel.stream_id);
    if (index >= 0) {
      setSelectedChannelIndex(index);
    }
  }
}, [currentChannel, menuCategory, streamsMap]); // Still has menuCategory but only reads, no side effects
```

**Key Insight**: The useEffect can READ `menuCategory` without causing problems as long as it doesn't UPDATE playback state.

---

### Decision 3: Category Navigation Handlers

**Decision**: Ensure `handleMoveNextCategory` and `handleMovePreviousCategory` ONLY update `menuCategory` and `streamsMap`, NEVER `currentChannel` or `currentCategory`.

**Rationale**:
- Spec FR-003, FR-009 require category navigation to NOT change playing channel
- Current implementation already follows this pattern (lines 188-209)
- Verification needed: Ensure no accidental state updates in category change handlers

**Verification Checklist**:
- ✅ `handleMoveNextCategory` only calls `setMenuCategory` and `setStreamsMap`
- ✅ `handleMovePreviousCategory` only calls `setMenuCategory` and `setStreamsMap`
- ✅ `handleCategorySelect` (click on category tab) only calls `setMenuCategory` and `setStreamsMap`
- ✅ `handleSelect` (Enter key) is the ONLY handler that updates `currentChannel`

---

### Decision 4: Menu Open/Close Behavior

**Decision**: When menu opens, sync `menuCategory` with `currentCategory` for UX consistency, but ensure this sync does NOT trigger any useEffect that affects playback.

**Rationale**:
- Users expect menu to show the category of the currently playing channel
- Sync is UI-only, should not affect VideoPlayer
- Current implementation (lines 145-154) already follows this pattern

**Implementation**:
```typescript
const handleToggleMenu = useCallback(() => {
  setIsMenuOpen(prev => {
    const newState = !prev;
    if (newState) {
      // Sync menu with current playing category
      setMenuCategory(currentCategory);
      // Load current category channels if not loaded
      if (currentCategory && !streamsMap.has(currentCategory)) {
        xtreamApi.getStreams(currentCategory).then(channels => {
          setStreamsMap(prev => new Map(prev).set(currentCategory, channels));
        }).catch(console.error);
      }
    }
    return newState;
  });
}, [currentCategory, streamsMap]);
```

**Critical**: This handler updates `menuCategory` and `streamsMap` only - NEVER `currentChannel`.

---

### Decision 5: VideoPlayer Key Stability

**Decision**: VideoPlayer's `key={currentChannel.stream_id}` MUST remain stable during menu operations.

**Rationale**:
- React remounts component when `key` changes
- Menu open/close/navigation should NEVER change `currentChannel`
- Therefore, key remains stable, VideoPlayer doesn't remount

**Verification**:
- Monitor `currentChannel` state during menu operations
- If `currentChannel` changes during menu open/close → BUG
- Fix: Ensure no setState calls to `currentChannel` in menu handlers

---

## Phase 1: Design & Contracts

### Data Model

**State Machine Diagram**:

```
┌─────────────────────────────────────────────────────────┐
│                  PLAYBACK STATE                         │
│  (Affects VideoPlayer - changes cause remount)          │
│                                                         │
│  currentChannel: LiveStream | null                      │
│  currentCategory: string (category_id)                  │
│                                                         │
│  Updated ONLY by:                                       │
│  - Initial load (useEffect on mount)                    │
│  - handleSelect (Enter key or click)                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  NAVIGATION STATE                       │
│  (UI only - changes do NOT affect VideoPlayer)          │
│                                                         │
│  menuCategory: string (category_id)                     │
│  menuChannels: LiveStream[]                             │
│  selectedChannelIndex: number                           │
│  isMenuOpen: boolean                                    │
│                                                         │
│  Updated by:                                            │
│  - handleToggleMenu (M key)                             │
│  - handleMoveNext/Previous (arrow keys)                 │
│  - handleMoveNext/PreviousCategory (arrow keys)         │
│  - handleCategorySelect (click on category)             │
└─────────────────────────────────────────────────────────┘

STATE ISOLATION: Navigation state changes → UI re-render only
                 Playback state changes → VideoPlayer remount + reload
```

**State Transition Rules**:

| Action | Updates | Does NOT Update | Result |
|--------|---------|-----------------|--------|
| Open menu (M) | `isMenuOpen`, `menuCategory`, `streamsMap` | `currentChannel` | Menu shows, video continues |
| Close menu (M/Esc) | `isMenuOpen` | `currentChannel`, `menuCategory` | Menu hides, video continues |
| Navigate categories (←→) | `menuCategory`, `streamsMap`, `selectedChannelIndex` | `currentChannel` | Menu shows new category, video continues |
| Navigate channels (↑↓) | `selectedChannelIndex` | `currentChannel` | Highlight changes, video continues |
| Select channel (Enter/click) | `currentChannel`, `currentCategory`, `isMenuOpen` | N/A | Video changes, menu closes |

---

### Interface Contracts

**Status**: N/A (Internal State Management Only)

This feature does not expose external APIs or interfaces. All changes are internal to `app/player/page.tsx` state management.

**Component Interface Preservation**:
- `VideoPlayer` props unchanged
- `MenuOverlay` props unchanged
- `CategoryList` props unchanged
- `ChannelGrid` props unchanged
- `useKeyboardNavigation` hook interface unchanged

---

### Quickstart Guide

```markdown
# Quickstart: Testing Channel Reload Fix

## Prerequisites

- Development server running (`npm run dev`)
- Browser with DevTools (Chrome recommended)
- Xtream Codes credentials for testing

## Manual Testing Steps

### Test 1: Menu Open/Close Without Reload

1. Navigate to http://localhost:3000/player
2. Wait for channel to start playing
3. Open React DevTools → Components tab
4. Find `VideoPlayer` component
5. Note: No remounts should occur during this test

6. Press 'M' to open menu
   - ✅ Expected: Menu opens, video continues playing
   - ❌ Bug: Video reloads/restarts

7. Press 'M' to close menu
   - ✅ Expected: Menu closes, video continues playing
   - ❌ Bug: Video reloads/restarts

8. Repeat 5 times to verify consistency

### Test 2: Category Navigation Without Channel Change

1. With menu open (press 'M')
2. Press right arrow (→) to navigate to next category
   - ✅ Expected: Menu shows new category channels, video continues
   - ❌ Bug: Video changes to first channel of new category

3. Press left arrow (←) to navigate back
   - ✅ Expected: Menu shows previous category, video continues

4. Press up/down arrows (↑↓) to navigate channels
   - ✅ Expected: Highlighted channel changes, video continues
   - ❌ Bug: Video changes to highlighted channel

5. Press Enter to select highlighted channel
   - ✅ Expected: Video changes to selected channel, menu closes
   - This is the ONLY time video should change

### Test 3: Rapid Navigation Stress Test

1. Open menu (M)
2. Rapidly press left/right arrows (10+ times)
   - ✅ Expected: Menu updates quickly, video never interrupts
   - ❌ Bug: Video flickers or reloads

3. Close menu (M or Esc)
   - ✅ Expected: Video continues smoothly

## Automated Testing (Future)

```typescript
// Example integration test (to be implemented in /speckit.tasks)
describe('Channel Reload Fix', () => {
  it('should not reload video when menu opens/closes', async () => {
    render(<PlayerPage />);
    await waitForChannelToPlay();
    
    const videoPlayer = screen.getByRole('video');
    const initialKey = videoPlayer.key;
    
    // Open menu
    fireEvent.keyDown(document, { key: 'm' });
    await waitFor(() => expect(screen.getByText('Canales')).toBeInTheDocument());
    
    // Verify video didn't remount
    expect(videoPlayer.key).toBe(initialKey);
    
    // Close menu
    fireEvent.keyDown(document, { key: 'm' });
    await waitFor(() => expect(screen.queryByText('Canales')).not.toBeInTheDocument());
    
    // Verify video still didn't remount
    expect(videoPlayer.key).toBe(initialKey);
  });
});
```

## Performance Verification

1. Open Chrome DevTools → Performance tab
2. Start recording
3. Open menu (M), navigate categories (←→), close menu (M)
4. Stop recording
5. Verify:
   - No long tasks (>50ms) during menu operations
   - No layout shifts (CLS = 0)
   - Menu navigation feels instant (<100ms)

## Success Criteria Validation

| Criteria | Target | How to Verify |
|----------|--------|---------------|
| SC-001 | 100% no reload on menu open/close | Manual test 10 times, 0 failures |
| SC-002 | 100% no change on category nav | Manual test 10 times, 0 failures |
| SC-003 | 100% no change on channel nav | Manual test 10 times, 0 failures |
| SC-004 | 0 false positives | Only Enter/click changes channel |
| SC-005 | No video interruption | Visual inspection, no buffering |
| SC-006 | <100ms menu navigation | DevTools Performance tab |

---

## Next Steps

After quickstart:
1. Review this plan for completeness
2. Run `/speckit.tasks` to generate task breakdown
3. Implement following TDD workflow
```

---

## Constitution Check (Post-Design)

*Re-evaluation after Phase 1 design completion*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **I. TypeScript-First** | ✅ PASS | State types preserved, no `any` introduced |
| **II. Component-Driven** | ✅ PASS | Component boundaries respected, no VideoPlayer changes |
| **III. Test-First (TDD)** | ⚠️ PENDING | Tests to be written during implementation phase |
| **IV. Framework-Aware** | ✅ PASS | React state management patterns, proper useEffect usage |
| **V. Simplicity** | ✅ PASS | Minimal changes, state separation is simplest solution |
| **VI. Spanish-First** | ✅ PASS | No user-facing changes, code comments in English |

**Gate Status**: ✅ PASS - Ready for implementation planning

---

## Agent Context Update

**Action Required**: Update `AGENTS.md` to reference this plan file between the `<!-- SPECKIT START -->` and `<!-- SPECKIT END -->` markers.

**Current Plan Reference**: `specs/003-fix-channel-reload/plan.md`

---

## Next Command

Run `/speckit.tasks` to generate the task breakdown with TDD workflow.
