# Implementation Plan: Focus State for Cascading Menu

**Branch**: `006-focus-state-cascading-menu` | **Date**: 2026-05-10 | **Spec**: `specs/006-focus-state-cascading-menu/spec.md`
**Input**: Feature specification from `/specs/006-focus-state-cascading-menu/spec.md`

## Summary

Add keyboard focus tracking state (`focusedCategoryIndex`, `focusedChannelIndex`) and navigation callbacks (`moveNextItem`, `movePreviousItem`) to the `useCascadingMenu` hook. Ensure focus resets correctly on menu open/close and category changes. Export all new state and callbacks for use by the consuming player page component. This is foundational work that blocks all subsequent keyboard navigation user stories (US1-US4).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js 16.2.6, React 19.2.4  
**Primary Dependencies**: React hooks (useState, useCallback, useEffect)  
**Storage**: N/A (in-memory React state only)  
**Testing**: Jest + @testing-library/react (see `app/hooks/__tests__/`)  
**Target Platform**: Modern web browsers (desktop)  
**Project Type**: Web application (Next.js App Router, `/player` page)  
**Performance Goals**: Focus updates must be synchronous and instant (no perceptible delay); INP < 200ms  
**Constraints**: No changes to existing menu behavior; only adds state tracking; no new dependencies  
**Scale/Scope**: Single hook modification, single test file update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. TypeScript-First | PASS | All changes in .ts/.tsx, strict mode, explicit types for new state fields |
| II. Component-Driven | PASS | Hook follows existing co-location pattern in `app/hooks/` |
| III. Test-First | PASS | Tests required for focus state transitions and callback behavior |
| IV. Framework-Aware | PASS | Uses standard React hooks; no Next.js-specific APIs needed |
| V. Simplicity & Maintainability | PASS | Minimal change: adds numeric index state + boundary-checked callbacks |
| VI. Spanish-First | N/A | No user-facing text changes (internal state only) |
| Quality Gate 1: TS strict | PASS | No `any` introduced |
| Quality Gate 2: ESLint | PASS | Follows existing patterns |
| Quality Gate 3: All tests pass | MUST VERIFY | Run after implementation |
| Quality Gate 4: No console.log | PASS | No console.log in production code |
| Quality Gate 5: Tests or waiver | PASS | New tests required for focus state |
| Quality Gate 6: Lighthouse 90+ | PASS | No visual/performance regression expected |

## Project Structure

### Documentation (this feature)

```text
specs/006-focus-state-cascading-menu/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── hooks/
│   ├── useCascadingMenu.ts          # [MODIFY] Add focus state, callbacks, exports
│   └── __tests__/
│       └── useCascadingMenu.test.ts # [MODIFY] Add tests for focus navigation
```

**Structure Decision**: Single frontend project (Next.js App Router). All changes within existing files following established patterns. No new files needed — only state additions and callback exports to the existing hook and its test file.

## Complexity Tracking

No constitution violations — this is a minimal state addition with well-defined boundaries.
