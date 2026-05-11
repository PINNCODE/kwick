# Implementation Plan: TV Streaming Interface Overlay

**Branch**: `009-tv-streaming-ui` | **Date**: 2026-05-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-tv-streaming-ui/spec.md`

## Summary

Implement a three-panel TV streaming interface overlay (Categories, Channels, Program Guide) with glassmorphic styling and blue neon accents, displayed over an animated nighttime soccer stadium background. The panels cascade: category selection filters channels, channel selection updates the program guide. Uses existing Xtream API for channel/program data, Zustand for state management, and Tailwind CSS v4 for styling.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode  
**Primary Dependencies**: Next.js 16.2.6, React 19.2.4, Zustand 5.0.13, SWR 2.4.1, Tailwind CSS v4  
**Storage**: N/A (UI overlay only, data fetched from Xtream API)  
**Testing**: Jest with @testing-library/react  
**Target Platform**: Desktop/large screen browsers (TV or monitor)  
**Project Type**: Next.js web application (UI feature addition)  
**Performance Goals**: Panels render within 2s; LCP < 2.5s; CLS < 0.1  
**Constraints**: JS bundle < 200KB gzipped; background animation CSS-only (no video); 15-min polling for program guide  
**Scale/Scope**: Single-page overlay feature; ~100+ channels across ~11 categories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. TypeScript-First | PASS | All components, hooks, stores, and types will be strictly typed |
| II. Component-Driven | PASS | Each panel is a self-contained React component with explicit props interface |
| III. Test-First | PASS | Unit tests for hooks/stores; integration tests for panel components |
| IV. Framework-Aware | PASS | Will consult `node_modules/next/dist/docs/` for Next.js 16.2.6 conventions |
| V. Simplicity | PASS | Single feature addition; no new dependencies beyond existing stack |
| VI. Spanish-First | PASS | All UI labels, error messages, and content in Spanish |
| Performance 90+ | PASS | CSS-only animation, lazy-loaded panels, optimized image assets |

## Project Structure

### Documentation (this feature)

```text
specs/009-tv-streaming-ui/
├── spec.md              # Feature specification (/speckit.specify output)
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
├── components/
│   ├── ui/
│   │   ├── GlassPanel.tsx           # Reusable glassmorphic panel wrapper
│   │   ├── LiveBadge.tsx            # Red "EN VIVO" badge component
│   │   └── StadiumBackground.tsx    # Stadium background with ambient animation
│   └── streaming-ui/
│       ├── CategoriesPanel.tsx      # Left panel: category vertical menu
│       ├── ChannelsPanel.tsx        # Center panel: numbered channel list with logos
│       ├── ProgramGuidePanel.tsx    # Right panel: program schedule display
│       └── StreamingOverlay.tsx     # Parent component composing all three panels
├── hooks/
│   └── use-program-guide.ts         # SWR hook for program schedule polling (15-min interval)
├── lib/
│   └── xtream-api.ts                # Existing API client (extended for program guide endpoints)
├── types/
│   └── streaming.ts                 # TypeScript interfaces for Category, Channel, Program
└── store/
    └── streaming-ui-store.ts        # Zustand store for selected category/channel state

tests/
├── unit/
│   ├── use-program-guide.test.ts
│   └── streaming-ui-store.test.ts
├── integration/
│   ├── CategoriesPanel.test.tsx
│   ├── ChannelsPanel.test.tsx
│   ├── ProgramGuidePanel.test.tsx
│   └── StreamingOverlay.test.tsx
└── contract/
    └── xtream-api-contract.test.ts
```

**Structure Decision**: Single project addition to existing Next.js app. Components follow the constitution's component-driven architecture: shared UI primitives in `app/components/ui/`, feature-specific components in `app/components/streaming-ui/`. State managed via Zustand store (existing dependency). Data fetching via SWR with polling (existing dependency). No new external dependencies required.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No constitution violations | N/A |
