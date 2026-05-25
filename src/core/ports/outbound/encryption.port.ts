export interface EncryptedPayload {
  cipher: string;
  iv: string;
  salt: string;
}

export interface EncryptionPort {
  deriveKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey>;
  encrypt(data: string, key: CryptoKey): Promise<{ cipher: string; iv: Uint8Array }>;
  decrypt(cipher: string, iv: Uint8Array, key: CryptoKey): Promise<string>;
  generateSalt(): Uint8Array;
  encryptWithPassword(data: string, masterPassword: string): Promise<EncryptedPayload>;
  decryptWithPassword(payload: EncryptedPayload, masterPassword: string): Promise<string>;
}
