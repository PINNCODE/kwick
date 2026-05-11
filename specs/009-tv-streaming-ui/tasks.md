# Tasks: TV Streaming Interface Overlay

**Input**: Design documents from `/specs/009-tv-streaming-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md

**Tests**: Constitution Principle III mandates TDD — all tasks include test-first workflow.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Components: `app/components/ui/`, `app/components/streaming-ui/`
- Hooks: `app/hooks/`
- Store: `app/store/`
- Types: `app/types/`
- Tests: `tests/unit/`, `tests/integration/`, `tests/contract/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing project structure and add feature-specific directories

- [x] T001 Verify existing Next.js 16.2.6 project structure matches plan.md paths
- [x] T002 [P] Create `app/components/streaming-ui/` directory
- [x] T003 [P] Create `app/store/` directory
- [x] T004 [P] Create `tests/integration/` directory if not present

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, state management, and shared UI primitives that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Define Category, Channel, Program, StreamingUIState interfaces in `app/types/streaming.ts`
- [x] T006 [P] Implement `useDebounce` hook in `app/hooks/use-debounce.ts`
- [x] T007 Create Zustand streaming UI store in `app/store/streaming-ui-store.ts` (depends on T005)
- [x] T008 [P] Unit test for streaming-ui-store in `tests/unit/streaming-ui-store.test.ts`
- [x] T012 [P] Unit test for GlassPanel in `tests/unit/GlassPanel.test.tsx`
- [x] T013 [P] Unit test for LiveBadge in `tests/unit/LiveBadge.test.tsx`
- [x] T014 [P] Unit test for StadiumBackground in `tests/unit/StadiumBackground.test.tsx`
- [x] T016 Contract test for Xtream API endpoints in `tests/contract/xtream-api-contract.test.ts` (depends on T015)

**Checkpoint**: Foundation ready — types, store, shared components, and API typing complete

---

## Phase 3: User Story 1 - Browse and Select TV Channels (Priority: P1) 🎯 MVP

**Goal**: User sees three glassmorphic panels over stadium background, can browse categories, select one to filter channels, and select a channel to highlight it

**Independent Test**: Open the streaming overlay, verify three panels render, select a category and confirm channel list filters, select a channel and confirm blue highlight appears

### Tests for User Story 1

- [x] T017 [P] [US1] Integration test for StreamingOverlay rendering in `tests/integration/StreamingOverlay.test.tsx`
- [x] T018 [P] [US1] Integration test for CategoriesPanel category selection in `tests/integration/CategoriesPanel.test.tsx`
- [x] T019 [P] [US1] Integration test for ChannelsPanel channel selection and highlighting in `tests/integration/ChannelsPanel.test.tsx`

### Implementation for User Story 1

- [x] T020 [US1] Implement CategoriesPanel component with scrollable category list in `app/components/streaming-ui/CategoriesPanel.tsx` (depends on T007, T009)
- [x] T021 [US1] Implement ChannelsPanel component with numbered list and inline 32x32 logos in `app/components/streaming-ui/ChannelsPanel.tsx` (depends on T007, T009)
- [x] T022 [US1] Implement StreamingOverlay parent component composing StadiumBackground + three panels in `app/components/streaming-ui/StreamingOverlay.tsx` (depends on T010, T011, T020, T021)
- [x] T023 [US1] Wire category selection to filter channels via Zustand store in `app/components/streaming-ui/CategoriesPanel.tsx` (depends on T020, FR-009)
- [x] T024 [US1] Wire channel selection to highlight and update store in `app/components/streaming-ui/ChannelsPanel.tsx` (depends on T021, FR-006)
- [x] T025 [US1] Add empty state message "No hay canales disponibles" when category has no channels (depends on T021)
- [x] T026 [US1] Add loading indicator between category transitions (depends on T020, T021)

**Checkpoint**: User Story 1 complete — user can browse categories, filter channels, and select a channel with visual feedback

---

## Phase 4: User Story 2 - View Program Schedule Information (Priority: P2)

**Goal**: Program guide panel displays current programs with time ranges, live badges for active broadcasts, and auto-refreshes every 15 minutes

**Independent Test**: Select a channel, verify program guide shows programs with start/end times, confirm "EN VIVO" badge appears for live programs, verify data refreshes on interval

### Tests for User Story 2

- [x] T027 [P] [US2] Unit test for use-program-guide hook polling behavior in `tests/unit/use-program-guide.test.ts`
- [x] T028 [P] [US2] Integration test for ProgramGuidePanel display and live badge in `tests/integration/ProgramGuidePanel.test.tsx`
- [x] T029 [US2] Implement `use-program-guide` SWR hook with 15-minute refresh interval in `app/hooks/use-program-guide.ts` (depends on T005, T015)
- [x] T030 [US2] Implement ProgramGuidePanel component with program list and time ranges in `app/components/streaming-ui/ProgramGuidePanel.tsx` (depends on T009, T010, T029)
- [x] T031 [US2] Wire ProgramGuidePanel to selected channel from Zustand store in `app/components/streaming-ui/ProgramGuidePanel.tsx` (depends on T007, T030, FR-010)
- [x] T032 [US2] Compute `isLive` flag and display red "EN VIVO" badge for active programs (depends on T030, T010, FR-008)
- [x] T033 [US2] Format Unix timestamps to 24-hour HH:MM→HH:MM display in `app/components/streaming-ui/ProgramGuidePanel.tsx` (depends on T030, FR-015)
- [x] T034 [US2] Add "Hora de fin por definir" fallback when program end time is missing (depends on T030)
- [x] T035 [US2] Add "Información del programa temporalmente no disponible" fallback when EPG data fails to load (depends on T030, FR-016)

