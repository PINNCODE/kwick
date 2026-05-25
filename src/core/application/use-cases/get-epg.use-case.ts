import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { EPGListing } from '../../domain/entities/epg-listing.entity';
import { IptvApiPort } from '../../ports/outbound/iptv-api.port';
import { IptvApiException } from '../../error/iptv-api.exception';
import { ErrorCode } from '../../error/error-codes';
import { decodeBase64 } from '../../../infrastructure/parsing/epg-decoder';

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
      return throwError(() => new IptvApiException(ErrorCode.AUTH_REQUIRED, 'Authentication required'));
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
