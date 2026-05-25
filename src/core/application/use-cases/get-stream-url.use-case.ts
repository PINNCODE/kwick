import { StreamUrl } from '../../domain/value-objects/stream-url.vo';
import { IptvApiException } from '../../error/iptv-api.exception';
import { ErrorCode } from '../../error/error-codes';

export interface GetStreamUrlInput {
  streamId: number;
}

export type GetStreamUrlOutput = string;

export class GetStreamUrlUseCase {
  constructor(
    private readonly getHost: () => string | null,
    private readonly getUsername: () => string | null,
    private readonly getDecryptedPassword: () => string | null
  ) {}

  execute(input: GetStreamUrlInput): string {
    const host = this.getHost();
    const username = this.getUsername();
    const password = this.getDecryptedPassword();

    if (!host || !username || !password) {
      throw new IptvApiException(ErrorCode.AUTH_REQUIRED, 'Authentication required');
    }

    return StreamUrl.compose(host, username, password, input.streamId).toString();
  }
}
