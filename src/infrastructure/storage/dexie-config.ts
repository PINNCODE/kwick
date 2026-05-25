import Dexie, { Table } from 'dexie';
import { CredentialRecord } from '../../core/ports/outbound/credential-storage.port';

export class IptvCredentialDatabase extends Dexie {
  credentials!: Table<CredentialRecord, string>;

  constructor() {
    super('iptv-credentials');
    this.version(1).stores({
      credentials: 'id, host, username',
    });
  }
}

export const DB_NAME = 'iptv-credentials';
export const CREDENTIALS_TABLE = 'credentials';
