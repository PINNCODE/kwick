# Phase 0: Research Report

**Feature**: Landing Page TV App  
**Date**: 2026-05-09  
**Status**: Complete

---

## Research Topics

This document consolidates research findings for all technical unknowns identified during planning.

---

### 1. Landing Page Structure for TV Streaming App

**Research Question**: What sections are essential for a TV streaming app landing page?

**Findings**:

Industry best practices for 2026 indicate 7 core sections:

| Section | Purpose | Priority |
|---------|---------|----------|
| **Hero** | Value proposition + primary CTA | P0 (Critical) |
| **Trust Bar** | Social proof, logos, stats | P1 (High) |
| **Benefits** | 3-5 key differentiators | P0 (Critical) |
| **App Preview** | Visual mockup of interface | P1 (High) |
| **How It Works** | Simple 3-step process | P2 (Medium) |
| **Testimonials** | User quotes/reviews | P2 (Medium) |
| **Final CTA** | Secondary conversion opportunity | P1 (High) |
| **Footer** | Legal, links, contact | P1 (High) |

**Recommendation**: Implement all 7 sections with emphasis on Hero and Benefits (above the fold).

**Anti-Patterns to Avoid**:
- Generic headlines ("Welcome to Our App")
- Hiding login behind menus
- Technical jargon ("Xtream Codes support")
- Multiple competing CTAs
- Long paragraphs (users scan, don't read)

---

### 2. Conversion Optimization - Login CTA

**Research Question**: Best practices for login CTA placement and design?

**Findings**:

| Placement | Conversion Rate | Recommendation |
|-----------|-----------------|----------------|
| Hero (top-right nav) | Highest | ✅ Primary placement |
| Sticky header (on scroll) | High | ✅ Secondary placement |
| Hero (centered below headline) | High | Alternative for mobile-first |
| Floating button (mobile) | Medium | Fallback only |
| End of page only | Low | ❌ Not recommended |

**Design Specifications**:
- Minimum touch target: 44x44px (WCAG)
- Color: High contrast (bg-blue-600, text-white)
- Text: Action-oriented ("Iniciar Sesión" not "Login")
- Animation: Subtle hover scale (scale-105, 200ms)
- Focus state: Visible ring (focus:ring-2)

**Recommendation**: Dual placement - nav button + sticky header on scroll.

---

### 3. Visual Hierarchy & Above-the-Fold Design

**Research Question**: How to present value proposition in first 3 seconds?

**Findings**:

**Critical Elements (Must be visible without scrolling)**:
1. Logo (top-left)
2. Login button (top-right)
3. Headline (40-60px, benefit-driven)
4. Subheadline (18-24px, supporting detail)
5. Primary CTA (if not in nav)
6. Hero image/mockup (right side or below)

**Typography Hierarchy**:
```
Headline: clamp(2.25rem, 5vw, 3.75rem), line-height 1.1
Subhead:  clamp(1rem, 2vw, 1.25rem), text-gray-400
Body:     16px minimum, readable line-height (1.5-1.7)
```

**Whitespace**: Generious spacing (py-20, space-y-8)

**Recommendation**: Follow F-pattern for left-to-right languages, place value prop in top 60% of viewport.

---

### 4. Performance Optimization (90+ Lighthouse)

**Research Question**: Techniques for achieving 90+ Lighthouse scores in Next.js?

**Findings**:

**Core Web Vitals Targets**:
| Metric | Target | Optimization Strategy |
|--------|--------|----------------------|
| LCP | < 2.5s | Preload hero image, optimize fonts |
| INP | < 200ms | Minimize JavaScript, use Server Components |
| CLS | < 0.1 | Specify image dimensions, avoid layout shifts |
| FCP | < 1.8s | Reduce TTFB, optimize critical CSS |
| TTFB | < 800ms | Edge deployment, caching |

**Image Optimization**:
- Use Next.js `Image` component
- Specify explicit width/height
- Use `priority` for LCP image
- Use `loading="lazy"` for below-fold
- Format: WebP/AVIF with fallbacks

**Font Optimization**:
- Use `next/font` for automatic optimization
- Subset to Latin characters only
- Set `font-display: swap`
- Preload critical weights only

**Resource Hints**:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
<link rel="prefetch" href="/login" as="document" />
```

**Recommendation**: Server Components for all static content, lazy load non-critical client components.

---

### 5. Responsive Design Patterns

**Research Question**: Mobile-first approaches for landing pages?

**Findings**:

**Breakpoint Strategy (Tailwind v4)**:
| Breakpoint | Min Width | Layout Changes |
|------------|-----------|----------------|
| Mobile (base) | 0px | Single column, stacked, full-width buttons |
| sm | 640px | Two-column grids, adjusted padding |
| md | 768px | Tablet layouts, horizontal navigation |
| lg | 1024px | Three-column, full navigation |
| xl | 1280px | Max-width containers |
| 2xl | 1536px | Wider content areas |

**Mobile-First Principles**:
- Write base styles for mobile
- Add complexity with `min-width` queries
- Touch targets ≥ 44px
- Stack vertically on mobile, expand horizontally on desktop
- Use fluid typography (`clamp()`)

**Container Queries** (Tailwind v4):
```css
@utility container-card {
  container-type: inline-size;
}

/* Component adapts based on its own width */
@container (min-width: 400px) {
  @apply flex-row;
}
```

**Recommendation**: Mobile-first with Tailwind breakpoints, fluid typography with `clamp()`, touch-friendly targets.

---

### 6. Existing Design System Analysis

**Research Question**: What UI patterns and components already exist in the codebase?

**Findings**:

**Color Palette**:
| Usage | Color | Tailwind |
|-------|-------|----------|
| Background | Black | `bg-black` |
| Surface | Dark Gray | `bg-gray-900` |
| Input Fields | Darker Gray | `bg-gray-800` |
| Primary Accent | Blue | `bg-blue-600` |
| Text Primary | White | `text-white` |
| Text Secondary | Light Gray | `text-gray-300` |
| Error | Red | `bg-red-900/50` |

**Typography**:
- Font: Geist Sans (via `next/font/google`)
- Mono: Geist Mono
- Sizes: xs, sm, base, xl, 3xl in use

**Existing Components to Reuse**:
- `LoginForm.tsx` - Input/button patterns
- `ErrorToast.tsx` - Notification system
- Button styles - Extract to reusable component
- Input styles - Extract to reusable component

**Recommendation**: Extract reusable UI primitives (`Button`, `Input`, `Section`) from existing patterns, maintain consistency with current design system.

---

## Decisions Summary

| # | Decision | Chosen Approach |
|---|----------|-----------------|
| 1 | Structure | 7-section landing page (Hero → Footer) |
| 2 | Login CTA | Dual placement (nav + sticky header) |
| 3 | Visual Mockup | Static screenshot with channel overlay |
| 4 | Performance | Server Components + Next.js Image + Font optimization |
| 5 | Responsive | Mobile-first + Tailwind breakpoints + fluid typography |
| 6 | Auth State | Auto-redirect after 3s with dismissible banner |

---

## References

- [web.dev Learn Performance](https://web.dev/learn/performance)
- [web.dev Learn Responsive Design](https://web.dev/learn/design)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Core Web Vitals](https://web.dev/vitals/)
