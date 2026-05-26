# Tasks: Move Stream Player to /player Route

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending (not needed) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Player Feature Directory (Foundation)

- [ ] 1.1 Create directory `src/app/features/player/`
- [ ] 1.2 Create `src/app/features/player/player.component.ts` — PlayerComponent with signals: `streamUrl`, `playerState`, `errorMessage`, `streamLayerVisible`; handlers: `onPlayerState`, `onPlayerError`, `onTogglePlayPause`, `onToggleMute`, `onVolumeChange`, `toggleStreamLayer`; ViewChild for `StreamPlayerComponent`
- [ ] 1.3 Create `src/app/features/player/player.component.html` — template with `<main tabindex="0" (keydown.m)="toggleStreamLayer()">` wrapping `<app-stream-layer>` and `<app-stream-player>` per design spec
- [ ] 1.4 Create `src/app/features/player/player.component.scss` — move all styles from `src/app/app.scss` (`:host`, `main`, `.player-container`, `app-stream-layer` rules)
- [ ] 1.5 Create `src/app/features/player/index.ts` — barrel export `{ PlayerComponent } from './player.component'`

## Phase 2: App Shell Simplification (Integration)

- [ ] 2.1 Update `src/app/app.routes.ts` — add `{ path: 'player', loadComponent: () => import('./features/player/player.component') }` and root redirect `{ path: '', redirectTo: 'player', pathMatch: 'full' }`
- [ ] 2.2 Update `src/app/app.html` — replace content with `<router-outlet></router-outlet>` only
- [ ] 2.3 Update `src/app/app.ts` — strip all signals, handlers, ViewChild; keep `@Component` decorator with `RouterOutlet` import only; make class a thin shell

## Phase 3: Verification

- [ ] 3.1 Verify `StreamPlayerComponent` is exported from `src/app/shared/index.ts` via `export * from './components/stream-player'` (already exists — no change needed)
- [ ] 3.2 Verify navigating to `/player` renders stream-player and stream-layer identically to previous App behavior
- [ ] 3.3 Verify pressing `m` key on `/player` toggles stream layer visibility when main element has focus
- [ ] 3.4 Verify root `/` redirects to `/player`
- [ ] 3.5 Verify play/pause, mute/unmute, volume controls work via stream-layer buttons
- [ ] 3.6 Verify App shell has zero stream-related logic — no signals, no handlers, no ViewChild

## Phase 4: Cleanup

- [ ] 4.1 Confirm `src/app/app.scss` no longer contains player-specific rules (styles moved to `player.component.scss`)
- [ ] 4.2 Confirm `src/app/shared/index.ts` barrel correctly exports `StreamPlayerComponent` and `StreamLayerComponent` (already satisfied — no action needed)
