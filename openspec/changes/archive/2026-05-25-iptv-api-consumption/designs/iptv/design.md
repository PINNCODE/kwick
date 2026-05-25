# SDD: IPTV Player API Consumption — Technical Design

**Change:** `iptv-api-consumption`
**Author:** Senior Architect
**Date:** 2026-05-25
**Stack:** Angular 21, RxJS, Dexie.js, Web Crypto API
**Architecture:** Hexagonal (Ports & Adapters)

---

## 1. Folder Structure

```
src/
├── core/                                    # Domain layer — zero external dependencies
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   ├── server-info.entity.ts
│   │   │   ├── auth-result.entity.ts
│   │   │   ├── category.entity.ts
│   │   │   ├── stream.entity.ts
│   │   │   └── epg-listing.entity.ts
│   │   └── value-objects/
│   │       └── stream-url.vo.ts
│   ├── ports/
│   │   ├── outbound/
│   │   │   ├── iptv-api.port.ts
│   │   │   ├── encryption.port.ts
│   │   │   └── credential-storage.port.ts
│   │   └── inbound/
│   │       ├── auth.service.port.ts
│   │       ├── category.service.port.ts
│   │       ├── stream.service.port.ts
│   │       └── epg.service.port.ts
│   ├── application/
│   │   └── use-cases/
│   │       ├── login.use-case.ts
│   │       ├── get-categories.use-case.ts
│   │       ├── get-livestreams.use-case.ts
│   │       ├── get-epg.use-case.ts
│   │       └── get-stream-url.use-case.ts
│   └── error/
│       ├── iptv-api.exception.ts
│       └── error-codes.ts
├── infrastructure/
│   ├── http/
│   │   ├── xtream-http.adapter.ts
│   │   └── api-endpoints.ts
│   ├── storage/
│   │   ├── credential-db.adapter.ts
│   │   └── dexie-config.ts
│   ├── crypto/
│   │   └── web-crypto.adapter.ts
│   ├── parsing/
│   │   └── epg-decoder.ts
│   └── interceptors/
│       └── http-error.interceptor.ts
├── app/
│   └── app.config.ts                        # MODIFIED: registers providers
```

---

## 2. Entity Definitions

### `src/core/domain/entities/user.entity.ts`

```typescript
export interface User {
  username: string;
}
```

### `src/core/domain/entities/server-info.entity.ts`

```typescript
export interface ServerInfo {
  url: string;
  port: number;
  httpsPort: number;
  serverProtocol: string;
  rtmpPort: number;
  timestamp: number;
}
```

### `src/core/domain/entities/auth-result.entity.ts`

```typescript
import { User } from './user.entity';
import { ServerInfo } from './server-info.entity';

export type AuthStatus = 'active' | 'expired' | 'disabled';

export interface AuthResult {
  user: User;
  serverInfo: ServerInfo;
  authToken?: string;
  status: AuthStatus;
}
```

### `src/core/domain/entities/category.entity.ts`

```typescript
export type CategoryType = 'live';

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
}
```

### `src/core/domain/entities/stream.entity.ts`

```typescript
export type StreamType = 'live';

export interface Stream {
  id: number;
  name: string;
  categoryId: number;
  type: StreamType;
  thumbnail?: string;
}
```

### `src/core/domain/entities/epg-listing.entity.ts`

```typescript
export interface EPGListing {
  id: number;
  channelId: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  startTimestamp: number;
  endTimestamp: number;
}
```

### `src/core/domain/value-objects/stream-url.vo.ts`

```typescript
export class StreamUrl {
  readonly value: string;

  private constructor(url: string) {
    this.value = url;
  }

  static compose(
    host: string,
    username: string,
    password: string,
    streamId: number
  ): StreamUrl {
    const url = `${host}/live/${username}/${password}/${streamId}.m3u8`;
    return new StreamUrl(url);
  }

  toString(): string {
    return this.value;
  }
}
```

### `src/core/ports/outbound/credential-storage.port.ts`

```typescript
export interface CredentialRecord {
  id: string;
  host: string;
  username: string;
  passwordCipher: string;
  iv: string;
  salt: string;
}

export interface CredentialStoragePort {
  save(credentials: CredentialRecord): Promise<void>;
  get(): Promise<CredentialRecord | undefined>;
  delete(): Promise<void>;
  exists(): Promise<boolean>;
}
```

---

## 3. Port Interfaces

### 3.1 Outbound Ports

### `src/core/ports/outbound/iptv-api.port.ts`

