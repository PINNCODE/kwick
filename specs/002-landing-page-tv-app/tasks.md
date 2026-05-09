# Tasks: Landing Page TV App

**Input**: Design documents from `/specs/002-landing-page-tv-app/`  
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md  
**Tests**: NOT included - tests deferred to implementation phase per constitution check  
**Organization**: Tasks grouped by user story for independent implementation and testing

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4])
- Include exact file paths in descriptions

## Path Conventions

Single project structure with Next.js App Router:
- `app/` - Main application directory
- `app/components/landing/` - Landing page specific components
- `app/components/ui/` - Reusable UI primitives
- `app/(auth)/` - Existing authentication routes (unchanged)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure

- [X] T001 [P] Create `app/components/landing/` directory for landing page components
- [X] T002 [P] Create `app/components/ui/` directory for reusable UI primitives
- [X] T003 Verify Next.js dev server runs with `npm run dev`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI primitives that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create `app/components/ui/Button.tsx` - Extract button styles from LoginForm with variants (primary, secondary) and sizes
- [X] T005 [P] Create `app/components/ui/Section.tsx` - Wrapper component with consistent padding and responsive container
- [X] T006 [P] Create `app/components/ui/Toast.tsx` - Adapt ErrorToast for general notifications (success, info, warning)
- [X] T007 Verify all UI primitives compile without TypeScript errors

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Discover App Value Proposition (Priority: P1) 🎯 MVP

**Goal**: Create hero section with clear value proposition visible within 3 seconds

**Independent Test**: Visit landing page and verify headline explains TV-only streaming without scrolling

### Implementation for User Story 1

- [X] T008 [P] [US1] Create `app/components/landing/Hero.tsx` - Hero section with headline, subheadline, and login CTA
- [X] T009 [US1] Implement Spanish headline in Hero.tsx: "TV Simple. Sin Distracciones."
- [X] T010 [US1] Implement Spanish subheadline in Hero.tsx emphasizing TV-only focus (no VOD, no complex menus)
- [X] T011 [US1] Add fluid typography with clamp() for responsive headline sizing in Hero.tsx
- [X] T012 [US1] Integrate Button component in Hero.tsx for login CTA with proper styling
- [X] T013 [US1] Add semantic HTML structure (section, h1, p) for SEO in Hero.tsx

**Checkpoint**: User Story 1 complete - Hero section displays value proposition clearly

---

## Phase 4: User Story 2 - Quick Access to Login (Priority: P1)

**Goal**: Prominent login button always visible, navigates to /login in 1 click

**Independent Test**: Verify login button visible on page load, clicking navigates to /login, touch target ≥ 44px on mobile

### Implementation for User Story 2

- [X] T014 [P] [US2] Create `app/components/landing/Navbar.tsx` - Sticky header with logo and login button
- [X] T015 [US2] Implement Next.js Link in Navbar.tsx for login button navigation to /login
- [X] T016 [US2] Add sticky positioning to Navbar.tsx (sticky top-0, z-50, backdrop-blur)
- [X] T017 [US2] Ensure login button has minimum 44x44px touch target in Navbar.tsx
- [ ] T018 [P] [US2] Create `app/components/landing/FinalCTA.tsx` - Secondary login CTA at bottom of page
- [X] T019 [US2] Integrate Navbar.tsx into main landing page layout
- [ ] T020 [US2] Verify login button contrast meets WCAG AA standards

**Checkpoint**: User Story 2 complete - Login accessible from any point on page

---

## Phase 5: User Story 3 - Visual Demonstration of Simplicity (Priority: P2)

**Goal**: Visual mockup showing clean player interface with channel grid overlay

**Independent Test**: Scroll to App Preview section and verify mockup shows player with channel navigation

### Implementation for User Story 3

- [X] T021 [P] [US3] Create `app/components/landing/AppPreviewSection.tsx` - Section showcasing app interface
- [ ] T022 [US3] Create or capture mockup image showing player with channel grid overlay (save to `public/images/`)
- [ ] T023 [US3] Implement Next.js Image component in AppPreviewSection.tsx with optimized WebP format
- [ ] T024 [US3] Add explicit width/height props to Image component to prevent CLS
- [ ] T025 [US3] Add priority prop to hero mockup Image for LCP optimization
- [X] T026 [US3] Add caption in Spanish explaining simplicity shown in mockup
- [ ] T027 [US3] Implement lazy loading for below-fold images with loading="lazy"

**Checkpoint**: User Story 3 complete - Visual proof of simple interface displayed

---

## Phase 6: User Story 4 - Understand Key Benefits (Priority: P2)

