# SDD Implementation Tasks — IPTV API Consumption

**Change:** `iptv-api-consumption`
**Spec:** `openspec/changes/iptv-api-consumption/specs/iptv/spec.md`
**Design:** `openspec/changes/iptv-api-consumption/designs/iptv/design.md`
**Stack:** Angular 21, RxJS, Dexie.js, Web Crypto API
**Architecture:** Hexagonal (Ports & Adapters)

---

## Implementation Order

1. Core Domain Layer (entities, value objects, error model)
2. Core Ports Layer (outbound, inbound)
3. Core Application Layer (use cases)
4. Infrastructure Adapters (crypto, storage, http, parsing, interceptors)
5. App Configuration

---

## Phase 1: Core Domain Layer

### 1.1 Entity Interfaces

- [x] **Create `src/core/domain/entities/user.entity.ts`**
  - Export `User` interface with `username: string`

- [x] **Create `src/core/domain/entities/server-info.entity.ts`**
  - Export `ServerInfo` interface with fields: `url`, `port`, `httpsPort`, `serverProtocol`, `rtmpPort`, `timestamp`

- [x] **Create `src/core/domain/entities/auth-result.entity.ts`**
  - Export `AuthStatus` type: `'active' | 'expired' | 'disabled'`
  - Export `AuthResult` interface with: `user`, `serverInfo`, `authToken?`, `status`

- [x] **Create `src/core/domain/entities/category.entity.ts`**
  - Export `CategoryType` type: `'live'`
  - Export `Category` interface with: `id`, `name`, `type`

- [x] **Create `src/core/domain/entities/stream.entity.ts`**
  - Export `StreamType` type: `'live'`
  - Export `Stream` interface with: `id`, `name`, `categoryId`, `type`, `thumbnail?`

- [x] **Create `src/core/domain/entities/epg-listing.entity.ts`**
  - Export `EPGListing` interface with: `id`, `channelId`, `title`, `description`, `startTime`, `endTime`, `startTimestamp`, `endTimestamp`

### 1.2 Value Objects

- [x] **Create `src/core/domain/value-objects/stream-url.vo.ts`**
  - Export `StreamUrl` class with:
    - Private constructor accepting `url: string`
    - Static `compose(host, username, password, streamId): StreamUrl` factory method
    - `toString(): string` method
    - URL format: `{host}/live/{username}/{password}/{streamId}.m3u8`

### 1.3 Error Model

- [x] **Create `src/core/error/error-codes.ts`**
  - Export `ErrorCode` enum with values: `AUTH_FAILED`, `AUTH_REQUIRED`, `NETWORK_ERROR`, `SERVER_ERROR`, `DECODE_ERROR`, `DECRYPTION_FAILED`, `ENCRYPTION_FAILED`

- [x] **Create `src/core/error/iptv-api.exception.ts`**
  - Export `IptvApiException` class extending `Error` with:
    - `readonly code: ErrorCode`
    - `readonly timestamp: number`
    - Constructor accepting `code: ErrorCode, message: string`
    - Static `fromHttpStatus(status: number): IptvApiException` factory method

---

## Phase 2: Core Ports Layer

### 2.1 Outbound Ports

- [x] **Create `src/core/ports/outbound/iptv-api.port.ts`**
  - Export `IptvApiPort` interface with methods:
    - `login(username, password, host): Observable<AuthResult>`
    - `getCategories(host, authToken): Observable<Category[]>`
    - `getLivestreams(host, authToken, categoryId?): Observable<Stream[]>`
    - `getEPG(host, authToken, streamId, limit?): Observable<EPGListing[]>`

- [x] **Create `src/core/ports/outbound/encryption.port.ts`**
  - Export `EncryptedPayload` interface with: `cipher`, `iv`, `salt` (all strings)
  - Export `EncryptionPort` interface with methods:
    - `deriveKey(masterPassword, salt): Promise<CryptoKey>`
    - `encrypt(data, key): Promise<{ cipher: string; iv: Uint8Array }>`
    - `decrypt(cipher, iv, key): Promise<string>`
    - `generateSalt(): Uint8Array`
    - `encryptWithPassword(data, masterPassword): Promise<EncryptedPayload>`
    - `decryptWithPassword(payload, masterPassword): Promise<string>`

