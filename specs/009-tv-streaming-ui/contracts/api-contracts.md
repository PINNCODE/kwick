# API Contracts: TV Streaming Interface Overlay

## Contract 1: Get Live Categories

**Endpoint**: `GET /player_api.php`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | Xtream username |
| password | string | Yes | Xtream password |
| action | string | Yes | `get_live_categories` |

**Response** (200 OK):
```json
[
  {
    "category_id": "1",
    "category_name": "WORLD CUP 2026",
    "parent_id": 0
  },
  {
    "category_id": "2",
    "category_name": "CANALES PREMIUM",
    "parent_id": 0
  }
]
```

**Maps to**: `Category[]` in `types/xtream.ts`

---

## Contract 2: Get Live Streams (with optional category filter)

**Endpoint**: `GET /player_api.php`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | Xtream username |
| password | string | Yes | Xtream password |
| action | string | Yes | `get_live_streams` |
| category_id | string | No | Filter by category |

**Response** (200 OK):
```json
[
  {
    "num": 1,
    "name": "CP || AZTECA UNO",
    "stream_type": "live",
    "stream_id": "101",
    "stream_icon": "https://example.com/logos/azteca-uno.png",
    "epg_channel_id": "epg_101",
    "added": "2024-01-15",
    "category_id": "1",
    "custom_sid": "",
    "tv_archive": 0,
    "direct_source": "",
    "tv_archive_duration": 0
  }
]
```

**Maps to**: `LiveStream[]` in `types/xtream.ts`

---

## Contract 3: Get Short EPG (Program Guide)

**Endpoint**: `GET /player_api.php`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | Xtream username |
| password | string | Yes | Xtream password |
| action | string | Yes | `get_short_epg` |
| stream_id | string | Yes | Channel stream ID |

**Response** (200 OK):
```json
{
  "epg_listings": [
    {
      "id": "12345",
      "title": "RTC",
      "start": "1715364780",
      "end": "1715379000",
      "description": "Program description"
    },
    {
      "id": "12346",
      "title": "Inova",
      "start": "1715364780",
      "end": "1715382000",
      "description": "Program description"
    }
  ]
}
```

**Maps to**: `Program[]` (new type in `types/streaming.ts`)

**Polling**: Every 15 minutes via SWR `refreshInterval`

---

## Error Responses

| Scenario | HTTP Status | Behavior |
|----------|-------------|----------|
| Invalid credentials | 401 | Show login prompt |
| Server unreachable | Network error | Show "Connection error" fallback with retry |
| Empty category | 200, `[]` | Show "No hay canales disponibles" |
| EPG unavailable | 200, `{}` or `{ epg_listings: [] }` | Show "Información del programa temporalmente no disponible" |
| Missing end time | 200, `end: null` | Show "Hora de fin por definir" |
