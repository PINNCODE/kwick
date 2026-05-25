# Proposal: IPTV Player API Consumption — Hexagonal Architecture

## Intent

Implement a typed Angular 21 API consumption layer for IPTV Player Xtream-compatible servers using Hexagonal Architecture (Ports & Adapters). Isolates domain logic from HTTP concerns, enables testability, and provides clean interfaces for future frontend integration.

## Scope

### In Scope
- **5 API endpoints**: Login, Categories, Livestreams, EPG, Stream URL composition
- **Domain entities**: User, ServerInfo, AuthResult, Category, Stream, EPGListing
- **Use cases**: LoginUseCase, GetCategoriesUseCase, GetLivestreamsUseCase, GetEPGUseCase, GetStreamUrlUseCase
- **Outbound port**: IptvApiPort (HTTP adapter interface)
- **Inbound ports**: AuthService, CategoryService, StreamService, EpgService
- **Hexagonal folder structure** with domain/core, application, and infrastructure layers
- **RxJS-based reactive patterns** with typed responses
- **Base64 decoding utility** for EPG title/description
- **Encrypted credential storage** using Dexie.js (IndexedDB) + Web Crypto API (AES-GCM)
- **Master password** for deriving encryption key via PBKDF2 (100k+ iterations)

### Out of Scope
- Frontend UI components (user explicitly deferred)
- Video player implementation
- M3U8 playlist parsing beyond URL generation
- Token refresh / session renewal logic
- Server-side rendering

## Capabilities

### New Capabilities
- `iptv-auth`: Login authentication against Xtream-compatible API
- `iptv-categories`: Retrieve and type live TV categories
- `iptv-streams`: Retrieve and type live stream listings
- `iptv-epg`: Retrieve and decode EPG listings with Base64 decoding
- `iptv-stream-url`: Compose stream URLs for playback

## Approach

### Hexagonal Architecture Layers

```
src/
├── core/                          # Domain layer (no external deps)
│   ├── domain/
│   │   ├── entities/              # User, ServerInfo, AuthResult, Category, Stream, EPGListing
│   │   └── value-objects/         # StreamUrl
│   ├── ports/
│   │   ├── outbound/             # IptvApiPort, CredentialStoragePort, EncryptionPort
│   │   └── inbound/              # AuthService, CategoryService, StreamService, EpgService
│   └── application/
│       └── use-cases/            # LoginUseCase, GetCategoriesUseCase, GetLivestreamsUseCase, GetEPGUseCase, GetStreamUrlUseCase
├── infrastructure/               # Adapters layer
│   ├── http/                      # Angular HttpClient adapter implementing IptvApiPort
│   │   └── xtream-http.adapter.ts
│   ├── storage/                   # Dexie.js adapter implementing CredentialStoragePort
│   │   └── credential-db.adapter.ts
│   ├── crypto/                    # Web Crypto API adapter implementing EncryptionPort
│   │   └── web-crypto.adapter.ts
│   └── parsing/                   # Base64 decoding, URL composition
│       └── epg-decoder.ts
└── app/                          # Angular bootstrap (minimal)
```

### HTTP Client Strategy
- Angular `HttpClient` with typed `HttpResponse<T>` responses
- `HttpErrorResponse` handling via centralized error interceptor
- Requests return `Observable<T>` from use cases

### Credential Storage (Dexie.js + Web Crypto API)
- **Dexie.js** (IndexedDB wrapper) for persistent browser storage
- Credentials stored **encrypted** using **AES-GCM** (Web Crypto API)
- **Master password** required to derive encryption key via **PBKDF2** (100k+ iterations, random salt)
- Schema: `credentials` table with `id`, `host`, `username`, `password_cipher`, `iv`, `salt`
- **Logout** = `Dexie.delete()` → complete database wipe (no residual data)
- Key never stored; derived on-the-fly from master password + stored salt

