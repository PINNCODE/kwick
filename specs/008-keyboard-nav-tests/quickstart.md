# Quickstart: Keyboard Navigation Tests and Polish

**Date**: 2026-05-10
**Feature**: specs/008-keyboard-nav-tests

## Prerequisites

- Node.js and npm installed
- Project dependencies installed (`npm install`)
- Existing test infrastructure working (Jest + @testing-library/react)

## Running Tests

### Run all cascading menu tests

```bash
npm test -- useCascadingMenu
```

### Run specific test file

```bash
npm test -- app/hooks/__tests__/useCascadingMenu.test.ts
```

### Run with watch mode

```bash
npm test -- --watch useCascadingMenu
```

## Test Coverage

The following test IDs have been added to `app/hooks/__tests__/useCascadingMenu.test.ts`:

| Test ID | Description | User Story |
|---------|-------------|------------|
| T044 | Left Arrow on panel 0 closes menu | US1 |
| T045 | Left Arrow on panel 1 returns to categories | US1 |
| T046 | Focus restored when returning to categories | US2 |
| T047 | showCategoriesView defaults to 0 when category not found | US2 |
| T048 | Rapid key presses — sequential next (12 calls) | US3 |
| T049 | Rapid key presses — alternating next/prev | US3 |
| T050 | movePreviousPanel during loading is safe | US3 |
| T051 | Quickstart validation — defaults and callbacks | US3 |

**Total tests in suite**: 52 (30 original from specs 006/007 + 8 new from spec 008 + 14 from earlier specs)

### UI Polish Verification

| Item | Status | Location |
|------|--------|----------|
| T027: Keyboard hint text | ✅ VERIFIED | `app/components/menu/MenuOverlay.tsx:32-35` |
| T028: preventDefault on arrows | ✅ VERIFIED | `app/hooks/useKeyboardNavigation.ts:50,58,66,74,82` |
| T030: Focus indicator sync | ✅ VERIFIED | `CategoriesPanel.tsx:41`, `ChannelsPanel.tsx:90` |

## Verification Steps

1. **Run existing tests** to ensure no regressions:
   ```bash
   npm test -- useCascadingMenu
   ```
   All existing tests (T001-T043) should pass.

2. **Add new tests** following the established patterns in the test file.

3. **Run full test suite** to verify all tests pass:
   ```bash
   npm test
   ```

4. **Verify TypeScript compilation**:
   ```bash
   npx tsc --noEmit
   ```

5. **Run ESLint**:
   ```bash
   npm run lint
   ```

## Key Files

- **Hook**: `app/hooks/useCascadingMenu.ts` — no changes expected
- **Tests**: `app/hooks/__tests__/useCascadingMenu.test.ts` — add new test cases
- **Component**: `app/components/CascadingMenu.tsx` — verify hint text (T027)
- **Page**: `app/player/page.tsx` — verify keyboard event handling (T028-T030)
