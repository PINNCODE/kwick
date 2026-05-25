# Proposal: HLS Stream Player Component

## Intent

Play live IPTV channels by integrating hls.js into an Angular component that consumes HLS streams from the existing `StreamUrl` composition pipeline.

## Scope

### In Scope
- `hls.js` npm package installation
- `StreamPlayerComponent` (Angular standalone component)
- Player lifecycle: init on `AfterViewInit`, destroy on `OnDestroy`
- `@Input()` API: `streamId`, `streamName`, `thumbnail`, `autoplay`, `muted`, `controls`
- `@Output()` API: `playerState` (idle|loading|playing|paused|waiting|error), `error`
- Responsive CSS for video element
- Vitest unit tests

### Out of Scope
- Custom player UI (use native HTML5 controls)
- DVR / recording functionality
- Picture-in-picture
- Multiple simultaneous streams

## Capabilities

### New Capabilities
- `stream-playback`: Play HLS streams via hls.js with reactive state emission

## Approach

Inject `GetStreamUrlUseCase` to compose HLS URL from `streamId`. Initialize hls.js in `AfterViewInit` on a `<video>` element reference. Wire hls.js events → Angular `@Output()`. Destroy hls.js instance in `OnDestroy`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | Add `hls.js` dependency |
| `src/app/shared/components/stream-player/` | New | Component files (`.ts`, `.html`, `.scss`, `.spec.ts`) |
| `src/core/ports/outbound/` | Modified | Add `PlayerPort` for testability |
| `src/core/error/error-codes.ts` | Modified | Add `PLAYER_ERROR` codes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Autoplay blocked by browser | Medium | Default `muted=true` + `playsInline` |
| Stream unavailable (CORS/404) | Medium | Handle `ERROR` event, emit via `@Output()` |
| Memory leak from hls instance | Low | Explicit `hls.destroy()` in `ngOnDestroy` |

## Rollback Plan

1. `npm uninstall hls.js`
2. Delete `src/app/shared/components/stream-player/`
3. Revert error code additions
4. Remove `PlayerPort` from ports

## Dependencies

- `npm install hls.js`
- `GetStreamUrlUseCase` (existing)
- `StreamUrl` VO (existing)

## Success Criteria

- [ ] Component renders `<video>` and initializes hls.js on `streamId` input
- [ ] `playerState` emits correct values through lifecycle
- [ ] `hls.destroy()` called on component destroy
- [ ] Vitest tests pass with mocked hls.js
- [ ] No console errors during playback