**Encryption Flow:**
```
Master Password + Random Salt → PBKDF2 (100k iteraciones) → AES Key
Credentials → AES-GCM Encrypt → Store { password_cipher, iv, salt } in Dexie
Read from Dexie → AES-GCM Decrypt with derived Key → Use for API calls
Logout → Dexie.delete() → All data destroyed
```

### Base64 Decoding
- EPG API returns title/description as Base64-encoded strings
- `epg-decoder.ts` utility: `decodeBase64(encoded: string): string`
- Handle malformed Base64 gracefully with fallback to raw string

### Stream URL Composition
- URL template: `{host}/live/{username}/{password}/{streamId}.m3u8`
- `StreamUrlService.compose(streamId: string): string`
- No actual M3U8 parsing — URL passed directly to video player

### Error Handling
- `HttpErrorInterceptor` catches all HTTP errors
- Domain-specific `IptvApiException` with codes: `AUTH_FAILED`, `NETWORK_ERROR`, `SERVER_ERROR`, `DECODE_ERROR`
- Use cases expose errors via `throwError()` in Observable chain

## Domain Model

```typescript
// entities/user.ts
interface User {
  username: string;
}

interface ServerInfo {
  url: string;
  port: number;
  httpsPort: number;
  serverProtocol: string;
  rtmpPort: number;
  timestamp: number;
}

interface AuthResult {
  user: User;
  serverInfo: ServerInfo;
  authToken?: string;
  status: 'active' | 'expired' | 'disabled';
}

// entities/category.ts
interface Category {
  id: number;
  name: string;
  type: 'live';  // future-proofing for VOD
}

// entities/stream.ts
interface Stream {
  id: number;
  name: string;
  categoryId: number;
  type: 'live';
  thumbnail?: string;
}

// entities/epg-listing.ts
interface EPGListing {
  id: number;
  channelId: number;
  title: string;        // decoded from Base64
  description: string; // decoded from Base64
  startTime: Date;
  endTime: Date;
  startTimestamp: number;
  endTimestamp: number;
}
```

## Use Cases

### LoginUseCase
**Input**: `{ username: string, password: string }`
**Output**: `Observable<AuthResult>`
**Errors**: `IptvApiException(AUTH_FAILED | SERVER_ERROR)`

### GetCategoriesUseCase
**Input**: `void`
**Output**: `Observable<Category[]>`
**Errors**: `IptvApiException(NETWORK_ERROR | SERVER_ERROR)`

### GetLivestreamsUseCase
**Input**: `categoryId?: number`
**Output**: `Observable<Stream[]>`
**Errors**: `IptvApiException(NETWORK_ERROR | SERVER_ERROR)`

### GetEPGUseCase
**Input**: `{ streamId: number, limit?: number }`
**Output**: `Observable<EPGListing[]>` (decoded)
**Errors**: `IptvApiException(NETWORK_ERROR | SERVER_ERROR | DECODE_ERROR)`

### GetStreamUrlUseCase
**Input**: `{ streamId: number }`
**Output**: `string` (composed URL)
**Errors**: none (pure composition)

## Ports & Adapters

### Outbound Port — IptvApiPort
```typescript
interface IptvApiPort {
  login(username: string, password: string): Observable<AuthResult>;
  getCategories(): Observable<Category[]>;
  getLivestreams(categoryId?: number): Observable<Stream[]>;
  getEPG(streamId: number, limit?: number): Observable<EPGListing[]>;
}
```

### Outbound Port — EncryptionPort
```typescript
interface EncryptionPort {
  deriveKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey>;
  encrypt(data: string, key: CryptoKey): Promise<{ cipher: string; iv: Uint8Array }>;
  decrypt(cipher: string, iv: Uint8Array, key: CryptoKey): Promise<string>;
  generateSalt(): Uint8Array;
}
```

