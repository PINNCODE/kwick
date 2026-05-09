# Phase 0: Research Report - State Management for Channel Navigation

**Feature**: Fix Channel Reload on Menu Open/Close  
**Date**: 2026-05-09  
**Status**: Complete

---

## Research Topics

### 1. React State Separation Patterns

**Research Question**: How to separate UI navigation state from playback state to prevent unnecessary re-renders?

**Findings**:

#### Pattern 1: Independent State Pairs

```typescript
// Playback state (affects VideoPlayer)
const [currentChannel, setCurrentChannel] = useState<LiveStream | null>(null);
const [currentCategory, setCurrentCategory] = useState<string>('');

// Navigation state (UI only)
const [menuCategory, setMenuCategory] = useState<string>('');
const [menuChannels, setMenuChannels] = useState<LiveStream[]>([]);
const [selectedChannelIndex, setSelectedChannelIndex] = useState(0);
```

**Benefits**:
- Clear separation of concerns
- Easy to reason about what triggers re-renders
- VideoPlayer only remounts when `currentChannel.stream_id` changes

**Implementation**: Use separate `useState` calls, never mix states in single object.

---

#### Pattern 2: Functional Updates to Prevent Cascades

```typescript
// ✅ GOOD: Functional update prevents stale closure
setStreamsMap(prev => new Map(prev).set(categoryId, channels));

// ❌ BAD: Direct state reference can cause issues
setStreamsMap(new Map(streamsMap).set(categoryId, channels));
```

**Benefits**:
- Always works with latest state
- Prevents race conditions in async operations
- React batches functional updates efficiently

---

#### Pattern 3: useCallback with Minimal Dependencies

```typescript
// ✅ GOOD: Only essential dependencies
const handleToggleMenu = useCallback(() => {
  setIsMenuOpen(prev => !prev);
}, []);

// ❌ BAD: Unnecessary dependencies cause re-creation
const handleToggleMenu = useCallback(() => {
  setIsMenuOpen(prev => !prev);
}, [menuCategory, currentChannel]); // These aren't used!
```

**Benefits**:
- Stable function references
- Prevents unnecessary re-renders of child components
- Easier to reason about when handlers change

---

### 2. useEffect Dependency Management

**Research Question**: How to structure useEffect dependencies to prevent cascading updates?

**Findings**:

#### Anti-Pattern: Circular Dependencies

```typescript
// ❌ BAD: This creates a cascade
useEffect(() => {
  if (menuCategory) {
    // Load channels
  }
}, [menuCategory]);

useEffect(() => {
  if (menuChannels.length > 0) {
    // Update selected index
    setSelectedChannelIndex(0);
  }
}, [menuChannels]);

useEffect(() => {
  if (selectedChannelIndex !== -1) {
    // This might trigger something else...
  }
}, [selectedChannelIndex]);
```

**Problem**: Each effect triggers the next, creating a cascade of updates.

---

#### Pattern: Isolated Effects with Clear Responsibilities

```typescript
// ✅ GOOD: Each effect has single responsibility
useEffect(() => {
  // Only loads channels, doesn't update other state
  if (menuCategory && !streamsMap.has(menuCategory)) {
    xtreamApi.getStreams(menuCategory).then(channels => {
      setStreamsMap(prev => new Map(prev).set(menuCategory, channels));
    });
  }
}, [menuCategory, streamsMap]);

useEffect(() => {
  // Only syncs index when channel changes, not when menu changes
  if (currentChannel && menuCategory) {
    const channels = streamsMap.get(menuCategory) || [];
    const index = channels.findIndex(c => c.stream_id === currentChannel.stream_id);
    if (index >= 0) {
      setSelectedChannelIndex(index);
    }
  }
}, [currentChannel, menuCategory, streamsMap]); // Reads menuCategory but doesn't cause cascade
```

**Key Insight**: An effect can READ a state value without causing problems. The issue is when effect UPDATES trigger other effects.

---

### 3. VideoPlayer Remount Prevention

**Research Question**: What causes VideoPlayer to remount and how to prevent it?

**Findings**:

#### Root Cause: Key Prop Changes

```typescript
// Current implementation
<VideoPlayer
  key={currentChannel.stream_id}  // ← This causes remount when key changes
  channel={currentChannel}
  streamUrl={streamUrl}
/>
```

**React Behavior**: When `key` changes, React:
1. Unmounts old component (destroys HLS instance)
2. Mounts new component (creates new HLS instance)
3. Video reloads from beginning

---

#### Solution: Keep Key Stable During Menu Operations

```typescript
// Menu operations should NEVER change currentChannel
const handleMoveNextCategory = useCallback(async () => {
  // ✅ GOOD: Only updates menu state
  setMenuCategory(nextCategoryId);
  // ❌ BAD: Would cause VideoPlayer remount
  // setCurrentChannel(newChannel);
}, []);

// Only explicit selection changes currentChannel
const handleSelect = useCallback(() => {
  // ✅ GOOD: This is when we WANT VideoPlayer to change
  setCurrentChannel(selectedChannel);
  setCurrentCategory(menuCategory);
  setIsMenuOpen(false);
}, [selectedChannel, menuCategory]);
```

**Verification**: Monitor `currentChannel` during menu operations. If it changes → BUG.

---

### 4. State Batching and Update Order

**Research Question**: How does React batch state updates and what's the update order?

**Findings**:

#### React 18 Automatic Batching

```typescript
// React 18: Both updates are batched
const handleClick = () => {
  setMenuCategory(categoryId);
  setStreamsMap(prev => new Map(prev).set(categoryId, channels));
  // Both updates happen in same render pass
};
```

**Benefits**:
- Fewer re-renders
- Better performance
- More predictable state

---

#### Update Order Matters

```typescript
// ✅ GOOD: Order is clear
const handleCategorySelect = useCallback(async (categoryId: string) => {
  // First: Load channels if needed
  if (!streamsMap.has(categoryId)) {
    const channels = await xtreamApi.getStreams(categoryId);
    setStreamsMap(prev => new Map(prev).set(categoryId, channels));
  }
  
  // Then: Update menu to show new category
  setMenuCategory(categoryId);
  setSelectedChannelIndex(0);
  
  // NEVER: Update currentChannel here (that's handleSelect's job)
}, [streamsMap]);
```

---

## Decisions Summary

| # | Decision | Chosen Approach |
|---|----------|-----------------|
| 1 | State Separation | Independent state pairs (currentChannel vs menuCategory) |
| 2 | useEffect Cascades | Remove menu states from playback-related effects |
| 3 | Category Navigation | Only update menuCategory, NEVER currentChannel |
| 4 | Menu Open Sync | Sync menuCategory with currentCategory (UI-only) |
| 5 | VideoPlayer Key | Keep stable during menu operations |

---

## References

- [React Docs: State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)
- [React Docs: Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- [React Docs: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React 18 Working Group: Automatic Batching](https://github.com/reactwg/react-18/discussions/21)
