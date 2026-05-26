# Spec for user-auth

## ADDED Requirements

### Requirement: Login Route Renders AuthComponent

The system SHALL render the `AuthComponent` when the user navigates to `/login`. The component SHALL be loaded lazily via Angular's `loadComponent` routing. The route SHALL be defined in `app.routes.ts`.

#### Scenario: Navigate to login page

- GIVEN the user is not authenticated
- WHEN the user navigates to `/login`
- THEN the login form SHALL be displayed

#### Scenario: Authenticated user navigates to login

- GIVEN the user is authenticated (valid session exists)
- WHEN the user navigates to `/login`
- THEN the user SHALL be redirected to `/player`

---

### Requirement: Login Form Fields and Validation

The login form SHALL contain the following fields: Host (text input), Username (text input), Password (password input), and "Remember Provider" (checkbox). All fields except "Remember Provider" are REQUIRED. The host field SHALL validate URL format. The username and password fields SHALL validate non-empty before submission.

#### Scenario: Form displays with all fields

- GIVEN the user is on the `/login` page
- WHEN the page loads
- THEN fields for Host, Username, Password, and "Remember Provider" SHALL be visible

#### Scenario: Form submission with empty required fields

- GIVEN the user is on the `/login` page
- WHEN the user clicks Submit without filling required fields
- THEN validation errors SHALL be displayed under each empty required field

#### Scenario: Form submission with invalid host format

- GIVEN the user entered an invalid host URL
- WHEN the user clicks Submit
- THEN a validation error SHALL indicate the host format is invalid

---

### Requirement: Login Submission Calls LoginUseCase

Upon valid form submission, the component SHALL call the `LoginUseCase` via the `AuthService` port (implementation: `AuthServiceAdapter`). The component SHALL NOT contain any infrastructure code (HTTP adapters, storage adapters, or crypto adapters). The component SHALL ONLY interact with inbound ports.

#### Scenario: Valid submission triggers LoginUseCase

- GIVEN the user filled all required fields with valid values
- WHEN the user clicks Submit
- THEN `AuthService.login()` SHALL be called with {host, username, password}

---

### Requirement: Loading State During Authentication

During the API call, the submit button SHALL be disabled and display a loading spinner. All form fields SHALL be disabled. No additional submissions SHALL be allowed until the current request completes.

#### Scenario: Loading state displayed during login

- GIVEN the user submitted valid credentials
- WHEN the login request is in progress
- THEN the submit button SHALL be disabled with a spinner
- AND all form fields SHALL be disabled

---

### Requirement: Error State Displays Login Failures

When login fails (wrong credentials, network error, server unreachable), the system SHALL display a user-facing error message. Error messages SHALL be specific: "Invalid credentials" for auth failures, "Network error" for connectivity issues, "Server unreachable" for timeout.

#### Scenario: Display wrong credentials error

- GIVEN the user submitted invalid credentials
- WHEN the server returns an authentication failure
- THEN the message "Invalid credentials" SHALL be displayed

#### Scenario: Display network error

- GIVEN the user submitted valid credentials
- WHEN a network error occurs during the request
- THEN the message "Network error" SHALL be displayed

---

### Requirement: Successful Login Redirects to Player

Upon successful authentication, the system SHALL redirect the user to `/player`.

#### Scenario: Successful login redirects

- GIVEN the user submitted valid credentials
- WHEN the login succeeds
- THEN the user SHALL be redirected to `/player`

---

### Requirement: Remember Provider Persists Provider URL

When the "Remember Provider" checkbox is checked, the provider host URL SHALL be persisted to credential storage via `CredentialStoragePort`. On component init, if a provider URL exists in storage, it SHALL be pre-populated in the Host field.

#### Scenario: Remember provider saves host

- GIVEN the user checked "Remember Provider" and entered a host URL
- WHEN the login succeeds
- THEN the host URL SHALL be stored via `CredentialStoragePort`

#### Scenario: Session restore pre-fills host

- GIVEN a provider URL was previously stored
- WHEN the `AuthComponent` initializes
- THEN the Host field SHALL be pre-populated with the stored URL

---

### Requirement: Auth Guard Protects Player Route

The `/player` route SHALL be protected by an auth guard. If no valid session exists (no stored credentials or expired session), the guard SHALL redirect to `/login`.

#### Scenario: Unauthenticated user blocked from player

- GIVEN the user has no valid session
- WHEN the user attempts to navigate to `/player`
- THEN the user SHALL be redirected to `/login`

#### Scenario: Authenticated user accesses player

- GIVEN the user has a valid session (credentials stored and not expired)
- WHEN the user navigates to `/player`
- THEN the user SHALL be granted access to the player

---

### Requirement: Visual Design

The login page SHALL render with the following design:
- Glass panel: `background: rgba(30, 31, 35, 0.4); backdrop-filter: blur(40px); border: 1px solid rgba(255, 255, 255, 0.1);`
- Dark background: radial gradient from `#1e1f23` to `#121317`
- Glow overlay: two radial gradients with blue/teal accents following mouse position (parallax effect)
- Input focus state: `border-color: #adc6ff; box-shadow: 0 0 0 2px rgba(173, 198, 255, 0.2);`
- Primary color: `#adc6ff`
- Background: `#121317`
- Surface: `#1e1f23`
- On-surface: `#e3e2e7`
- On-surface-variant: `#c1c6d7`
- Border outline-variant: `#414755`
- Submit button: full-width, white background, `border-radius: 9999px` (rounded-full)
- QR code section: decorative placeholder on the right side of the panel
- Icon font: Material Symbols
- Font family: Inter

#### Scenario: Visual elements rendered

- GIVEN the user is on the `/login` page
- THEN the glass panel, dark gradient background, and all styled form elements SHALL be visible

---

### Requirement: Logout Clears Session

The system SHALL provide a logout mechanism via `AuthService.logout()`. Calling logout SHALL clear stored credentials and redirect to `/login`.

#### Scenario: Logout clears credentials and redirects

- GIVEN the user is authenticated and on the `/player` page
- WHEN the user triggers logout
- THEN stored credentials SHALL be cleared via `CredentialStoragePort`
- AND the user SHALL be redirected to `/login`

---

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

---

## Summary Table

| Requirement | Type | Scenarios |
|-------------|------|-----------|
| Login Route Renders AuthComponent | ADDED | 2 |
| Login Form Fields and Validation | ADDED | 3 |
| Login Submission Calls LoginUseCase | ADDED | 1 |
| Loading State During Authentication | ADDED | 1 |
| Error State Displays Login Failures | ADDED | 2 |
| Successful Login Redirects to Player | ADDED | 1 |
| Remember Provider Persists Provider URL | ADDED | 2 |
| Auth Guard Protects Player Route | ADDED | 2 |
| Visual Design | ADDED | 1 |
| Logout Clears Session | ADDED | 1 |
| **TOTAL** | | **16** |

## Next Step

Spec is active. Source of truth for user-auth capability.