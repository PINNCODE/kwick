<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.1.0 (MINOR - Landing Page Feature Added)
Type: Minor version bump - new functionality added without breaking changes

Modified Principles:
  - V. Simplicity & Maintainability - Reinforced with landing page implementation

Added Sections:
  - Performance Standards (new section documenting Lighthouse targets)
  - Spanish-First Content (new principle for target market)

Removed Sections: N/A

Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - Constitution check references updated
  ✅ .specify/templates/spec-template.md - No updates needed
  ✅ .specify/templates/tasks-template.md - No updates needed

Follow-up TODOs: None

-->

# Kwick Constitution

## Core Principles

### I. TypeScript-First Development

All code MUST be written in TypeScript with strict type checking enabled. Type safety is non-negotiable; use of `any` type requires explicit justification and comment. Interfaces and types must be defined before implementation. Runtime type validation is required for external data boundaries (APIs, user input, configuration).

**Rationale**: TypeScript eliminates entire categories of bugs at compile time, improves IDE support and refactoring safety, and serves as living documentation. The strict mode ensures maximum type safety benefits.

### II. Component-Driven Architecture

The application is built from self-contained, reusable React components. Each component MUST have a single responsibility and explicit props interface. Components should be co-located with their styles, tests, and documentation. Shared components live in `app/components/ui/`; feature-specific components live in `app/components/{feature}/`.

**Rationale**: Component-driven development enables parallel work, improves testability, and creates a consistent UI. It aligns with React's compositional model and Next.js App Router conventions.

### III. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory for all features. The Red-Green-Refactor cycle MUST be followed:
1. Write failing tests that define expected behavior
2. Implement minimum code to pass tests
3. Refactor while keeping tests green

Unit tests are required for utilities and hooks. Integration tests are required for page components and API routes. Tests MUST run in CI before merge.

**Rationale**: Test-first development ensures requirements are understood before implementation, creates regression safety nets, and produces more testable, loosely-coupled code. It is the primary defense against technical debt.

### IV. Framework-Aware Implementation

This is NOT standard Next.js — APIs, conventions, and file structure differ from standard documentation. All implementation MUST consult the guides in `node_modules/next/dist/docs/` before writing code. Deprecation notices MUST be heeded. When uncertain, verify against the actual framework source and current project patterns.

**Rationale**: The project uses a customized Next.js build with breaking changes. Following standard Next.js documentation without verification will cause runtime errors and compatibility issues.

### V. Simplicity & Maintainability

Start simple. YAGNI (You Aren't Gonna Need It) principles apply — do not implement features until they are needed. Code should be readable first, clever second. Refactoring is continuous; technical debt must be addressed before it compounds. Complexity requires justification documented in code comments or architecture decision records (ADRs).

**Rationale**: Simple code is easier to understand, test, and modify. Premature optimization and over-engineering create maintenance burdens. Continuous refactoring keeps the codebase healthy and adaptable.

### VI. Spanish-First Content (NEW)

All user-facing content MUST be in Spanish by default. This includes:
- Landing page copy and headings
- UI labels and buttons
- Error messages and notifications
- Metadata (title, description) for SEO

English is acceptable for:
- Code comments (for international collaboration)
- Technical documentation (README, specs)
- Variable and function names

**Rationale**: Kwick targets Spanish-speaking markets. Spanish-first ensures the product resonates with the primary audience and improves conversion rates.

## Technology Stack & Dependencies

**Core Framework**: Next.js 16.2.6 (custom build with breaking changes)  
**UI Library**: React 19.2.4, React DOM 19.2.4  
**Language**: TypeScript 5.x with strict mode  
**Styling**: Tailwind CSS v4  
**Linting**: ESLint 9.x with Next.js config  
**Build Tool**: Next.js built-in (webpack/turbopack based on version)  
**State Management**: Zustand 5.0.13  
**Data Fetching**: SWR 2.4.1  
**Video Streaming**: HLS.js 1.6.16  
**Utilities**: clsx 2.1.1, tailwind-merge 3.5.0

**Dependency Policy**:
- Production dependencies require security audit approval
- Major version updates require compatibility verification against framework docs
- Lock files (package-lock.json) MUST be committed
- Unused dependencies must be removed within one sprint of detection
- All dependencies MUST be pinned to exact versions (no ^ or ~ for major updates)

## Performance Standards (NEW)

All pages MUST meet the following performance targets:

### Lighthouse Scores (Target: 90+)

- **Performance**: 90+
- **Accessibility**: 90+
- **Best Practices**: 90+
- **SEO**: 90+

### Core Web Vitals

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Page load |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability |
| INP (Interaction to Next Paint) | < 200ms | Responsiveness |
| FCP (First Contentful Paint) | < 1.8s | Initial render |

### Performance Budget

- **JavaScript bundle**: < 200KB (gzipped)
- **CSS bundle**: < 50KB (gzipped)
- **Images**: < 200KB per image (WebP/AVIF format)
- **Total page weight**: < 1MB (initial load)

**Rationale**: Performance directly impacts user retention and conversion. Fast pages rank better in search engines and provide superior user experience.

## Development Workflow

**Branch Strategy**: Feature branches with PR-based workflow
- Format: `{feature-number}-{feature-name}` (e.g., `002-landing-page-tv-app`)
- All features MUST have corresponding spec in `specs/` directory

**Code Review Requirements**:
- All PRs require at least one reviewer approval
- CI checks (lint, type-check, test) MUST pass
- Constitution compliance verified by author before requesting review
- Performance regression check required for UI changes

**Commit Convention**: Conventional Commits (type(scope): description)
- Types: feat, fix, docs, style, refactor, test, chore
- Scope optional but encouraged (e.g., `feat(landing): add hero section`)
- Messages MUST be in Spanish for user-facing features, English for technical changes

**Quality Gates**:
1. TypeScript compiles without errors (strict mode)
2. ESLint passes with zero warnings
3. All tests pass (when tests exist)
4. No `console.log` statements in production code
5. Components have associated tests or explicit waiver with rationale
6. Lighthouse score 90+ (for UI changes)

**Documentation**:
- AGENTS.md contains agent-specific context and rules
- Complex logic requires inline comments explaining "why"
- Public APIs and components require JSDoc comments
- Each feature MUST have spec, plan, tasks, and quickstart in `specs/{feature}/`

## Governance

**Authority**: This constitution supersedes all other development practices, style guides, and conventions. When conflicts arise, the constitution prevails.

**Amendment Procedure**:
1. Proposed amendments require a documented rationale
2. Impact analysis must identify affected templates, documentation, and code
3. Amendment requires project maintainer approval
4. Upon approval, version MUST be bumped following semantic versioning:
   - **MAJOR**: Backward-incompatible governance changes, principle removals
   - **MINOR**: New principles added, sections expanded, new features
   - **PATCH**: Clarifications, wording improvements, non-semantic changes
5. Template and documentation updates MUST accompany constitution changes
6. CHANGELOG.md MUST be updated with each version bump

**Compliance Review**:
- Quarterly review of constitution adherence across codebase
- Violations are tracked as technical debt with remediation plans
- New team members must acknowledge constitution before first commit
- Automated checks (lint, type-check) enforce principles in CI/CD

**Version History**:
- All versions maintained in git history
- Changelog entry required for MINOR and MAJOR bumps
- Migration guides required for MAJOR version changes
- Constitution version tracked in git tags (e.g., `constitution-v1.1.0`)

**Version**: 1.1.0 | **Ratified**: 2026-05-09 | **Last Amended**: 2026-05-09
