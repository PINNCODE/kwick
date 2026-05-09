# Implementation Plan: Landing Page TV App

**Branch**: `002-landing-page-app` | **Date**: 2026-05-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-landing-page-tv-app/spec.md`

## Summary

Build a modern, high-converting landing page at the root path (`/`) that communicates Kwick's value proposition of simple, TV-only streaming. The page will feature a prominent hero section with clear messaging in Spanish, a direct login CTA, visual mockup of the player interface, and 3-5 benefit cards. Implementation uses Next.js App Router server components for optimal performance, Tailwind CSS for styling, and achieves 90+ Lighthouse scores through image optimization, font optimization, and minimal JavaScript.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode  
**Primary Dependencies**: Next.js 16.2.6, React 19.2.4, Tailwind CSS v4  
**Storage**: N/A (static content, no persistent data)  
**Testing**: Component tests with React Testing Library (to be added)  
**Target Platform**: Web (desktop, tablet, mobile browsers)  
**Project Type**: Web application (Next.js)  
**Performance Goals**: Lighthouse 90+, LCP < 2.5s, CLS < 0.1, INP < 200ms  
**Constraints**: Must maintain existing auth system, Spanish content only, no breaking changes to `/login` or `/player` routes  
**Scale/Scope**: Single landing page with 7 sections, ~50-100 lines per section component

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **I. TypeScript-First** | ✅ PASS | All components will be TypeScript with strict types, interfaces for props |
| **II. Component-Driven** | ✅ PASS | Landing page built from reusable components (Hero, Benefits, CTA, etc.) |
| **III. Test-First (TDD)** | ⚠️ DEFERRED | Tests will be added in `/speckit.tasks` phase; Red-Green-Refactor during implementation |
| **IV. Framework-Aware** | ✅ PASS | Using Next.js 16 App Router patterns, server components where possible |
| **V. Simplicity** | ✅ PASS | Minimal dependencies, no over-engineering, YAGNI principle applied |

**Gate Status**: ✅ PASS (TDD deferred to implementation phase per workflow)

## Project Structure

### Documentation (this feature)

```text
specs/002-landing-page-tv-app/
├── plan.md              # This file
├── research.md          # Phase 0 output (below)
├── data-model.md        # Phase 1 output (N/A - no data entities)
├── quickstart.md        # Phase 1 output (below)
├── contracts/           # Phase 1 output (N/A - no external contracts)
└── tasks.md             # Phase 2 output (future)
```

### Source Code (repository root)

```text
app/
├── page.tsx             # NEW: Landing page (replaces current auth redirect)
├── layout.tsx           # EXISTING: Update metadata for landing page
├── (auth)/
│   └── login/
│       └── page.tsx     # EXISTING: Unchanged
└── components/
    ├── landing/         # NEW: Landing page components
    │   ├── Hero.tsx
    │   ├── BenefitsSection.tsx
    │   ├── AppPreviewSection.tsx
    │   ├── HowItWorksSection.tsx
    │   ├── TestimonialsSection.tsx
    │   ├── FinalCTA.tsx
    │   └── Footer.tsx
    ├── ui/              # NEW: Reusable UI components
    │   ├── Button.tsx
    │   ├── Section.tsx
    │   └── Toast.tsx    # Move/adapt from ErrorToast
    ├── auth/
    │   └── LoginForm.tsx # EXISTING: Unchanged
    └── player/
        └── VideoPlayer.tsx # EXISTING: Unchanged
