import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { encryptNote, decryptNoteTitle, decryptNoteContent, vaultIdFor, NoteAlgo } from '../lib/notesCrypto';

// Base URL for the backend API. The NEXT_PUBLIC_API_URL environment variable can be set
// at build time to point to the correct backend URL (e.g. Vercel serverless function or
// local development server). If not provided it defaults to localhost:4000.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SecureNoteDto {
  id: string;
  user_id: string;
  encrypted_title: string;
  encrypted_content: string;
  crypto_algo: NoteAlgo;
  kdf: 'PBKDF2';
  kdf_iterations: number;
  iv: string;
  salt: string;
  mac?: string;
  vault_id: string;
  auto_delete_after_read: boolean;
  has_been_read: boolean;
  expires_at?: string;
  created_at: string;
}

export const useSecureNotes = () => {
  const { user, token } = useAuth();
  const [notes, setNotes] = useState<SecureNoteDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vault listing: requires algorithm + password to derive vaultId
  const listVaultNotes = async (algo: NoteAlgo, password: string) => {
    if (!user) return [] as SecureNoteDto[];
    setLoading(true);
    try {
      const vaultId = await vaultIdFor(user.id, algo, password);
      const res = await fetch(`${API_BASE_URL}/api/notes/vault-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ cryptoAlgo: algo, vaultId }),
      });
      if (!res.ok) throw new Error('Failed to fetch notes');
      const data: SecureNoteDto[] = await res.json();
      setNotes(data || []);
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [] as SecureNoteDto[];
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (
    algo: NoteAlgo,
    password: string,
    title: string,
    content: string,
    autoDeleteAfterRead: boolean = false,
    expiresAt?: string,
    expiresInMinutes?: number,
    kdfIterations: number = 250000,
  ) => {
    if (!user) return null;
    try {
      const enc = await encryptNote(title, content, password, algo, kdfIterations);
      const vaultId = await vaultIdFor(user.id, algo, password);
      const res = await fetch(`${API_BASE_URL}/api/notes/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          encryptedTitle: enc.encryptedTitle,
          encryptedContent: enc.encryptedContent,
          cryptoAlgo: enc.cryptoAlgo,
          kdf: 'PBKDF2',
          kdfIterations: enc.kdfIterations,
          iv: enc.iv,
          salt: enc.salt,
          mac: enc.mac,
          vaultId,
          autoDeleteAfterRead,
          expiresAt,
          expiresInMinutes,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create note');
      }
      const data = await res.json();
      return data as SecureNoteDto;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const getNoteEncrypted = async (noteId: string) => {
    if (!user) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch note');
      }
      const data: SecureNoteDto = await res.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete note');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Decrypt helpers for UI
  const decryptTitle = async (note: SecureNoteDto, password: string) =>
    decryptNoteTitle(
      { cryptoAlgo: note.crypto_algo, kdf: 'PBKDF2', kdfIterations: note.kdf_iterations, iv: note.iv, salt: note.salt, mac: note.mac },
      note.encrypted_title,
      password,
    );

  const decryptContent = async (note: SecureNoteDto, password: string) =>
    decryptNoteContent(
      { cryptoAlgo: note.crypto_algo, kdf: 'PBKDF2', kdfIterations: note.kdf_iterations, iv: note.iv, salt: note.salt, mac: note.mac },
      note.encrypted_content,
      password,
    );

  return { notes, loading, error, listVaultNotes, createNote, getNoteEncrypted, deleteNote, decryptTitle, decryptContent };
};
