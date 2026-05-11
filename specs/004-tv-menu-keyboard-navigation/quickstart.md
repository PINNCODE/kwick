# Quickstart: TV Menu Keyboard Navigation

## What You're Building

Wire ArrowUp/ArrowDown/Enter keyboard events to navigate items within the TV menu's categories and channels panels, with visual focus indicators and proper panel transition logic.

## Files to Modify

| File | Change |
|------|--------|
| `app/hooks/useCascadingMenu.ts` | Add `focusedCategoryIndex`, `focusedChannelIndex` state + `moveNextItem`, `movePreviousItem`, `selectFocusedItem` callbacks |
| `app/components/menu/CategoriesPanel.tsx` | Accept `focusedIndex` prop, render focus indicator on the focused item |
| `app/components/menu/ChannelsPanel.tsx` | Accept `focusedIndex` prop, render focus indicator on the focused item |
| `app/player/page.tsx` | Wire `menu.moveNextItem`, `menu.movePreviousItem`, `menu.selectFocusedItem` to `useKeyboardNavigation` |

## Files to Create

| File | Purpose |
|------|---------|
| `app/hooks/__tests__/useKeyboardNavigation.test.ts` | Test focus movement, Enter selection, edge behaviors |

## Key State (in `useCascadingMenu`)

```typescript
const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0);
const [focusedChannelIndex, setFocusedChannelIndex] = useState(0);
```

## Callback Wiring (in `player/page.tsx`)

```typescript
useKeyboardNavigation({
  // ...
  onMoveNext: menu.moveNextItem,
  onMovePrevious: menu.movePreviousItem,
  onSelect: menu.selectFocusedItem,
  // ...
});
```

## Focus Indicator Style (Tailwind)

```tsx
className={`... ${isKeyboardFocused ? 'ring-2 ring-blue-400' : ''}`}
```

## Test Strategy

1. **Focus movement**: ArrowUp/ArrowDown moves `focusedIndex` within bounds
2. **Edge stop**: At first/last item, further movement does nothing
3. **Enter on category**: Calls `selectCategory` with the focused category
4. **Enter on channel**: Calls `selectChannel` with the focused channel, then closes menu
5. **Left arrow in categories**: Closes menu
6. **Left arrow in channels**: Returns to categories with focus on previously selected
7. **Right arrow in channels**: No-op

## Run Checklist

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript strict
npm test           # Jest tests
```
