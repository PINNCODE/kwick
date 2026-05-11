# Quickstart: TV Streaming Interface Overlay

## Prerequisites

- Node.js 20+ installed
- Project dependencies installed (`npm install`)
- Active Xtream Codes server credentials configured

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the streaming interface route (path determined by parent layout integration)

3. The overlay renders automatically when the user is authenticated and has active streaming access

## Testing

Run all tests:
```bash
npm test
```

Run tests for this feature only:
```bash
npm test -- --testPathPattern="streaming-ui|use-program-guide|StadiumBackground|GlassPanel"
```

Run tests in watch mode during development:
```bash
npm run test:watch
```

## Key Files

| File | Purpose |
|------|---------|
| `app/components/streaming-ui/StreamingOverlay.tsx` | Main overlay component |
| `app/components/streaming-ui/CategoriesPanel.tsx` | Left panel: category menu |
| `app/components/streaming-ui/ChannelsPanel.tsx` | Center panel: channel list |
| `app/components/streaming-ui/ProgramGuidePanel.tsx` | Right panel: program guide |
| `app/components/ui/GlassPanel.tsx` | Reusable glassmorphic panel |
| `app/components/ui/LiveBadge.tsx` | "EN VIVO" badge component |
| `app/components/ui/StadiumBackground.tsx` | Animated stadium background |
| `app/hooks/use-program-guide.ts` | SWR hook for EPG polling |
| `app/store/streaming-ui-store.ts` | Zustand state management |
| `app/types/streaming.ts` | TypeScript interfaces |

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              StadiumBackground                       │
│  ┌────────────┬──────────────────┬────────────────┐ │
│  │ Categories │    Channels      │  Program Guide │ │
│  │  Panel     │     Panel        │     Panel      │ │
│  │            │                  │                │ │
│  │ • World    │ 1. Azteca Uno    │ RTC 18:33→22:30│ │
│  │   Cup 2026 │ 2. Estrellas     │ EN VIVO        │ │
│  │ • Premium  │ 3. Azteca 7      │ Inova 18:33→   │ │
│  │ • Local MX │ 4. Cinema        │ 23:00          │ │
│  │ • USA      │ ...              │ ...            │ │
│  └────────────┴──────────────────┴────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**State Flow**:
1. User selects category → Zustand store updates `selectedCategoryId`
2. Channels panel reacts → fetches filtered channels via `getStreams(categoryId)`
3. User selects channel → Zustand store updates `selectedChannelId`
4. Program guide reacts → fetches EPG via `getEPG(streamId)` with 15-min polling

## Constitution Compliance Checklist

- [ ] TypeScript strict mode: all files compile without `any` types
- [ ] Spanish-first: all UI text in Spanish
- [ ] Test-first: tests written before implementation
- [ ] Component-driven: each panel is a self-contained component
- [ ] Performance: Lighthouse 90+ on all metrics
- [ ] No `console.log` in production code
