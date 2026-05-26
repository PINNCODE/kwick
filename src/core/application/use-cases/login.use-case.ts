import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResult } from '../../domain/entities/auth-result.entity';
import { IptvApiPort } from '../../ports/outbound/iptv-api.port';
import { CredentialStoragePort, CredentialRecord } from '../../ports/outbound/credential-storage.port';
import { IptvApiException } from '../../error/iptv-api.exception';
import { ErrorCode } from '../../error/error-codes';
import {
  IPTV_API_PORT,
  CREDENTIAL_STORAGE_PORT,
} from '../../ports/outbound/tokens';
import { Inject } from '@angular/core';

export interface LoginInput {
  username: string;
  password: string;
  host: string;
}

export type LoginOutput = AuthResult;

export type LoginError = IptvApiException;

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IPTV_API_PORT) private readonly apiPort: IptvApiPort,
    @Inject(CREDENTIAL_STORAGE_PORT) private readonly credentialStorage: CredentialStoragePort
  ) {}

  execute(input: LoginInput): Observable<AuthResult> {
    return new Observable<AuthResult>((subscriber) => {
      this.apiPort.login(input.username, input.password, input.host).subscribe({
        next: async (authResult) => {
          try {
            const record: CredentialRecord = {
              id: 'primary',
              host: input.host,
              username: input.username,
              password: input.password,
            };

            await this.credentialStorage.save(record);
            subscriber.next(authResult);
            subscriber.complete();
          } catch {
            subscriber.error(new IptvApiException(ErrorCode.ENCRYPTION_FAILED, 'Failed to save credentials'));
          }
        },
        error: (err) => {
          if (err instanceof IptvApiException) {
            subscriber.error(err);
          } else {
            subscriber.error(new IptvApiException(ErrorCode.AUTH_FAILED, 'Authentication failed'));
          }
        },
      });
    });
  }
}
