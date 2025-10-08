import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { decryptBytes } from '../../lib/crypto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function FileDownload() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!id) return;
    try {
      setStatus('Requesting access...');
      const res = await fetch(`${API_BASE_URL}/api/files/${id}/download-url?password=${encodeURIComponent(password)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Access denied');
      }
      const meta = await res.json();
      setStatus('Downloading encrypted file...');
      const encRes = await fetch(meta.url);
      if (!encRes.ok) throw new Error('Failed to fetch file');
      const encrypted = await encRes.arrayBuffer();

      setStatus('Decrypting...');
      const plain = await decryptBytes(encrypted, password, meta.iv, meta.salt, meta.kdfIterations);

      const blob = new Blob([plain], { type: meta.mimeType || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = meta.filename || 'file';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('✅ Downloaded');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Download failed');
      setStatus('');
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 20 }}>
      <h1>Secure File</h1>
      <p>Enter password to download and decrypt.</p>
      <form onSubmit={handleDownload} style={{ display: 'flex', gap: 8 }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8 }}
        />
        <button type="submit" disabled={!password} style={{ padding: '10px 16px', borderRadius: 8, background: '#2563eb', color: 'white', border: 0 }}>
          Download
        </button>
      </form>
      {status && <p style={{ color: '#334155', marginTop: 8 }}>{status}</p>}
      {error && <p style={{ color: '#ef4444', marginTop: 8 }}>{error}</p>}
    </div>
  );
}