- [x] **Create `src/core/ports/outbound/credential-storage.port.ts`**
  - Export `CredentialRecord` interface with: `id`, `host`, `username`, `passwordCipher`, `iv`, `salt`
  - Export `CredentialStoragePort` interface with methods:
    - `save(credentials): Promise<void>`
    - `get(): Promise<CredentialRecord | undefined>`
    - `delete(): Promise<void>`
    - `exists(): Promise<boolean>`

### 2.2 Inbound Ports (Service Interfaces)

- [x] **Create `src/core/ports/inbound/auth.service.port.ts`**
  - Export `LoginCredentials` interface with: `username`, `password`, `host`
  - Export `AuthService` interface with methods:
    - `login(credentials, masterPassword): Observable<AuthResult>`
    - `restoreSession(masterPassword): Promise<boolean>`
    - `getCurrentUser(): User | null`
    - `getCurrentAuthResult(): AuthResult | null`
    - `isAuthenticated(): boolean`
    - `logout(): Promise<void>`

- [x] **Create `src/core/ports/inbound/category.service.port.ts`**
  - Export `CategoryService` interface with methods:
    - `getCategories(): Observable<Category[]>`
    - `getCategoryById(id): Observable<Category | null>`

- [x] **Create `src/core/ports/inbound/stream.service.port.ts`**
  - Export `StreamService` interface with methods:
    - `getStreams(categoryId?): Observable<Stream[]>`
    - `getStreamById(id): Observable<Stream | null>`
    - `getStreamUrl(streamId): string`

- [x] **Create `src/core/ports/inbound/epg.service.port.ts`**
  - Export `EpgService` interface with methods:
    - `getEPG(streamId, limit?): Observable<EPGListing[]>`

---

## Phase 3: Core Application Layer (Use Cases)

- [x] **Create `src/core/application/use-cases/login.use-case.ts`**
  - Export `LoginInput` interface with: `username`, `password`, `host`, `masterPassword`
  - Export `LoginOutput` type as `AuthResult`
  - Export `LoginError` type as `IptvApiException`
  - Export `LoginUseCase` class:
    - Constructor injecting `IptvApiPort`, `EncryptionPort`, `CredentialStoragePort`
    - `execute(input): Observable<AuthResult>` — performs login, encrypts password, stores credentials

- [x] **Create `src/core/application/use-cases/get-categories.use-case.ts`**
  - Export `GetCategoriesInput` type as `void`
  - Export `GetCategoriesOutput` type as `Category[]`
  - Export `GetCategoriesError` type as `IptvApiException`
  - Export `GetCategoriesUseCase` class:
    - Constructor injecting `IptvApiPort`, `getAuthToken` callback, `getHost` callback
    - `execute(): Observable<Category[]>` — validates auth, calls API

- [x] **Create `src/core/application/use-cases/get-livestreams.use-case.ts`**
  - Export `GetLivestreamsInput` interface with optional `categoryId`
  - Export `GetLivestreamsOutput` type as `Stream[]`
  - Export `GetLivestreamsError` type as `IptvApiException`
  - Export `GetLivestreamsUseCase` class:
    - Constructor injecting `IptvApiPort`, `getAuthToken` callback, `getHost` callback
    - `execute(input?): Observable<Stream[]>` — validates auth, calls API with optional category filter

- [x] **Create `src/core/application/use-cases/get-epg.use-case.ts`**
  - Export `GetEPGInput` interface with: `streamId`, optional `limit`
  - Export `GetEPGOutput` type as `EPGListing[]`
  - Export `GetEPGError` type as `IptvApiException`
  - Export `GetEPGUseCase` class:
    - Constructor injecting `IptvApiPort`, `getAuthToken` callback, `getHost` callback
    - `execute(input): Observable<EPGListing[]>` — fetches EPG, decodes Base64 title/description via `epg-decoder`

- [x] **Create `src/core/application/use-cases/get-stream-url.use-case.ts`**
  - Export `GetStreamUrlInput` interface with: `streamId`
  - Export `GetStreamUrlOutput` type as `string`
  - Export `GetStreamUrlUseCase` class:
    - Constructor injecting `getHost`, `getUsername`, `getDecryptedPassword` callbacks
    - `execute(input): string` — pure composition using `StreamUrl.compose()`, throws if not authenticated

