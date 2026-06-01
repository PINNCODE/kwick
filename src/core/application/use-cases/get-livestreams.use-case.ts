import { Observable } from 'rxjs';
import { Stream } from '../../domain/entities/stream.entity';
import { IptvApiPort } from '../../ports/outbound/iptv-api.port';

export interface GetLivestreamsInput {
  categoryId?: number;
  credentials: {
    host: string;
    authToken: string;
  };
}

export type GetLivestreamsOutput = Stream[];

export class GetLivestreamsUseCase {
  constructor(
    private readonly apiPort: IptvApiPort
  ) {}

  execute(input: GetLivestreamsInput): Observable<Stream[]> {
    return this.apiPort.getLivestreams(input.credentials.host, input.credentials.authToken, input.categoryId);
  }
}