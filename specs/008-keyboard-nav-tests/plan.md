# Implementation Plan: Keyboard Navigation Tests and Polish

**Branch**: `008-keyboard-nav-tests` | **Date**: 2026-05-10 | **Spec**: [specs/008-keyboard-nav-tests/spec.md](../spec.md)
**Input**: Feature specification from `/specs/008-keyboard-nav-tests/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add comprehensive test coverage for left arrow navigation (T021-T022), focus restoration when returning to categories (T023-T024), and polish/validation items: keyboard hint text (T027), preventDefault on arrow keys (T028), rapid key press handling (T029), focus indicator sync (T030), and quickstart validation (T034). The `useCascadingMenu` hook already implements `movePreviousPanel` and `showCategoriesView` — tests will verify these callbacks across the defined scenarios. Polish items validate UI hints and event handling in the consuming component.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js 16.2.6, React 19.2.4  
**Primary Dependencies**: React hooks (useState, useCallback), Jest + @testing-library/react  
**Storage**: N/A (in-memory React state only)  
**Testing**: Jest + @testing-library/react (see `app/hooks/__tests__/`)  
**Target Platform**: Modern web browsers (desktop)  
**Project Type**: Web application (Next.js App Router, `/player` page)  
**Performance Goals**: Arrow key response must be synchronous and instant; INP < 200ms  
**Constraints**: No changes to existing hook logic — tests only; no new dependencies  
**Scale/Scope**: Single test file modification (`app/hooks/__tests__/useCascadingMenu.test.ts`) + UI polish validation in consuming component

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. TypeScript-First | PASS | No new code — tests only; existing hook already typed |
| II. Component-Driven | PASS | Tests target existing hook following established patterns |
| III. Test-First | PASS | This IS the test work — TDD cycle applies to any code changes |
| IV. Framework-Aware | PASS | Uses standard React testing patterns already in project |
| V. Simplicity & Maintainability | PASS | Minimal change: new test cases in existing test file |
| VI. Spanish-First | N/A | No user-facing text changes (tests only); hint text already in Spanish |
| Quality Gate 1: TS strict | PASS | No `any` introduced |
| Quality Gate 2: ESLint | PASS | Follows existing test patterns |
| Quality Gate 3: All tests pass | MUST VERIFY | Run after implementation |
| Quality Gate 4: No console.log | PASS | No console.log in tests |
| Quality Gate 5: Tests or waiver | PASS | New tests are the deliverable |
| Quality Gate 6: Lighthouse 90+ | PASS | No visual/performance regression expected |

## Project Structure

### Documentation (this feature)

```text
specs/008-keyboard-nav-tests/
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
│   ├── useCascadingMenu.ts          # [NO CHANGE] movePreviousPanel, showCategoriesView already exist
│   └── __tests__/
│       └── useCascadingMenu.test.ts # [MODIFY] Add T021-T024, T027-T030, T034 tests
├── components/
│   └── CascadingMenu.tsx            # [VERIFY] Check hint text visibility (T027)
└── player/
    └── page.tsx                     # [VERIFY] Check keyboard event handling (T028, T029, T030)
```

**Structure Decision**: Single frontend project (Next.js App Router). All test changes within existing test file following established patterns from specs 006/007. Polish items (T027-T030) require verification of existing UI component behavior rather than new code.

## Complexity Tracking

No constitution violations — this is a pure test coverage addition with UI polish validation. No production code changes expected.
