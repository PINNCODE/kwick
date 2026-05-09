# Implementation Plan: IPTV Player with Xtream Codes

**Branch**: `001-iptv-player` | **Date**: 2026-05-09 | **Spec**: specs/001-iptv-player/spec.md
**Input**: Feature specification from `/specs/001-iptv-player/spec.md`

## Summary

Build a fullscreen IPTV player using Next.js 16 and HLS.js for adaptive streaming. The application features Xtream Codes API integration for dynamic channel loading, keyboard-only navigation with semi-transparent menu overlays, automatic retry logic for stream errors, and persistent playback state. The interface prioritizes video content with 100% screen coverage, no visible controls, and immediate channel persistence across sessions.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode (per Constitution)

**Primary Dependencies**:
- Next.js 16.2.6 (React 19.2.4) - Framework with App Router
- hls.js ^1.5.0 - HLS streaming library
- swr ^2.2.0 - Data fetching with caching
- zustand ^4.5.0 - State management (lightweight)
- tailwind-merge ^2.2.0 - Utility for Tailwind classes
- clsx ^2.1.0 - Conditional class names

**Storage**: 
- LocalStorage for persistent data (credentials, last channel, error statistics)
- SessionStorage for session data (current playback state)
- SWR cache for API responses (5-minute TTL)

**Testing**: Implementation without TDD (per user request)

**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) with HLS support

**Project Type**: Single-page web application with Next.js App Router

**Performance Goals**:
- Login completion < 10 seconds (including connectivity check)
- Video start time < 2 seconds after authentication
- Menu overlay response < 100ms
- Error recovery with retries < 7 seconds total
- Category/channel list load < 3 seconds

**Constraints**:
- MUST use customized Next.js build (per Constitution Principle IV)
- Video must always remain visible (no fullscreen blackouts)
- Keyboard-only navigation (no mouse/touch controls visible)
- Always fullscreen mode (no windowed mode)
- Volume fixed at 100%

**Scale/Scope**:
- Single user session
- 50-100 channels across 5-10 categories typical
- No backend required (uses external Xtream API)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. TypeScript-First** | ✅ PASS | All components TypeScript with strict typing |
| **II. Component-Driven** | ✅ PASS | VideoPlayer, MenuOverlay, LoginForm as separate components |
| **III. Test-First** | ⚠️ WAIVED | User explicitly requested no tests |
| **IV. Framework-Aware** | ✅ PASS | Will consult Next.js docs before implementation |
| **V. Simplicity** | ✅ PASS | YAGNI principles followed, no premature features |

**Gate Status**: ✅ PASS (Test requirement waived per user directive)

## Project Structure

### Documentation (this feature)

```text
specs/001-iptv-player/
├── plan.md              # This file
├── spec.md              # Feature specification
├── data-model.md        # Entity definitions
├── quickstart.md        # Development guide
├── contracts/           # Interface definitions
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
app/
├── (auth)/
│   └── login/
│       └── page.tsx              # Login screen
├── (player)/
│   └── page.tsx                  # Main player (fullscreen)
├── api/xtream/
│   ├── health/route.ts           # Connectivity check
│   ├── auth/route.ts             # Authentication
│   ├── categories/route.ts       # Categories endpoint
│   └── streams/route.ts          # Streams endpoint
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx
│   ├── player/
│   │   ├── VideoPlayer.tsx
│   │   └── ErrorToast.tsx
│   └── menu/
│       ├── MenuOverlay.tsx
│       ├── CategoryList.tsx
│       └── ChannelGrid.tsx
├── hooks/
│   ├── useXtreamAuth.ts
│   ├── useChannels.ts
│   ├── useHlsPlayer.ts
│   ├── useChannelPersistence.ts
│   └── useKeyboardNavigation.ts
├── lib/
│   ├── xtream-api.ts
│   ├── storage.ts
│   └── error-analytics.ts
└── types/
    ├── xtream.ts
    └── player.ts
```

**Structure Decision**: Using Next.js App Router with route groups for auth and player sections. API routes act as proxy to Xtream Codes API. Components organized by feature domain (auth, player, menu). State management via Zustand for global state, SWR for server state.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | No violations - all principles satisfied or waived |

## Architecture Decisions

### State Management Strategy

**Zustand** for global client state:
- Authentication state
- Current playback state
- UI state (menu open/closed)

**SWR** for server state:
- Categories list (5min cache)
- Channels by category (5min cache)
- Automatic revalidation

**LocalStorage** for persistence:
- User credentials
- Last watched channel
- Error statistics

### Error Handling Strategy

Three-tier approach:
1. **Automatic retries** with exponential backoff (1s, 2s, 4s)
2. **Toast notifications** for user feedback
3. **Statistics logging** for debugging

### Navigation Philosophy

- **Always fullscreen**: No windowed mode
- **Overlay menus**: Semi-transparent, video always visible
- **Zero mouse dependency**: All controls via keyboard
- **Immediate feedback**: Channel changes persist instantly

## API Integration

### Xtream Codes Endpoints

All proxied through `/api/xtream/*` to handle CORS and add caching:

```typescript
// GET /api/xtream/health?host={url}
// Validates connectivity to server

// POST /api/xtream/auth
// Body: { host, username, password }
// Returns: user info or error

// GET /api/xtream/categories
// Returns: Category[] (cached 5min)

// GET /api/xtream/streams?category_id={id}
// Returns: LiveStream[] (cached 5min)
```

### Stream URL Format

```
{host}/live/{username}/{password}/{stream_id}.m3u8
```

## Data Flow

### Login Flow
```
LoginForm → validate connectivity (5s timeout) → authenticate 
→ store credentials → load categories → load channels 
→ auto-play first channel OR last watched
```

### Channel Change Flow
```
Keyboard event → update current channel → persist to LocalStorage 
→ load HLS stream → start playback
```

### Error Recovery Flow
```
Error detected → show toast → retry 1 (immediate) 
→ retry 2 (+1s) → retry 3 (+2s) → retry 4 (+4s) 
→ success (hide toast) OR failure (persistent toast + log stats)
```

## Performance Considerations

1. **Lazy load channels**: Only fetch channels for active category
2. **Disconnect HLS**: Properly destroy player instance when switching
3. **Debounce navigation**: Prevent rapid key spam
4. **Cache aggressively**: 5-minute SWR cache for categories/channels
5. **Preload adjacent**: Optional: preload next channel in background

## Security Considerations

1. **Credentials in LocalStorage**: Acceptable for this use case (single user)
2. **No HTTPS enforcement**: Host URL can be HTTP (local networks)
3. **No token refresh**: Xtream uses static credentials
4. **CORS proxy**: API routes prevent direct browser CORS issues

## Future Enhancements (Out of Scope)

- EPG (Electronic Program Guide)
- Recording/DVR functionality
- Multi-profile support
- Parental controls
- Picture-in-picture mode
- Mobile touch interface
- Audio track selection
- Subtitle support
