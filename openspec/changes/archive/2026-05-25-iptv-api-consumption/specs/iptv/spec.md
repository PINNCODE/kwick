# Delta for IPTV API Consumption

## ADDED Requirements

### Requirement: IPTV Authentication

The system SHALL authenticate users against an Xtream-compatible IPTV API and persist encrypted credentials for session restoration.

#### Scenario: Successful login

- GIVEN host, username, password, and masterPassword are provided
- WHEN `AuthService.login()` is invoked
- THEN the system SHALL validate credentials via the IPTV API login endpoint
- AND SHALL derive an encryption key from masterPassword using PBKDF2
- AND SHALL encrypt the API password using AES-GCM
- AND SHALL store {host, username, encryptedPassword, iv, salt} in Dexie (IndexedDB)
- AND SHALL return an AuthResult containing user info and serverInfo

#### Scenario: Failed login

- GIVEN invalid credentials (wrong username/password)
- WHEN `AuthService.login()` is invoked
- THEN the system SHALL throw `IptvApiException(AUTH_FAILED)`

#### Scenario: Session restore

- GIVEN encrypted credentials exist in Dexie and user provides masterPassword
- WHEN `AuthService.restoreSession(masterPassword)` is invoked
- THEN the system SHALL derive the encryption key from masterPassword + stored salt
- AND SHALL decrypt the stored API password
- AND SHALL verify credentials against the IPTV API
- AND SHALL return true if valid, false otherwise

#### Scenario: Session restore with wrong password

- GIVEN encrypted credentials exist in Dexie and user provides incorrect masterPassword
- WHEN `AuthService.restoreSession(masterPassword)` is invoked
- THEN key derivation or decryption SHALL fail
- AND the system SHALL return false

#### Scenario: Logout

- WHEN `AuthService.logout()` is invoked
- THEN the system SHALL delete the entire Dexie database
- AND SHALL clear in-memory authentication state

### Requirement: Category Retrieval

The system SHALL retrieve live TV categories from the IPTV API.

#### Scenario: Get all categories

- GIVEN user is authenticated
- WHEN `CategoryService.getCategories()` is invoked
- THEN the system SHALL return an Observable of Category[] from the API
- AND each Category SHALL contain id (number) and name (string)

#### Scenario: Get category by ID

- GIVEN user is authenticated and category with given ID exists
- WHEN `CategoryService.getCategoryById(id)` is invoked
- THEN the system SHALL return an Observable resolving to the matching Category
- AND SHALL return null if no category matches

### Requirement: Stream Retrieval

The system SHALL retrieve live streams from the IPTV API with optional category filtering.

#### Scenario: Get all livestreams

- GIVEN user is authenticated
- WHEN `StreamService.getStreams()` is invoked with no filter
- THEN the system SHALL return an Observable of all Stream[]

#### Scenario: Get livestreams by category

- GIVEN user is authenticated
- WHEN `StreamService.getStreams(categoryId)` is invoked with a categoryId
- THEN the system SHALL return an Observable of Stream[] filtered by that categoryId

### Requirement: EPG Retrieval with Base64 Decoding

The system SHALL retrieve and decode EPG listings from the IPTV API.

#### Scenario: Get EPG for stream

- GIVEN user is authenticated and streamId is valid
- WHEN `EpgService.getEPG(streamId, limit?)` is invoked
- THEN the system SHALL fetch EPG listings from the API
- AND SHALL decode Base64-encoded title and description fields
- AND SHALL return an Observable of EPGListing[] with decoded strings

#### Scenario: Malformed Base64 in EPG

- GIVEN the API returns a field with malformed Base64
- WHEN `EpgService.getEPG(streamId)` is invoked
- THEN the system SHALL attempt to decode the Base64
- AND SHALL fall back to the raw string if decoding fails
- AND SHALL NOT throw an exception

### Requirement: Stream URL Composition

The system SHALL compose stream URLs for playback without fetching actual M3U8 content.

#### Scenario: Compose stream URL

- GIVEN a valid streamId
- WHEN `StreamService.getStreamUrl(streamId)` is invoked OR `GetStreamUrlUseCase.execute(streamId)` is called
- THEN the system SHALL return a string URL in format: `{host}/live/{username}/{password}/{streamId}.m3u8`
- AND this SHALL be pure composition with no side effects or HTTP calls

### Requirement: Credential Encryption

The system SHALL use Web Crypto API with AES-GCM encryption and PBKDF2 key derivation for credential storage.

#### Scenario: Encrypt credentials for storage

- GIVEN an API password and masterPassword
- WHEN the EncryptionPort.encrypt() is called
- THEN the system SHALL generate a random salt using Web Crypto API
- AND SHALL derive a CryptoKey using PBKDF2 with 100k+ iterations
- AND SHALL encrypt the password using AES-GCM
- AND SHALL return {cipher, iv, salt}

#### Scenario: Decrypt credentials for API use

- GIVEN a cipher text, iv, salt, and masterPassword
- WHEN the EncryptionPort.decrypt() is called
- THEN the system SHALL derive the CryptoKey using PBKDF2 with the provided salt
- AND SHALL decrypt using AES-GCM
- AND SHALL return the original password string

#### Scenario: Key derivation failure

- GIVEN incorrect masterPassword during decryption
- WHEN EncryptionPort.decrypt() is invoked
- THEN the system SHALL throw `IptvApiException(DECRYPTION_FAILED)`

### Requirement: Error Handling

The system SHALL provide typed exceptions for IPTV API and encryption operations.

#### Scenario: Network error during API call

- GIVEN a network connectivity failure
- WHEN any use case invokes an HTTP request
- THEN the system SHALL throw `IptvApiException(NETWORK_ERROR)`

#### Scenario: Server error response

- GIVEN the API returns a 5xx status code
- WHEN any use case processes the response
- THEN the system SHALL throw `IptvApiException(SERVER_ERROR)`

#### Scenario: Decode error during EPG processing

- GIVEN EPG data that cannot be processed
- WHEN `GetEPGUseCase` encounters a decoding failure
- THEN the system SHALL throw `IptvApiException(DECODE_ERROR)`

## MODIFIED Requirements

None — this is a new capability.

## REMOVED Requirements

None — this is a new capability.

---

## Summary Table

| Requirement | Type | Scenarios |
|-------------|------|-----------|
| IPTV Authentication | ADDED | 5 |
| Category Retrieval | ADDED | 2 |
| Stream Retrieval | ADDED | 2 |
| EPG Retrieval with Base64 Decoding | ADDED | 2 |
| Stream URL Composition | ADDED | 1 |
| Credential Encryption | ADDED | 3 |
| Error Handling | ADDED | 3 |
| **TOTAL** | | **18** |

## Next Step

Ready for design (sdd-design).