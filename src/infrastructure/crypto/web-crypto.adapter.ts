import { Injectable } from '@angular/core';
import { EncryptionPort, EncryptedPayload } from '../../core/ports/outbound/encryption.port';

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

@Injectable()
export class WebCryptoAdapter implements EncryptionPort {
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();

  async deriveKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(masterPassword),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data: string, key: CryptoKey): Promise<{ cipher: string; iv: Uint8Array }> {
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      this.encoder.encode(data)
    );

    return {
      cipher: this.arrayBufferToBase64(encrypted),
      iv,
    };
  }

  async decrypt(cipher: string, iv: Uint8Array, key: CryptoKey): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      this.base64ToArrayBuffer(cipher)
    );

    return this.decoder.decode(decrypted);
  }

  generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  }

  async encryptWithPassword(data: string, masterPassword: string): Promise<EncryptedPayload> {
    const salt = this.generateSalt();
    const key = await this.deriveKey(masterPassword, salt);
    const { cipher, iv } = await this.encrypt(data, key);

    return {
      cipher,
      iv: this.arrayBufferToBase64(iv.buffer as ArrayBuffer),
      salt: this.arrayBufferToBase64(salt.buffer as ArrayBuffer),
    };
  }

  async decryptWithPassword(payload: EncryptedPayload, masterPassword: string): Promise<string> {
    const salt = new Uint8Array(this.base64ToArrayBuffer(payload.salt));
    const iv = new Uint8Array(this.base64ToArrayBuffer(payload.iv));
    const key = await this.deriveKey(masterPassword, salt);

    return this.decrypt(payload.cipher, iv, key);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer as ArrayBuffer;
  }
}
