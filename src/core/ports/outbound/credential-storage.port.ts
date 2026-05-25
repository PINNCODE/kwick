export interface CredentialRecord {
  id: string;
  host: string;
  username: string;
  passwordCipher: string;
  iv: string;
  salt: string;
}

export interface CredentialStoragePort {
  save(credentials: CredentialRecord): Promise<void>;
  get(): Promise<CredentialRecord | undefined>;
  delete(): Promise<void>;
  exists(): Promise<boolean>;
}
