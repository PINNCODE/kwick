# Apply Progress: kwick-move-to-player-route

## Phase 1: Player Feature Directory
- [x] 1.1 Create directory `src/app/features/player/`
- [x] 1.2 Create `player.component.ts` with signals: streamUrl, playerState, errorMessage, streamLayerVisible; handlers: onPlayerState, onPlayerError, onTogglePlayPause, onToggleMute, onVolumeChange, toggleStreamLayer; @ViewChild for StreamPlayerComponent
- [x] 1.3 Create `player.component.html` with main tabindex=0 wrapping stream-layer and stream-player
- [x] 1.4 Create `player.component.scss` with styles moved from app.scss
- [x] 1.5 Create `index.ts` barrel export

## Phase 2: App Shell Simplification
- [x] 2.1 Update `app.routes.ts` with lazy-loaded /player route and root redirect
- [x] 2.2 Update `app.html` to `<main><router-outlet /></main>`
- [x] 2.3 Update `app.ts` to thin shell with RouterOutlet only

## Phase 3: Verification
- [x] 3.1 Build successful - no compilation errors
- [x] 3.2 Tests: 22 passed, 1 pre-existing failure (unrelated to this change)

## Notes
- Angular 21 loadComponent used with `as any` cast due to TypeScript type inference issue with dynamic imports
- StreamLayerComponent bindings simplified to remove non-existent inputs (playerState, errorMessage)
- App.scss retains :host styles for root container styling
