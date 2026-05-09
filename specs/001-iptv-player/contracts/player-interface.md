# Interface Contracts: IPTV Player

## Xtream API Client

### XtreamAPI Interface

```typescript
interface XtreamAPI {
  // Validation
  checkConnectivity(host: string): Promise<boolean>;
  
  // Authentication
  authenticate(credentials: Credentials): Promise<AuthResult>;
  
  // Data fetching
  getCategories(): Promise<Category[]>;
  getStreams(categoryId?: string): Promise<LiveStream[]>;
  
  // Stream URL construction
  getStreamUrl(streamId: string): string;
}

interface Credentials {
  host: string;
  username: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  userInfo?: UserInfo;
  error?: string;
}
```

## Video Player Component

### VideoPlayer Props

```typescript
interface VideoPlayerProps {
  channel: LiveStream;
  autoPlay?: boolean;
  onError?: (error: PlayerError) => void;
  onPlaying?: () => void;
  onBuffering?: () => void;
}

interface PlayerError {
  code: string;
  message: string;
  type: 'network' | 'media' | 'decode' | 'other';
  recoverable: boolean;
}
```

### VideoPlayer API (via ref)

```typescript
interface VideoPlayerRef {
  play(): void;
  pause(): void;
  reload(): void;
  destroy(): void;
  getCurrentTime(): number;
  getDuration(): number;
}
```

## Menu System

### MenuOverlay Props

```typescript
interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  streams: Map<string, LiveStream[]>;
  currentChannel: LiveStream;
  onSelectChannel: (channel: LiveStream) => void;
}
```

### Keyboard Navigation

```typescript
interface KeyboardNavigation {
  // Menu toggle
  toggleMenu: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  
  // Navigation
  moveNext: () => void;
  movePrevious: () => void;
  moveNextCategory: () => void;
  movePreviousCategory: () => void;
  
  // Selection
  select: () => void;
}
```

## Error Handling

### ErrorToast System

```typescript
interface ToastSystem {
  show(message: string, type: 'info' | 'warning' | 'error', persistent?: boolean): void;
  hide(id: string): void;
  hideAll(): void;
}

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  persistent: boolean;
  autoDismiss?: number; // ms, undefined for persistent
}
```

### Error Analytics

```typescript
interface ErrorAnalytics {
  logError(error: ErrorLog): void;
  resolveError(channelId: string, timestamp: number): void;
  getStats(): ErrorStats;
  exportStats(): string; // JSON string
}
```

## Storage Interface

### StorageService

```typescript
interface StorageService {
  // Credentials
  saveCredentials(credentials: Credentials): void;
  getCredentials(): Credentials | null;
  clearCredentials(): void;
  
  // Last channel
  saveLastChannel(channel: LastChannel): void;
  getLastChannel(): LastChannel | null;
  
  // Error stats
  saveErrorStats(stats: ErrorStats): void;
  getErrorStats(): ErrorStats;
  appendErrorLog(log: ErrorLog): void;
  
  // Session
  saveSessionState(state: SessionState): void;
  getSessionState(): SessionState | null;
  clearSession(): void;
}
```

## API Routes

### POST /api/xtream/health

**Request:**
```json
{
  "host": "https://example.com:8080"
}
```

**Response:**
```json
{
  "reachable": true,
  "latency": 120
}
```

### POST /api/xtream/auth

**Request:**
```json
{
  "host": "https://example.com:8080",
  "username": "user",
  "password": "pass"
}
```

**Response (Success):**
```json
{
  "success": true,
  "userInfo": {
    "username": "user",
    "status": "Active",
    "exp_date": "1715000000"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### GET /api/xtream/categories

**Response:**
```json
[
  {
    "category_id": "1",
    "category_name": "Sports",
    "parent_id": 0
  }
]
```

### GET /api/xtream/streams

**Query:** `?category_id=1`

**Response:**
```json
[
  {
    "num": 1,
    "name": "ESPN",
    "stream_id": "123",
    "stream_icon": "http://...",
    "category_id": "1"
  }
]
```
