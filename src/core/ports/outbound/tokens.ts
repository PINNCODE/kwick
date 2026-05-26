import { InjectionToken } from '@angular/core';
import { IptvApiPort } from './iptv-api.port';
import { EncryptionPort } from './encryption.port';
import { CredentialStoragePort } from './credential-storage.port';

export const IPTV_API_PORT = new InjectionToken<IptvApiPort>('IPTV_API_PORT');
export const ENCRYPTION_PORT = new InjectionToken<EncryptionPort>('ENCRYPTION_PORT');
export const CREDENTIAL_STORAGE_PORT = new InjectionToken<CredentialStoragePort>('CREDENTIAL_STORAGE_PORT');
