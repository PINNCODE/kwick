# Contract: selectFocusedItem Callback

## Purpose

Defines the interface and behavior contract for the `selectFocusedItem` callback exported by `useCascadingMenu`. This callback is the Enter key handler for the cascading menu.

## Signature

```typescript
selectFocusedItem: () => void
```

## Behavior Contract

### Pre-conditions

- Hook must be initialized with valid `categories` array (may be empty)
- `viewMode` must be either `'categories'` or `'channels'`
- `focusedCategoryIndex` and `focusedChannelIndex` must be non-negative integers

### Categories View Behavior

When `viewMode === 'categories'`:

1. If `categories[focusedCategoryIndex]` exists:
   - Calls `selectCategory(category.category_id)`
   - This triggers async channel loading and view mode switch to `'channels'`
2. If `categories[focusedCategoryIndex]` is undefined (empty list or out-of-bounds):
   - Does nothing (no-op, no errors)

### Channels View Behavior

When `viewMode === 'channels'`:

1. If `channels[focusedChannelIndex]` exists:
   - Calls `selectChannel(channel)`
   - Calls `closeMenu()` after channel selection
2. If `channels[focusedChannelIndex]` is undefined (empty list or out-of-bounds):
   - Does nothing (no-op, no errors)

### Loading State Guard

- If `isLoadingChannels === true`, the callback MUST be a no-op to prevent duplicate API calls

## Error Handling

- MUST NOT throw exceptions under any circumstances
- MUST handle empty arrays gracefully
- MUST handle out-of-bounds indices gracefully
- MUST handle async errors from `selectCategory`/`selectChannel` internally

## Test Scenarios

| Scenario | View Mode | List State | Expected Result |
|----------|-----------|------------|-----------------|
| T028 | categories | Non-empty | Selects focused category, loads channels |
| T029 | channels | Non-empty | Selects focused channel, closes menu |
| T030 | categories | Empty | No-op, no errors |
| T030 | channels | Empty | No-op, no errors |
| Loading guard | any | Loading | No-op, no duplicate API calls |
