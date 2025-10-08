import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface TempNumber {
  id: string;
  user_id: string;
  phone_number: string;
  provider: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface SmsMessageDto {
  id: string;
  to: string;
  from: string;
  body: string;
  received_at: string;
}

export function useSms() {
  const { token } = useAuth();
  const [numbers, setNumbers] = useState<TempNumber[]>([]);
  const [messages, setMessages] = useState<SmsMessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [twilioConfigured, setTwilioConfigured] = useState<boolean | null>(null);

  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/config/public`);
      const data = res.ok ? await res.json() : {};
      setTwilioConfigured(!!data.twilioConfigured);
    } catch { setTwilioConfigured(null); }
  };

  const fetchNumbers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sms/numbers`, { headers });
      if (!res.ok) throw new Error('Failed to load numbers');
      setNumbers(await res.json());
    } catch (e: any) { setError(e.message); }
  };

  const fetchMessages = async (number?: string) => {
    try {
      const url = new URL(`${API_BASE_URL}/api/sms/messages`);
      if (number) url.searchParams.set('number', number);
      const res = await fetch(url.toString(), { headers });
      if (!res.ok) throw new Error('Failed to load messages');
      setMessages(await res.json());
    } catch (e: any) { setError(e.message); }
  };

  const assignNumber = async (expiresInMinutes?: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sms/assign`, { method: 'POST', headers, body: JSON.stringify({ expiresInMinutes }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to assign number'); }
      await fetchNumbers();
    } catch (e: any) { setError(e.message); }
  };

  const releaseNumber = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sms/numbers/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to release number');
      await fetchNumbers();
    } catch (e: any) { setError(e.message); }
  };

  const refetch = async () => { setLoading(true); await Promise.all([fetchConfig(), fetchNumbers(), fetchMessages()]); setLoading(false); };

  useEffect(() => { refetch(); }, [token]);

  return { numbers, messages, loading, error, twilioConfigured, assignNumber, releaseNumber, fetchMessages, refetch };
}

