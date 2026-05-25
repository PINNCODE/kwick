import { Observable, throwError } from 'rxjs';
import { Stream } from '../../domain/entities/stream.entity';
import { IptvApiPort } from '../../ports/outbound/iptv-api.port';
import { IptvApiException } from '../../error/iptv-api.exception';
import { ErrorCode } from '../../error/error-codes';

export interface GetLivestreamsInput {
  categoryId?: number;
}

export type GetLivestreamsOutput = Stream[];

export type GetLivestreamsError = IptvApiException;

export class GetLivestreamsUseCase {
  constructor(
    private readonly apiPort: IptvApiPort,
    private readonly getAuthToken: () => string | null,
    private readonly getHost: () => string | null
  ) {}

  execute(input?: GetLivestreamsInput): Observable<Stream[]> {
    const host = this.getHost();
    const authToken = this.getAuthToken();

    if (!host || !authToken) {
      return throwError(() => new IptvApiException(ErrorCode.AUTH_REQUIRED, 'Authentication required'));
    }

    return this.apiPort.getLivestreams(host, authToken, input?.categoryId);
  }
}
