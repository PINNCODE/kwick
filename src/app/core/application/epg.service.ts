import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EpgService as EpgServicePort } from '../../../core/ports/inbound/epg.service.port';
import { EPGListing } from '../../../core/domain/entities/epg-listing.entity';
import { AUTH_SERVICE_PORT } from '../../../core/ports/outbound/tokens';
import { GetEPGUseCase } from '../../../core/application/use-cases/get-epg.use-case';

@Injectable({ providedIn: 'root' })
export class EpgService implements EpgServicePort {
  private readonly authService = inject(AUTH_SERVICE_PORT);
  private readonly getEPGUseCase = inject(GetEPGUseCase);

  getEPG(streamId: number, limit?: number): Observable<EPGListing[]> {
    const credentials = this.authService.getStreamCredentials();
    if (!credentials) {
      throw new Error('Not authenticated');
    }
    return this.getEPGUseCase.execute({
      streamId,
      limit,
      credentials: {
        host: credentials.host,
        authToken: `${credentials.username}:${credentials.password}`,
      },
    });
  }
}