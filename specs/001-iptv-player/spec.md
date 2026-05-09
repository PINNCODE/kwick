# Feature Specification: IPTV Player with Xtream Codes

**Feature Branch**: `001-iptv-player`  
**Created**: 2026-05-09  
**Status**: Ready for Implementation  
**Input**: A live TV player that leverages HLS technology for adaptive streaming, with a minimalist interface where the screen is 100% video and a quick keyboard access menu that allows navigation between categories and channels without visual interruptions.

## User Scenarios & Testing

### User Story 1 - Login and Authentication (Priority: P1)

User opens the application and needs to authenticate with their IPTV provider credentials. The system validates connectivity before attempting authentication and persists credentials for future sessions.

**Why this priority**: Authentication is the entry point to the entire application. Without valid credentials, no other functionality is accessible.

**Independent Test**: Can be fully tested by verifying login form validation, connectivity check, and credential persistence.

**Acceptance Scenarios**:

1. **Given** the user enters valid host, username, and password, **When** they submit the form, **Then** the system validates connectivity (5s timeout), authenticates, and redirects to the player
2. **Given** the user enters invalid credentials, **When** they submit the form, **Then** an error message is displayed and credentials are not saved
3. **Given** the server does not respond within 5 seconds, **When** the user submits the form, **Then** an error message about connectivity is displayed
4. **Given** valid credentials were previously saved, **When** the user opens the app, **Then** auto-login occurs and the user is redirected to the player

---

### User Story 2 - Auto-Play and Channel Persistence (Priority: P1)

After authentication, the application automatically starts playing the first channel of the first category. When the user changes channels, the selection is persisted immediately. On page refresh, the application resumes playing the last watched channel.

**Why this priority**: Core functionality of the player. Users expect immediate playback and continuity across sessions.

**Independent Test**: Can be tested by verifying auto-play on login, channel change persistence in LocalStorage, and recovery of last channel on refresh.

**Acceptance Scenarios**:

1. **Given** successful login, **When** the player loads, **Then** the first channel of the first category starts playing automatically
2. **Given** the user is watching a channel, **When** they select a different channel, **Then** the new channel is saved as "lastChannel" in LocalStorage immediately
3. **Given** the user previously watched a specific channel, **When** they refresh the page, **Then** the last watched channel resumes playing (or first available if it no longer exists)
4. **Given** the player is active, **When** the user closes and reopens the app, **Then** the last channel from previous session starts playing

---

### User Story 3 - Keyboard Navigation (Priority: P1)

Users navigate the application entirely through keyboard shortcuts. A semi-transparent menu overlay appears without interrupting video playback. Navigation uses arrow keys for channels and categories, with Enter to select.

**Why this priority**: Essential UX feature for a TV-like experience. Users expect quick, non-intrusive navigation.

**Independent Test**: Can be tested by verifying all keyboard shortcuts work correctly and menu appears as overlay without pausing video.

**Acceptance Scenarios**:

1. **Given** the player is active, **When** the user presses 'M' or 'Escape', **Then** a semi-transparent menu overlay appears without pausing the video
2. **Given** the menu is open, **When** the user presses ↑ or ↓, **Then** the selection moves between channels in the current category
3. **Given** the menu is open, **When** the user presses ← or →, **Then** the selection moves between categories
4. **Given** a channel is selected in the menu, **When** the user presses Enter, **Then** the menu closes and the selected channel starts playing
5. **Given** the menu is open, **When** the user presses 'M' or 'Escape' again, **Then** the menu closes without changing the channel

---

### User Story 4 - Error Handling and Recovery (Priority: P2)

The player handles streaming errors gracefully with automatic retries, visual feedback through toast notifications, and persistent error statistics for debugging.

**Why this priority**: Important for user experience but secondary to core functionality. Application should degrade gracefully when streams fail.

**Independent Test**: Can be tested by simulating network errors and verifying retry logic, toast display, and statistics persistence.

**Acceptance Scenarios**:

