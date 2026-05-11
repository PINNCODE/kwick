# Quickstart: Focus State for Cascading Menu

**Date**: 2026-05-10
**Feature**: `specs/006-focus-state-cascading-menu/spec.md`

## Prerequisites

- Node.js and npm installed
- Project dependencies installed (`npm install`)
- Familiarity with React hooks and TypeScript

## Development Setup

1. **Run the dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the player page**:
   Open `http://localhost:3000/player` in your browser.

3. **Open the menu**:
   Click the menu button or use the designated keyboard shortcut to open the cascading menu.

## Running Tests

```bash
# Run all tests
npm test

# Run only the useCascadingMenu tests
npm test -- app/hooks/__tests__/useCascadingMenu.test.ts

# Run tests in watch mode
npm test -- --watch
```

## Key Files

| File | Purpose |
|------|---------|
| `app/hooks/useCascadingMenu.ts` | Hook with focus state and navigation callbacks |
| `app/hooks/__tests__/useCascadingMenu.test.ts` | Unit tests for focus behavior |
| `app/player/page.tsx` | Consuming component (wires keyboard events to callbacks) |

## Implementation Order

1. Verify existing focus state variables in `useCascadingMenu.ts` (T001)
2. Verify `moveNextItem` and `movePreviousItem` callbacks (T002-T003)
3. Verify `selectCategory` resets `focusedChannelIndex` (T004)
4. Verify `openMenu`/`closeMenu` reset both indices (T005)
5. Verify all new state/callbacks are exported (T006)
6. Add/update tests for each behavior
7. Wire keyboard events in `page.tsx` (covered in subsequent issues #4-#8)

## Verification

After implementation, manually test:
1. Open menu → focus should be on first category
2. Press Down arrow → focus moves to next category
3. Press Up arrow → focus moves to previous category
4. Select a category → channels load, focus on first channel
5. Press Down/Up → focus moves through channels
6. Close menu → both indices reset to 0
