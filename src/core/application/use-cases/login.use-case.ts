import { Observable } from 'rxjs';
import { AuthResult } from '../../domain/entities/auth-result.entity';
import { IptvApiPort } from '../../ports/outbound/iptv-api.port';
import { EncryptionPort } from '../../ports/outbound/encryption.port';
import { CredentialStoragePort, CredentialRecord } from '../../ports/outbound/credential-storage.port';
import { IptvApiException } from '../../error/iptv-api.exception';
import { ErrorCode } from '../../error/error-codes';

export interface LoginInput {
  username: string;
  password: string;
  host: string;
  masterPassword: string;
}

export type LoginOutput = AuthResult;

export type LoginError = IptvApiException;

export class LoginUseCase {
  constructor(
    private readonly apiPort: IptvApiPort,
    private readonly encryptionPort: EncryptionPort,
    private readonly credentialStorage: CredentialStoragePort
  ) {}

  execute(input: LoginInput): Observable<AuthResult> {
    return new Observable<AuthResult>((subscriber) => {
      this.apiPort.login(input.username, input.password, input.host).subscribe({
        next: async (authResult) => {
          try {
            const encrypted = await this.encryptionPort.encryptWithPassword(
              input.password,
              input.masterPassword
            );

            const record: CredentialRecord = {
              id: 'primary',
              host: input.host,
              username: input.username,
              passwordCipher: encrypted.cipher,
              iv: encrypted.iv,
              salt: encrypted.salt,
            };

            await this.credentialStorage.save(record);
            subscriber.next(authResult);
            subscriber.complete();
          } catch {
            subscriber.error(new IptvApiException(ErrorCode.ENCRYPTION_FAILED, 'Failed to encrypt credentials'));
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
