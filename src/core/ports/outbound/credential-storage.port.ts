export interface CredentialRecord {
  id: string;
  host: string;
  username: string;
  password: string;
}

export interface CredentialStoragePort {
  save(credentials: CredentialRecord): Promise<void>;
  get(): Promise<CredentialRecord | undefined>;
  delete(): Promise<void>;
  exists(): Promise<boolean>;
}
