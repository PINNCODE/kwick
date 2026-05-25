export function decodeBase64(encoded: string): string {
  try {
    const decoded = atob(encoded);
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes.buffer);
  } catch {
    return encoded;
  }
}

export function decodeBase64Field(field: unknown): string {
  if (typeof field === 'string') {
    return decodeBase64(field);
  }
  return '';
}
