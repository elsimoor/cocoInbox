// Simple Web Crypto utilities for password-based file encryption/decryption
// AES-GCM with PBKDF2-derived key

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

export interface EncryptionResult {
  blob: Blob;
  iv: string; // base64
  salt: string; // base64
  algo: string;
  kdfIterations: number;
}

function toBase64(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    TEXT_ENCODER.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptFile(file: Blob, password: string, iterations = 250000): Promise<EncryptionResult> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt, iterations);
  const data = new Uint8Array(await file.arrayBuffer());
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const res = new Blob([encrypted], { type: 'application/octet-stream' });
  return {
    blob: res,
    iv: toBase64(iv.buffer),
    salt: toBase64(salt.buffer),
    algo: 'AES-GCM',
    kdfIterations: iterations,
  };
}

export async function decryptBytes(encrypted: ArrayBuffer, password: string, ivB64: string, saltB64: string, iterations: number): Promise<ArrayBuffer> {
  const iv = fromBase64(ivB64);
  const salt = fromBase64(saltB64);
  const key = await deriveKey(password, salt, iterations);
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
}

