import React, { useState } from 'react';
import Layout from '../Components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useSms } from '../hooks/useSms';
import { useRouter } from 'next/router';

export default function SmsPage() {
  const { user, loading: authLoading } = useAuth();
  const { numbers, messages, loading, error, twilioConfigured, assignNumber, releaseNumber, fetchMessages } = useSms();
  const [expires, setExpires] = useState<string>('60');
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const router = useRouter();

  React.useEffect(() => { if (!authLoading && !user) router.push('/login'); }, [user, authLoading, router]);

  React.useEffect(() => {
    if (!autoRefresh || !selectedNumber) return;
    const id = setInterval(() => fetchMessages(selectedNumber), 8000);
    return () => clearInterval(id);
  }, [autoRefresh, selectedNumber, fetchMessages]);

  if (authLoading || !user) return <div>Loading...</div>;

  return (
    <Layout title="Temporary SMS Numbers">
      <div className="page">
        <h1>SMS Temporaires</h1>
        <p className="subtitle">Attribution d’un numéro temporaire, réception SMS, suppression automatique</p>
        {typeof twilioConfigured === 'boolean' && !twilioConfigured && (
          <div className="warning">Twilio n'est pas configuré. Ajoutez TWILIO_ACCOUNT_SID et TWILIO_AUTH_TOKEN dans le backend pour activer ce service.</div>
        )}
        {error && (<div className="error">{error}</div>)}

        <div className="controls">
          <select value={expires} onChange={(e) => setExpires(e.target.value)} className="select">
            <option value="30">Expire dans 30 min</option>
            <option value="60">Expire dans 1 heure</option>
            <option value="1440">Expire dans 24 heures</option>
          </select>
          <button className="btn" onClick={() => assignNumber(Number(expires))} disabled={loading}>Obtenir un numéro</button>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto-refresh
          </label>
        </div>

        {loading ? <div>Chargement...</div> : (
          <div className="grid">
            <div className="card">
              <h3>Mes numéros</h3>
              {numbers.length === 0 ? (
                <p className="muted">Aucun numéro pour l'instant.</p>
              ) : (
                <ul className="list">
                  {numbers.map(n => (
                    <li key={n.id} className={selectedNumber === n.phone_number ? 'active' : ''}>
                      <div className="row">
                        <span className="mono">{n.phone_number}</span>
                        <span className="muted">{n.expires_at ? `expire: ${new Date(n.expires_at as any).toLocaleString()}` : ''}</span>
                      </div>
                      <div className="row">
                        <button className="link" onClick={() => { setSelectedNumber(n.phone_number); fetchMessages(n.phone_number); }}>Voir SMS</button>
                        <button className="link danger" onClick={() => releaseNumber(n.id)}>Supprimer</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card">
              <h3>Messages reçus {selectedNumber && (<span className="mono">({selectedNumber})</span>)}</h3>
              {messages.length === 0 ? <p className="muted">Aucun message.</p> : (
                <ul className="messages">
                  {messages.map(m => (
                    <li key={m.id}>
                      <div className="row"><span className="mono from">De {m.from}</span><span className="muted">{new Date(m.received_at).toLocaleString()}</span></div>
                      <pre className="body">{m.body}</pre>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .page { max-width: 1200px; margin: 0 auto; }
        h1 { font-size: 32px; color: #1e293b; margin: 8px 0; }
        .subtitle { color: #64748b; margin-bottom: 12px; }
        .warning { background: #fff7ed; color: #9a3412; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px; }
        .error { background: #fee2e2; color: #b91c1c; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px; }
        .controls { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; }
        .select { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; }
        .btn { background: #2563eb; color: #fff; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; }
        .grid { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; }
        .card { background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .muted { color: #64748b; }
        .mono { font-family: monospace; }
        .list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
        .list li { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
        .list li.active { border-color: #2563eb; }
        .row { display: flex; gap: 8px; align-items: center; justify-content: space-between; }
        .link { background: transparent; border: none; color: #2563eb; cursor: pointer; padding: 0; }
        .link.danger { color: #ef4444; }
        .messages { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
        .from { font-weight: 600; }
        .body { white-space: pre-wrap; margin: 0; color: #0f172a; background: #f8fafc; border-radius: 6px; padding: 10px; }
      `}</style>
    </Layout>
  );
}
