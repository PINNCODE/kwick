import { InjectionToken } from '@angular/core';
import { IptvApiPort } from './iptv-api.port';
import { CredentialStoragePort } from './credential-storage.port';
import { AuthService } from '../inbound/auth.service.port';

export const IPTV_API_PORT = new InjectionToken<IptvApiPort>('IPTV_API_PORT');
export const CREDENTIAL_STORAGE_PORT = new InjectionToken<CredentialStoragePort>('CREDENTIAL_STORAGE_PORT');
export const AUTH_SERVICE_PORT = new InjectionToken<AuthService>('AUTH_SERVICE_PORT');
