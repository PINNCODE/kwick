# Architecture Design: kwick-move-to-player-route

## Overview

The stream-player feature is extracted from `AppComponent` into a dedicated `PlayerComponent` on a `/player` route. The App shell becomes a thin router outlet only. This follows hexagonal architecture with clear layer separation.

---

## Layer Responsibilities

### Domain Layer (`StreamPlayerState`)

**File**: `src/app/shared/state/stream-player.state.ts`

Pure domain service. Owns no UI concerns.

```
Responsibilities:
- Exposes writable signals: state, error, volume
- setState(state: PlayerState): void
- setError(error: PlayerError): void
- setVolume(vol: number): void
- reset(): void
```

**Key constraint**: No Angular component imports (`@angular/core` is fine for `Injector`, `signal`).

---

### Application Layer (`PlayerComponent`)

**File**: `src/app/features/player/player.component.ts`

Orchestrator. All reactive state for the player feature lives here.

#### Signals owned by PlayerComponent

| Signal | Type | Purpose |
|--------|------|---------|
| `streamUrl` | `signal<string>` | Current HLS stream URL |
| `playerState` | `signal<PlayerState \| ''>` | Current playback state |
| `errorMessage` | `signal<string>` | Error display message |
| `streamLayerVisible` | `signal<boolean>` | Stream layer overlay visibility |

#### Events received from StreamLayerComponent

| Event | Handler | Delegates to |
|-------|---------|--------------|
| `togglePlayPause` | `onTogglePlayPause()` | `player.togglePlay()` |
| `toggleMuteUnmute` | `onToggleMute()` | `player.toggleMute()` |
| `volumeChange(volume)` | `onVolumeChange(volume)` | `player.setVolume(volume)` |

#### Events received from StreamPlayerComponent

| Event | Handler | Action |
|-------|---------|--------|
| `playerState` | `onPlayerState(state)` | Updates `playerState` signal |
| `error` | `onPlayerError(error)` | Updates `errorMessage` signal |

#### 'm' key handler

Lives on `PlayerComponent` template, NOT on App shell.

```html
<main tabindex="0" (keydown.m)="toggleStreamLayer()">
```

**Rationale**: Focus must be on the player page element for the key to register. App shell only has a `<router-outlet>` which cannot hold focus. The `tabindex="0"` on the `<main>` wrapper makes it focusable and ensures keyboard events fire correctly.

---

### Infrastructure Layer

#### StreamPlayerComponent (`src/app/shared/components/stream-player/stream-player.component.ts`)

HLS.js adapter. Wraps the video element and HLS.js lifecycle.

```
Providers: [StreamPlayerState]  ← keeps domain service scoped to this component
Inputs: streamUrl, streamName, thumbnail, muted, controls
Outputs: playerState, error
Methods: play(), pause(), setVolume(), getVolume(), isMuted(), mute(), unmute()
```

**ViewChild**: `@ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>` — accessed in `ngAfterViewInit`.

#### StreamLayerComponent (`src/app/shared/components/stream-layer/stream-layer.component.ts`)

Pure UI overlay. No business logic. Emits events only.

---

### UI Layer

**Template** (`src/app/features/player/player.component.html`):

```html
<main tabindex="0" (keydown.m)="toggleStreamLayer()">
  <div class="player-container">
    <app-stream-layer
      [class.stream-layer-hidden]="!streamLayerVisible()"
      [playerState]="playerState()"
      [errorMessage]="errorMessage()"
      (togglePlayPause)="onTogglePlayPause()"
      (toggleMuteUnmute)="onToggleMute()"
      (volumeChange)="onVolumeChange($event)"
    ></app-stream-layer>
    <app-stream-player
      #streamPlayer
      [streamUrl]="streamUrl()"
      [streamName]="'Channel 5'"
      [muted]="false"
      [controls]="false"
      (playerState)="onPlayerState($event)"
      (error)="onPlayerError($event)"
    />
  </div>
</main>
```

---

## Routing

**File**: `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import {PlayerComponent} from './features/player';

export const routes: Routes = [
  { path: 'player', loadComponent: () => import('./features/player/player.component') },
  { path: '', redirectTo: 'player', pathMatch: 'full' },
];
```

### Route Navigation Behavior

- `/player` is **lazy-loaded** via `loadComponent`
- Each navigation to `/player` creates a fresh `PlayerComponent` instance
- `ngAfterViewInit` fires when the view tree is initialized — no timing issue with `ViewChild`
- `StreamPlayerComponent` in the template is available after view init via `#streamPlayer` template reference

### Why `loadComponent` not static import

```typescript
// Instead of:
{ path: 'player', component: PlayerComponent }

// Using:
{ path: 'player', loadComponent: () => import('./features/player/player.component') }
```

**Rationale**: Enables code-splitting. The player feature (HLS.js, overlays) is only loaded when the user navigates to `/player`. Future: can add `loadChildren` for route-level lazy loading of other features.

---

## Ownership Map

