# Delta for kwick-move-to-player-route

## ADDED Requirements

### Requirement: /player Route

The application SHALL provide a `/player` route that renders the full stream-player experience.

#### Scenario: Navigate to /player

- GIVEN the user navigates to `/player`
- WHEN the route resolves
- THEN `PlayerComponent` SHALL be rendered
- AND SHALL display `<app-stream-player>` and `<app-stream-layer>` within the player container

#### Scenario: Root route redirect

- GIVEN the user navigates to `/` (root)
- WHEN the route resolves
- THEN the application SHALL redirect to `/player`

---

### Requirement: Stream Layer Toggle via 'm' Key

The `PlayerComponent` SHALL toggle the visibility of the stream layer when the user presses the 'm' key.

#### Scenario: Toggle stream layer visible

- GIVEN the stream layer is hidden
- AND the `PlayerComponent` main element has focus
- WHEN the user presses the 'm' key
- THEN `streamLayerVisible` signal SHALL be set to `true`
- AND the stream layer SHALL become visible

#### Scenario: Toggle stream layer hidden

- GIVEN the stream layer is visible
- AND the `PlayerComponent` main element has focus
- WHEN the user presses the 'm' key
- THEN `streamLayerVisible` signal SHALL be set to `false`
- AND the stream layer SHALL be hidden

#### Scenario: 'm' key requires focus

- GIVEN the `PlayerComponent` main element does NOT have focus
- WHEN the user presses the 'm' key
- THEN the stream layer SHALL NOT toggle

---

### Requirement: Signal State Ownership

The `PlayerComponent` SHALL own all reactive state for the stream player feature.

#### Scenario: Stream URL signal

- GIVEN `PlayerComponent` initializes
- THEN it SHALL maintain a `streamUrl` signal
- AND SHALL pass `streamUrl` to `StreamPlayerComponent` as input

#### Scenario: Player state signal

- GIVEN the stream is playing
- WHEN `StreamPlayerComponent` emits `playerState`
- THEN `PlayerComponent` SHALL update its `playerState` signal
- AND SHALL pass it to `StreamLayerComponent`

#### Scenario: Error signal

- GIVEN an error occurs in `StreamPlayerComponent`
- WHEN `error` emits
- THEN `PlayerComponent` SHALL update its `errorMessage` signal
- AND the stream layer SHALL display the error state

---

### Requirement: Playback Control Handlers

The `PlayerComponent` SHALL delegate playback control to `StreamLayerComponent` events.

#### Scenario: Toggle play/pause

- GIVEN the user clicks the play/pause button in stream layer
- WHEN `StreamLayerComponent` emits `togglePlayPause`
- THEN `PlayerComponent` SHALL call `togglePlay()` on the `StreamPlayerComponent` reference

#### Scenario: Toggle mute

- GIVEN the user clicks the mute button in stream layer
- WHEN `StreamLayerComponent` emits `toggleMute`
- THEN `PlayerComponent` SHALL call `toggleMute()` on the `StreamPlayerComponent` reference

#### Scenario: Volume change

- GIVEN the user adjusts the volume slider in stream layer
- WHEN `StreamLayerComponent` emits `volumeChange`
- THEN `PlayerComponent` SHALL call `setVolume(volume)` on the `StreamPlayerComponent` reference

---

### Requirement: StreamPlayerComponent Export

The `StreamPlayerComponent` SHALL be exported from the shared barrel.

#### Scenario: Shared barrel export

- GIVEN a consumer imports from `shared/index.ts`
- WHEN `StreamPlayerComponent` is referenced
- THEN it SHALL be available as a named export

---

## MODIFIED Requirements

None (pure addition; no existing stream-playback behavior is changed).

---

## REMOVED Requirements

### Requirement: App Shell as Stream Owner

(Reason: Stream player logic moved to `PlayerComponent`. App shell is now a thin router outlet only.)

- GIVEN any user interaction with stream controls
- WHEN that interaction previously relied on `App` component signal state
- THEN `App` SHALL no longer handle that interaction
- AND `PlayerComponent` SHALL handle it instead

---

## Summary Table

| Requirement | Type | Scenarios |
|-------------|------|-----------|
| /player Route | ADDED | 2 |
| Stream Layer Toggle via 'm' Key | ADDED | 3 |
| Signal State Ownership | ADDED | 3 |
| Playback Control Handlers | ADDED | 3 |
| StreamPlayerComponent Export | ADDED | 1 |
| App Shell as Stream Owner | REMOVED | 1 |
| **TOTAL** | | **13** |

---

## Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| 'm' key pressed before focus | No toggle occurs; focus must be established first |
| Stream URL unavailable | `errorMessage` signal updates; stream layer shows error state |
| Player fails to initialize | `playerState` emits `error`; error displayed in stream layer |
| Rapid 'm' key presses | Each press toggles once; no debounce required |
| Navigating away mid-stream | `ngOnDestroy` cleans up HLS.js instance via `StreamPlayerComponent` |

---

## Next Step

Ready for design (sdd-design). If design already exists, ready for tasks (sdd-tasks).