**Checkpoint**: User Stories 1 AND 2 both work independently — full three-panel experience with live program guide

---

## Phase 5: User Story 3 - Navigate Category Hierarchy (Priority: P3)

**Goal**: Enhanced category navigation with featured/premium highlighting, smooth scrolling, debounce on rapid switching, and complete category structure support

**Independent Test**: Scroll through full category list, verify featured categories show blue highlight, rapidly switch categories and confirm debounced behavior with loading indicator

### Tests for User Story 3

- [x] T036 [P] [US3] Integration test for featured category highlighting in `tests/integration/CategoriesPanel.test.tsx` (extends T018)
- [x] T037 [P] [US3] Integration test for debounce behavior on rapid category switching in `tests/integration/CategoriesPanel.test.tsx` (extends T018)
- [x] T038 [US3] Implement `isFeatured` logic for category highlighting (World Cup 2026, Canales Premium, La Mansión VIP) in `app/components/streaming-ui/CategoriesPanel.tsx` (depends on T020, FR-004)
- [x] T039 [US3] Add bright blue visual emphasis styling for featured categories in `app/components/streaming-ui/CategoriesPanel.tsx` (depends on T038)
- [x] T040 [US3] Implement smooth scrolling for overflow category list in `app/components/streaming-ui/CategoriesPanel.tsx` (depends on T020, FR-003)
- [x] T041 [US3] Apply debounce (300ms) to category selection to prevent rapid switching flicker in `app/components/streaming-ui/CategoriesPanel.tsx` (depends on T006, T023)
- [x] T042 [US3] Support full category structure: World Cup 2026, La Mansión VIP, LCDF 2026, LCDFL Colombia, Eventos Deportivos, México + Vistos, USA, Locales MX, Noticias MX, Canales Premium, and subcategories (depends on T020, FR-013)

**Checkpoint**: All user stories complete — full category hierarchy with featured highlighting and smooth navigation

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, accessibility, and final validation

- [x] T043 [P] Add `prefers-reduced-motion` media query support for StadiumBackground animation in `app/components/ui/StadiumBackground.tsx`
- [x] T044 [P] Optimize channel logo images with Next.js Image component and WebP format in `app/components/streaming-ui/ChannelsPanel.tsx`
- [x] T045 [P] Verify Lighthouse scores 90+ across all metrics per constitution performance standards
- [x] T046 [P] Run ESLint and TypeScript strict mode compilation with zero errors
- [x] T047 Run full test suite and verify all tests pass
- [x] T048 Run quickstart.md validation — verify feature renders correctly in development mode
- [x] T049 [P] Add JSDoc comments to public components and hooks
- [x] T050 Remove any `console.log` statements from production code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — Depends on US1's StreamingOverlay structure for program guide integration
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — Extends CategoriesPanel from US1 with featured highlighting and debounce

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Constitution Principle III)
- Types before store
- Store before components
- Core components before integration wiring
- Story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T004 (Setup) can run in parallel
- T005, T006, T009, T010, T011 (Foundational types/hooks/UI primitives) can run in parallel
- T008, T012, T013, T014 (Foundational tests) can run in parallel after their components exist
- T017, T018, T019 (US1 tests) can run in parallel
- T027, T028 (US2 tests) can run in parallel
- T036, T037 (US3 tests) can run in parallel
- T043, T044, T045, T049 (Polish) can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all foundational UI primitives together:
Task T009: "Implement GlassPanel in app/components/ui/GlassPanel.tsx"
Task T010: "Implement LiveBadge in app/components/ui/LiveBadge.tsx"
Task T011: "Implement StadiumBackground in app/components/ui/StadiumBackground.tsx"

# Launch all foundational types/store together:
Task T005: "Define interfaces in app/types/streaming.ts"
Task T006: "Implement useDebounce in app/hooks/use-debounce.ts"
```

---

## Parallel Example: User Story 1

```bash
# Launch all US1 integration tests together:
Task T017: "Integration test for StreamingOverlay in tests/integration/StreamingOverlay.test.tsx"
Task T018: "Integration test for CategoriesPanel in tests/integration/CategoriesPanel.test.tsx"
Task T019: "Integration test for ChannelsPanel in tests/integration/ChannelsPanel.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (4 tasks)
2. Complete Phase 2: Foundational (12 tasks) — CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (10 tasks)
4. **STOP and VALIDATE**: Test three-panel overlay with category/channel selection
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (16 tasks)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) — 10 tasks
3. Add User Story 2 → Test independently → Deploy/Demo — 9 tasks
4. Add User Story 3 → Test independently → Deploy/Demo — 7 tasks
5. Polish → Final validation — 8 tasks
6. Each story adds value without breaking previous stories

### Total Task Count

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 1: Setup | 4 | Project directories |
| Phase 2: Foundational | 12 | Types, store, shared UI, API typing |
| Phase 3: US1 (P1) | 10 | Categories + Channels panels, overlay |
| Phase 4: US2 (P2) | 9 | Program guide, EPG hook, live badges |
| Phase 5: US3 (P3) | 7 | Featured highlighting, debounce, full categories |
| Phase 6: Polish | 8 | Performance, accessibility, validation |
| **Total** | **50** | |

### Parallel Opportunities Identified

- 3 parallel groups in Setup
- 5 parallel groups in Foundational
- 3 parallel test tasks in US1
- 2 parallel test tasks in US2
- 2 parallel test tasks in US3
- 4 parallel tasks in Polish

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- TDD mandatory per Constitution Principle III — tests fail before implementation
- All UI text in Spanish per Constitution Principle VI
- No new external dependencies — uses existing Zustand, SWR, Tailwind CSS v4
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