**Goal**: 3-5 benefit cards scannable in under 10 seconds, mix of speed/quality/content

**Independent Test**: Verify benefits section displays 3-5 cards, user can identify 3+ advantages after scanning

### Implementation for User Story 4

- [X] T028 [P] [US4] Create `app/components/landing/BenefitsSection.tsx` - Grid layout for benefit cards
- [X] T029 [P] [US4] Create `app/components/landing/BenefitCard.tsx` - Reusable card component with icon, title, description
- [X] T030 [US4] Implement 3-5 benefit cards with Spanish content (mix of speed, quality, content focus)
- [X] T031 [US4] Add responsive grid layout (1 col mobile, 2 tablet, 3 desktop) in BenefitsSection.tsx
- [X] T032 [US4] Add icons to each BenefitCard (use existing icon library or SVG)
- [X] T033 [US4] Ensure cards are scannable with clear visual hierarchy and whitespace

**Checkpoint**: User Story 4 complete - Benefits clearly communicated in scannable format

---

## Phase 7: Additional Landing Page Sections (Supporting)

**Purpose**: Complete the 7-section landing page structure per research findings

### Trust Bar Section

- [X] T034 [P] Create `app/components/landing/TrustBar.tsx` - Social proof section (optional: stats, features logos)
- [X] T035 [P] Add simple trust indicators (e.g., "Sin registro", "Acceso inmediato", "Compatible con tu proveedor")

### How It Works Section

- [X] T036 [P] Create `app/components/landing/HowItWorksSection.tsx` - Simple 3-step process
- [X] T037 Implement Spanish steps: 1) Ingresa tus credenciales, 2) Explora canales, 3) Disfruta

### Testimonials Section (Optional)

- [ ] T038 Create `app/components/landing/TestimonialsSection.tsx` - User quotes (can use placeholder content)

### Footer Section

- [X] T039 [P] Create `app/components/landing/Footer.tsx` - Simple footer with copyright
- [X] T040 Add minimal links and copyright in Spanish

---

## Phase 8: Main Page Assembly & Auth Integration

**Purpose**: Assemble all sections into main landing page and handle authenticated users

### Main Page Assembly

- [X] T041 [P] Update `app/page.tsx` - Replace auth redirect with landing page component assembly
- [X] T042 Import all section components in page.tsx
- [X] T043 Assemble sections in order: Navbar, Hero, TrustBar, Benefits, AppPreview, HowItWorks, Testimonials, FinalCTA, Footer
- [X] T044 Update `app/layout.tsx` - Metadata for SEO (title: "Kwick - TV Simple", description in Spanish)

### Authenticated User Handling

- [X] T045 [P] Create `app/components/landing/AuthRedirectBanner.tsx` - Banner for authenticated users with 3s auto-redirect
- [X] T046 Implement useEffect with checkStoredAuth() in landing page
- [X] T047 Implement 3-second timer with router.push('/player') for authenticated users
- [X] T048 Add "Stay on page" dismiss button to AuthRedirectBanner.tsx
- [X] T049 Add conditional rendering: show banner only when isAuthenticated is true

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, responsive testing, final validation

### Performance Optimization

- [ ] T050 [P] Add resource hints in layout.tsx (preconnect to fonts.googleapis.com, prefetch /login)
- [ ] T051 Verify all images optimized (WebP format, < 200KB for hero)
- [ ] T052 Run Lighthouse audit on desktop (target: 90+)
- [ ] T053 Run Lighthouse audit on mobile (target: 90+)
- [ ] T054 Fix any CLS issues (verify all images have explicit dimensions)

### Responsive Testing

- [ ] T055 [P] Test landing page on mobile viewport (320px - 767px)
- [ ] T056 Test landing page on tablet viewport (768px - 1023px)
- [ ] T057 Test landing page on desktop viewport (1024px+)
- [ ] T058 Verify all touch targets ≥ 44px on mobile
- [ ] T059 Verify login button visible without scrolling on all viewports

### Content & Accessibility

- [ ] T060 [P] Review all Spanish content for accuracy and tone
- [ ] T061 Verify color contrast meets WCAG AA standards
- [ ] T062 Add alt text to all images in Spanish
- [ ] T063 Test keyboard navigation through landing page
- [ ] T064 Verify semantic HTML structure (h1, h2, section, nav, footer)

### Final Validation

- [ ] T065 Run `npm run build` and verify no errors
- [ ] T066 Run `npm run lint` and fix all warnings
- [ ] T067 Test authenticated user redirect flow (3s delay + banner)
- [ ] T068 Test login button navigation from multiple positions (navbar, hero, final CTA)
- [ ] T069 Quickstart.md validation - verify all steps work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational completion
  - Can proceed in parallel once Phase 2 complete
  - Or sequentially: US1 → US2 → US3 → US4 (recommended for single developer)
