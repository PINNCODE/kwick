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

Start with the UI primitives:

```bash
# Create landing components directory
mkdir -p app/components/landing
mkdir -p app/components/ui
```

### 2. Implement in Order

Recommended implementation sequence:

#### Phase 1: UI Primitives (`components/ui/`)

1. **`Button.tsx`** - Extract from existing LoginForm
   - Variants: primary, secondary, ghost
   - Sizes: sm, md, lg
   - Loading state support

2. **`Section.tsx`** - Wrapper with consistent padding
   - Props: variant (default, dark, gradient)
   - Responsive container with max-width

#### Phase 2: Landing Sections (`components/landing/`)

1. **`Hero.tsx`** - Value prop + login CTA
   - Headline in Spanish
   - Subheadline
   - Login button (primary CTA)
   - Hero image/mockup

2. **`BenefitsSection.tsx`** - 3-5 benefit cards
   - Grid layout (1 col mobile, 2 tablet, 3 desktop)
   - Icon + title + description per card
   - Mix of speed, quality, content benefits

3. **`AppPreviewSection.tsx`** - Visual mockup
   - Screenshot of player with channel overlay
   - Caption explaining simplicity

4. **`Footer.tsx`** - Simple footer
   - Copyright
   - Minimal links

#### Phase 3: Main Page

1. **Update `app/page.tsx`** - Replace auth redirect with landing page
   - Import all section components
   - Assemble in order
   - Handle authenticated user redirect

2. **Update `app/layout.tsx`** - Metadata for SEO
   - Title: "Kwick - TV Simple. Sin Distracciones."
   - Description in Spanish

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
- [ ] Authenticated user redirect works (3s delay + banner)

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
    │   ├── AppPreviewSection.tsx
    │   └── Footer.tsx
    └── ui/                     # CREATE
        ├── Button.tsx
        └── Section.tsx
```

## Common Issues

**Issue**: Hero image causes layout shift  
**Solution**: Add explicit `width` and `height` props to Next.js Image component

**Issue**: Login button not visible on mobile  
**Solution**: Ensure sticky header has proper z-index and mobile padding

**Issue**: Lighthouse score below 90  
**Solution**: Check image sizes, remove unused JavaScript, verify font optimization

**Issue**: Authenticated users confused by landing page  
**Solution**: Implement 3-second auto-redirect with "Stay on page" dismissible banner

---

## Next Steps

After quickstart:
1. Review `plan.md` for implementation details
2. Run `/speckit.tasks` to generate task breakdown
3. Implement following TDD workflow (Red-Green-Refactor)