```typescript
import { Observable } from 'rxjs';
import { AuthResult } from '../../domain/entities/auth-result.entity';
import { Category } from '../../domain/entities/category.entity';
import { Stream } from '../../domain/entities/stream.entity';
import { EPGListing } from '../../domain/entities/epg-listing.entity';

export interface IptvApiPort {
  login(username: string, password: string, host: string): Observable<AuthResult>;
  getCategories(host: string, authToken: string): Observable<Category[]>;
  getLivestreams(host: string, authToken: string, categoryId?: number): Observable<Stream[]>;
  getEPG(host: string, authToken: string, streamId: number, limit?: number): Observable<EPGListing[]>;
}
```

### `src/core/ports/outbound/encryption.port.ts`

```typescript
export interface EncryptedPayload {
  cipher: string;
  iv: string;
  salt: string;
}

export interface EncryptionPort {
  deriveKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey>;
  encrypt(data: string, key: CryptoKey): Promise<{ cipher: string; iv: Uint8Array }>;
  decrypt(cipher: string, iv: Uint8Array, key: CryptoKey): Promise<string>;
  generateSalt(): Uint8Array;
  encryptWithPassword(data: string, masterPassword: string): Promise<EncryptedPayload>;
  decryptWithPassword(payload: EncryptedPayload, masterPassword: string): Promise<string>;
}
```

### 3.2 Inbound Ports (Service Interfaces)

### `src/core/ports/inbound/auth.service.port.ts`

```typescript
import { Observable } from 'rxjs';
import { AuthResult } from '../../domain/entities/auth-result.entity';
import { User } from '../../domain/entities/user.entity';

export interface LoginCredentials {
  username: string;
  password: string;
  host: string;
}

export interface AuthService {
  login(credentials: LoginCredentials, masterPassword: string): Observable<AuthResult>;
  restoreSession(masterPassword: string): Promise<boolean>;
  getCurrentUser(): User | null;
  getCurrentAuthResult(): AuthResult | null;
  isAuthenticated(): boolean;
  logout(): Promise<void>;
}
```

### `src/core/ports/inbound/category.service.port.ts`

```typescript
import { Observable } from 'rxjs';
import { Category } from '../../domain/entities/category.entity';

export interface CategoryService {
  getCategories(): Observable<Category[]>;
  getCategoryById(id: number): Observable<Category | null>;
}
```

### `src/core/ports/inbound/stream.service.port.ts`

```typescript
import { Observable } from 'rxjs';
import { Stream } from '../../domain/entities/stream.entity';

export interface StreamService {
  getStreams(categoryId?: number): Observable<Stream[]>;
  getStreamById(id: number): Observable<Stream | null>;
  getStreamUrl(streamId: number): string;
}
```

### `src/core/ports/inbound/epg.service.port.ts`

```typescript
import { Observable } from 'rxjs';
import { EPGListing } from '../../domain/entities/epg-listing.entity';

export interface EpgService {
  getEPG(streamId: number, limit?: number): Observable<EPGListing[]>;
}
```

---

## 4. Use Case Classes

### `src/core/application/use-cases/login.use-case.ts`

```typescript
import { Observable, throwError } from 'rxjs';
import { AuthResult } from '../../domain/entities/auth-result.entity';
import { IptvApiPort } from '../../ports/outbound/iptv-api.port';
import { EncryptionPort } from '../../ports/outbound/encryption.port';
import { CredentialStoragePort, CredentialRecord } from '../../ports/outbound/credential-storage.port';
import { IptvApiException, ErrorCode } from '../../error/iptv-api.exception';

export interface LoginInput {
  username: string;
  password: string;
  host: string;
  masterPassword: string;
}

export type LoginOutput = AuthResult;

export type LoginError = IptvApiException;

export class LoginUseCase {
  constructor(
    private readonly apiPort: IptvApiPort,
    private readonly encryptionPort: EncryptionPort,
    private readonly credentialStorage: CredentialStoragePort
  ) {}

  execute(input: LoginInput): Observable<AuthResult> {
    return new Observable<AuthResult>((subscriber) => {
      this.apiPort.login(input.username, input.password, input.host).subscribe({
        next: async (authResult) => {
          try {
            const encrypted = await this.encryptionPort.encryptWithPassword(
              input.password,
              input.masterPassword
            );

            const record: CredentialRecord = {
              id: 'primary',
              host: input.host,
              username: input.username,
              passwordCipher: encrypted.cipher,
              iv: encrypted.iv,
              salt: encrypted.salt,
            };

            await this.credentialStorage.save(record);
            subscriber.next(authResult);
            subscriber.complete();
          } catch (err) {
            subscriber.error(new IptvApiException('ENCRYPTION_FAILED', 'Failed to encrypt credentials'));
          }
        },
        error: (err) => {
          if (err instanceof IptvApiException) {
            subscriber.error(err);
          } else {
            subscriber.error(new IptvApiException('AUTH_FAILED', 'Authentication failed'));
          }
        },
      });
    });
  }
}
```

