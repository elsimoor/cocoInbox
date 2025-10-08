import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { encryptFile } from '../lib/crypto';
import { watermarkImage } from '../lib/watermark';

// Base URL for the backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SecureFile {
  id: string;
  user_id: string;
  filename: string;
  encrypted_file_url: string;
  storage_path: string;
  file_size: number;
  password_protected: boolean;
  expires_at?: string;
  download_count: number;
  max_downloads?: number;
  watermark_enabled: boolean;
  created_at: string;
  iv?: string;
  salt?: string;
  algo?: string;
  kdf_iterations?: number;
  original_mime_type?: string;
}

export const useSecureFiles = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<SecureFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!user) {
      setFiles([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/files/user/${user.id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await res.json();
      setFiles(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const uploadFile = async (
    file: File,
    options?: {
      password: string;
      expiresAt?: string;
      maxDownloads?: number;
      watermarkEnabled?: boolean;
    }
  ) => {
    if (!user) return null;
    try {
      const password = options?.password;
      if (!password) {
        throw new Error('Password is required for secure upload');
      }

      // 1) Optional watermark for images
      let content: Blob = file;
      let filename = file.name;
      if ((options?.watermarkEnabled ?? true) && file.type.startsWith('image/')) {
        const wmText = `Secure • ${user.email || user.id}`;
        content = await watermarkImage(file, wmText);
        // Use PNG extension for watermarked output
        filename = filename.replace(/\.[^.]+$/, '') + '.png';
      }

      // 2) Request signed upload URL
      const upRes = await fetch(`${API_BASE_URL}/api/files/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, filename, contentType: 'application/octet-stream' }),
      });
      if (!upRes.ok) throw new Error('Failed to get upload URL');
      const { storagePath, uploadUrl } = await upRes.json();

      // 3) Encrypt on client
      const enc = await encryptFile(content, password);

      // 4) Upload encrypted blob
      const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: enc.blob });
      if (!put.ok) throw new Error('Failed to upload encrypted file');

      // 5) Create DB record
      const crRes = await fetch(`${API_BASE_URL}/api/files/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          filename,
          storagePath,
          fileSize: enc.blob.size,
          passwordProtected: true,
          password,
          expiresAt: options?.expiresAt,
          maxDownloads: options?.maxDownloads,
          watermarkEnabled: options?.watermarkEnabled ?? file.type.startsWith('image/'),
          iv: enc.iv,
          salt: enc.salt,
          algo: enc.algo,
          kdfIterations: enc.kdfIterations,
          originalMimeType: file.type || 'application/octet-stream',
        }),
      });
      if (!crRes.ok) throw new Error('Failed to create file record');
      const data = await crRes.json();
      await fetchFiles();
      return data as SecureFile;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete file');
      }
      await fetchFiles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { files, loading, error, uploadFile, deleteFile, refetch: fetchFiles };
};
