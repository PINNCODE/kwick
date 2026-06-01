import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { EPGListing } from '../../domain/entities/epg-listing.entity';
import { IptvApiPort } from '../../ports/outbound/iptv-api.port';
import { IptvApiException } from '../../error/iptv-api.exception';
import { ErrorCode } from '../../error/error-codes';
import { decodeBase64 } from '../../utils/base64';

export interface GetEPGInput {
  streamId: number;
  limit?: number;
  credentials: {
    host: string;
    authToken: string;
  };
}

export type GetEPGOutput = EPGListing[];

export type GetEPGError = IptvApiException;

export class GetEPGUseCase {
  constructor(
    private readonly apiPort: IptvApiPort
  ) {}

  execute(input: GetEPGInput): Observable<EPGListing[]> {
    const { host, authToken } = input.credentials;

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