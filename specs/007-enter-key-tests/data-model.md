# Data Model: Enter Key Tests for Cascading Menu

## Entities

### selectFocusedItem Callback

**Purpose**: Handles Enter key selection based on current view mode

**Inputs**: None (uses internal hook state)

**Behavior**:
- When `viewMode === 'categories'`:
  - Reads `categories[focusedCategoryIndex]`
  - If category exists, calls `selectCategory(category.category_id)`
  - If category is undefined (empty list or out-of-bounds), does nothing
- When `viewMode === 'channels'`:
  - Reads `channels[focusedChannelIndex]`
  - If channel exists, calls `selectChannel(channel)` then `closeMenu()`
  - If channel is undefined (empty list or out-of-bounds), does nothing

**State Dependencies**:
- `viewMode`: Determines which list to select from
- `focusedCategoryIndex`: Index of focused category (0-based)
- `focusedChannelIndex`: Index of focused channel (0-based)
- `categories`: Array of Category objects
- `channels`: Array of LiveStream objects
- `isLoadingChannels`: Boolean — should guard against duplicate calls (gap identified in research)

**Side Effects**:
- Triggers `selectCategory` → loads channels via API, switches to channels view
- Triggers `selectChannel` → calls `onChannelChange`, loads EPG, closes menu

## Validation Rules

- Category selection requires valid `category_id` from the categories array
- Channel selection requires valid `LiveStream` object from the channels array
- Empty arrays and out-of-bounds indices must be handled gracefully (no errors)
- Loading state should prevent duplicate API calls (identified gap)

## State Transitions

```
Categories View + Enter → selectCategory → Loading → Channels View
Channels View + Enter → selectChannel → closeMenu → Menu Closed
Any View + Enter (empty list) → No-op → Same State
Any View + Enter (loading) → Should be No-op → Same State (gap to fix)
```
