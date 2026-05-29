import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EpgService as EpgServicePort } from '../../../core/ports/inbound/epg.service.port';
import { EPGListing } from '../../../core/domain/entities/epg-listing.entity';
import { IPTV_API_PORT } from '../../../core/ports/outbound/tokens';
import { AuthServiceAdapter } from '../../../infrastructure/adapters/auth-service.adapter';
import { GetEPGUseCase } from '../../../core/application/use-cases/get-epg.use-case';

@Injectable({ providedIn: 'root' })
export class EpgService implements EpgServicePort {
  private readonly apiPort = inject(IPTV_API_PORT);
  private readonly auth = inject(AuthServiceAdapter);

  getEPG(streamId: number, limit?: number): Observable<EPGListing[]> {
    const credentials = this.auth.getStreamCredentials();
    const useCase = new GetEPGUseCase(
      this.apiPort,
      () => credentials ? `${credentials.username}:${credentials.password}` : null,
      () => credentials ? credentials.host : null
    );
    return useCase.execute({ streamId, limit });
  }
}