### `src/core/application/use-cases/get-categories.use-case.ts`

```typescript
import { Observable, throwError } from 'rxjs';
import { Category } from '../../domain/entities/category.entity';
import { IptvApiPort } from '../../ports/outbound/iptv-api.port';
import { IptvApiException, ErrorCode } from '../../error/iptv-api.exception';

export type GetCategoriesInput = void;

export type GetCategoriesOutput = Category[];

export type GetCategoriesError = IptvApiException;

export class GetCategoriesUseCase {
  constructor(
    private readonly apiPort: IptvApiPort,
    private readonly getAuthToken: () => string | null,
    private readonly getHost: () => string | null
  ) {}

  execute(): Observable<Category[]> {
    const host = this.getHost();
    const authToken = this.getAuthToken();

    if (!host || !authToken) {
      return throwError(() => new IptvApiException('AUTH_REQUIRED', 'Authentication required'));
    }

    return this.apiPort.getCategories(host, authToken);
  }
}
```

### `src/core/application/use-cases/get-livestreams.use-case.ts`

```typescript
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Stream } from '../../domain/entities/stream.entity';
import { IptvApiPort } from '../../ports/outbound/iptv-api.port';
import { IptvApiException, ErrorCode } from '../../error/iptv-api.exception';

export interface GetLivestreamsInput {
  categoryId?: number;
}

export type GetLivestreamsOutput = Stream[];

export type GetLivestreamsError = IptvApiException;

export class GetLivestreamsUseCase {
  constructor(
    private readonly apiPort: IptvApiPort,
    private readonly getAuthToken: () => string | null,
    private readonly getHost: () => string | null
  ) {}

  execute(input?: GetLivestreamsInput): Observable<Stream[]> {
    const host = this.getHost();
    const authToken = this.getAuthToken();

    if (!host || !authToken) {
      return throwError(() => new IptvApiException('AUTH_REQUIRED', 'Authentication required'));
    }

    return this.apiPort.getLivestreams(host, authToken, input?.categoryId);
  }
}
```

### `src/core/application/use-cases/get-epg.use-case.ts`

```typescript
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { EPGListing } from '../../domain/entities/epg-listing.entity';
import { IptvApiPort } from '../../ports/outbound/iptv-api.port';
import { IptvApiException, ErrorCode } from '../../error/iptv-api.exception';
import { decodeBase64Field, decodeBase64 } from '../../../infrastructure/parsing/epg-decoder';

export interface GetEPGInput {
  streamId: number;
  limit?: number;
}

export type GetEPGOutput = EPGListing[];

export type GetEPGError = IptvApiException;

export class GetEPGUseCase {
  constructor(
    private readonly apiPort: IptvApiPort,
    private readonly getAuthToken: () => string | null,
    private readonly getHost: () => string | null
  ) {}

  execute(input: GetEPGInput): Observable<EPGListing[]> {
    const host = this.getHost();
    const authToken = this.getAuthToken();

    if (!host || !authToken) {
      return throwError(() => new IptvApiException('AUTH_REQUIRED', 'Authentication required'));
    }

    return this.apiPort.getEPG(host, authToken, input.streamId, input.limit).pipe(
      map((listings) =>
        listings.map((listing) => ({
          ...listing,
          title: decodeBase64(listing.title as unknown as string),
          description: decodeBase64(listing.description as unknown as string),
        }))
      )
    );
  }
}
```

### `src/core/application/use-cases/get-stream-url.use-case.ts`

```typescript
import { StreamUrl } from '../../domain/value-objects/stream-url.vo';
import { IptvApiException } from '../../error/iptv-api.exception';

export interface GetStreamUrlInput {
  streamId: number;
}

export type GetStreamUrlOutput = string;

export class GetStreamUrlUseCase {
  constructor(
    private readonly getHost: () => string | null,
    private readonly getUsername: () => string | null,
    private readonly getDecryptedPassword: () => string | null
  ) {}

  execute(input: GetStreamUrlInput): string {
    const host = this.getHost();
    const username = this.getUsername();
    const password = this.getDecryptedPassword();

    if (!host || !username || !password) {
      throw new IptvApiException('AUTH_REQUIRED', 'Authentication required');
    }

    return StreamUrl.compose(host, username, password, input.streamId).toString();
  }
}
```

