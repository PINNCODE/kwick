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

## Common Issues

**Issue**: Video still reloads when opening menu  
**Solution**: Check if `currentChannel` is being updated in `handleToggleMenu`. It should only update `menuCategory` and `streamsMap`.

**Issue**: Category navigation changes the video  
**Solution**: Verify `handleMoveNextCategory` and `handleMovePreviousCategory` do NOT call `setCurrentChannel`.

**Issue**: Menu shows wrong category when opened  
**Solution**: Ensure `handleToggleMenu` syncs `menuCategory` with `currentCategory` when opening.

---

## Next Steps

After testing:
1. If all tests pass → proceed to `/speckit.tasks` for implementation
2. If tests fail → review state management in `app/player/page.tsx`
3. Document any edge cases discovered during testing
