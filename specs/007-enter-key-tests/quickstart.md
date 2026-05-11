# Quickstart: Enter Key Tests for Cascading Menu

## Prerequisites

- Project dependencies installed (`npm install`)
- Spec 006 (focus-state-cascading-menu) implementation complete
- All existing tests passing

## Running the Tests

```bash
# Run only the new Enter key tests
npm test -- --testPathPatterns="useCascadingMenu" -t "T028|T029|T030"

# Run all cascading menu tests
npm test -- --testPathPatterns="useCascadingMenu"

# Run full test suite
npm test
```

## Development Workflow

1. **Verify existing `selectFocusedItem` behavior**: Run current tests to confirm baseline
2. **Write failing tests first** (TDD per constitution):
   - T028: Test Enter selects category in categories view
   - T029: Test Enter selects channel in channels view
   - T030: Test Enter on empty list does not throw
3. **Fix identified gap**: Add `isLoadingChannels` guard to `selectFocusedItem` if tests reveal it's missing
4. **Run tests**: Verify all 3 new tests pass
5. **Run full suite**: Confirm no regressions

## Files Modified

- `app/hooks/__tests__/useCascadingMenu.test.ts` — Add 3 new test cases
- `app/hooks/useCascadingMenu.ts` — Potentially add `isLoadingChannels` guard (if gap confirmed)

## Verification Checklist

- [ ] T028 passes: Enter selects focused category
- [ ] T029 passes: Enter selects focused channel and closes menu
- [ ] T030 passes: Enter on empty list does not throw
- [ ] All existing tests still pass
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