---

## Phase 4: Infrastructure - Crypto

- [x] **Create `src/infrastructure/crypto/web-crypto.adapter.ts`**
  - Constants: `PBKDF2_ITERATIONS = 100000`, `KEY_LENGTH = 256`, `SALT_LENGTH = 16`, `IV_LENGTH = 12`
  - Export `WebCryptoAdapter` class implementing `EncryptionPort`:
    - `deriveKey(masterPassword, salt): Promise<CryptoKey>` — PBKDF2 with SHA-256
    - `encrypt(data, key): Promise<{ cipher: string; iv: Uint8Array }>` — AES-GCM
    - `decrypt(cipher, iv, key): Promise<string>` — AES-GCM
    - `generateSalt(): Uint8Array` — crypto.getRandomValues
    - `encryptWithPassword(data, masterPassword): Promise<EncryptedPayload>` — generates salt, derives key, encrypts
    - `decryptWithPassword(payload, masterPassword): Promise<string>` — reverses encryption
    - Private helpers: `arrayBufferToBase64()`, `base64ToArrayBuffer()`

---

## Phase 5: Infrastructure - Storage

- [x] **Create `src/infrastructure/storage/dexie-config.ts`**
  - Export `IptvCredentialDatabase` class extending `Dexie`:
    - Constructor: `super('iptv-credentials')`
    - Table `credentials`: keyPath `'id'`, indexes `'host'`, `'username'`
  - Export constants: `DB_NAME = 'iptv-credentials'`, `CREDENTIALS_TABLE = 'credentials'`

- [x] **Create `src/infrastructure/storage/credential-db.adapter.ts`**
  - Export `CredentialDbAdapter` class implementing `CredentialStoragePort`:
    - `save(credentials): Promise<void>` — puts to 'credentials' table
    - `get(): Promise<CredentialRecord | undefined>` — gets 'primary' key
    - `delete(): Promise<void>` — `Dexie.delete('iptv-credentials')`, reinitializes db
    - `exists(): Promise<boolean>` — checks if 'primary' record exists

---

## Phase 6: Infrastructure - HTTP

- [x] **Create `src/infrastructure/http/api-endpoints.ts`**
  - Export `ApiEndpoints` object with:
    - `login(host): string` — `{host}/panel_api.php?username={username}&password={password}`
    - `categories(host): string` — `{host}/panel_api.php?action=get_categories`
    - `livestreams(host, categoryId?): string` — conditional category_id param
    - `epg(host, streamId, limit?): string` — conditional limit param

- [x] **Create `src/infrastructure/http/xtream-http.adapter.ts`**
  - Define `XtreamApiResponse` interface mapping API response shapes
  - Export `XtreamHttpAdapter` class implementing `IptvApiPort`:
    - `login(username, password, host): Observable<AuthResult>` — HTTP GET, map to AuthResult
    - `getCategories(host, authToken): Observable<Category[]>` — HTTP GET, map array
    - `getLivestreams(host, authToken, categoryId?): Observable<Stream[]>` — HTTP GET, map array
    - `getEPG(host, authToken, streamId, limit?): Observable<EPGListing[]>` — HTTP GET, map timestamps to Date
    - Private: `mapAuthResult()` method
    - Private: `handleHttpError()` method returning typed exceptions

---

## Phase 7: Infrastructure - Interceptors

- [x] **Create `src/infrastructure/interceptors/http-error.interceptor.ts`**
  - Export `httpErrorInterceptor: HttpInterceptorFn`:
    - Catches `HttpErrorResponse`
    - Returns `IptvApiException` via `fromHttpStatus()` or wraps network errors

---

## Phase 8: Infrastructure - Parsing

- [x] **Create `src/infrastructure/parsing/epg-decoder.ts`**
  - Export `decodeBase64(encoded: string): string`:
    - Attempts `atob()` decode → TextDecoder
    - Falls back to raw string on failure
  - Export `decodeBase64Field(field: unknown): string`:
    - Handles unknown type, calls `decodeBase64` or returns empty string

---

## Phase 9: App Configuration

