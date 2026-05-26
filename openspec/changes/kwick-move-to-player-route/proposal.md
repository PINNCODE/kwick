# Proposal: Move Stream Player to /player Route

## Intent

The App component currently serves double duty: it is both the application shell AND the stream-player feature. Business logic (signals, handlers, ViewChild) lives in App alongside router-outlet concerns. This creates a tight coupling that blocks lazy loading, prevents feature-level testing isolation, and mixes infrastructure (HLS.js) with orchestration. The fix is to extract a dedicated Player feature component and route.

## Scope

### In Scope
- Create `src/app/features/player/` with `PlayerComponent` (business logic, signals, handlers)
- Define `/player` route pointing to `PlayerComponent`
- Migrate the 'm' key `toggleStreamLayer()` logic from `App` to `PlayerComponent`
- Migrate all signal state (`streamUrl`, `playerState`, `errorMessage`, `streamLayerVisible`) from `App` to `PlayerComponent`
- Migrate all handler methods (`onPlayerState`, `onPlayerError`, `onTogglePlayPause`, `onToggleMute`, `onVolumeChange`, `togglePlay`, `setVolume`, `toggleMute`)
- App component becomes a thin shell: `router-outlet` + `tabindex`/`keydown.m` focus trap only
- Add `StreamPlayerComponent` to `shared/index.ts` barrel (it is currently missing)

### Out of Scope
- Any changes to HLS.js initialization logic in `StreamPlayerComponent`
- Changes to `StreamLayerComponent` (UI only, no logic changes)
- Changes to `StreamPlayerState` service
- Adding lazy loading beyond the route definition
- Changes to `app.config.ts`

## Capabilities

### New Capabilities
- `player-route`: A new `/player` route that owns all stream-player business logic and state

### Modified Capabilities
- None at the spec level (pure refactor)

## Approach

### Hexagonal Architecture Split

| Layer | Owner | Responsibility |
|-------|-------|----------------|
| **Domain** | `StreamPlayerState` | Pure signal state: `state`, `error`, `volume` signals; no Angular UI imports |
| **Application** | `PlayerComponent` | Orchestration: owns all reactive state (signals), handles events from `StreamLayerComponent`, calls domain methods |
| **Infrastructure** | `StreamPlayerComponent` | HLS.js adapter: initializes video element, wires events to `StreamPlayerState` |
| **UI / Presentation** | `StreamLayerComponent`, `app.html` | Pure presentational: renders program cards, play/pause, volume slider; emits events only |

### Port / Adapter Mapping

- **Port**: `StreamPlayerState` (Injectable domain service) — exposes `state`, `error`, `volume` signals
- **Adapter**: `StreamPlayerComponent` — implements HLS.js playback, calls `state.setState()` / `state.setError()` / `state.setVolume()`

### File Changes

| File | Change |
|------|--------|
| `src/app/app.ts` | Thin shell: keep `router-outlet`, `tabindex`, `keydown.m` |
| `src/app/app.html` | Single `<router-outlet>` only |
| `src/app/app.routes.ts` | Add `{ path: 'player', component: PlayerComponent }` |
| `src/app/features/player/player.component.ts` | **New** — all business logic, signals, handlers |
| `src/app/features/player/player.component.html` | **New** — inline or linked template with `<app-stream-layer>` + `<app-stream-player>` |
| `src/app/features/player/player.component.scss` | **New** — player container styles |
| `src/app/features/player/index.ts` | **New** — barrel export |
| `src/app/shared/index.ts` | Add `StreamPlayerComponent` export |

### Route Definition

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: 'player', loadComponent: () => import('./features/player/player.component') },
  { path: '', redirectTo: 'player', pathMatch: 'full' },
];
```

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/app.ts` | Modified | Remove all signals and handlers; thin shell |
| `src/app/app.html` | Modified | Replace content with `<router-outlet>` |
| `src/app/app.routes.ts` | Modified | Add `/player` route |
| `src/app/features/player/` | New | Full feature directory |
| `src/app/shared/index.ts` | Modified | Export `StreamPlayerComponent` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| App loses `ViewChild` reference timing if not using `AfterViewInit` | Low | `PlayerComponent.ngAfterViewInit` mirrors current App behavior |
| 'm' key handler needs focusable element in PlayerComponent | Low | Player template wraps in `<main tabindex="0">` matching current App shell |
| `StreamPlayerState` provider scope — currently provided in `StreamPlayerComponent` | Medium | Keep `providers: [StreamPlayerState]` in `StreamPlayerComponent`; no scope change |

## Rollback Plan

1. Revert `app.routes.ts` to empty routes array
2. Restore original `app.ts` and `app.html` from git
3. Remove `src/app/features/player/` directory
4. Revert `shared/index.ts` exports

## Dependencies

- Angular Router already configured via `provideRouter(routes)` in `app.config.ts`
- No new npm packages required

## Success Criteria

- [ ] Navigating to `/player` renders stream player and stream layer identically to current behavior
- [ ] Pressing 'm' toggles stream layer visibility on the player page
- [ ] Play/pause, mute/unmute, volume controls all work via stream-layer buttons
- [ ] App shell (`/`) redirects to `/player`
- [ ] `shared/index.ts` exports `StreamPlayerComponent`
- [ ] `PlayerComponent` has no template HTML (uses inline or linked, but lives in features/player)
- [ ] No Angular console errors on load
