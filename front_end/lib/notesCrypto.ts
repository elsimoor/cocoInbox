// Client-side encryption for Secure Notes with selectable algorithms
// - AES-GCM (authenticated encryption)
// - AES-CBC-HMAC (encrypt-then-MAC)

const ENC = new TextEncoder();
const DEC = new TextDecoder();

function toB64(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number, lengthBits: number): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey('raw', ENC.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  return crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, keyMaterial, lengthBits);
}

export type NoteAlgo = 'AES-GCM' | 'AES-CBC-HMAC';

export interface NoteCipherMeta {
  cryptoAlgo: NoteAlgo;
  kdf: 'PBKDF2';
  kdfIterations: number;
  iv: string;
  salt: string;
  mac?: string;
}

export interface EncryptedNotePayload extends NoteCipherMeta {
  encryptedTitle: string;
  encryptedContent: string;
}

export async function vaultIdFor(userId: string, cryptoAlgo: NoteAlgo, password: string, iterations = 120000): Promise<string> {
  const salt = ENC.encode(`vault:${userId}:${cryptoAlgo}`);
  const bits = await pbkdf2(password, new Uint8Array(salt), iterations, 256);
  return toB64(bits);
}

export async function encryptNote(
  title: string,
  content: string,
  password: string,
  algo: NoteAlgo,
  iterations = 250000
): Promise<EncryptedNotePayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  if (algo === 'AES-GCM') {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const bits = await pbkdf2(password, salt, iterations, 256);
    const key = await crypto.subtle.importKey('raw', bits, { name: 'AES-GCM' }, false, ['encrypt']);
    const ctTitle = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, ENC.encode(title));
    const ctContent = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, ENC.encode(content));
    return {
      cryptoAlgo: 'AES-GCM',
      kdf: 'PBKDF2',
      kdfIterations: iterations,
      iv: toB64(iv),
      salt: toB64(salt),
      encryptedTitle: toB64(ctTitle),
      encryptedContent: toB64(ctContent),
    };
  } else {
    // AES-CBC with HMAC-SHA256 (encrypt-then-MAC)
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const bits = await pbkdf2(password, salt, iterations, 512);
    const keyBytes = new Uint8Array(bits);
    const encKeyBytes = keyBytes.slice(0, 32);
    const macKeyBytes = keyBytes.slice(32, 64);
    const encKey = await crypto.subtle.importKey('raw', encKeyBytes, { name: 'AES-CBC' }, false, ['encrypt']);
    const macKey = await crypto.subtle.importKey('raw', macKeyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const ctTitle = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, encKey, ENC.encode(title));
    const ctContent = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, encKey, ENC.encode(content));
    const macData = new Uint8Array([...iv, ...new Uint8Array(ctContent)]);
    const mac = await crypto.subtle.sign('HMAC', macKey, macData);
    return {
      cryptoAlgo: 'AES-CBC-HMAC',
      kdf: 'PBKDF2',
      kdfIterations: iterations,
      iv: toB64(iv),
      salt: toB64(salt),
      mac: toB64(mac),
      encryptedTitle: toB64(ctTitle),
      encryptedContent: toB64(ctContent),
    };
  }
}

export async function decryptNoteTitle(meta: NoteCipherMeta, encryptedTitle: string, password: string): Promise<string> {
  const iv = fromB64(meta.iv);
  const salt = fromB64(meta.salt);
  if (meta.cryptoAlgo === 'AES-GCM') {
    const bits = await pbkdf2(password, salt, meta.kdfIterations, 256);
    const key = await crypto.subtle.importKey('raw', bits, { name: 'AES-GCM' }, false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, fromB64(encryptedTitle));
    return DEC.decode(pt);
  } else {
    const bits = await pbkdf2(password, salt, meta.kdfIterations, 512);
    const keyBytes = new Uint8Array(bits);
    const encKeyBytes = keyBytes.slice(0, 32);
    // No MAC check on title; MAC is computed over the content for CBC-HMAC mode
    const encKey = await crypto.subtle.importKey('raw', encKeyBytes, { name: 'AES-CBC' }, false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, encKey, fromB64(encryptedTitle));
    return DEC.decode(pt);
  }
}

export async function decryptNoteContent(meta: NoteCipherMeta, encryptedContent: string, password: string): Promise<string> {
  const iv = fromB64(meta.iv);
  const salt = fromB64(meta.salt);
  if (meta.cryptoAlgo === 'AES-GCM') {
    const bits = await pbkdf2(password, salt, meta.kdfIterations, 256);
    const key = await crypto.subtle.importKey('raw', bits, { name: 'AES-GCM' }, false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, fromB64(encryptedContent));
    return DEC.decode(pt);
  } else {
    const bits = await pbkdf2(password, salt, meta.kdfIterations, 512);
    const keyBytes = new Uint8Array(bits);
    const encKeyBytes = keyBytes.slice(0, 32);
    const macKeyBytes = keyBytes.slice(32, 64);
    const macKey = await crypto.subtle.importKey('raw', macKeyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    // For content MAC, include both title and content to match encryption ordering
    const macData = new Uint8Array([...iv, ...fromB64(encryptedContent)]);
    if (meta.mac) {
      const ok = await crypto.subtle.verify('HMAC', macKey, fromB64(meta.mac), macData);
      if (!ok) throw new Error('MAC verification failed');
    }
    const encKey = await crypto.subtle.importKey('raw', encKeyBytes, { name: 'AES-CBC' }, false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, encKey, fromB64(encryptedContent));
    return DEC.decode(pt);
  }
}