---

## 5. Adapter Implementations

### 5.1 HTTP Adapter

### `src/infrastructure/http/api-endpoints.ts`

```typescript
export const ApiEndpoints = {
  login: (host: string) => `${host}/panel_api.php?username={username}&password={password}`,
  categories: (host: string) => `${host}/panel_api.php?action=get_categories`,
  livestreams: (host: string, categoryId?: number) =>
    categoryId
      ? `${host}/panel_api.php?action=get_live_streams&category_id=${categoryId}`
      : `${host}/panel_api.php?action=get_live_streams`,
  epg: (host: string, streamId: number, limit?: number) =>
    `${host}/panel_api.php?action=get_short_epg&stream_id=${streamId}${limit ? `&limit=${limit}` : ''}`,
} as const;
```

### `src/infrastructure/http/xtream-http.adapter.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IptvApiPort } from '../../core/ports/outbound/iptv-api.port';
import { AuthResult } from '../../core/domain/entities/auth-result.entity';
import { Category } from '../../core/domain/entities/category.entity';
import { Stream } from '../../core/domain/entities/stream.entity';
import { EPGListing } from '../../core/domain/entities/epg-listing.entity';
import { ApiEndpoints } from './api-endpoints';
import { IptvApiException } from '../../core/error/iptv-api.exception';

interface XtreamApiResponse {
  user?: {
    username: string;
    status: string;
    exp_date?: string;
  };
  server_info?: {
    url: string;
    port: number;
    https_port: number;
    server_protocol: string;
    rtmp_port: number;
    timestamp: number;
  };
  categories?: Array<{
    category_id: string;
    category_name: string;
    category_type: string;
  }>;
  livestreams?: Array<{
    num: number;
    name: string;
    stream_type: string;
    stream_id: number;
    category_id: number;
    thumbnail?: string;
  }>;
}

@Injectable()
export class XtreamHttpAdapter implements IptvApiPort {
  private readonly http = inject(HttpClient);