```
StreamPlayerState (domain)
    ↑ called by StreamPlayerComponent (infrastructure)
    
StreamPlayerComponent (infrastructure)
    ↑ input/output wiring via PlayerComponent (application)
    
PlayerComponent (application)
    ↑ owns signals, handles events, routes input/output to children
    
StreamLayerComponent (presentation)
    ↑ receives inputs, emits events → PlayerComponent handles
    
player.component.html / player.component.scss (presentation)
    ↑ template/styles for PlayerComponent
```

---

## Export Strategy

### `shared/index.ts` barrel

```typescript
export * from './components/stream-player';    // StreamPlayerComponent
export * from './components/stream-layer';    // StreamLayerComponent
export * from './state';                       // StreamPlayerState, PlayerState, PlayerError
```

`StreamPlayerComponent` is exported from here — makes it available to `PlayerComponent` via `shared/index.ts`.

### `features/player/index.ts` barrel

```typescript
export { PlayerComponent } from './player.component';
```

`PlayerComponent` is NOT in `shared` — it is the feature orchestrator and belongs to the player feature module.

---

## App Shell After Migration

**File**: `src/app/app.ts`

Removes all signal state, handlers, ViewChild. App becomes a pure shell.

```typescript
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // No business logic. No signals. No handlers.
}
```

**File**: `src/app/app.html`

```html
<router-outlet></router-outlet>
```

---

## Key Design Decisions

### Decision 1: 'm' key handler on PlayerComponent, not App

**Choice**: `PlayerComponent` template hosts the `keydown.m` handler.

**Rationale**: App shell is now a router outlet with no focusable content. A bare `<router-outlet>` cannot receive keyboard events. The handler must be on a focusable element within the player page. Adding `tabindex="0"` to a `<main>` wrapper ensures focus management works identically to the current App behavior.

**Alternatives considered**:
- Host listener on `document` — rejected. Global listener is harder to test and leaks across navigations.
- Keep on App with focus trap — rejected. App no longer has player-specific content and should not own player keyboard logic.

### Decision 2: streamLayerVisible owned by PlayerComponent

**Choice**: `streamLayerVisible = signal(true)` lives in `PlayerComponent`.

**Rationale**: `PlayerComponent` is the application-layer orchestrator. All feature state belongs here. `StreamLayerComponent` receives it as input and displays/hides accordingly.

**Alternative rejected**: `StreamPlayerState` owning it — rejected because that service is domain-only and should not know about UI-layer visibility concerns.

### Decision 3: ViewChild timing with lazy-loaded route

**Choice**: No special handling beyond `ngAfterViewInit`.

**Rationale**: Angular calls `ngAfterViewInit` after the view and all child views are initialized. With `loadComponent`, the component is dynamically loaded, but Angular still follows the same lifecycle. The `#streamPlayer` template reference is resolved before `ngAfterViewInit` fires. This matches the current behavior in `AppComponent`.

**Potential issue**: If `streamPlayer` template reference is used in `ngOnInit`, it would be undefined. Current implementation does not do this.

### Decision 4: streamPlayerState provider scope

**Choice**: `StreamPlayerComponent` keeps `providers: [StreamPlayerState]`.

**Rationale**: Each `StreamPlayerComponent` instance needs its own `StreamPlayerState` instance to track that specific player's state. The provider is scoped to the component — not the app root. This is existing behavior and no changes are needed.

---

## File Map

| File | Action |
|------|--------|
| `src/app/features/player/player.component.ts` | **CREATE** |
| `src/app/features/player/player.component.html` | **CREATE** |
| `src/app/features/player/player.component.scss` | **CREATE** |
| `src/app/features/player/index.ts` | **CREATE** |
| `src/app/app.ts` | **MODIFY** — strip business logic |
| `src/app/app.html` | **MODIFY** — single router-outlet |
| `src/app/app.routes.ts` | **MODIFY** — add /player route |
| `src/app/shared/index.ts` | **NO CHANGE** — already exports sub-modules |

---

## Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Focus lost on route navigation | Low | `<main tabindex="0">` preserves focusable context |
| ViewChild undefined in ngOnInit | Low | StreamPlayerComponent methods called only via player reference in handlers, not ngOnInit |
| State loss on navigation away and back | Low | Lazy loading creates fresh state on each navigation — acceptable for live stream use case |
| Missing StreamPlayerComponent export | N/A | Already exported via `export * from './components/stream-player'` in shared/index.ts |

---

## ADR Summary

1. **'m' key handler**: Lives on `PlayerComponent <main tabindex="0">`, not App shell
2. **streamLayerVisible ownership**: PlayerComponent as application-layer orchestrator
3. **ViewChild timing**: Safe via ngAfterViewInit with lazy-loaded component
4. **Provider scope**: Keep `StreamPlayerState` in `StreamPlayerComponent` providers
5. **Export strategy**: `shared/index.ts` exports infrastructure/domain; `features/player/index.ts` exports `PlayerComponent` only
