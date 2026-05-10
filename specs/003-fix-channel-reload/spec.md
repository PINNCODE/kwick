# Feature Specification: Fix Channel Reload on Menu Open/Close

**Feature Branch**: `003-fix-channel-reload`  
**Created**: 2026-05-09  
**Status**: Draft  
**Input**: 
1. User description: "al abrir y cerrar el menu hay un problema, se vuelve a cargar el canal, esto no deberia suceder. el canal se debe cargar cuando inicia el dashboard y cuando el usuario selecciona un canal desde el menu, tambien con las flechas arriba o abajo"
2. **CLARIFIED**: User requirement: "quiero que el menu cascada se muestre solo categorias, si se selecciona una ahora si muestra + panel de canales mas el epg del canal. el panel de canales y epg es el mismo asi que el boton back de este panel debe de cerrarse y volver solo a categorias."

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

### User Story 3 - Two-Step Cascade Menu Flow (Priority: P0)

As a user, I want the menu to initially show only categories, and only after selecting a category should I see the channels and EPG panels together, so I can browse more efficiently and focus on one level at a time.

**Why this priority**: This provides a cleaner, less overwhelming interface. Users can first choose a category, then focus on channel selection with EPG information visible.

**Independent Test**: Can be fully tested by:
1. Open menu - verify only categories visible
2. Select a category - verify channels + EPG appear
3. Click back button - verify returns to categories-only view

**Acceptance Scenarios**:

1. **Given** the menu is closed, **When** user opens menu with 'M', **Then** only the Categories panel is visible (no channels or EPG)
2. **Given** user is viewing categories, **When** they select a category (click or Enter), **Then** Channels + EPG panels appear together
3. **Given** user is viewing Channels + EPG, **When** they click the back button, **Then** both panels close and only Categories panel remains visible
4. **Given** user is viewing Channels + EPG, **When** they navigate with Left arrow from Channels panel, **Then** they return to Categories-only view

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

### Two-Step Cascade Menu Requirements (CLARIFIED)

- **FR-011**: Menu MUST initially display ONLY the Categories panel when opened (Channels and EPG panels hidden)
- **FR-012**: Menu MUST have a `viewMode` state with values 'categories' or 'channels' to control panel visibility
- **FR-013**: Selecting a category (click or Enter) MUST switch viewMode to 'channels' and display both Channels + EPG panels
- **FR-014**: Back button in Channels panel MUST return to 'categories' viewMode (hiding Channels + EPG)
- **FR-015**: Opening menu MUST always reset viewMode to 'categories' for consistent UX
- **FR-016**: Closing menu MUST reset viewMode to 'categories' for next open
- **FR-017**: Keyboard navigation from Channels panel with Left arrow MUST return to Categories-only view

### Key Entities

- **currentChannel**: The channel currently playing in the video player (state that affects playback)
- **currentCategory**: The category ID of the currentChannel (state that affects playback)
- **menuCategory**: The category currently displayed in the menu UI (navigation state only, does NOT affect playback)
- **menuChannels**: List of channels in menuCategory (display only, does NOT affect playback until selection)
- **streamsMap**: Cache of loaded channels per category (prevents re-fetching on repeated navigation)
- **viewMode**: The current view state of the cascade menu - 'categories' (only categories visible) or 'channels' (channels + EPG visible)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of menu open/close actions do NOT trigger channel reload (verified by monitoring VideoPlayer component re-renders)
- **SC-002**: 100% of category navigation actions (left/right arrows) do NOT change currentChannel
- **SC-003**: 100% of channel navigation actions (up/down arrows) do NOT change currentChannel
- **SC-004**: Channel changes occur ONLY on explicit selection (Enter key or click) - 0 false positives
- **SC-005**: No visible video interruption or buffering when opening/closing menu
- **SC-006**: Menu category navigation feels instant (<100ms) even when loading new category channels from API

### Two-Step Cascade Menu Success Criteria (CLARIFIED)

- **SC-007**: Menu opens showing ONLY Categories panel 100% of the time (Channels + EPG hidden)
- **SC-008**: Category selection switches to Channels + EPG view within 100ms (excluding API load time)
- **SC-009**: Back button returns to Categories-only view 100% of the time
- **SC-010**: Menu always resets to Categories view when reopened after closing

## Assumptions

- The VideoPlayer component uses HLS.js for streaming and maintains state via refs
- The VideoPlayer component has a `key={currentChannel.stream_id}` prop that causes remounting when key changes
- The current implementation may have unnecessary state updates or useEffect dependencies causing re-renders
- The fix should preserve existing keyboard navigation functionality
- The fix should preserve existing menu open/close behavior (M key, Esc key, click outside)
- The fix should NOT require changes to the VideoPlayer component itself (fix is in state management)
- Users expect to browse the channel guide without interrupting their viewing experience
- The menu is a modal overlay that appears on top of the video player


## Clarifications

### Session 2026-05-10

- **Q**: What is the exact behavior expected for the cascade menu flow?  
  **A**: Two-step flow: (1) Menu opens showing ONLY categories, (2) Selecting a category shows Channels + EPG together, (3) Back button returns to categories-only view

- **Q**: How should the back button behave in the Channels panel?  
  **A**: Back button should close Channels + EPG panels and return to categories-only view (not just move panel focus)

- **Q**: Should menu remember the view mode (categories vs channels) when reopened?  
  **A**: No, menu should always reset to categories-only view when opened

- **Q**: What state is needed to implement this?  
  **A**: Add `viewMode` state ('categories' | 'channels') to control panel visibility, separate from `activePanel` which controls focus

- **Q**: Should keyboard navigation change?  
  **A**: Left arrow from Channels panel returns to categories view; Right arrow from Categories advances to channels view
