# Data Model: IPTV Player

## Entities

### Category

Represents a group of channels (e.g., "Sports", "News", "Entertainment").

| Field | Type | Description |
|-------|------|-------------|
| category_id | string | Unique identifier from Xtream API |
| category_name | string | Display name |
| parent_id | number | Parent category ID (0 if top-level) |

### LiveStream (Channel)

Represents an individual TV channel with streaming information.

| Field | Type | Description |
|-------|------|-------------|
| num | number | Channel number/order |
| name | string | Display name |
| stream_type | string | Type (usually "live") |
| stream_id | string | Unique stream identifier |
| stream_icon | string | URL to channel logo (optional) |
| epg_channel_id | string | EPG identifier (optional) |
| added | string | Timestamp when added |
| category_id | string | Reference to Category |
| custom_sid | string | Custom stream ID |
| tv_archive | number | DVR availability flag |
| direct_source | string | Alternative source URL |
| tv_archive_duration | number | Hours of archive available |

### UserSession

Stores authentication state and connection info.

| Field | Type | Description |
|-------|------|-------------|
| host | string | Server URL (e.g., "https://ftvpro.net:8443") |
| username | string | Xtream username |
| password | string | Xtream password |
| authenticated | boolean | Current auth status |
| userInfo | UserInfo | Server response data |
| loginTime | number | Timestamp of login |

### UserInfo (from Xtream API)

| Field | Type | Description |
|-------|------|-------------|
| username | string | Confirmed username |
| password | string | Confirmed password |
| message | string | Server message |
| auth | number | Auth status code |
| status | string | Account status |
| exp_date | string | Expiration date |
| is_trial | string | Trial flag |
| active_cons | string | Active connections |
| created_at | string | Account creation |
| max_connections | string | Max allowed connections |
| allowed_output_formats | string[] | Supported formats |

### PlayerState

Tracks current playback state.

| Field | Type | Description |
|-------|------|-------------|
| currentChannel | LiveStream | Currently playing channel |
| isPlaying | boolean | Playback status |
| isBuffering | boolean | Buffering status |
| error | PlayerError | Current error (if any) |
| quality | string | Current quality ("auto" or specific) |
| volume | number | Volume level (always 1.0) |

### LastChannel (Persistence)

Stored in LocalStorage for session recovery.

| Field | Type | Description |
|-------|------|-------------|
| streamId | string | Channel identifier |
| name | string | Channel name |
| categoryId | string | Category reference |
| timestamp | number | When last watched |

### ErrorLog

Records streaming errors for analytics.

| Field | Type | Description |
|-------|------|-------------|
| timestamp | number | When error occurred |
| channelId | string | Channel being played |
| channelName | string | Channel name |
| errorType | ErrorType | Category of error |
| errorCode | string | Specific error code |
| retryCount | number | Number of retries attempted |
| resolved | boolean | Whether error was resolved |
| resolutionTime | number | Milliseconds to resolve |

### ErrorType Enum

```typescript
type ErrorType = 'api' | 'hls' | 'network' | 'buffer' | 'auth';
```

### ErrorStats (Aggregate)

Summary statistics stored in LocalStorage.

| Field | Type | Description |
|-------|------|-------------|
| totalErrors | number | Total error count |
| errorsByType | Record<ErrorType, number> | Count by type |
| errorsByChannel | Record<string, number> | Count by channel |
| avgResolutionTime | number | Average time to resolve |
| lastUpdated | number | Timestamp of last update |

## Relationships

```
Category 1--* LiveStream
UserSession 1--1 UserInfo
PlayerState 1--1 LiveStream
PlayerState 1--0..1 PlayerError
ErrorStats 1--* ErrorLog
```

## State Transitions

### Player State Machine

```
IDLE → LOADING → PLAYING
  ↓       ↓         ↓
ERROR ← BUFFERING ←┘
  ↓
RETRYING → (back to LOADING on success)
  ↓
FAILED (persistent error)
```

### Authentication State

```
LOGGED_OUT → VALIDATING → AUTHENTICATED
                  ↓
             INVALID_CREDENTIALS
                  ↓
             CONNECTIVITY_ERROR
```

## Storage Strategy

| Data | Storage | TTL | Notes |
|------|---------|-----|-------|
| Credentials | LocalStorage | Permanent | Until logout |
| Last Channel | LocalStorage | Permanent | Updated immediately |
| Error Stats | LocalStorage | Permanent | Append-only logs |
| Current Channel | SessionStorage | Session | Current playback |
| Categories | SWR Cache | 5 minutes | Auto-revalidate |
| Channels | SWR Cache | 5 minutes | Per category |
| Auth Token | Memory | Session | Via Zustand |