### Outbound Port — CredentialStoragePort
```typescript
interface CredentialRecord {
  id: string;
  host: string;
  username: string;
  passwordCipher: string;
  iv: string;
  salt: string;
}

interface CredentialStoragePort {
  save(credentials: CredentialRecord): Promise<void>;
  get(): Promise<CredentialRecord | undefined>;
  delete(): Promise<void>;
  exists(): Promise<boolean>;
}
```

### Inbound Ports — Service Interfaces
```typescript
interface AuthService {
  login(credentials: { username: string; password: string; host: string }, masterPassword: string): Observable<AuthResult>;
  restoreSession(masterPassword: string): Promise<boolean>;
  getCurrentUser(): User | null;
  isAuthenticated(): boolean;
  logout(): Promise<void>;
}

interface CategoryService {
  getCategories(): Observable<Category[]>;
  getCategoryById(id: number): Observable<Category | null>;
}

interface StreamService {
  getStreams(categoryId?: number): Observable<Stream[]>;
  getStreamById(id: number): Observable<Stream | null>;
  getStreamUrl(streamId: number): string;
}

interface EpgService {
  getEPG(streamId: number, limit?: number): Observable<EPGListing[]>;
}
```

### HTTP Adapter
```typescript
@Injectable()
class XtreamHttpAdapter implements IptvApiPort {
  constructor(
    private http: HttpClient,
    private credentialStore: CredentialStore
  ) {}

  // Implements all IptvApiPort methods with proper typing and error handling
}
```

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/core/domain/entities/` | New | User, ServerInfo, AuthResult, Category, Stream, EPGListing |
| `src/core/domain/value-objects/` | New | StreamUrl |
| `src/core/ports/outbound/` | New | IptvApiPort, CredentialStoragePort, EncryptionPort |
| `src/core/ports/inbound/` | New | AuthService, CategoryService, StreamService, EpgService |
| `src/core/application/use-cases/` | New | 5 use case classes |
| `src/infrastructure/http/` | New | XtreamHttpAdapter implementing IptvApiPort |
| `src/infrastructure/storage/` | New | CredentialDbAdapter implementing CredentialStoragePort (Dexie.js) |
| `src/infrastructure/crypto/` | New | WebCryptoAdapter implementing EncryptionPort |
| `src/infrastructure/parsing/` | New | EPG decoder utility |
| `src/infrastructure/interceptors/` | New | HttpErrorInterceptor |
| `src/app/app.config.ts` | Modified | Register providers |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Base64 decoding failures on malformed EPG data | Medium | `try/catch` with fallback to raw string + warning log |
| Server returns non-JSON error responses | Medium | HttpInterceptor checks `responseType` before parsing |
| Master password forgotten | High | No recovery (by design); user must re-authenticate |
| IndexedDB unavailable in private browsing | Low | Graceful fallback with user warning |
| API version mismatch with Xtream API variants | Medium | Typed interfaces with optional fields; adapter validates response shape |
| HttpClient errors during concurrent requests | Low | RxJS `retry()` with exponential backoff on GET requests |

## Rollback Plan

1. Delete `src/core/` and `src/infrastructure/` directories
2. Remove adapter registrations from `app.config.ts`
3. Revert any modifications to `app.config.ts`
4. No database migrations or data changes involved

## Dependencies

- `@angular/common/http` — HttpClient
- `rxjs` — Observable patterns (already in Angular)
- `dexie` — IndexedDB wrapper for credential storage
- No other additional npm packages required

## Success Criteria

- [ ] All 5 endpoints return correctly typed responses
- [ ] Use cases are unit-testable without HTTP mock complexity
- [ ] Base64 EPG fields are decoded before reaching consumers
- [ ] Credentials are encrypted with AES-GCM before stored in Dexie (IndexedDB)
- [ ] Master password is never stored; key derived via PBKDF2
- [ ] Logout deletes entire Dexie database
- [ ] `IptvApiException` errors contain actionable error codes
- [ ] Folder structure clearly separates domain from infrastructure concerns
