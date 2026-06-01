import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { httpErrorInterceptor } from '../infrastructure/interceptors/http-error.interceptor';
import { LoginUseCase } from '../core/application/use-cases/login.use-case';
import { GetLivestreamsUseCase } from '../core/application/use-cases/get-livestreams.use-case';
import { GetCategoriesUseCase } from '../core/application/use-cases/get-categories.use-case';
import { GetEPGUseCase } from '../core/application/use-cases/get-epg.use-case';
import { XtreamHttpAdapter } from '../infrastructure/http/xtream-http.adapter';
import { CredentialDbAdapter } from '../infrastructure/storage/credential-db.adapter';
import { AuthServiceAdapter } from '../infrastructure/adapters/auth-service.adapter';
import {
  IPTV_API_PORT,
  CREDENTIAL_STORAGE_PORT,
  AUTH_SERVICE_PORT,
} from '../core/ports/outbound/tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    XtreamHttpAdapter,
    CredentialDbAdapter,
    AuthServiceAdapter,
    { provide: IPTV_API_PORT, useExisting: XtreamHttpAdapter },
    { provide: CREDENTIAL_STORAGE_PORT, useExisting: CredentialDbAdapter },
    { provide: AUTH_SERVICE_PORT, useExisting: AuthServiceAdapter },
    LoginUseCase,
    GetLivestreamsUseCase,
    GetCategoriesUseCase,
    GetEPGUseCase,
  ]
};