- [x] **Modify `src/app/app.config.ts`**
  - Add `provideHttpClient(withInterceptors([httpErrorInterceptor]))`
  - Add `provideZoneChangeDetection({ eventCoalescing: true })` if not present
  - **Note:** Dexie APP_ID must be provided via `DEXIE_APP_ID` token or direct instantiation in `CredentialDbAdapter`

---

## Dependency Graph

```
Phase 1: Entities/ValueObjects/Errors (no deps)
         ↓
Phase 2: Ports (depend on entities)
         ↓
Phase 3: UseCases (depend on ports & entities)
         ↓
Phase 4-8: Adapters (depend on ports)
         ↓
Phase 9: App Config (wires everything)
```

---

## File Manifest

| Phase | File | Lines (est.) |
|-------|------|--------------|
| 1.1 | `src/core/domain/entities/user.entity.ts` | ~5 |
| 1.1 | `src/core/domain/entities/server-info.entity.ts` | ~15 |
| 1.1 | `src/core/domain/entities/auth-result.entity.ts` | ~15 |
| 1.1 | `src/core/domain/entities/category.entity.ts` | ~10 |
| 1.1 | `src/core/domain/entities/stream.entity.ts` | ~15 |
| 1.1 | `src/core/domain/entities/epg-listing.entity.ts` | ~20 |
| 1.2 | `src/core/domain/value-objects/stream-url.vo.ts` | ~25 |
| 1.3 | `src/core/error/error-codes.ts` | ~15 |
| 1.3 | `src/core/error/iptv-api.exception.ts` | ~35 |
| 2.1 | `src/core/ports/outbound/iptv-api.port.ts` | ~25 |
| 2.1 | `src/core/ports/outbound/encryption.port.ts` | ~25 |
| 2.1 | `src/core/ports/outbound/credential-storage.port.ts` | ~20 |
| 2.2 | `src/core/ports/inbound/auth.service.port.ts` | ~25 |
| 2.2 | `src/core/ports/inbound/category.service.port.ts` | ~15 |
| 2.2 | `src/core/ports/inbound/stream.service.port.ts` | ~15 |
| 2.2 | `src/core/ports/inbound/epg.service.port.ts` | ~10 |
| 3 | `src/core/application/use-cases/login.use-case.ts` | ~65 |
| 3 | `src/core/application/use-cases/get-categories.use-case.ts` | ~30 |
| 3 | `src/core/application/use-cases/get-livestreams.use-case.ts` | ~35 |
| 3 | `src/core/application/use-cases/get-epg.use-case.ts` | ~40 |
| 3 | `src/core/application/use-cases/get-stream-url.use-case.ts` | ~30 |
| 4 | `src/infrastructure/crypto/web-crypto.adapter.ts` | ~100 |
| 5 | `src/infrastructure/storage/dexie-config.ts` | ~25 |
| 5 | `src/infrastructure/storage/credential-db.adapter.ts` | ~35 |
| 6 | `src/infrastructure/http/api-endpoints.ts` | ~20 |
| 6 | `src/infrastructure/http/xtream-http.adapter.ts` | ~150 |
| 7 | `src/infrastructure/interceptors/http-error.interceptor.ts` | ~20 |
| 8 | `src/infrastructure/parsing/epg-decoder.ts` | ~25 |
| 9 | `src/app/app.config.ts` | ~15 |

---

## Verification Checklist

After implementation:

- [x] All entity interfaces compile without implementation
- [x] `StreamUrl.compose()` produces correct URL format
- [x] `IptvApiException` maps all error codes
- [x] Use cases inject ports (interfaces), not adapters
- [x] `WebCryptoAdapter` uses 100k+ PBKDF2 iterations
- [x] `CredentialDbAdapter` handles delete by recreating db instance
- [x] `XtreamHttpAdapter` maps API response fields correctly
- [x] `httpErrorInterceptor` catches HttpErrorResponse
- [x] `epg-decoder` falls back gracefully on malformed Base64
- [x] `app.config.ts` registers `httpErrorInterceptor`
- [x] No imports of infrastructure in core/domain or core/ports

---

## Next Steps

1. Execute Phase 1-9 in order
2. Run `npm run lint` and `npm run typecheck` after each phase
3. Proceed to `sdd-verify` with spec verification checklist
