"use client"

import type React from "react"
import { useEffect, useState } from "react"
// Import the Mailbox component from the react‑mailbox package. This
// component provides a ready‑made inbox UI with a list and details
// pane. See the package README for details. If the package isn’t
// installed yet, add it as a dependency with `npm install react-mailbox`.
// Import the Body component from @react-email/body. This component
// outputs a `<body>` element containing a table wrapper that is
// typically used in email templates. We leverage it here to present
// message bodies in a consistent, email‑like layout. Note: React will
// render `<body>` tags nested within our page. While this is invalid
// HTML, browsers will still display the content correctly. If you
// encounter issues with nested bodies, consider rendering the Body
// component into an iframe or using ReactDOMServer on the server
// side to convert it to HTML.
import { Body } from '@react-email/body'

// The root page of Cocoinbox now functions as an inbox viewer. Instead of
// redirecting users to the /inbox route, we duplicate the inbox UI here so
// that visiting `/` immediately presents the mailbox experience. This page
// leverages the same API endpoint (`/api/get-all`) to fetch messages from
// the configured temporary mailbox. The mailbox address is exposed via
// `NEXT_PUBLIC_TEMP_EMAIL` in the frontend and corresponding variables in
// the backend `.env` file.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface Attachment {
  filename: string
  size: number
  contentType: string
  cid?: string
  // Base64 encoded content for preview/download. When undefined, the
  // attachment content is not available in the API response.
  content?: string
}

interface Message {
  uid?: number | string
  seqNo?: number
  flags?: string[]
  modseq?: any
  from: string
  to: string
  subject: string
  // The date returned from the server may be a Date object or a string.
  date: any
  text: string
  html?: string
  attachments?: Attachment[]
}

const HomePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  // Index of the currently expanded message. When null no message body is shown.
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  // Pagination state: display 10 messages per page by default. When
  // messages change (e.g. after refresh), reset to the first page and
  // collapse any expanded message. Users can navigate through pages via
  // the controls rendered below the message list.
  const MESSAGES_PER_PAGE = 10
  const [currentPage, setCurrentPage] = useState<number>(1)

  useEffect(() => {
    // Reset pagination and expanded state when a new set of messages arrives
    setCurrentPage(1)
    setExpandedIndex(null)
  }, [messages])

  // Extract the message fetching logic into its own function so it can
  // be reused by both the initial load and the refresh button. This
  // function updates loading and error state, then populates the
  // messages array with the fetched data. If the API call fails it
  // stores the error so an appropriate banner can be shown.
  const fetchMessages = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/get-all`)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to fetch messages')
      }
      const data = await res.json()
      const msgs = data && Array.isArray(data.messages) ? data.messages : []
      setMessages(msgs)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

  // Kick off the initial fetch when the component mounts. The
  // dependency array is left empty so this runs only once on first
  // render. Subsequent refreshes are triggered explicitly via the
  // refresh button below.
  useEffect(() => {
    fetchMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCopy = async (value: string, event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      await navigator.clipboard.writeText(value)
      const target = event.currentTarget
      const original = target.textContent
      target.textContent = "Copied!"
      setTimeout(() => {
        if (original) target.textContent = original
      }, 1500)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }



  console.log("Rendering HomePage with messages:", messages)

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">🥥</span>
            <span className="logo-text">Cocoinbox</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#inbox" className="nav-link">
              Inbox
            </a>
            <button className="nav-cta">Get Started</button>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Temporary Email,
              <span className="hero-highlight"> Instant Privacy</span>
            </h1>
            <p className="hero-description">
              Protect your real email from spam, ads, and unwanted messages. Get a disposable email address in seconds.
            </p>
            <div className="hero-cta">
              <a href="#inbox" className="btn-primary">
                View Your Inbox
              </a>
              <button className="btn-secondary">How It Works</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-card">
              <div className="visual-icon">📧</div>
              <div className="visual-text">Instant Setup</div>
            </div>
            <div className="visual-card">
              <div className="visual-icon">🔒</div>
              <div className="visual-text">100% Private</div>
            </div>
            <div className="visual-card">
              <div className="visual-icon">⚡</div>
              <div className="visual-text">Lightning Fast</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="features-container">
          <h2 className="section-title">Why Choose Cocoinbox?</h2>
          <p className="section-subtitle">The smartest way to protect your inbox</p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon blue">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="feature-title">Instant Access</h3>
              <p className="feature-description">
                No registration required. Start receiving emails immediately with your temporary address.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon yellow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Complete Privacy</h3>
              <p className="feature-description">
                Your real email stays hidden. No tracking, no data collection, no compromises.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Real-Time Updates</h3>
              <p className="feature-description">
                Messages appear instantly in your inbox. No delays, no waiting around.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon yellow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="feature-title">No Spam</h3>
              <p className="feature-description">
                Keep your primary inbox clean. Use temporary emails for signups and trials.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Mobile Friendly</h3>
              <p className="feature-description">Access your temporary inbox from any device, anywhere, anytime.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon yellow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Easy to Use</h3>
              <p className="feature-description">
                Simple, intuitive interface. Copy your email address and start using it right away.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="inbox" className="inbox-section">
        <div className="inbox-container">
          <div className="inbox-header">
            <h2 className="inbox-title">Your Inbox</h2>
            <p className="inbox-subtitle">Messages sent to your temporary address appear here</p>
          </div>

          <div className="active-emails">
            <div className="mailbox-header">
              <span className="active-label">
                <svg className="label-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Your Temporary Email
              </span>
            </div>
            <div className="email-item">
              <span className="email-address">{process.env.NEXT_PUBLIC_TEMP_EMAIL}</span>
              <button onClick={(e) => handleCopy(process.env.NEXT_PUBLIC_TEMP_EMAIL || "", e)} className="copy-btn">
                <svg className="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="copy-text">Copy</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : error ? (
            <div className="error-banner">
              <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3 className="empty-title">No messages yet</h3>
              <p className="empty-description">Messages sent to your mailbox will appear here</p>
            </div>
          ) : (
            <div className="messages-container">
              <div className="messages-header">
                <span className="message-count">
                  {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                </span>
                {/* Refresh button uses an emoji to avoid adding extra dependencies. */}
                <button className="refresh-button" onClick={fetchMessages} title="Refresh inbox">
                  🔄
                </button>
              </div>
              {/*
                Transform the raw messages into the format expected by
                react‑mailbox. Newest messages are shown first by
                sorting in descending order by date. Each message gets
                a unique id (prefer uid when available) and defaults to
                unread inbox status.
              */}
              {/*
                Render a simple inbox list instead of using the react‑mailbox
                component. Newest messages are shown first by sorting in
                descending order by date. Clicking a message toggles its
                expansion. When expanded, the message body is wrapped in
                the `Body` component from @react-email/body to provide an
                email‑style presentation. Attachments are listed below
                the content if present.
              */}
              {
                /*
                 * Pagination: sort messages descending by date so the most recent
                 * appears first, then slice the array to only include the
                 * messages on the current page. Each page shows
                 * MESSAGES_PER_PAGE items. Clicking a message toggles its
                 * expanded state relative to the current page.
                 */
              }
              <div className="messages-list">
                {(() => {
                  const sortedMessages = messages
                    .slice()
                    .sort((a, b) => {
                      const dateA = a.date ? new Date(a.date).getTime() : 0
                      const dateB = b.date ? new Date(b.date).getTime() : 0
                      return dateB - dateA
                    })
                  const totalPages = Math.ceil(sortedMessages.length / MESSAGES_PER_PAGE)
                  const startIndex = (currentPage - 1) * MESSAGES_PER_PAGE
                  const paginated = sortedMessages.slice(startIndex, startIndex + MESSAGES_PER_PAGE)
                  return paginated.map((msg, index) => {
                    // The index used for expansion is relative to the current page
                    const isExpanded = expandedIndex === index
                    const messageKey = typeof msg.uid !== 'undefined' ? msg.uid : startIndex + index
                    return (
                      <div
                        key={String(messageKey)}
                        className={`message${isExpanded ? ' expanded' : ''}`}
                      >
                        {/* Header clickable area toggles message expansion. The rest of the content
                        is interactive (links, previews) and should not collapse the message when clicked. */}
                        <div
                          className="message-header"
                          onClick={() => setExpandedIndex(isExpanded ? null : index)}
                        >
                          <div className={`subject${!msg.subject ? ' no-subject' : ''}`}>{msg.subject || '(No subject)'}</div>
                          <div className="meta">
                            From: {msg.from || 'Unknown'} • {msg.date ? new Date(msg.date).toLocaleString() : ''}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="body">
                            <Body
                              style={{
                                backgroundColor: '#ffffff',
                                color: '#334155',
                                padding: '16px',
                                lineHeight: '1.4',
                                fontSize: '14px',
                              }}
                            >
                              {/* Render HTML if present; otherwise show plain text. The HTML has
                               been processed on the server to embed inline images. */}
                              {msg.html ? (
                                <div dangerouslySetInnerHTML={{ __html: msg.html }} />
                              ) : (
                                msg.text ? msg.text.replace(/</g, '&lt;') : '(No content)'
                              )}
                              {/* Display attachments. Provide previews for images and PDFs, and
                               download links for other attachment types. */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="attachments">
                                  Attachments:
                                  <ul>
                                    {msg.attachments.map((att, i) => (
                                      <li key={i} className="attachment">
                                        {att.content && att.contentType && att.contentType.startsWith('image/') ? (
                                          <>
                                            <img
                                              src={`data:${att.contentType};base64,${att.content}`}
                                              alt={att.filename}
                                              style={{ maxWidth: '100%', marginBottom: '8px' }}
                                            />
                                            <br />
                                            <a
                                              href={`data:${att.contentType};base64,${att.content}`}
                                              download={att.filename}
                                            >
                                              {att.filename} (download)
                                            </a>
                                          </>
                                        ) : att.content && att.contentType === 'application/pdf' ? (
                                          <>
                                            <embed
                                              src={`data:${att.contentType};base64,${att.content}`}
                                              type="application/pdf"
                                              width="100%"
                                              height="400px"
                                              style={{ marginBottom: '8px' }}
                                            />
                                            <br />
                                            <a
                                              href={`data:${att.contentType};base64,${att.content}`}
                                              download={att.filename}
                                            >
                                              {att.filename} (download)
                                            </a>
                                          </>
                                        ) : (
                                          <a
                                            href={att.content && att.contentType ? `data:${att.contentType};base64,${att.content}` : '#'}
                                            download={att.filename}
                                          >
                                            {att.filename}
                                          </a>
                                        )}{' '}
                                        {att.size ? `(${Math.round((att.size || 0) / 1024)} KB)` : ''}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </Body>
                          </div>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>

              {/* Pagination controls: display previous/next buttons and page indicator */}
              {(() => {
                const totalPages = Math.ceil(messages.length / MESSAGES_PER_PAGE)
                if (totalPages <= 1) return null
                return (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1)
                          setExpandedIndex(null)
                        }
                      }}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span className="page-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="pagination-btn"
                      onClick={() => {
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1)
                          setExpandedIndex(null)
                        }
                      }}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">🥥 Cocoinbox</span>
              <p className="footer-tagline">Your privacy, our priority</p>
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link">
                Privacy Policy
              </a>
              <a href="#" className="footer-link">
                Terms of Service
              </a>
              <a href="#" className="footer-link">
                Contact
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Cocoinbox. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #F0F9FF 0%, #FFFBEB 50%, #F0F9FF 100%);
        }

        /*Navbar Styles */
        .navbar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(14, 165, 233, 0.1);
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 800;
          font-size: 1.25rem;
          color: #0EA5E9;
        }

        .logo-icon {
          font-size: 1.75rem;
        }

        .logo-text {
          display: none;
        }

        @media (min-width: 640px) {
          .logo-text {
            display: inline;
          }
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .nav-links {
            gap: 2rem;
          }
        }

        .nav-link {
          color: #475569;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
          font-size: 0.875rem;
          display: none;
        }

        @media (min-width: 640px) {
          .nav-link {
            display: inline;
          }
        }

        @media (min-width: 768px) {
          .nav-link {
            font-size: 1rem;
          }
        }

        .nav-link:hover {
          color: #0EA5E9;
        }

        .nav-cta {
          background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
          box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3);
        }

        @media (min-width: 768px) {
          .nav-cta {
            padding: 0.625rem 1.5rem;
            font-size: 1rem;
          }
        }

        .nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px -2px rgba(14, 165, 233, 0.4);
        }

        /* Hero Section */
        .hero-section {
          padding: 3rem 1.5rem;
        }

        @media (min-width: 768px) {
          .hero-section {
            padding: 5rem 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .hero-section {
            padding: 6rem 1.5rem;
          }
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-content {
          text-align: center;
          margin-bottom: 3rem;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 900;
          color: #0F172A;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        @media (min-width: 768px) {
          .hero-title {
            font-size: 3.5rem;
          }
        }

        @media (min-width: 1024px) {
          .hero-title {
            font-size: 4.5rem;
          }
        }

        .hero-highlight {
          background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.125rem;
          color: #64748B;
          max-width: 600px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        @media (min-width: 768px) {
          .hero-description {
            font-size: 1.25rem;
          }
        }

        .hero-cta {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 640px) {
          .hero-cta {
            flex-direction: row;
          }
        }

        .btn-primary {
          background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
          color: white;
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.4);
          font-size: 1rem;
          display: inline-block;
        }

        @media (min-width: 768px) {
          .btn-primary {
            font-size: 1.125rem;
          }
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(14, 165, 233, 0.5);
        }

        .btn-secondary {
          background: white;
          color: #0EA5E9;
          padding: 1rem 2rem;
          border: 2px solid #0EA5E9;
          border-radius: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
        }

        @media (min-width: 768px) {
          .btn-secondary {
            font-size: 1.125rem;
          }
        }

        .btn-secondary:hover {
          background: #0EA5E9;
          color: white;
          transform: translateY(-2px);
        }

        .hero-visual {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .hero-visual {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .visual-card {
          background: white;
          padding: 2rem;
          border-radius: 1.5rem;
          text-align: center;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
        }

        .visual-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
        }

        .visual-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .visual-text {
          font-weight: 700;
          color: #0F172A;
          font-size: 1.125rem;
        }

        /* Features Section */
        .features-section {
          padding: 4rem 1.5rem;
          background: white;
        }

        @media (min-width: 768px) {
          .features-section {
            padding: 6rem 1.5rem;
          }
        }

        .features-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 900;
          text-align: center;
          color: #0F172A;
          margin-bottom: 1rem;
        }

        @media (min-width: 768px) {
          .section-title {
            font-size: 3rem;
          }
        }

        .section-subtitle {
          text-align: center;
          color: #64748B;
          font-size: 1.125rem;
          margin-bottom: 3rem;
        }

        @media (min-width: 768px) {
          .section-subtitle {
            font-size: 1.25rem;
            margin-bottom: 4rem;
          }
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .feature-card {
          background: linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%);
          padding: 2rem;
          border-radius: 1.5rem;
          border: 1px solid #E2E8F0;
          transition: all 0.3s;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
          border-color: #0EA5E9;
        }

        .feature-icon {
          width: 4rem;
          height: 4rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .feature-icon svg {
          width: 2rem;
          height: 2rem;
        }

        .feature-icon.blue {
          background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%);
          color: #0369A1;
        }

        .feature-icon.yellow {
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          color: #92400E;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 0.75rem;
        }

        .feature-description {
          color: #64748B;
          line-height: 1.6;
          font-size: 0.9375rem;
        }

        /* Inbox Section */
        .inbox-section {
          padding: 4rem 1.5rem;
          background: linear-gradient(135deg, #F0F9FF 0%, #FFFBEB 100%);
        }

        @media (min-width: 768px) {
          .inbox-section {
            padding: 6rem 1.5rem;
          }
        }

        .inbox-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .inbox-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .inbox-title {
          font-size: 2rem;
          font-weight: 900;
          color: #0F172A;
          margin-bottom: 1rem;
        }

        @media (min-width: 768px) {
          .inbox-title {
            font-size: 3rem;
          }
        }

        .inbox-subtitle {
          color: #64748B;
          font-size: 1.125rem;
        }

        @media (min-width: 768px) {
          .inbox-subtitle {
            font-size: 1.25rem;
          }
        }

        /* Active Emails Section */
        .active-emails {
          background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
          border-radius: 1.5rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.3);
        }

        @media (min-width: 768px) {
          .active-emails {
            padding: 2rem;
          }
        }

        .mailbox-header {
          margin-bottom: 1rem;
        }

        .active-label {
          font-weight: 700;
          color: white;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (min-width: 768px) {
          .active-label {
            font-size: 1rem;
          }
        }

        .label-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        @media (min-width: 768px) {
          .label-icon {
            width: 1.5rem;
            height: 1.5rem;
          }
        }

        .email-item {
          background: white;
          border-radius: 1rem;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        @media (min-width: 640px) {
          .email-item {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 1.5rem;
          }
        }

        .email-address {
          font-family: 'Courier New', monospace;
          color: #0284C7;
          font-weight: 700;
          font-size: 1rem;
          word-break: break-all;
        }

        @media (min-width: 640px) {
          .email-address {
            font-size: 1.125rem;
            word-break: normal;
          }
        }

        .copy-btn {
          background: linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%);
          color: #78350f;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-size: 0.9375rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 6px rgba(252, 211, 77, 0.3);
          width: 100%;
        }

        @media (min-width: 640px) {
          .copy-btn {
            width: auto;
          }
        }

        .copy-btn:hover {
          background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(252, 211, 77, 0.4);
        }

        .copy-btn:active {
          transform: translateY(0);
        }

        .copy-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .copy-text {
          display: inline;
        }

        /* Messages Container */
        .messages-container {
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        /* Messages list styles */
        .messages-list {
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .message {
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
          transition: background 0.2s;
        }

        .message:last-child {
          border-bottom: none;
        }

        .message:hover {
          background: #f8fafc;
        }

        .message.expanded {
          background: #f1f5f9;
        }

        .message-header {
          cursor: pointer;
        }

        .subject {
          font-weight: 600;
          color: #1e293b;
        }

        .subject.no-subject {
          font-style: italic;
          color: #64748b;
        }

        .meta {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        .body {
          margin-top: 12px;
        }

        .attachments {
          margin-top: 12px;
          font-size: 12px;
          color: #475569;
        }

        .attachments ul {
          list-style: none;
          padding-left: 0;
          margin-top: 4px;
        }

        .attachment {
          margin-bottom: 4px;
        }

        /* Pagination styles */
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding: 12px 0;
        }

        .pagination-btn {
          background: #e2e8f0;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          color: #1e293b;
          cursor: pointer;
          transition: background 0.2s;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .pagination-btn:not(:disabled):hover {
          background: #cbd5e1;
        }

        .page-info {
          font-size: 14px;
          color: #475569;
        }

        .messages-header {
          background: linear-gradient(135deg, #E0F2FE 0%, #FEF3C7 100%);
          padding: 1.25rem 1.5rem;
          border-bottom: 2px solid #BAE6FD;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .message-count {
          font-weight: 700;
          color: #0369A1;
          font-size: 1rem;
        }

        /* Refresh button styles. Placed next to the message count to allow
           manual reloading of the inbox without reloading the whole page. */
        .refresh-button {
          margin-left: auto;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0 0.5rem;
          color: #0369A1;
        }

        .refresh-button:hover {
          color: #0F172A;
        }

        .message {
          border-bottom: 1px solid #F1F5F9;
          cursor: pointer;
          transition: all 0.2s;
        }

        .message:last-child {
          border-bottom: none;
        }

        .message:hover {
          background: linear-gradient(135deg, #F0F9FF 0%, #FFFBEB 100%);
        }

        .message.expanded {
          background: linear-gradient(135deg, #E0F2FE 0%, #FEF3C7 100%);
        }

        .message-header {
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .message-main {
          flex: 1;
          min-width: 0;
        }

        .subject {
          font-weight: 700;
          color: #0F172A;
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
          word-break: break-word;
        }

        .subject.no-subject {
          font-style: italic;
          color: #94A3B8;
          font-weight: 500;
        }

        .meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: #64748B;
        }

        @media (min-width: 640px) {
          .meta {
            flex-direction: row;
            gap: 1rem;
          }
        }

        .from {
          font-weight: 500;
        }

        .date {
          color: #94A3B8;
        }

        .expand-indicator {
          flex-shrink: 0;
        }

        .chevron {
          width: 1.5rem;
          height: 1.5rem;
          color: #0EA5E9;
          transition: transform 0.2s;
        }

        .chevron.rotated {
          transform: rotate(180deg);
        }

        .body {
          display: none;
          padding: 0 1.5rem 1.5rem 1.5rem;
        }

        .message.expanded .body {
          display: block;
        }

        .body-content {
          background: white;
          padding: 1.25rem;
          border-radius: 1rem;
          font-size: 0.9375rem;
          color: #334155;
          white-space: pre-line;
          word-break: break-word;
          line-height: 1.6;
          border: 1px solid #E2E8F0;
        }

        .attachments {
          margin-top: 1rem;
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          padding: 1.25rem;
          border-radius: 1rem;
          border: 1px solid #FDE68A;
        }

        .attachments-header {
          font-weight: 700;
          color: #92400E;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9375rem;
        }

        .attachment-icon {
          width: 1.125rem;
          height: 1.125rem;
        }

        .attachments ul {
          list-style: none;
          padding-left: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .attachment {
          font-size: 0.875rem;
          color: #78350F;
          background: white;
          padding: 0.625rem 1rem;
          border-radius: 0.5rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }

        .attachment-name {
          font-weight: 600;
        }

        .attachment-size {
          color: #A16207;
        }

        /* Loading State */
        .loading {
          padding: 4rem 1rem;
          text-align: center;
          color: #64748B;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid #E0F2FE;
          border-top-color: #0EA5E9;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Empty State */
        .empty-state {
          padding: 4rem 1rem;
          text-align: center;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 0.5rem;
        }

        .empty-description {
          color: #64748B;
          font-size: 1rem;
        }

        /* Error Banner */
        .error-banner {
          background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
          color: #991B1B;
          padding: 1.25rem;
          border-radius: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          border: 1px solid #FCA5A5;
        }

        .error-icon {
          width: 1.5rem;
          height: 1.5rem;
          flex-shrink: 0;
        }

        /* Footer */
        .footer {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          color: white;
          padding: 3rem 1.5rem 2rem;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 768px) {
          .footer-content {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .footer-brand {
          text-align: center;
        }

        @media (min-width: 768px) {
          .footer-brand {
            text-align: left;
          }
        }

        .footer-logo {
          font-size: 1.5rem;
          font-weight: 800;
          display: block;
          margin-bottom: 0.5rem;
        }

        .footer-tagline {
          color: #94A3B8;
          font-size: 0.9375rem;
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .footer-links {
            justify-content: flex-end;
          }
        }

        .footer-link {
          color: #CBD5E1;
          text-decoration: none;
          transition: color 0.2s;
          font-size: 0.9375rem;
        }

        .footer-link:hover {
          color: #FCD34D;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #94A3B8;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  )
}

export default HomePage
