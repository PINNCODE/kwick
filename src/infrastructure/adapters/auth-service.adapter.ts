import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService, LoginCredentials } from '../../core/ports/inbound/auth.service.port';
import { AuthResult } from '../../core/domain/entities/auth-result.entity';
import { User } from '../../core/domain/entities/user.entity';
import { LoginUseCase } from '../../core/application/use-cases/login.use-case';
import { XtreamHttpAdapter } from '../http/xtream-http.adapter';
import { CredentialDbAdapter } from '../storage/credential-db.adapter';

@Injectable({ providedIn: 'root' })
export class AuthServiceAdapter implements AuthService {
  private currentUser: User | null = null;
  private currentAuthResult: AuthResult | null = null;
  private decryptedPassword: string | null = null;
  private storedHost: string | null = null;

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly apiAdapter: XtreamHttpAdapter,
    private readonly credentialStorage: CredentialDbAdapter
  ) {}

  login(credentials: LoginCredentials): Observable<AuthResult> {
    return this.loginUseCase.execute({
      username: credentials.username,
      password: credentials.password,
      host: credentials.host,
    }).pipe(
      map((authResult) => {
        this.currentUser = authResult.user;
        this.currentAuthResult = authResult;
        this.decryptedPassword = credentials.password;
        this.storedHost = credentials.host;
        return authResult;
      })
    );
  }

  async restoreSession(): Promise<boolean> {
    const record = await this.credentialStorage.get();
    if (!record) {
      return false;
    }

    try {
      const authResult = await new Promise<AuthResult>((resolve, reject) => {
        this.apiAdapter.login(record.username, record.password, record.host).subscribe({
          next: resolve,
          error: reject,
        });
      });

      this.currentUser = authResult.user;
      this.currentAuthResult = authResult;
      this.decryptedPassword = record.password;
      this.storedHost = record.host;
      return true;
    } catch {
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentAuthResult(): AuthResult | null {
    return this.currentAuthResult;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getStreamCredentials(): { host: string; username: string; password: string } | null {
    if (!this.storedHost || !this.decryptedPassword) {
      return null;
    }
    return {
      host: this.storedHost,
      username: this.currentUser?.username ?? '',
      password: this.decryptedPassword,
    };
  }

  async logout(): Promise<void> {
    await this.credentialStorage.delete();
    this.currentUser = null;
    this.currentAuthResult = null;
    this.decryptedPassword = null;
    this.storedHost = null;
  }
}
