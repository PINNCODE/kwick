import { Observable } from 'rxjs';
import { AuthResult } from '../../domain/entities/auth-result.entity';
import { User } from '../../domain/entities/user.entity';

export interface LoginCredentials {
  username: string;
  password: string;
  host: string;
}

export interface AuthService {
  login(credentials: LoginCredentials): Observable<AuthResult>;
  restoreSession(): Promise<boolean>;
  getCurrentUser(): User | null;
  getCurrentAuthResult(): AuthResult | null;
  isAuthenticated(): boolean;
  logout(): Promise<void>;
}