```

**Structure Decision**: Single project structure with new `components/landing/` directory for feature-specific components and `components/ui/` for reusable UI primitives. This maintains separation of concerns while keeping related components co-located.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | No violations requiring justification |

---

## Phase 0: Research

### Research Summary

**Objective**: Resolve all technical unknowns and establish best practices for landing page implementation.

---

### Decision 1: Landing Page Structure

**Decision**: 7-section structure (Hero, Trust Bar, Benefits, App Preview, How It Works, Testimonials, Final CTA + Footer)

**Rationale**: 
- Matches industry best practices for SaaS/web app landing pages
- Prioritizes value proposition above the fold (Hero + Login CTA)
- Visual proof section (App Preview) builds credibility
- Progressive disclosure keeps initial load simple

**Alternatives Considered**:
- Minimal 3-section (Hero, Benefits, CTA): Rejected for lacking visual proof
- Long-form sales page: Rejected as inconsistent with "simplicity" brand

---

### Decision 2: Login CTA Strategy

**Decision**: Dual placement - Primary button in hero (top-right nav) + sticky header on scroll

**Rationale**:
- Highest conversion rate for above-fold placement
- Sticky header ensures CTA always accessible during scroll
- Aligns with FR-003 (prominent, always-visible login button)

**Alternatives Considered**:
- Single hero button only: Rejected (loses visibility on scroll)
- Floating action button (mobile): Rejected (adds complexity, lower conversion)

---

### Decision 3: Visual Mockup Approach

**Decision**: Static screenshot mockup with semi-transparent channel grid overlay

**Rationale**:
- Shows both player interface AND channel selection simplicity
- Can be generated from existing app (no illustration needed)
- Lightweight (optimized WebP) vs. video/auto-play alternatives

**Alternatives Considered**:
- Auto-playing video demo: Rejected (performance impact, LCP penalty)
- Interactive demo: Rejected (complexity, scope creep)
- Static player only: Rejected (doesn't show channel navigation)

---

### Decision 4: Performance Optimization Strategy

**Decision**: Server Components + Next.js Image + Font Optimization

**Rationale**:
- Server Components eliminate client-side JS for static content
- Next.js Image provides automatic WebP/AVIF conversion
- next/font handles font subsetting and preload automatically
- Achieves 90+ Lighthouse without manual optimization

**Key Techniques**:
- `priority` prop on hero image for LCP optimization
- `loading="lazy"` on below-fold images
- Explicit width/height to prevent CLS
- `fetchPriority="high"` for critical resources
- Prefetch `/login` route for instant navigation

---

### Decision 5: Responsive Design Strategy

**Decision**: Mobile-first with Tailwind breakpoints + fluid typography

**Rationale**:
- Mobile-first ensures touch-friendly targets (44px minimum)
- Tailwind breakpoints (sm, md, lg, xl) cover all device sizes
- Fluid typography (`clamp()`) provides smooth scaling
- Container queries for component-level responsiveness

**Breakpoint Strategy**:
- Mobile (base): Single column, stacked content, full-width buttons
- Tablet (sm, 640px): Two-column benefits grid
- Desktop (lg, 1024px): Hero with side-by-side text + mockup

---

### Decision 6: Authentication State Handling

**Decision**: Auto-redirect authenticated users after 3 seconds with dismissible banner

**Rationale**:
- Respects simplicity principle (fastest path to content)
- 3-second delay prevents disorientation
- "Stay on page" option gives user control
- Implemented via client-side check on landing page mount

**Implementation Pattern**:
```tsx
useEffect(() => {
  checkStoredAuth();
}, []);

