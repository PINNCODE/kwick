# Implementation Plan: Enter Key Tests for Cascading Menu

**Branch**: `007-enter-key-tests` | **Date**: 2026-05-10 | **Spec**: `specs/007-enter-key-tests/spec.md`
**Input**: Feature specification from `/specs/007-enter-key-tests/spec.md`

## Summary

Add three tests (T028-T030) to verify Enter key selection behavior in the `useCascadingMenu` hook: selecting a category via Enter, selecting a channel via Enter, and handling Enter on empty lists. The hook already has `selectFocusedItem` which encapsulates Enter key logic — tests will exercise this callback across the three scenarios defined in the spec.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js 16.2.6, React 19.2.4  
**Primary Dependencies**: React hooks (useState, useCallback), Jest + @testing-library/react  
**Storage**: N/A (in-memory React state only)  
**Testing**: Jest + @testing-library/react (see `app/hooks/__tests__/`)  
**Target Platform**: Modern web browsers (desktop)  
**Project Type**: Web application (Next.js App Router, `/player` page)  
**Performance Goals**: Enter key response must be synchronous and instant; INP < 200ms  
**Constraints**: No changes to existing hook logic — only adds test coverage; no new dependencies  
**Scale/Scope**: Single test file modification (`app/hooks/__tests__/useCascadingMenu.test.ts`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. TypeScript-First | PASS | No new code — tests only; existing hook already typed |
| II. Component-Driven | PASS | Tests target existing hook following established patterns |
| III. Test-First | PASS | This IS the test work — TDD cycle applies to any code changes |
| IV. Framework-Aware | PASS | Uses standard React testing patterns already in project |
| V. Simplicity & Maintainability | PASS | Minimal change: 3 new test cases in existing test file |
| VI. Spanish-First | N/A | No user-facing text changes (tests only) |
| Quality Gate 1: TS strict | PASS | No `any` introduced |
| Quality Gate 2: ESLint | PASS | Follows existing test patterns |
| Quality Gate 3: All tests pass | MUST VERIFY | Run after implementation |
| Quality Gate 4: No console.log | PASS | No console.log in tests |
| Quality Gate 5: Tests or waiver | PASS | New tests are the deliverable |
| Quality Gate 6: Lighthouse 90+ | PASS | No visual/performance regression expected |

## Project Structure

### Documentation (this feature)

```text
specs/007-enter-key-tests/
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
│   ├── useCascadingMenu.ts          # [NO CHANGE] selectFocusedItem already exists
│   └── __tests__/
│       └── useCascadingMenu.test.ts # [MODIFY] Add T028, T029, T030 tests
```

**Structure Decision**: Single frontend project (Next.js App Router). All changes within existing test file following established patterns. No production code changes needed — the `selectFocusedItem` callback already handles Enter key logic for both categories and channels with empty-list guards.

## Complexity Tracking

No constitution violations — this is a pure test coverage addition with no production code changes.