  login(username: string, password: string, host: string): Observable<AuthResult> {
    const url = `${host}/panel_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    return this.http.get<XtreamApiResponse>(url).pipe(
      map((response) => this.mapAuthResult(response, username)),
      catchError((err) => {
        if (err.status === 0 || err.status === 404) {
          return throwError(() => new IptvApiException('AUTH_FAILED', 'Invalid credentials'));
        }
        return throwError(() => new IptvApiException('SERVER_ERROR', 'Server error during login'));
      })
    );
  }

  getCategories(host: string, authToken: string): Observable<Category[]> {
    const url = `${host}/panel_api.php?action=get_categories`;

    return this.http.get<XtreamApiResponse>(url).pipe(
      map((response) =>
        (response.categories ?? []).map((cat) => ({
          id: Number(cat.category_id),
          name: cat.category_name,
          type: cat.category_type as 'live',
        }))
      ),
      catchError((err) => this.handleHttpError(err))
    );
  }

  getLivestreams(host: string, authToken: string, categoryId?: number): Observable<Stream[]> {
    const url = categoryId
      ? `${host}/panel_api.php?action=get_live_streams&category_id=${categoryId}`
      : `${host}/panel_api.php?action=get_live_streams`;

    return this.http.get<XtreamApiResponse>(url).pipe(
      map((response) =>
        (response.livestreams ?? []).map((stream) => ({
          id: stream.stream_id,
          name: stream.name,
          categoryId: stream.category_id,
          type: stream.stream_type as 'live',
          thumbnail: stream.thumbnail,
        }))
      ),
      catchError((err) => this.handleHttpError(err))
    );
  }

  getEPG(host: string, authToken: string, streamId: number, limit?: number): Observable<EPGListing[]> {
    let url = `${host}/panel_api.php?action=get_short_epg&stream_id=${streamId}`;
    if (limit) {
      url += `&limit=${limit}`;
    }

    return this.http.get<XtreamApiResponse>(url).pipe(
      map((response) => {
        const epgData = (response as unknown as { epg_listings?: EPGListing[] }).epg_listings ?? [];
        return epgData.map((item) => ({
          id: item.id,
          channelId: item.channelId,
          title: item.title,
          description: item.description,
          startTime: new Date(item.startTimestamp * 1000),
          endTime: new Date(item.endTimestamp * 1000),
          startTimestamp: item.startTimestamp,
          endTimestamp: item.endTimestamp,
        }));
      }),
      catchError((err) => this.handleHttpError(err))
    );
  }

  private mapAuthResult(response: XtreamApiResponse, username: string): AuthResult {
    if (!response.user || !response.server_info) {
      throw new IptvApiException('AUTH_FAILED', 'Invalid server response');
    }

    return {
      user: { username: response.user.username },
      serverInfo: {
        url: response.server_info.url,
        port: response.server_info.port,
        httpsPort: response.server_info.https_port,
        serverProtocol: response.server_info.server_protocol,
        rtmpPort: response.server_info.rtmp_port,
        timestamp: response.server_info.timestamp,
      },
      authToken: `${response.user.username}:${Date.now()}`,
      status: response.user.status as 'active' | 'expired' | 'disabled',
    };
  }

  private handleHttpError(err: { status: number; message?: string }): Observable<never> {
    if (err.status === 0 || err.status >= 500) {
      return throwError(() => new IptvApiException('SERVER_ERROR', 'Server error'));
    }
    return throwError(() => new IptvApiException('NETWORK_ERROR', 'Network error'));
  }
}
```

### 5.2 Encryption Adapter

### `src/infrastructure/crypto/web-crypto.adapter.ts`

```typescript
import { Injectable } from '@angular/core';
import { EncryptionPort, EncryptedPayload } from '../../core/ports/outbound/encryption.port';

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

@Injectable()
export class WebCryptoAdapter implements EncryptionPort {
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();

  async deriveKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(masterPassword),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data: string, key: CryptoKey): Promise<{ cipher: string; iv: Uint8Array }> {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      this.encoder.encode(data)
    );

    return {
      cipher: this.arrayBufferToBase64(encrypted),
      iv,
    };
  }

  async decrypt(cipher: string, iv: Uint8Array, key: CryptoKey): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      this.base64ToArrayBuffer(cipher)
    );

    return this.decoder.decode(decrypted);
  }

  generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  }

  async encryptWithPassword(data: string, masterPassword: string): Promise<EncryptedPayload> {
    const salt = this.generateSalt();
    const key = await this.deriveKey(masterPassword, salt);
    const { cipher, iv } = await this.encrypt(data, key);

    return {
      cipher,
      iv: this.arrayBufferToBase64(iv),
      salt: this.arrayBufferToBase64(salt),
    };
  }

  async decryptWithPassword(payload: EncryptedPayload, masterPassword: string): Promise<string> {
    const salt = new Uint8Array(this.base64ToArrayBuffer(payload.salt));
    const iv = new Uint8Array(this.base64ToArrayBuffer(payload.iv));
    const key = await this.deriveKey(masterPassword, salt);

    return this.decrypt(payload.cipher, iv, key);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
```

### 5.3 Credential Storage Adapter

### `src/infrastructure/storage/dexie-config.ts`

```typescript
import Dexie, { Table } from 'dexie';
import { CredentialRecord } from '../../core/ports/outbound/credential-storage.port';

export class IptvCredentialDatabase extends Dexie {
  credentials!: Table<CredentialRecord, string>;

  constructor() {
    super('iptv-credentials');
    this.version(1).stores({
      credentials: 'id, host, username',
    });
  }
}

export const DB_NAME = 'iptv-credentials';
export const CREDENTIALS_TABLE = 'credentials';
```

### `src/infrastructure/storage/credential-db.adapter.ts`

```typescript
import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { CredentialStoragePort, CredentialRecord } from '../../core/ports/outbound/credential-storage.port';
import { IptvCredentialDatabase } from './dexie-config';

@Injectable()
export class CredentialDbAdapter implements CredentialStoragePort {
  private db: Dexie;

  constructor() {
    this.db = new IptvCredentialDatabase();
  }

  async save(credentials: CredentialRecord): Promise<void> {
    await this.db.table<CredentialRecord, string>('credentials').put(credentials);
  }

  async get(): Promise<CredentialRecord | undefined> {
    return this.db.table<CredentialRecord, string>('credentials').get('primary');
  }

  async delete(): Promise<void> {
    await Dexie.delete('iptv-credentials');
    this.db = new IptvCredentialDatabase();
  }

  async exists(): Promise<boolean> {
    const record = await this.get();
    return record !== undefined;
  }
}
```

---

## 6. Error Model

### `src/core/error/error-codes.ts`

```typescript
export enum ErrorCode {
  AUTH_FAILED = 'AUTH_FAILED',
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  DECODE_ERROR = 'DECODE_ERROR',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
}
```

### `src/core/error/iptv-api.exception.ts`

```typescript
import { ErrorCode } from './error-codes';

export class IptvApiException extends Error {
  readonly code: ErrorCode;
  readonly timestamp: number;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'IptvApiException';
    this.code = code;
    this.timestamp = Date.now();
  }

  static fromHttpStatus(status: number): IptvApiException {
    switch (status) {
      case 0:
        return new IptvApiException('NETWORK_ERROR', 'Network connectivity error');
      case 401:
      case 403:
        return new IptvApiException('AUTH_FAILED', 'Authentication failed');
      case 404:
        return new IptvApiException('AUTH_FAILED', 'Resource not found');
      case 500:
      case 502:
      case 503:
        return new IptvApiException('SERVER_ERROR', 'Server error');
      default:
        return new IptvApiException('NETWORK_ERROR', `HTTP error: ${status}`);
    }
  }
}
```

### `src/infrastructure/interceptors/http-error.interceptor.ts`

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { IptvApiException } from '../../core/error/iptv-api.exception';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        return throwError(() => new IptvApiException('NETWORK_ERROR', err.message));
      }
      return throwError(() => IptvApiException.fromHttpStatus(err.status));
    })
  );
};
```

---

## 7. Key Implementation Details

### 7.1 Stream URL Composition

**Template:** `{host}/live/{username}/{password}/{streamId}.m3u8`

**Implementation:**
```typescript
// src/core/domain/value-objects/stream-url.vo.ts
static compose(host: string, username: string, password: string, streamId: number): StreamUrl {
  const url = `${host}/live/${username}/${password}/${streamId}.m3u8`;
  return new StreamUrl(url);
}
```

### 7.2 PBKDF2 Key Derivation

- **Algorithm:** PBKDF2 with SHA-256
- **Iterations:** 100,000+ (configurable)
- **Key Length:** 256 bits
- **Salt:** 16 bytes, cryptographically random

```typescript
// src/infrastructure/crypto/web-crypto.adapter.ts
const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;
```

### 7.3 AES-GCM Encryption

- **Key Size:** 256-bit
- **IV Size:** 96 bits (12 bytes)
- **Authentication:** Automatic via GCM mode

### 7.4 Dexie Database Configuration

- **Database Name:** `iptv-credentials`
- **Table Name:** `credentials`
- **Key Path:** `id` (primary key)

```typescript
// src/infrastructure/storage/dexie-config.ts
super('iptv-credentials');
this.version(1).stores({
  credentials: 'id, host, username',
});
```

### 7.5 Base64 Decoding for EPG

```typescript
// src/infrastructure/parsing/epg-decoder.ts
export function decodeBase64(encoded: string): string {
  try {
    const decoded = atob(encoded);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes.buffer);
  } catch {
    return encoded;
  }
}
```

---

## 8. Angular Provider Registration

### `src/app/app.config.ts` (MODIFIED)

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpErrorInterceptor } from '../infrastructure/interceptors/http-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
  ],
};
```

