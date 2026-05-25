# Tasks: HLS Stream Player Component

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~280-350 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| New files | 5 (component ts/html/scss/spec + state service) |
| Modified files | 2 (package.json, error-codes.ts) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

Single PR is safe. All phases are tightly coupled — state service feeds component, tests verify both. Splitting would create artificial review boundaries.

## Phase 1: Foundation

- [ ] 1.1 Run `npm install hls.js` and verify `package.json` updated
- [ ] 1.2 Add `PLAYER_ERROR = 'PLAYER_ERROR'` to `ErrorCode` enum in `src/core/error/error-codes.ts`
- [ ] 1.3 Create `src/app/shared/components/stream-player/stream-player.state.ts`:
  - `type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'waiting' | 'error'`
  - `PlayerError` interface: `{ code: ErrorCode; message: string; correlationId: string }`
  - Injectable `StreamPlayerState` service with Angular signals: `state = signal<PlayerState>('idle')`, `error = signal<PlayerError | null>(null)`
  - Methods: `setState(state: PlayerState)`, `setError(error: PlayerError)`, `reset()`

## Phase 2: Core Component

- [ ] 2.1 Create `src/app/shared/components/stream-player/stream-player.component.ts`:
  - Standalone component with `@Input()` signals: `streamId`, `streamName`, `thumbnail`, `autoplay`, `muted`, `controls`
  - `@Output() playerState = output<PlayerState>()` and `@Output() error = output<PlayerError>()` (Angular 17+ output primitives — signals, not EventEmitter)
  - Inject `GetStreamUrlUseCase` and `StreamPlayerState`
  - `@ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>`
  - `ngAfterViewInit()`: resolve URL via use case, create `Hls` instance, wire `Hls.Events.MANIFEST_LOADED` → `setState('playing')`, `Hls.Events.ERROR` → `setError(...)` + `setState('error')`, `Hls.Events.FRAG_BUFFERED` → `setState('playing')`
  - `ngOnDestroy()`: call `hls.destroy()`, `state.reset()`
  - Generate `correlationId` via `crypto.randomUUID()` on each error event for debugging/tracing
  - NO internal channel switching logic — parent component handles stream changes
- [ ] 2.2 Create `src/app/shared/components/stream-player/stream-player.component.html`:
  - `<video #video [autoplay]="autoplay()" [muted]="muted()" [controls]="controls()" playsinline></video>`
- [ ] 2.3 Create `src/app/shared/components/stream-player/stream-player.component.scss`:
  - `video { width: 100%; aspect-ratio: 16/9; object-fit: contain; background: #000; }`
- [ ] 2.4 Create `src/app/shared/components/stream-player/index.ts` barrel export

## Phase 3: Testing

- [ ] 3.1 Create `src/app/shared/components/stream-player/stream-player.state.spec.ts`:
  - Test `setState()` updates signal value
  - Test `setError()` sets error signal with correlationId
  - Test `reset()` returns state to `'idle'` and clears error
- [ ] 3.2 Create `src/app/shared/components/stream-player/stream-player.component.spec.ts`:
  - Mock `Hls` class with `vi.fn()` constructor (Vitest)
  - Test component renders `<video>` element
  - Test `ngAfterViewInit` calls `GetStreamUrlUseCase.execute(streamId)` and creates `Hls` instance
  - Test `MANIFEST_LOADED` event triggers `playerState` output emission of `'playing'`
  - Test `ERROR` event triggers `error` output with `PLAYER_ERROR` code and non-empty `correlationId`
  - Test `ngOnDestroy` calls `hls.destroy()` and no further state emissions occur
  - Test `autoplay`/`muted`/`controls` inputs reflect on `<video>` element attributes
