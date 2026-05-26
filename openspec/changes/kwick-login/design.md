# Design: Login UI Feature

## Technical Approach

Implement a standalone `AuthComponent` at `/login` route that connects to the existing `LoginUseCase` via the `AuthService` port interface. The component will use Angular signals for reactive state, reactive forms for validation, and will NOT contain any infrastructure code — it will only interact through inbound ports as specified in the requirements.

## Architecture Decisions

### Decision: AuthServiceAdapter Required

**Choice**: Create `AuthServiceAdapter` as the implementation of `AuthService` port, wiring it to `LoginUseCase`.

**Alternatives considered**: Calling `LoginUseCase` directly from the component — rejected because spec requires component only interacts with inbound ports.

**Rationale**: Clean hexagonal architecture demands the component speak only to port interfaces. `LoginUseCase` is an application use-case, not an inbound port. The adapter pattern provides the translation layer.

---

### Decision: Signal-Based State with Component-Level Signals

**Choice**: Use Angular signals (`signal<T>`) for `isLoading`, `errorMessage`, `isAuthenticated`.

**Alternatives considered**: BehaviorSubject/rxjs approach — rejected because the existing codebase already uses signals in `PlayerComponent` (e.g., `streamLayerVisible`, `playerState`).

**Rationale**: Consistency with established patterns in the codebase. Signals provide better performance for simple state transitions.

---

### Decision: Standalone Component with Lazy Route

**Choice**: `AuthComponent` is standalone, loaded via Angular's `loadComponent` from `app.routes.ts`.

**Alternatives considered**: Module-based component with eager loading — rejected because `PlayerComponent` uses standalone + lazy loading pattern.

**Rationale**: Consistency with existing player feature. Lazy loading improves initial bundle size.

---

### Decision: Feature Folder Named `auth`

**Choice**: Create feature folder at `src/app/features/auth/`.

**Alternatives considered**: Named `login` — rejected because logout and session management belong to the same domain, future-proofing for auth-related features.

**Rationale**: Proposal explicitly states "Feature folder is `auth` (not `login`) since logout and session management belong to the same domain."

---

### Decision: SCSS Only — No Tailwind

**Choice**: Use SCSS with component-scoped `styleUrl` and CSS custom properties for design tokens.

**Alternatives considered**: Tailwind — not used in this project.

**Rationale**: Project convention. Design tokens specified in the requirements (glass panel styles, colors, border-radius).

---

### Decision: Auth Guard is Functional Route Guard

**Choice**: Implement `auth.guard.ts` as a functional guard using Angular's `CanActivateFn`.

**Alternatives considered**: Class-based guard — rejected as functional guards are the modern Angular pattern and require less boilerplate.

**Rationale**: Simpler, tree-shakable, consistent with modern Angular patterns.

---

## Data Flow

```
User submits form
       │
       ▼
AuthComponent.login(form.value)
       │
       ▼
AuthServiceAdapter.login(credentials, masterPassword)
       │
       ├──► XtreamHttpAdapter.login() ──► IPTV Server
       │
       ├──► WebCryptoAdapter.encryptWithPassword() ──► AES-GCM
       │
       ├──► CredentialDbAdapter.save() ──► IndexedDB (Dexie)
       │
       ▼
AuthResult ──► Router.navigate('/player')
```

**Session Restore Flow:**
```
AuthComponent.init()
       │
       ▼
CredentialDbAdapter.exists() ──► boolean
       │
       ├──► true: Router.navigate('/player')
       │
       └──► false: Show login form
```

**Auth Guard Flow:**
```
Route: /player → AuthGuard.canActivate()
       │
       ▼
CredentialDbAdapter.exists()
       │
       ├──► true: Return true (allow)
       │
       └──► false: Return inject(Router).createUrlTree(['/login'])
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/features/auth/auth.component.ts` | Create | Standalone component with reactive form, signals for state |
| `src/app/features/auth/auth.component.html` | Create | Template with glass panel, form fields, QR placeholder |
| `src/app/features/auth/auth.component.scss` | Create | Component-scoped styles (glass, inputs, button, responsive) |
| `src/app/features/auth/auth.routes.ts` | Create | Route: `/login` → `AuthComponent` |
| `src/app/features/auth/auth.guard.ts` | Create | Functional guard protecting `/player` |
| `src/app/features/auth/auth.service.adapter.ts` | Create | Implementation of `AuthService` port wiring to `LoginUseCase` |
| `src/app/app.routes.ts` | Modify | Add `/login` route with lazy load and guard on `/player` |
| `src/styles.scss` | Modify | Add global styles for auth page background (if needed) |

## Interfaces / Contracts

### AuthServiceAdapter (new)

```typescript
// src/app/features/auth/auth.service.adapter.ts
@Injectable({ providedIn: 'root' })
export class AuthServiceAdapter implements AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly apiAdapter: IptvApiPort,
    private readonly encryptionAdapter: EncryptionPort,
    private readonly credentialStorage: CredentialStoragePort
  ) {}

  login(credentials: LoginCredentials, masterPassword: string): Observable<AuthResult> {
    // Wire to LoginUseCase.execute()
  }

  async restoreSession(masterPassword: string): Promise<boolean> {
    // Get credentials from CredentialStoragePort
    // Decrypt with WebCryptoAdapter
    // Call apiAdapter.login() to verify
  }

  isAuthenticated(): boolean {
    // Check credentialStorage.exists()
  }

  logout(): Promise<void> {
    // credentialStorage.delete()
  }
}
```

### AuthComponent Signals (new)

```typescript
// src/app/features/auth/auth.component.ts
protected readonly isLoading = signal(false);
protected readonly errorMessage = signal('');
protected readonly isAuthenticated = signal(false);
```

### AuthGuard (new)

```typescript
// src/app/features/auth/auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const credentialStorage = inject(CredentialStorageAdapter);
  const router = inject(Router);

  return credentialStorage.exists()
    ? true
    : router.createUrlTree(['/login']);
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | AuthServiceAdapter.login() calls LoginUseCase | Mock LoginUseCase, verify execute called with correct input |
| Unit | AuthServiceAdapter.restoreSession() decrypts and re-authenticates | Mock adapters, verify decryptWithPassword called |
| Unit | AuthComponent validates form before submit | Test form validation logic |
| Integration | AuthComponent + AuthServiceAdapter + LoginUseCase | Full flow with mocked HTTP |
| E2E | Navigate to /login, submit valid credentials, redirect to /player | Playwright/Cypress |

## Migration / Rollout

No migration required. This is a net-new feature that connects to existing backend infrastructure.

## Open Questions

- [ ] **masterPassword**: The `LoginUseCase` requires a `masterPassword` for encryption. Where does the component get this? The spec shows a "master password" field in the form — need to confirm this is the intended source.
- [ ] **Remember Provider**: Spec says host URL is persisted via `CredentialStoragePort`. Should the encrypted password also be persisted for session restore, or only the host?

---

**Summary**: Create `AuthServiceAdapter` as the bridge between the `AuthService` port and `LoginUseCase`. The component uses signals for loading/error state, reactive forms for validation, and connects to the existing infrastructure adapters through the adapter. Auth guard checks credential existence before allowing `/player` access.