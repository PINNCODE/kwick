import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { CredentialStoragePort, CredentialRecord } from '../../core/ports/outbound/credential-storage.port';
import { IptvCredentialDatabase } from './dexie-config';

@Injectable()
export class CredentialDbAdapter implements CredentialStoragePort {
  private db: Dexie;

  constructor() {
    this.db = new IptvCredentialDatabase();
  }

  async save(credentials: CredentialRecord): Promise<void> {
    await this.db.table<CredentialRecord, string>('credentials').put(credentials);
  }

  async get(): Promise<CredentialRecord | undefined> {
    return this.db.table<CredentialRecord, string>('credentials').get('primary');
  }

  async delete(): Promise<void> {
    await Dexie.delete('iptv-credentials');
    this.db = new IptvCredentialDatabase();
  }

  async exists(): Promise<boolean> {
    const record = await this.get();
    return record !== undefined;
  }
}
