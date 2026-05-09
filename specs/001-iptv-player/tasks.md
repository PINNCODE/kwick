# Tasks: IPTV Player with Xtream Codes

**Input**: Design documents from `/specs/001-iptv-player/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/, quickstart.md

**Tests**: Tests are NOT included (per specification request)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Phase 1: Setup

**Purpose**: Project initialization and dependency installation

- [ ] T001 Install required dependencies in package.json: hls.js, swr, zustand, clsx, tailwind-merge
- [ ] T002 [P] Create TypeScript type definitions in app/types/xtream.ts (Category, LiveStream, UserInfo interfaces)
- [ ] T003 [P] Create TypeScript type definitions in app/types/player.ts (PlayerState, PlayerError, LastChannel, ErrorLog interfaces)
- [ ] T004 Create storage utilities in app/lib/storage.ts (LocalStorage and SessionStorage wrappers)
- [ ] T005 Create error analytics utilities in app/lib/error-analytics.ts (Error logging and statistics aggregation)

---

## Phase 2: Foundational

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create Xtream API client in app/lib/xtream-api.ts (HTTP client with methods for health, auth, categories, streams)
- [ ] T007 [P] Create API route handler in app/api/xtream/health/route.ts (POST endpoint for connectivity validation with 5s timeout)
- [ ] T008 [P] Create API route handler in app/api/xtream/auth/route.ts (POST endpoint for authentication proxy)
- [ ] T009 [P] Create API route handler in app/api/xtream/categories/route.ts (GET endpoint with 5min SWR cache)
- [ ] T010 Create API route handler in app/api/xtream/streams/route.ts (GET endpoint with category_id filter and 5min SWR cache)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Login and Authentication (Priority: P1) 🎯 MVP

**Goal**: Implement login screen with connectivity validation, authentication, and credential persistence

**Independent Test**: Verify login form validates host connectivity (5s timeout), authenticates with Xtream API, persists credentials to LocalStorage, and auto-logs in on subsequent visits

### Implementation for User Story 1

- [ ] T011 Create Zustand auth store in app/hooks/useXtreamAuth.ts (authentication state, login/logout methods, credential persistence)
- [ ] T012 [P] Create LoginForm component in app/components/auth/LoginForm.tsx (host, username, password inputs with validation, connectivity check, loading states)
- [ ] T013 Create login page in app/(auth)/login/page.tsx (fullscreen layout, form submission handler, error display)
- [ ] T014 Implement auto-login logic in app/hooks/useXtreamAuth.ts (check LocalStorage on mount, validate stored credentials)
- [ ] T015 Add error handling for connectivity failures in app/components/auth/LoginForm.tsx (timeout messages, retry option)

**Checkpoint**: At this point, User Story 1 should be fully functional - user can login with validation and credentials persist

---

## Phase 4: User Story 2 - Auto-Play and Channel Persistence (Priority: P1) 🎯 MVP

**Goal**: Implement automatic playback of first channel, immediate persistence of channel changes, and recovery of last channel on refresh

**Independent Test**: Verify auto-play starts first channel on login, channel changes are saved to LocalStorage immediately, and last channel resumes on page refresh (with fallback to first available if deleted)

### Implementation for User Story 2

- [ ] T016 Create channel persistence hook in app/hooks/useChannelPersistence.ts (saveLastChannel, getLastChannel, autoPlayChannel functions)
- [ ] T017 [P] Create VideoPlayer component in app/components/player/VideoPlayer.tsx (HLS.js integration, video element, loading states)
- [ ] T018 Create HLS player hook in app/hooks/useHlsPlayer.ts (initialize hls.js, handle manifests, quality selection, error callbacks)
- [ ] T019 Create main player page in app/(player)/page.tsx (fullscreen layout, auto-play logic, channel persistence integration)
- [ ] T020 Implement channel recovery on refresh in app/(player)/page.tsx (check lastChannel on mount, fallback to first channel if not available)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - login auto-plays first channel, channel changes persist, and refresh recovers last channel

---

## Phase 5: User Story 3 - Keyboard Navigation (Priority: P1) 🎯 MVP

**Goal**: Implement semi-transparent menu overlay with full keyboard navigation (M/Esc toggle, arrows for navigation, Enter to select)

**Independent Test**: Verify menu opens/closes with M/Esc keys, arrow keys navigate categories and channels, Enter selects and closes menu, and video continues playing while menu is open

### Implementation for User Story 3

- [ ] T021 Create keyboard navigation hook in app/hooks/useKeyboardNavigation.ts (event listeners for M/Esc, arrows, Enter, focus management)
- [ ] T022 [P] Create MenuOverlay component in app/components/menu/MenuOverlay.tsx (semi-transparent backdrop, visibility state)
- [ ] T023 [P] Create CategoryList component in app/components/menu/CategoryList.tsx (horizontal or vertical list, arrow key navigation, selection state)
- [ ] T024 [P] Create ChannelGrid component in app/components/menu/ChannelGrid.tsx (grid layout of channels, arrow navigation within and between categories)
- [ ] T025 Integrate menu into player page in app/(player)/page.tsx (menu state management, current channel highlighting, channel selection handler)

**Checkpoint**: At this point, all core functionality works - login, playback, and keyboard navigation are complete

---

## Phase 6: User Story 4 - Error Handling and Recovery (Priority: P2)

**Goal**: Implement 3 automatic retries with exponential backoff, toast notifications, and error statistics persistence

**Independent Test**: Verify stream errors trigger 3 retries with 1s-2s-4s delays, toast shows "Reconectando..." during retries and auto-dismisses on recovery, persistent toast on final failure, and errors are logged to LocalStorage statistics

### Implementation for User Story 4

- [ ] T026 Create ErrorToast component in app/components/player/ErrorToast.tsx (notification display, auto-dismiss logic, persistent errors)
- [ ] T027 Implement retry logic with backoff in app/hooks/useHlsPlayer.ts (3 attempts with exponential delays: 1s, 2s, 4s, callback for each retry)
- [ ] T028 Create toast system integration in app/components/player/VideoPlayer.tsx (show toast on error, hide on recovery, persistent error state)
- [ ] T029 Integrate error analytics in app/hooks/useHlsPlayer.ts (log errors with channel info, track retry count, record resolution time)
- [ ] T030 Add error statistics display (optional debug view) in app/components/player/ErrorToast.tsx or separate component (show error count by type, channel, average resolution time)

**Checkpoint**: All user stories should now be independently functional with robust error handling

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T031 [P] Add visual focus indicators in app/components/menu/CategoryList.tsx and ChannelGrid.tsx (highlight selected item, ensure visibility against video background)
- [ ] T032 [P] Implement smooth transitions in app/components/menu/MenuOverlay.tsx (fade in/out, slide animations)
- [ ] T033 Optimize performance in app/hooks/useChannels.ts (lazy load channels, virtualize long lists if needed)
- [ ] T034 Add loading skeletons in app/components/player/VideoPlayer.tsx and app/components/auth/LoginForm.tsx (improve perceived performance)
- [ ] T035 Final code review and cleanup (remove console.logs, ensure TypeScript strict mode, verify no unused imports)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (Login)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (Auto-play)**: Can start after Foundational (Phase 2) - Depends on US1 for authentication context
- **User Story 3 (Navigation)**: Can start after Foundational (Phase 2) - Depends on US2 for player integration
- **User Story 4 (Errors)**: Can start after Foundational (Phase 2) - Depends on US2 for player component

### Within Each User Story

- Models/stores before components
- Components before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 2

```bash
# Launch all components for User Story 2 together:
Task: "Create channel persistence hook in app/hooks/useChannelPersistence.ts"
Task: "Create VideoPlayer component in app/components/player/VideoPlayer.tsx"

# Launch hooks in parallel:
Task: "Create HLS player hook in app/hooks/useHlsPlayer.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Login)
4. Complete Phase 4: User Story 2 (Auto-play)
5. Complete Phase 5: User Story 3 (Navigation)
6. **STOP and VALIDATE**: Test core functionality end-to-end
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test login flow independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test playback and persistence → Deploy/Demo
4. Add User Story 3 → Test navigation → Deploy/Demo
5. Add User Story 4 → Test error handling → Deploy/Demo
6. Add Phase 7 Polish → Final refinement → Deploy/Demo
7. Each story adds value without breaking previous stories

### Sequential Development (Single Developer)

With one developer, work sequentially:

1. Phase 1: Setup (T001-T005)
2. Phase 2: Foundational (T006-T010)
3. Phase 3: US1 - Login (T011-T015)
4. Phase 4: US2 - Auto-play (T016-T020)
5. Phase 5: US3 - Navigation (T021-T025)
6. Phase 6: US4 - Errors (T026-T030)
7. Phase 7: Polish (T031-T035)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Total tasks: 35
- Tasks with [P] marker: 14 (parallelizable)