useEffect(() => {
  if (isAuthenticated) {
    const timer = setTimeout(() => {
      router.push('/player');
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [isAuthenticated]);
```

---

## Phase 1: Design & Contracts

### Data Model

**Status**: N/A

This feature does not introduce new data entities. The landing page is static content with no user-generated data, database interactions, or state persistence beyond existing authentication.

**Existing Entities Used**:
- User authentication state (from `useXtreamAuth` hook)
- No new entities required

---

### Interface Contracts

**Status**: N/A (Internal UI Only)

This feature does not expose external APIs or interfaces. All interactions are internal UI navigation:
- `/` → Landing page (new)
- `/login` → Existing login page (unchanged)
- `/player` → Existing player page (unchanged)

---

### Quickstart Guide

```markdown
# Quickstart: Landing Page Development

## Prerequisites

- Node.js 18+ installed
- Existing Kwick development environment set up
- Familiarity with Next.js App Router and Tailwind CSS

## Setup (5 minutes)

```bash
# Ensure you're on the feature branch
git checkout 002-landing-page-app

# Install dependencies (if any new ones added)
npm install

# Start development server
npm run dev
```

## Development Workflow

### 1. Create Component Files

Start with the Hero section:

```bash
# Create landing components directory
mkdir -p app/components/landing
mkdir -p app/components/ui
```

### 2. Implement in Order

Recommended implementation sequence:

1. **UI Primitives** (`components/ui/`):
   - `Button.tsx` - Extract from existing LoginForm
   - `Section.tsx` - Wrapper with consistent padding

2. **Landing Sections** (`components/landing/`):
   - `Hero.tsx` - Value prop + login CTA
   - `BenefitsSection.tsx` - 3-5 benefit cards
   - `AppPreviewSection.tsx` - Visual mockup
   - `Footer.tsx` - Simple footer

3. **Main Page**:
   - Update `app/page.tsx` - Replace auth redirect with landing page
   - Update `app/layout.tsx` - Metadata for SEO

### 3. Test Locally

```bash
# Run dev server
npm run dev

# Test at http://localhost:3000
# - Verify login button navigates to /login
# - Test responsive design (mobile, tablet, desktop)
# - Run Lighthouse audit (target: 90+)
```

### 4. Performance Checklist

Before committing:

- [ ] Lighthouse score 90+ on mobile and desktop
- [ ] LCP < 2.5s (check in Lighthouse)
- [ ] CLS < 0.1 (no layout shifts)
- [ ] All images optimized (WebP format, < 200KB)
- [ ] Login CTA visible without scrolling
- [ ] Touch targets ≥ 44px on mobile
- [ ] Spanish content reviewed for accuracy

## Testing

```bash
# Run existing tests (ensure no regressions)
npm test

# Add component tests (during implementation phase)
# Tests will be defined in /speckit.tasks phase
```

## Deployment

```bash
# Build for production
npm run build

# Check for errors
npm run lint
```

## Key Files to Create

```
app/
├── page.tsx                    # MODIFY: Replace with landing page
├── layout.tsx                  # MODIFY: Update metadata
└── components/
    ├── landing/                # CREATE
    │   ├── Hero.tsx
    │   ├── BenefitsSection.tsx
    ├── ui/                     # CREATE
    │   ├── Button.tsx
    │   └── Section.tsx
```

## Common Issues

**Issue**: Hero image causes layout shift  
**Solution**: Add explicit `width` and `height` props to Next.js Image component

**Issue**: Login button not visible on mobile  
**Solution**: Ensure sticky header has proper z-index and mobile padding

**Issue**: Lighthouse score below 90  
**Solution**: Check image sizes, remove unused JavaScript, verify font optimization

---

## Next Steps

After quickstart:
1. Review this plan (`plan.md`) for implementation details
2. Run `/speckit.tasks` to generate task breakdown
3. Implement following TDD workflow (Red-Green-Refactor)
```

---

## Constitution Check (Post-Design)

*Re-evaluation after Phase 1 design completion*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **I. TypeScript-First** | ✅ PASS | All components defined with TypeScript interfaces |
| **II. Component-Driven** | ✅ PASS | Modular component architecture with clear boundaries |
| **III. Test-First (TDD)** | ⚠️ PENDING | Tests to be written during implementation phase |
| **IV. Framework-Aware** | ✅ PASS | Server Components, Next.js Image, App Router patterns |
| **V. Simplicity** | ✅ PASS | Minimal components, no over-engineering, YAGNI |

**Gate Status**: ✅ PASS - Ready for implementation planning

---

## Agent Context Update

**Action Required**: Update `AGENTS.md` to reference this plan file between the `<!-- SPECKIT START -->` and `<!-- SPECKIT END -->` markers.

**Current Plan Reference**: `specs/002-landing-page-tv-app/plan.md`

---

## Next Command

Run `/speckit.tasks` to generate the task breakdown with TDD workflow.
