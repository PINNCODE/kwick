import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { httpErrorInterceptor } from '../infrastructure/interceptors/http-error.interceptor';
import { LoginUseCase } from '../core/application/use-cases/login.use-case';
import { XtreamHttpAdapter } from '../infrastructure/http/xtream-http.adapter';
import { WebCryptoAdapter } from '../infrastructure/crypto/web-crypto.adapter';
import { CredentialDbAdapter } from '../infrastructure/storage/credential-db.adapter';
import {
  IPTV_API_PORT,
  ENCRYPTION_PORT,
  CREDENTIAL_STORAGE_PORT,
} from '../core/ports/outbound/tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    XtreamHttpAdapter,
    WebCryptoAdapter,
    CredentialDbAdapter,
    { provide: IPTV_API_PORT, useExisting: XtreamHttpAdapter },
    { provide: ENCRYPTION_PORT, useExisting: WebCryptoAdapter },
    { provide: CREDENTIAL_STORAGE_PORT, useExisting: CredentialDbAdapter },
    LoginUseCase,
  ]
};
