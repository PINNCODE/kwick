# Delta for Stream Playback Capability

## ADDED Requirements

### Requirement: Stream URL Resolution

The `StreamPlayerComponent` SHALL resolve an HLS URL from a `streamId` input before playback.

#### Scenario: Valid streamId

- GIVEN a `streamId` input
- WHEN the component initializes (AfterViewInit)
- THEN it SHALL invoke `GetStreamUrlUseCase.execute(streamId)` to obtain an HLS URL
- AND SHALL initialize hls.js with that URL

#### Scenario: Invalid streamId

- GIVEN a `streamId` with no corresponding stream
- WHEN `GetStreamUrlUseCase.execute(streamId)` is invoked
- THEN `playerState` SHALL emit `error`
- AND `error` SHALL emit a typed error

---

### Requirement: HLS Initialization

The component SHALL initialize hls.js on the video element after view init.

#### Scenario: Successful init

- GIVEN a valid HLS URL
- WHEN AfterViewInit executes
- THEN the component SHALL create an `Hls` instance attached to the `<video>` element
- AND SHALL begin loading the manifest

#### Scenario: Autoplay with muted

- GIVEN `autoplay` is true and `muted` is true
- WHEN the manifest loads
- THEN the video SHALL play automatically
- AND `playerState` SHALL emit `playing`

---

### Requirement: Playback Control

The component SHALL support play/pause via native HTML5 video controls.

#### Scenario: Pause

- GIVEN the video is playing
- WHEN the user clicks pause on native controls
- THEN the video SHALL pause
- AND `playerState` SHALL emit `paused`

#### Scenario: Resume

- GIVEN the video is paused
- WHEN the user clicks play on native controls
- THEN the video SHALL resume
- AND `playerState` SHALL emit `playing`

---

### Requirement: State Emission

The component SHALL emit `playerState` changes via `@Output()`.

#### Scenario: Buffering

- GIVEN the stream is playing
- WHEN buffering occurs
- THEN `playerState` SHALL emit `waiting`
- AND when buffering ends, SHALL emit `playing`

#### Scenario: Loading

- GIVEN a valid stream URL
- WHEN hls.js is loading the manifest
- THEN `playerState` SHALL emit `loading`

---

### Requirement: Error Handling

The component SHALL emit errors when HLS playback fails.

#### Scenario: Network error

- GIVEN hls.js attempts to load the manifest
- WHEN a network error, 404, or CORS block occurs
- THEN `playerState` SHALL emit `error`
- AND `error` SHALL emit `PLAYER_ERROR`

#### Scenario: Stream error

- GIVEN the stream is playing
- WHEN hls.js emits a stream error
- THEN `playerState` SHALL emit `error`
- AND `error` SHALL emit `PLAYER_ERROR`

#### Scenario: Autoplay blocked

- GIVEN `autoplay` is true and `muted` is false
- WHEN the browser blocks autoplay
- THEN `playerState` SHALL emit `paused` or `idle`

---

### Requirement: Cleanup

The component SHALL destroy the hls.js instance on `ngOnDestroy`.

#### Scenario: Destroy

- GIVEN the component is in any state (playing, paused, error)
- WHEN `ngOnDestroy` is called
- THEN `hls.destroy()` SHALL be called
- AND no resources SHALL leak

---

### Requirement: Responsive Display

The video element SHALL fill its container width.

#### Scenario: Sizing

- GIVEN the component is rendered
- THEN the `<video>` element SHALL have width 100%
- AND SHALL maintain the stream's native aspect ratio

---

## MODIFIED/REMOVED

None.

---

## Summary Table

| Requirement | Type | Scenarios |
|-------------|------|-----------|
| Stream URL Resolution | ADDED | 2 |
| HLS Initialization | ADDED | 2 |
| Playback Control | ADDED | 2 |
| State Emission | ADDED | 2 |
| Error Handling | ADDED | 3 |
| Cleanup | ADDED | 1 |
| Responsive Display | ADDED | 1 |
| **TOTAL** | | **13** |

## Notes

- Relies on `GetStreamUrlUseCase` from the IPTV spec.
- Uses native HTML5 video controls; no custom player UI.
- `PlayerPort` SHALL enable hls.js mocking in Vitest.

## Next Step

Spec is active. Source of truth for stream playback capability.
