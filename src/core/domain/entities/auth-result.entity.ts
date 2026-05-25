import { User } from './user.entity';
import { ServerInfo } from './server-info.entity';

export type AuthStatus = 'active' | 'expired' | 'disabled';

export interface AuthResult {
  user: User;
  serverInfo: ServerInfo;
  authToken?: string;
  status: AuthStatus;
}
