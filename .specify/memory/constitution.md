<!--
SYNC IMPACT REPORT
==================
Version Change: N/A → 1.0.0 (Initial Ratification)
Type: Initial Constitution Creation (MAJOR version bump implied from non-existent to 1.0.0)

Modified Principles: N/A (all new)
Added Sections:
  - Core Principles (all 5 principles)
  - Technology Stack & Dependencies
  - Development Workflow
  - Governance
Removed Sections: N/A

Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - No updates needed (constitution check already references constitution file)
  ✅ .specify/templates/spec-template.md - No updates needed (user story format independent of principles)
  ✅ .specify/templates/tasks-template.md - No updates needed (task organization already supports principles)
  ⚠ .specify/templates/commands/*.md - Directory does not exist, no action needed

Follow-up TODOs: None - all placeholders have been filled.
-->

# Kwick Constitution

## Core Principles

### I. TypeScript-First Development
All code MUST be written in TypeScript with strict type checking enabled. Type safety is non-negotiable; use of `any` type requires explicit justification and comment. Interfaces and types must be defined before implementation. Runtime type validation is required for external data boundaries (APIs, user input, configuration).

**Rationale**: TypeScript eliminates entire categories of bugs at compile time, improves IDE support and refactoring safety, and serves as living documentation. The strict mode ensures maximum type safety benefits.

### II. Component-Driven Architecture
The application is built from self-contained, reusable React components. Each component MUST have a single responsibility and explicit props interface. Components should be co-located with their styles, tests, and documentation. Shared components live in a designated component library location; application-specific components live alongside their feature.

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

## Technology Stack & Dependencies

**Core Framework**: Next.js 16.2.6 (custom build with breaking changes)  
**UI Library**: React 19.2.4, React DOM 19.2.4  
**Language**: TypeScript 5.x with strict mode  
**Styling**: Tailwind CSS v4  
**Linting**: ESLint 9.x with Next.js config  
**Build Tool**: Next.js built-in (webpack/turbopack based on version)  

**Dependency Policy**:
- Production dependencies require security audit approval
- Major version updates require compatibility verification against framework docs
- Lock files (package-lock.json, yarn.lock, pnpm-lock.yaml) MUST be committed
- Unused dependencies must be removed within one sprint of detection

## Development Workflow

**Branch Strategy**: Feature branches with PR-based workflow
**Code Review Requirements**:
- All PRs require at least one reviewer approval
- CI checks (lint, type-check, test) MUST pass
- Constitution compliance verified by author before requesting review

**Commit Convention**: Conventional Commits (type(scope): description)
- Types: feat, fix, docs, style, refactor, test, chore
- Scope optional but encouraged (e.g., `feat(auth): add login form`)

**Quality Gates**:
1. TypeScript compiles without errors (strict mode)
2. ESLint passes with zero warnings
3. All tests pass
4. No `console.log` statements in production code
5. Components have associated tests or explicit waiver with rationale

**Documentation**:
- AGENTS.md contains agent-specific context and rules
- Complex logic requires inline comments explaining "why"
- Public APIs and components require JSDoc comments

## Governance

**Authority**: This constitution supersedes all other development practices, style guides, and conventions. When conflicts arise, the constitution prevails.

**Amendment Procedure**:
1. Proposed amendments require a documented rationale
2. Impact analysis must identify affected templates, documentation, and code
3. Amendment requires project maintainer approval
4. Upon approval, version MUST be bumped following semantic versioning:
   - MAJOR: Backward-incompatible governance changes, principle removals
   - MINOR: New principles added, sections expanded
   - PATCH: Clarifications, wording improvements, non-semantic changes
5. Template and documentation updates MUST accompany constitution changes

**Compliance Review**:
- Quarterly review of constitution adherence across codebase
- Violations are tracked as technical debt with remediation plans
- New team members must acknowledge constitution before first commit

**Version History**:
- All versions maintained in git history
- Changelog entry required for MINOR and MAJOR bumps
- Migration guides required for MAJOR version changes

**Version**: 1.0.0 | **Ratified**: 2026-05-09 | **Last Amended**: 2026-05-09
