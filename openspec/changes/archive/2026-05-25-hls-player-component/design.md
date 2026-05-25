# Design: HLS Stream Player Component

## Technical Approach

Angular 21 standalone component consuming `GetStreamUrlUseCase` to compose HLS URLs. hls.js initializes on `AfterViewInit` via a `<video>` element `@ViewChild`. The component maps hls.js events to `PlayerState` and emits errors via `@Output()`. Lifecycle cleanup via `OnDestroy`.

## Architecture Decisions

### Decision: hls.js direct usage (no port)

**Choice**: Use hls.js directly in component, no `HlsPlayerPort`
**Alternatives considered**: Abstract behind `HlsPlayerPort` for testability
**Rationale**: hls.js is a well-tested browser library with stable API. Mocking is achievable via dependency injection of the `GetStreamUrlUseCase` — the URL composition is the logic we actually need to unit test. Adding a port layer adds indirection without commensurate value for this single use case.

### Decision: Error codes extend existing ErrorCode enum

**Choice**: Add `PLAYER_ERROR` variant to `ErrorCode` enum
**Alternatives considered**: Create separate `PlayerErrorCode` enum
**Rationale**: Single source of error truth. The proposal anticipated this with `error-codes.ts` modification. Each player error maps to a typed `ErrorCode` via factory.

### Decision: Component location `src/app/shared/components/stream-player/`

**Choice**: `src/app/shared/components/stream-player/`
**Alternatives considered**: `src/app/components/stream-player/` or `src/app/stream-player/`
**Rationale**: Consistent with Angular feature-based grouping. `shared/` signals reusable across the app. Path mirrors the existing `ports/outbound/` structure under `core/`.

### Decision: PlayerState as signal-based union type

**Choice**: `type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'waiting' | 'error'`
**Alternatives considered**: RxJS `BehaviorSubject`, Angular signals
**Rationale**: Simple union aligns with the spec's explicit state list. `@Output()` emits this via `EventEmitter` for Angular template compatibility.

### Decision: Responsive CSS with aspect-ratio + object-fit

**Choice**: CSS-only responsive sizing
**Alternatives considered**: ResizeObserver, component-level dimension inputs
**Rationale**: Spec requires "fill container width, maintain native aspect ratio" — CSS `aspect-ratio` + `object-fit: contain` handles this without JS overhead.

## Data Flow

```
streamId (Input)
    │
    ▼
GetStreamUrlUseCase.execute(streamId)   ──→ HLS URL
    │
    ▼
AfterViewInit ──→ new Hls(videoElement, config)  ──→ MANIFEST_LOADED ──→ playerState: 'playing'
    │                   │
    │                   ├──→ ERROR ──→ playerState: 'error' + error output
    │                   │
    │                   └──→ LEVEL_SWITCHED, BUFFER_APPENDED, etc.
    │
OnDestroy ──→ hls.destroy()
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add `hls.js` dependency |
| `src/app/shared/components/stream-player/stream-player.component.ts` | Create | Main component |
| `src/app/shared/components/stream-player/stream-player.component.html` | Create | Template with `<video>` |
| `src/app/shared/components/stream-player/stream-player.component.scss` | Create | Responsive video styles |
| `src/app/shared/components/stream-player/stream-player.component.spec.ts` | Create | Vitest unit tests |
| `src/core/error/error-codes.ts` | Modify | Add `PLAYER_ERROR` variant |

## Interfaces / Contracts

```typescript
// src/app/shared/components/stream-player/stream-player.component.ts

type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'waiting' | 'error';

@Component({ ... })
export class StreamPlayerComponent {
  @Input() streamId!: number;
  @Input() streamName?: string;
  @Input() thumbnail?: string;
  @Input() autoplay = false;
  @Input() muted = true;
  @Input() controls = true;

  @Output() playerState = new EventEmitter<PlayerState>();
  @Output() error = new EventEmitter<Error>();

  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

  private hls: Hls | null = null;
  private readonly getStreamUrlUseCase: GetStreamUrlUseCase;

  ngAfterViewInit(): void { /* init hls.js */ }
  ngOnDestroy(): void { /* hls.destroy() */ }
}
```

```typescript
// ErrorCode enum extension
export enum ErrorCode {
  // ...existing codes...
  PLAYER_ERROR = 'PLAYER_ERROR',
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `playerState` transitions on hls.js events | Mock `Hls` class, verify `EventEmitter` calls |
| Unit | URL composition via `GetStreamUrlUseCase` | Inject mock use case, assert URL string |
| Unit | Cleanup: `hls.destroy()` called on `ngOnDestroy` | Spy on `Hls.prototype.destroy` |
| Component | Renders `<video>` element | `TestBed.createComponent`, query selector |
| Component | `autoplay`/`muted` inputs reflect on `<video>` | Set inputs, check `videoRef.nativeElement` attributes |

## Migration / Rollback

No migration required — greenfield component. Rollback is surgical removal of component files + removal of `hls.js` from `package.json` + revert error code addition.

## Open Questions

- [ ] Should `PlayerState` use Angular signals internally alongside `EventEmitter` for outputs?
- [ ] Do we need a `correlationId` or `requestId` on errors for traceability back to specific hls.js events?
- [ ] Should the component support `setStream(streamId)` method to change streams post-init, or is re-creation acceptable?
