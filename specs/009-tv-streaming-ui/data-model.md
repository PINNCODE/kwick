# Data Model: TV Streaming Interface Overlay

## Entities

### Category

Represents a grouping of TV channels (e.g., "World Cup 2026", "Canales Premium").

```typescript
interface Category {
  category_id: string;      // Unique identifier from Xtream API
  category_name: string;    // Display name (Spanish)
  parent_id: number;        // Parent category (0 for top-level)
  isFeatured: boolean;      // Whether to highlight with blue accent
}
```

**Source**: Xtream API `get_live_categories` action, mapped from `Category` type in `types/xtream.ts`.

**isFeatured logic**: Categories matching known premium/featured names (World Cup 2026, Canales Premium, La Mansión VIP) are flagged as featured for blue highlighting (FR-004).

### Channel

Represents an individual TV channel with streaming metadata.

```typescript
interface Channel {
  num: number;              // Sequential channel number (FR-014)
  name: string;             // Display name
  stream_id: string;        // Unique stream identifier
  stream_icon: string;      // Logo URL (32x32px square display)
  category_id: string;      // Parent category reference
  epg_channel_id: string;   // EPG lookup identifier
}
```

**Source**: Xtream API `get_live_streams` action, mapped from `LiveStream` type in `types/xtream.ts`.

### Program

Represents a scheduled broadcast item in the program guide.

```typescript
interface Program {
  id: string;               // Unique program identifier
  title: string;            // Program name
  start: string;            // Start time (Unix timestamp from API)
  end: string;              // End time (Unix timestamp from API)
  isLive: boolean;          // Whether currently broadcasting (FR-008)
}
```

**Source**: Xtream API `get_short_epg` action. The existing `getEPG` method returns `any[]` — this interface provides proper typing.

**isLive computation**: `isLive = Date.now() >= start * 1000 && Date.now() < end * 1000`

### Streaming UI State

Zustand store state for panel interactions.

```typescript
interface StreamingUIState {
  selectedCategoryId: string | null;  // Currently selected category
  selectedChannelId: string | null;   // Currently selected channel
  setSelectedCategory: (id: string | null) => void;
  setSelectedChannel: (id: string | null) => void;
  resetSelection: () => void;
}
```

**Behavior**: 
- Setting `selectedCategoryId` filters the channel list (FR-009)
- Setting `selectedChannelId` triggers program guide update (FR-010)
- Both can be null (initial state, no selection)

## Relationships

```
Category (1) ──→ (*) Channel
Channel (1) ──→ (*) Program (via EPG lookup)
```

- A category contains multiple channels
- A channel has multiple program entries in its EPG
- Programs are looked up per-channel via `stream_id` → `getEPG(streamId)`

## Data Flow

```
Xtream API → getCategories() → Category[] → CategoriesPanel
Xtream API → getStreams(catId) → Channel[] → ChannelsPanel
Xtream API → getEPG(streamId) → Program[] → ProgramGuidePanel
                                    (15-min polling via SWR)
```
