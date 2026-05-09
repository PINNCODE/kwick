# Feature Specification: Fix Channel Reload on Menu Open/Close

**Feature Branch**: `003-fix-channel-reload`  
**Created**: 2026-05-09  
**Status**: Draft  
**Input**: User description: "al abrir y cerrar el menu hay un problema, se vuelve a cargar el canal, esto no deberia suceder. el canal se debe cargar cuando inicia el dashboard y cuando el usuario selecciona un canal desde el menu, tambien con las flechas arriba o abajo"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Menu Navigation Without Channel Reload (Priority: P0)

As a user watching a channel, I want to open and close the menu without interrupting the current channel playback, so I can browse available channels without missing content.

**Why this priority**: This is a critical UX bug that interrupts the viewing experience. Users should be able to browse the channel guide without the current channel reloading or restarting.

**Independent Test**: Can be fully tested by:
1. Start watching any channel
2. Press 'M' to open menu
3. Press 'M' or 'Esc' to close menu
4. Verify the channel continues playing without reload/restart

**Acceptance Scenarios**:

1. **Given** a user is watching a channel, **When** they open the menu with 'M', **Then** the channel continues playing without interruption
2. **Given** a user has the menu open, **When** they close it with 'M' or 'Esc', **Then** the same channel continues playing without reload
3. **Given** a user is watching a channel, **When** they navigate between categories using arrow keys, **Then** the current channel does NOT change until they select a new channel

---

### User Story 2 - Channel Changes Only on Explicit Selection (Priority: P0)

As a user, I want the channel to change ONLY when I explicitly select a channel (with Enter key or click), not when I'm just browsing categories with arrow keys.

**Why this priority**: Users need to browse categories and channels to find content without accidentally changing what they're watching. The channel should only change on deliberate selection.

**Independent Test**: Can be fully tested by navigating through multiple categories and channels with arrow keys, verifying the playing channel doesn't change until Enter is pressed.

**Acceptance Scenarios**:

1. **Given** a user is watching Channel A in Category 1, **When** they press right arrow to view Category 2, **Then** Channel A continues playing (no change)
2. **Given** a user is browsing channels with up/down arrows, **When** they navigate to different channels, **Then** the current playing channel does NOT change
3. **Given** a user has highlighted a channel in the menu, **When** they press Enter, **Then** the channel changes to the selected one and menu closes
4. **Given** a user clicks on a channel in the grid, **When** they click, **Then** the channel changes immediately and menu closes

---

### Edge Cases

- What happens when the user navigates to a category that hasn't been loaded yet? The category should load in the background without affecting the current channel
- What happens if the current channel's category is no longer in the loaded categories list? The menu should show available categories without forcing a channel change
- What happens when the user opens the menu immediately after page load? The menu should sync with the currently playing channel's category without reloading it
- How does the system handle rapid category navigation? Multiple rapid arrow key presses should not cause multiple API calls or channel flickering

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST NOT reload or restart the current channel when the menu is opened
- **FR-002**: System MUST NOT reload or restart the current channel when the menu is closed
- **FR-003**: System MUST NOT change the current playing channel when navigating categories with arrow keys (left/right)
- **FR-004**: System MUST NOT change the current playing channel when navigating channels with arrow keys (up/down) within the menu
- **FR-005**: System MUST change the playing channel ONLY when user explicitly selects a channel (Enter key or click)
- **FR-006**: System MUST maintain the current playing channel state independently from the menu's navigation state
- **FR-007**: Menu MUST display a separate `menuCategory` state that can differ from `currentCategory` (the playing channel's category)
- **FR-008**: When menu opens, menuCategory MUST sync with currentCategory for consistent UX, but this sync MUST NOT trigger channel reload
- **FR-009**: Category navigation (left/right arrows) MUST load channels for the new category in background WITHOUT changing currentChannel
- **FR-010**: Channel selection (Enter or click) MUST update currentChannel, currentCategory, and close the menu

### Key Entities

- **currentChannel**: The channel currently playing in the video player (state that affects playback)
- **currentCategory**: The category ID of the currentChannel (state that affects playback)
- **menuCategory**: The category currently displayed in the menu UI (navigation state only, does NOT affect playback)
- **menuChannels**: List of channels in menuCategory (display only, does NOT affect playback until selection)
- **streamsMap**: Cache of loaded channels per category (prevents re-fetching on repeated navigation)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of menu open/close actions do NOT trigger channel reload (verified by monitoring VideoPlayer component re-renders)
- **SC-002**: 100% of category navigation actions (left/right arrows) do NOT change currentChannel
- **SC-003**: 100% of channel navigation actions (up/down arrows) do NOT change currentChannel
- **SC-004**: Channel changes occur ONLY on explicit selection (Enter key or click) - 0 false positives
- **SC-005**: No visible video interruption or buffering when opening/closing menu
- **SC-006**: Menu category navigation feels instant (<100ms) even when loading new category channels from API

## Assumptions

- The VideoPlayer component uses HLS.js for streaming and maintains state via refs
- The VideoPlayer component has a `key={currentChannel.stream_id}` prop that causes remounting when key changes
- The current implementation may have unnecessary state updates or useEffect dependencies causing re-renders
- The fix should preserve existing keyboard navigation functionality
- The fix should preserve existing menu open/close behavior (M key, Esc key, click outside)
- The fix should NOT require changes to the VideoPlayer component itself (fix is in state management)
- Users expect to browse the channel guide without interrupting their viewing experience
- The menu is a modal overlay that appears on top of the video player

