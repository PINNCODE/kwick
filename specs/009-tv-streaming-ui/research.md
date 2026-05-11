# Research: TV Streaming Interface Overlay

## Phase 0: Technical Research

### 1. Glassmorphic Panel Rendering

**Approach**: CSS `backdrop-filter: blur()` with semi-transparent dark backgrounds and blue neon border accents.

**Tailwind CSS v4 Implementation**:
- Background: `bg-gray-900/80` (80% opacity dark gray)
- Blur: `backdrop-blur-md` (12px blur)
- Border: `border border-blue-500/30` (subtle blue neon)
- Rounded corners: `rounded-xl`
- Shadow: `shadow-lg shadow-blue-500/10` (blue-tinted shadow)

**Browser Support**: `backdrop-filter` is supported in all modern browsers (Chrome 76+, Firefox 103+, Safari 9+). Fallback: solid dark background without blur for unsupported browsers.

**Performance**: CSS-only, GPU-accelerated. No JS overhead. Meets Lighthouse performance targets.

### 2. Stadium Background with Ambient Animation

**Approach**: Static background image with CSS keyframe animation for subtle light flickering effects.

**Implementation**:
- Background image loaded via Next.js `Image` component or CSS `background-image`
- CSS `@keyframes` for ambient light pulsing (opacity shifts on overlay elements)
- Animation duration: 3-5s cycle, infinite loop
- `prefers-reduced-motion` media query respected for accessibility

**Image Optimization**:
- Format: WebP (with AVIF fallback)
- Size: < 200KB (per constitution performance budget)
- Next.js `next/image` for automatic optimization and lazy loading

### 3. SWR Polling for Program Guide

**Approach**: SWR's `refreshInterval` option for automatic polling.

**Configuration**:
```typescript
const { data, error, isLoading } = useSWR(
  `/epg/${streamId}`,
  fetcher,
  { refreshInterval: 15 * 60 * 1000 } // 15 minutes
);
```

**Benefits**:
- Built-in deduplication and revalidation
- Automatic retry on failure
- Stale-while-revalidate caching
- No additional dependencies

### 4. Zustand State Management

**Approach**: Single Zustand store for streaming UI state.

**State Shape**:
```typescript
interface StreamingUIState {
  selectedCategoryId: string | null;
  selectedChannelId: string | null;
  setSelectedCategory: (id: string | null) => void;
  setSelectedChannel: (id: string | null) => void;
  resetSelection: () => void;
}
```

**Rationale**: Zustand is already a project dependency. Minimal boilerplate, no provider wrapping needed, excellent TypeScript support.

### 5. Channel Logo Loading

**Approach**: Next.js `Image` component with fallback for missing logos.

**Implementation**:
- `stream_icon` field from `LiveStream` type provides logo URL
- Fallback: placeholder SVG icon when logo fails to load
- Size: 32x32px (small square, inline with channel name)
- `object-fit: contain` to preserve aspect ratio

### 6. Debouncing for Rapid Category Switching

**Approach**: Custom `useDebounce` hook or `lodash/debounce` (prefer custom to avoid new dependency).

**Implementation**:
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
```

**Delay**: 300ms (standard for UI interactions)

### 7. Existing API Compatibility

**Finding**: The existing `xtream-api.ts` already provides:
- `getCategories()` → Maps to Categories panel (FR-003, FR-013)
- `getStreams(categoryId?)` → Maps to Channels panel with filtering (FR-005, FR-009)
- `getEPG(streamId)` → Maps to Program Guide panel (FR-007, FR-010)
- `LiveStream.stream_icon` → Channel logos (FR-005)
- `LiveStream.num` → Channel numbering (FR-014)

**Gap**: `getEPG` returns `any[]` — needs proper typing (addressed in data-model.md).

**Gap**: EPG polling interval not configurable — needs SWR wrapper with 15-min interval (FR-017).

### 8. Spanish Content

All UI text (panel titles, error messages, badges, empty states) MUST be in Spanish per Constitution Principle VI.

| English | Spanish |
|---------|---------|
| Categories | Categorías |
| Channels | Canales |
| Program Guide | Guía de Programas |
| EN VIVO | EN VIVO |
| No channels available | No hay canales disponibles |
| Program information temporarily unavailable | Información del programa temporalmente no disponible |
| End time TBD | Hora de fin por definir |
