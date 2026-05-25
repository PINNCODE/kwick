# Tasks: HLS Stream Player Component

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~250-320 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

Single PR is safe. All tasks are tightly scoped to one component + one error code extension + tests.

## Phase 1: Foundation — Dependencies and Types

- [ ] 1.1 Run `npm install hls.js` and verify it appears in `package.json` dependencies
- [ ] 1.2 Add `PLAYER_ERROR` variant to `ErrorCode` enum in `src/core/error/error-codes.ts`
- [ ] 1.3 Create `src/app/shared/components/stream-player/stream-player.state.ts` with:
  - `type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'waiting' | 'error'`
  - `interface PlayerError { code: ErrorCode; message: string; correlationId: string }`
  - Injectable `StreamPlayerState` class with `playerState = signal<PlayerState>('idle')`, `error = signal<PlayerError | null>(null)`, and `correlationId = signal<string>('')`
- [ ] 1.4 Create `src/app/shared/components/stream-player/index.ts` barrel export

## Phase 2: Core — StreamPlayerState Service

- [ ] 2.1 Implement `StreamPlayerState` methods: `setState(state: PlayerState)`, `setError(error: PlayerError)`, `setCorrelationId(id: string)`, `reset()`
- [ ] 2.2 Write unit tests for `StreamPlayerState` signal transitions in `src/app/shared/components/stream-player/stream-player.state.spec.ts`:
  - Default state is `'idle'`
  - `setState` updates signal value
  - `setError` populates error signal with correlationId
  - `reset` clears all signals to defaults

## Phase 3: Component — StreamPlayerComponent

- [ ] 3.1 Create `src/app/shared/components/stream-player/stream-player.component.ts`:
  - Standalone Angular component with `@Input()` for `streamId`, `streamName`, `thumbnail`, `autoplay`, `muted`, `controls`
  - `@Output() playerState = output<PlayerState>()` and `@Output() error = output<PlayerError>()` (Angular 17+ output() primitive)
  - Inject `GetStreamUrlUseCase` and `StreamPlayerState`
  - `@ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>`
  - `ngAfterViewInit`: call `GetStreamUrlUseCase.execute(streamId)`, generate correlationId, create `Hls` instance, wire events (`Hls.Events.MANIFEST_LOADED` → `setState('playing')`, `Hls.Events.ERROR` → `setError` + `setState('error')`, `Hls.Events.FRAG_BUFFERED` → `setState('playing')`)
  - `ngOnDestroy`: call `hls.destroy()` and `state.reset()`
- [ ] 3.2 Create `src/app/shared/components/stream-player/stream-player.component.html`:
  - `<video #video [autoplay]="autoplay" [muted]="muted" [controls]="controls" playsinline></video>`
- [ ] 3.3 Create `src/app/shared/components/stream-player/stream-player.component.scss`:
  - `video { width: 100%; height: auto; aspect-ratio: 16/9; object-fit: contain; }`
- [ ] 3.4 Write unit tests in `src/app/shared/components/stream-player/stream-player.component.spec.ts`:
  - Component renders `<video>` element
  - `autoplay`/`muted`/`controls` inputs reflect on video element
  - `ngAfterViewInit` calls `GetStreamUrlUseCase.execute(streamId)`
  - `ngOnDestroy` calls `hls.destroy()`
  - Error event emits via `error` output with correlationId

## Phase 4: Verification and Integration

- [ ] 4.1 Run `npm test` and verify all tests pass
- [ ] 4.2 Run `npm run build` and verify no compilation errors
- [ ] 4.3 Verify `hls.js` types are recognized in component (no `// @ts-ignore` needed)
