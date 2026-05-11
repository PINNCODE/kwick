# Implementation Plan: TV Menu Keyboard Navigation

**Branch**: `004-tv-menu-keyboard-navigation` | **Date**: 2026-05-10 | **Spec**: `specs/004-tv-menu-keyboard-navigation/spec.md`
**Input**: Feature specification from `/specs/004-tv-menu-keyboard-navigation/spec.md`

## Summary

Enable keyboard-based navigation of the TV menu using arrow keys (Up/Down for items, Left/Right for panels), Enter for selection, and Left arrow to close/back. The menu uses a three-panel cascading layout (Categories → Channels → EPG) driven by a `useCascadingMenu` hook. Currently panel-level navigation works but item-level focus/selection is missing. This feature adds `focusedIndex` tracking per panel, wires ArrowUp/ArrowDown/Enter to actual actions, and adds visual focus indicators.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js 16.2.6, React 19.2.4
**Primary Dependencies**: Zustand 5.0.13 (auth only), SWR 2.4.1 (data fetching), clsx 2.1.1 + tailwind-merge 3.5.0 (styling utilities)
**Storage**: localStorage (via `app/lib/storage.ts`)
**Testing**: Jest + @testing-library/react (see `app/hooks/__tests__/`)
**Target Platform**: Modern web browsers (desktop)
**Project Type**: Web application (Next.js App Router, `/player` page)
**Performance Goals**: INP < 200ms (keyboard response), Lighthouse 90+ (constitution standard)
**Constraints**: No wrap-around navigation (clarified), Right arrow is no-op in channels panel (clarified), menu closes on channel selection (clarified)
**Scale/Scope**: Single-user session, one menu instance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. TypeScript-First | PASS | All code in .ts/.tsx, strict mode enabled, explicit interfaces for all new props |
| II. Component-Driven | PASS | Modifies existing components with clear props interfaces; single responsibility maintained |
| III. Test-First | PASS | New tests required for `useCascadingMenu` focus state and `useKeyboardNavigation` wiring |
| IV. Framework-Aware | PASS | Uses standard React hooks (useState, useCallback, useEffect) — no framework-specific keyboard APIs needed |
| V. Simplicity & Maintainability | PASS | Minimal state addition (focusedIndex integers), reuses existing patterns |
| VI. Spanish-First | PASS | Menu labels already in Spanish; keyboard hints in Spanish |
| Quality Gate 1: TS strict | PASS | No `any` introduced |
| Quality Gate 2: ESLint | PASS | Follows existing patterns |
| Quality Gate 3: All tests pass | MUST VERIFY | Run after implementation |
| Quality Gate 4: No console.log | PASS | No console.log in production code |
| Quality Gate 5: Tests or waiver | PASS | New tests required |
| Quality Gate 6: Lighthouse 90+ | PASS | No visual/performance regression expected |

## Project Structure

### Documentation (this feature)

```text
specs/004-tv-menu-keyboard-navigation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty for this feature)
└── tasks.md             # Created by /speckit.tasks
```

### Source Code (repository root)

```text
app/
├── hooks/
│   ├── useCascadingMenu.ts     # [MODIFY] Add focusedIndex, moveNextItem, movePreviousItem, selectFocusedItem
│   ├── useKeyboardNavigation.ts # [NO CHANGE] Already handles all key events
│   └── __tests__/
│       ├── useCascadingMenu.test.ts  # [MODIFY] Add tests for focus navigation
│       └── useKeyboardNavigation.test.ts  # [ADD] New tests for focus wiring
├── components/
│   └── menu/
│       ├── CategoriesPanel.tsx  # [MODIFY] Accept focusedIndex, show focus indicator
│       └── ChannelsPanel.tsx    # [MODIFY] Accept focusedIndex, show focus indicator
├── types/
│   └── menu.ts                 # [NO CHANGE]
└── player/
    └── page.tsx                # [MODIFY] Wire real callbacks to useKeyboardNavigation
```

**Structure Decision**: Single frontend project (Next.js App Router). All changes are within existing files following established patterns. No new files needed beyond tests.

## Complexity Tracking

No constitution violations — this is a straightforward enhancement to existing patterns.