- **Additional Sections (Phase 7)**: Can run parallel to user stories
- **Main Page Assembly (Phase 8)**: Depends on all section components complete
- **Polish (Phase 9)**: Depends on all implementation complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 (Button, Section components) - No dependencies on other stories
- **US2 (P1)**: Depends on Phase 2 (Button component) - Independent of US1
- **US3 (P2)**: Depends on Phase 2 (Section component) - Independent of US1/US2
- **US4 (P2)**: Depends on Phase 2 (Section component) - Independent of US1/US2/US3

### Within Each User Story

- Models/components before integration
- Core implementation before polish
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T001, T002, T003 can all run in parallel
- **Phase 2**: T004, T005, T006, T007 can all run in parallel
- **User Stories**: Once Phase 2 complete, US1, US2, US3, US4 can all run in parallel (different files)
- **Phase 7**: TrustBar, HowItWorks, Testimonials, Footer can all run in parallel
- **Phase 8**: T041-T044 can run in parallel with T045-T049 (different files)
- **Phase 9**: Performance, responsive, content tasks can run in parallel

---

## Parallel Example: User Story 1

```bash
# All US1 tasks can run in parallel (different files):
Task: "Create Hero.tsx component"
Task: "Implement Spanish headline"
Task: "Implement Spanish subheadline"
Task: "Add fluid typography"
# These can be done by different developers simultaneously
```

---

## Parallel Example: Multiple User Stories

```bash
# Once Phase 2 (Foundational) is complete:
Developer A: User Story 1 (Hero section - T008 to T013)
Developer B: User Story 2 (Navbar & CTA - T014 to T020)
Developer C: User Story 3 (App Preview - T021 to T027)
Developer D: User Story 4 (Benefits - T028 to T033)
# All stories can proceed in parallel - different files, no dependencies
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007) - **CRITICAL**
3. Complete Phase 3: User Story 1 (T008-T013) - Hero with value prop
4. Complete Phase 4: User Story 2 (T014-T020) - Login button
5. **STOP and VALIDATE**: Test MVP independently
   - Can users see value proposition?
   - Can users click login button?
   - Does it navigate to /login?
6. Deploy MVP if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 + US2 → Test independently → Deploy/Demo (MVP!)
3. Add US3 → Test independently → Deploy/Demo
4. Add US4 → Test independently → Deploy/Demo
5. Add Phase 7 sections → Polish → Final launch

### Single Developer Strategy (Recommended)

1. Day 1: Phase 1 + Phase 2 (Setup + Foundation)
2. Day 2: Phase 3 (US1 - Hero) + Phase 4 (US2 - Login)
3. Day 3: Phase 5 (US3 - Visual) + Phase 6 (US4 - Benefits)
4. Day 4: Phase 7 (Additional sections) + Phase 8 (Assembly)
5. Day 5: Phase 9 (Polish + Validation)

### Parallel Team Strategy

With 2-4 developers:
1. Team completes Setup + Foundational together
2. Once Foundational done:
   - Dev A: User Story 1 (Hero)
   - Dev B: User Story 2 (Navbar + CTA)
   - Dev C: User Story 3 (App Preview)
   - Dev D: User Story 4 (Benefits)
3. Reconvene for Phase 8 (Assembly) and Phase 9 (Polish)

---

## Task Summary

| Phase | Task Count | Description |
|-------|------------|-------------|
| Phase 1: Setup | 3 tasks | Directory structure |
| Phase 2: Foundational | 4 tasks | UI primitives (blocks all stories) |
| Phase 3: US1 (P1) | 6 tasks | Hero section with value prop |
| Phase 4: US2 (P1) | 7 tasks | Login button & navigation |
| Phase 5: US3 (P2) | 7 tasks | Visual mockup section |
| Phase 6: US4 (P2) | 6 tasks | Benefits cards section |
| Phase 7: Additional | 7 tasks | Trust, How It Works, Footer |
| Phase 8: Assembly | 9 tasks | Main page + auth integration |
| Phase 9: Polish | 20 tasks | Performance, responsive, validation |
| **Total** | **69 tasks** | Complete landing page implementation |

### MVP Scope (Minimum)

- Phase 1: Setup (3 tasks)
- Phase 2: Foundational (4 tasks)
- Phase 3: US1 (6 tasks) - Hero with value prop
- Phase 4: US2 (7 tasks) - Login button
- **MVP Total: 20 tasks**

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- Spanish content throughout (per spec requirements)
- No tests included - deferred to implementation phase per constitution