---

## 9. Dependency Injection Mapping

| Interface | Implementation | Provider |
|-----------|-----------------|----------|
| `IptvApiPort` | `XtreamHttpAdapter` | `HttpClient` |
| `EncryptionPort` | `WebCryptoAdapter` | `WebCryptoAdapter` |
| `CredentialStoragePort` | `CredentialDbAdapter` | `CredentialDbAdapter` |
| `AuthService` | Implemented in application layer | Factory |
| `CategoryService` | Implemented in application layer | Factory |
| `StreamService` | Implemented in application layer | Factory |
| `EpgService` | Implemented in application layer | Factory |

---

## 10. Security Considerations

1. **Master password never stored** — key derived on-demand via PBKDF2
2. **No plaintext credentials in IndexedDB** — AES-GCM encryption required
3. **Logout destroys database** — `Dexie.delete()` removes all persisted data
4. **Salt randomization** — each encryption uses unique salt to prevent rainbow table attacks
5. **High iteration count** — 100k PBKDF2 iterations increases brute-force cost

---

## 11. Testing Strategy

| Component | Test Approach |
|-----------|----------------|
| Use Cases | Unit test with mocked ports |
| Adapters | Integration test with test doubles |
| Entities | Type-level validation |
| Error Model | Unit test for all error codes |

**Note:** Testing capabilities to be confirmed via `sdd-init` phase.
