import React, { useEffect, useState } from 'react';
import Layout from '../Components/Layout';
import { useAuth } from '../contexts/AuthContext';
// We no longer fetch per‑user temporary addresses for the inbox view. Instead,
// the inbox displays messages from a single configured mailbox defined by
// MAIL_USER in the backend. The address is exposed to the client via
// NEXT_PUBLIC_TEMP_EMAIL.

// This page displays the user's inbox by fetching messages from the backend.
// It mirrors the simple email viewer implemented in Hi.zip but adapts the
// layout to our Next.js application. Messages are retrieved via the
// `/api/mail/inbox` endpoint, which authenticates using the JWT stored in
// localStorage. Only logged‑in users can access this page.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Message {
  uid?: number;
  from: string;
  to: string;
  subject: string;
  date: string;
  text: string;
  html?: string;
  attachments?: { filename: string; size: number; contentType: string }[];
}

export default function InboxPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Index of the currently expanded message. When null no message body is shown.
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Fetch inbox messages on mount. Unlike the previous version that relied on
  // authenticated routes, this endpoint does not require a token because it
  // accesses a single shared mailbox. See `/api/get-all` in the backend.
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/get-all`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to fetch messages');
        }
        const data = await res.json();
        // The API returns an object with an `ok` flag. Extract messages accordingly.
        const msgs = data && Array.isArray(data.messages) ? data.messages : [];
        setMessages(msgs);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // Copy a value to the clipboard and temporarily show feedback on the triggering element
  const handleCopy = async (value: string, event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      await navigator.clipboard.writeText(value);
      const target = event.currentTarget;
      const original = target.textContent;
      target.textContent = 'Copied!';
      setTimeout(() => {
        if (original) target.textContent = original;
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (authLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <Layout title="Inbox">
      <div className="inbox-page">
        <h1>Inbox</h1>
        {/* Display the configured mailbox address with a copy button */}
        <div className="active-emails">
          <span className="active-label">Mailbox:</span>
          <ul>
            <li className="email-item">
              <span className="email-address">{process.env.NEXT_PUBLIC_TEMP_EMAIL}</span>
              <button onClick={(e) => handleCopy(process.env.NEXT_PUBLIC_TEMP_EMAIL || '', e)} className="copy-btn">
                Copy
              </button>
            </li>
          </ul>
        </div>
        {/* Display inbox messages */}
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">No messages yet.</div>
        ) : (
          <div className="messages-container">
            {messages.map((msg, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <div
                  key={index}
                  className={`message${isExpanded ? ' expanded' : ''}`}
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                >
                  <div className={`subject${!msg.subject ? ' no-subject' : ''}`}>{msg.subject || '(No subject)'}</div>
                  <div className="meta">
                    From: {msg.from || 'Unknown'} •{' '}
                    {msg.date ? new Date(msg.date).toLocaleString() : ''}
                  </div>
                    <div className="body">
                    {msg.text ? msg.text.replace(/</g, '&lt;') : '(No content)'}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="attachments">
                        Attachments:
                        <ul>
                          {msg.attachments.map((att: any, i: number) => (
                            <li key={i} className="attachment">
                              {att.filename} ({Math.round(att.size / 1024)} KB)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style jsx>{`
        .inbox-page {
          max-width: 900px;
          margin: 0 auto;
        }
        h1 {
          font-size: 32px;
          color: #1e293b;
          margin-bottom: 16px;
        }
        .active-emails {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .active-label {
          font-weight: 600;
          margin-right: 8px;
          color: #475569;
        }
        .active-emails ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 8px;
        }
        .email-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 6px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .email-address {
          font-family: monospace;
          color: #2563eb;
        }
        .copy-btn {
          background: #22c55e;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .copy-btn:hover {
          background: #16a34a;
        }
        .no-active-emails {
          margin-bottom: 24px;
          color: #64748b;
          font-size: 14px;
        }
        .messages-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow-y: auto;
          max-height: 60vh;
        }
        .message {
          border-bottom: 1px solid #f1f5f9;
          padding: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .message:hover {
          background: #f9fafb;
        }
        .subject {
          font-weight: 600;
          color: #1f2937;
        }
        /* Style subjects that have no content differently to indicate they are placeholders */
        .subject.no-subject {
          font-style: italic;
          color: #6b7280;
        }
        .meta {
          font-size: 0.85rem;
          color: #6b7280;
          margin-top: 4px;
        }
        .body {
          display: none;
          margin-top: 12px;
          padding: 12px;
          background: #f3f4f6;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #374151;
          white-space: pre-line;
        }
        .message.expanded .body {
          display: block;
        }
        .attachments {
          margin-top: 12px;
        }
        .attachments ul {
          list-style: none;
          padding-left: 0;
          margin-top: 4px;
        }
        .attachment {
          font-size: 0.85rem;
          color: #1d4ed8;
        }
        .loading {
          padding: 40px 0;
          text-align: center;
          color: #64748b;
        }
        .empty-state {
          padding: 40px 0;
          text-align: center;
          color: #64748b;
        }
        .error-banner {
          background: #fee2e2;
          color: #b91c1c;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
      `}</style>
    </Layout>
  );
}