1. **Given** the stream encounters a network error, **When** the error occurs, **Then** the system attempts 3 automatic retries with exponential backoff (1s, 2s, 4s delays)
2. **Given** retries are in progress, **When** each retry occurs, **Then** a toast notification shows "Reconectando..."
3. **Given** the stream recovers after retries, **When** playback resumes, **Then** the toast disappears automatically
4. **Given** all retries fail, **When** the final attempt fails, **Then** a persistent toast shows "Error de conexión" and the error is logged to LocalStorage statistics
5. **Given** multiple errors have occurred, **When** checking statistics, **Then** the system shows error count by type, channel, and average resolution time

---

### Edge Cases

1. **What happens when the user's stored credentials are invalid (password changed)?** → Redirect to login with error message
2. **What happens when the last watched channel no longer exists in the API?** → Fall back to first channel of first category
3. **What happens when all channels in a category fail to load?** → Show error state, allow navigation to other categories
4. **What happens when the network goes offline mid-stream?** → Pause playback, show offline toast, resume automatically when connection returns
5. **What happens when the API rate limits the requests?** → Implement client-side throttling, show appropriate error message
6. **What happens when the HLS stream format is unsupported?** → Show error toast, attempt fallback quality levels

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a login form with fields for host URL, username, and password
- **FR-002**: System MUST validate server connectivity with a 5-second timeout before authentication
- **FR-003**: System MUST persist valid credentials in LocalStorage for auto-login on subsequent visits
- **FR-004**: System MUST automatically play the first channel of the first category upon successful login
- **FR-005**: System MUST persist the currently playing channel to LocalStorage immediately when changed
- **FR-006**: System MUST recover and play the last watched channel on page refresh (or fallback to first available)
- **FR-007**: System MUST display a semi-transparent menu overlay when 'M' or 'Escape' is pressed
- **FR-008**: System MUST support keyboard navigation (↑/↓ for channels, ←/→ for categories, Enter to select)
- **FR-009**: System MUST always display video in fullscreen mode without visible player controls
- **FR-010**: System MUST handle stream errors with 3 automatic retries using exponential backoff
- **FR-011**: System MUST display toast notifications during retries that auto-dismiss on recovery
- **FR-012**: System MUST persist error statistics (timestamp, channel, type, resolution time) to LocalStorage
- **FR-013**: System MUST cache categories and channels for 5 minutes using SWR
- **FR-014**: System MUST NOT pause video playback when menu is open
- **FR-015**: System MUST maintain volume at 100% without user controls

### Key Entities

- **Channel**: Represents an IPTV channel with id, name, category, stream URL, and logo
- **Category**: Groups channels (e.g., "Sports", "News") with id, name, and display order
- **UserSession**: Stores authentication state with host, credentials, and login timestamp
- **PlayerState**: Tracks current playback state (channel, playing status, errors)
- **ErrorLog**: Records streaming errors with details for debugging and statistics

## Success Criteria

### Measurable Outcomes

- **SC-001**: User can complete login in under 10 seconds (including connectivity check)
- **SC-002**: Video starts playing automatically within 2 seconds of successful login
- **SC-003**: Channel change persists and is recoverable after page refresh (100% reliability)
- **SC-004**: Menu overlay responds to keyboard input within 100ms
- **SC-005**: Error recovery with 3 retries completes within 7 seconds maximum
- **SC-006**: Toast notifications appear and dismiss appropriately without user intervention
- **SC-007**: Application maintains fullscreen mode throughout entire session
- **SC-008**: Category and channel lists load within 3 seconds with 5-minute cache

## Assumptions

- Users have stable internet connectivity for streaming (degraded handling via retries)
- Xtream Codes API follows standard specification with player_api.php endpoints
- HLS streams are accessible via direct URLs (CORS handling via Next.js proxy if needed)
- Modern browser with HLS support (or hls.js fallback)
- Single user per device (no multi-profile support in this version)
- Server IPTV provider maintains reasonable uptime (intermittent failures handled gracefully)
