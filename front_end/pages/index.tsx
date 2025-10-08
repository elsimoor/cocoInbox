"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Body } from "@react-email/body"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface Attachment {
  filename: string
  size: number
  contentType: string
  cid?: string
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
  date: any
  text: string
  html?: string
  attachments?: Attachment[]
}

const HomePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const MESSAGES_PER_PAGE = 10
  const [currentPage, setCurrentPage] = useState<number>(1)

  useEffect(() => {
    setCurrentPage(1)
    setExpandedIndex(null)
  }, [messages])

  const fetchMessages = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/get-all`)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to fetch messages")
      }
      const data = await res.json()
      const msgs = data && Array.isArray(data.messages) ? data.messages : []
      setMessages(msgs)
    } catch (err: any) {
      setError(err.message || "Failed to fetch messages")
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="tropical-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">🥥</span>
            <span className="logo-text">Cocoinbox</span>
          </div>
          <div className="nav-menu">
            <a href="#services" className="nav-item">
              PRICING
            </a>
            <a href="#about" className="nav-item">
              ABOUT US
            </a>
            <a href="#faq" className="nav-item">
              FAQ
            </a>
            <a href="#contact" className="nav-item">
              CONTACT
            </a>
            <a href="#blog" className="nav-item">
              BLOG
            </a>
            <button className="nav-login">LOGIN / SIGN UP</button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Tropical Island */}
      <section className="hero-section">
        <div className="hero-container">
          {/* Cloud with eSIMs text */}
          <div className="cloud-badge">
            <span className="cloud-text">eSIMs</span>
          </div>

          {/* Main tropical scene */}
          <div className="tropical-scene">
            {/* Sky with clouds */}
            <div className="sky">
              <div className="cloud cloud-1">☁️</div>
              <div className="cloud cloud-2">☁️</div>
              <div className="cloud cloud-3">☁️</div>
            </div>

            {/* Plane with banner */}
            <div className="plane-banner">
              <span className="plane">✈️</span>
              <div className="banner">Boite mail éphémère</div>
            </div>

            {/* Island with palm tree and treasure */}
            <div className="island">
              <div className="palm-tree">🌴</div>
              <div className="treasure-chest">
                <span className="chest-icon">📦</span>
                <span className="chest-label">
                  Notes
                  <br />
                  cryptées
                </span>
              </div>
            </div>

            {/* Ocean with boat */}
            <div className="ocean">
              <div className="waves">〰️〰️〰️</div>
              <div className="sailboat">
                <span className="boat">⛵</span>
                <div className="boat-label">
                  Transfert
                  <br />
                  de fichiers
                </div>
              </div>
            </div>

            {/* Beach with coconut character */}
            <div className="beach">
              <div className="coconut-character">
                <div className="coconut-face">
                  <span className="eyes">👀</span>
                  <span className="smile">😊</span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Input Card */}
          <div className="email-card">
            <div className="email-input-wrapper">
              <input
                type="text"
                placeholder="Your temporary email..."
                className="email-input"
                value={process.env.NEXT_PUBLIC_TEMP_EMAIL || ""}
                readOnly
              />
              <button className="generate-btn" onClick={(e) => handleCopy(process.env.NEXT_PUBLIC_TEMP_EMAIL || "", e)}>
                Copy
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <h2 className="services-title">SERVICES</h2>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">📧</div>
            <h3 className="service-name">EMAIL TEMP</h3>
          </div>
          <div className="service-card">
            <div className="service-icon">🔒</div>
            <h3 className="service-name">PARTAGE SECURISE</h3>
          </div>
          <div className="service-card">
            <div className="service-icon">📝</div>
            <h3 className="service-name">NOTES EPHEMAIRES</h3>
          </div>
        </div>
        <div className="service-dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </section>

      {/* Inbox Section */}
      <section id="inbox" className="inbox-section">
        <div className="inbox-container">
          <h2 className="inbox-title">Your Temporary Inbox</h2>

          <div className="active-email-box">
            <div className="email-display">
              <span className="email-label">📬 Active Email:</span>
              <span className="email-address">{process.env.NEXT_PUBLIC_TEMP_EMAIL}</span>
              <button onClick={(e) => handleCopy(process.env.NEXT_PUBLIC_TEMP_EMAIL || "", e)} className="copy-button">
                📋 Copy
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No messages yet</h3>
              <p>Messages sent to your mailbox will appear here</p>
            </div>
          ) : (
            <div className="messages-wrapper">
              <div className="messages-header">
                <span className="message-count">
                  📨 {messages.length} {messages.length === 1 ? "message" : "messages"}
                </span>
                <button className="refresh-btn" onClick={fetchMessages} title="Refresh inbox">
                  🔄 Refresh
                </button>
              </div>

              <div className="messages-list">
                {(() => {
                  const sortedMessages = messages.slice().sort((a, b) => {
                    const dateA = a.date ? new Date(a.date).getTime() : 0
                    const dateB = b.date ? new Date(b.date).getTime() : 0
                    return dateB - dateA
                  })
                  const totalPages = Math.ceil(sortedMessages.length / MESSAGES_PER_PAGE)
                  const startIndex = (currentPage - 1) * MESSAGES_PER_PAGE
                  const paginated = sortedMessages.slice(startIndex, startIndex + MESSAGES_PER_PAGE)

                  return paginated.map((msg, index) => {
                    const isExpanded = expandedIndex === index
                    const messageKey = typeof msg.uid !== "undefined" ? msg.uid : startIndex + index

                    return (
                      <div key={String(messageKey)} className={`message-item${isExpanded ? " expanded" : ""}`}>
                        <div className="message-header" onClick={() => setExpandedIndex(isExpanded ? null : index)}>
                          <div className="message-subject">{msg.subject || "(No subject)"}</div>
                          <div className="message-meta">
                            <span className="from">From: {msg.from || "Unknown"}</span>
                            <span className="date">{msg.date ? new Date(msg.date).toLocaleString() : ""}</span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="message-body">
                            <Body
                              style={{
                                backgroundColor: "#ffffff",
                                color: "#334155",
                                padding: "16px",
                                lineHeight: "1.6",
                                fontSize: "14px",
                              }}
                            >
                              {msg.html ? (
                                <div dangerouslySetInnerHTML={{ __html: msg.html }} />
                              ) : msg.text ? (
                                msg.text.replace(/</g, "&lt;")
                              ) : (
                                "(No content)"
                              )}

                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="attachments">
                                  <strong>📎 Attachments:</strong>
                                  <ul>
                                    {msg.attachments.map((att, i) => (
                                      <li key={i} className="attachment-item">
                                        {att.content && att.contentType && att.contentType.startsWith("image/") ? (
                                          <>
                                            <img
                                              src={`data:${att.contentType};base64,${att.content}`}
                                              alt={att.filename}
                                              style={{ maxWidth: "100%", marginBottom: "8px", borderRadius: "8px" }}
                                            />
                                            <br />
                                            <a
                                              href={`data:${att.contentType};base64,${att.content}`}
                                              download={att.filename}
                                            >
                                              {att.filename} (download)
                                            </a>
                                          </>
                                        ) : att.content && att.contentType === "application/pdf" ? (
                                          <>
                                            <embed
                                              src={`data:${att.contentType};base64,${att.content}`}
                                              type="application/pdf"
                                              width="100%"
                                              height="400px"
                                              style={{ marginBottom: "8px", borderRadius: "8px" }}
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
                                            href={
                                              att.content && att.contentType
                                                ? `data:${att.contentType};base64,${att.content}`
                                                : "#"
                                            }
                                            download={att.filename}
                                          >
                                            {att.filename}
                                          </a>
                                        )}{" "}
                                        {att.size ? `(${Math.round((att.size || 0) / 1024)} KB)` : ""}
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
                      ← Previous
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
                      Next →
                    </button>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </section>

      {/* User Feedback Section */}
      <section className="feedback-section">
        <h2 className="feedback-title">RETOUR DES UTILISATEURS</h2>
        <div className="feedback-content">
          <p className="feedback-text">"Cocoinbox has been a game-changer for protecting my privacy online! 🌴"</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="footer-logo">🥥 Cocoinbox</span>
            <p className="footer-tagline">Your privacy, our priority</p>
          </div>
          <div className="footer-links">
            <a href="#privacy" className="footer-link">
              Privacy Policy
            </a>
            <a href="#terms" className="footer-link">
              Terms of Service
            </a>
            <a href="#contact" className="footer-link">
              Contact
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Cocoinbox. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .tropical-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #38BDF8 0%, #22D3EE 50%, #06B6D4 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Navbar */
        .navbar {
          background: rgba(6, 182, 212, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 3px solid #0891B2;
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 800;
          font-size: 1.5rem;
          color: white;
        }

        .logo-icon {
          font-size: 2rem;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .nav-item {
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          transition: all 0.2s;
          padding: 0.5rem;
          border-radius: 0.5rem;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .nav-login {
          background: white;
          color: #0891B2;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 2rem;
          font-weight: 700;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .nav-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        /* Hero Section */
        .hero-section {
          padding: 2rem 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .hero-container {
          max-width: 900px;
          margin: 0 auto;
          position: relative;
        }

        .cloud-badge {
          background: white;
          padding: 1rem 2rem;
          border-radius: 3rem;
          display: inline-block;
          margin-bottom: 2rem;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          border: 3px solid #0891B2;
        }

        .cloud-text {
          font-weight: 800;
          font-size: 1.5rem;
          color: #0891B2;
        }

        /* Tropical Scene */
        .tropical-scene {
          background: linear-gradient(180deg, #7DD3FC 0%, #38BDF8 40%, #22D3EE 70%, #FDE68A 100%);
          border-radius: 2rem;
          padding: 2rem;
          position: relative;
          min-height: 400px;
          border: 4px solid #0891B2;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .sky {
          position: absolute;
          top: 1rem;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-around;
          z-index: 1;
        }

        .cloud {
          font-size: 2rem;
          animation: float 6s ease-in-out infinite;
        }

        .cloud-1 {
          animation-delay: 0s;
        }

        .cloud-2 {
          animation-delay: 2s;
        }

        .cloud-3 {
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .plane-banner {
          position: absolute;
          top: 3rem;
          right: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 2;
          animation: fly 20s linear infinite;
        }

        @keyframes fly {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100vw);
          }
        }

        .plane {
          font-size: 2rem;
          transform: rotate(-10deg);
        }

        .banner {
          background: #FEF3C7;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 700;
          font-size: 0.75rem;
          color: #92400E;
          border: 2px solid #FDE68A;
          white-space: nowrap;
        }

        .island {
          position: absolute;
          right: 10%;
          top: 40%;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 3;
        }

        .palm-tree {
          font-size: 4rem;
          margin-bottom: -1rem;
        }

        .treasure-chest {
          background: #FCD34D;
          padding: 1rem;
          border-radius: 1rem;
          border: 3px solid #92400E;
          text-align: center;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .chest-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .chest-label {
          font-weight: 800;
          font-size: 0.75rem;
          color: #92400E;
          line-height: 1.2;
        }

        .ocean {
          position: absolute;
          bottom: 25%;
          left: 0;
          right: 0;
          z-index: 2;
        }

        .waves {
          font-size: 2rem;
          text-align: center;
          color: #0891B2;
          opacity: 0.6;
        }

        .sailboat {
          position: absolute;
          left: 30%;
          top: -2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: bob 3s ease-in-out infinite;
        }

        @keyframes bob {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(2deg);
          }
        }

        .boat {
          font-size: 3rem;
        }

        .boat-label {
          background: #EF4444;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 700;
          font-size: 0.7rem;
          text-align: center;
          line-height: 1.2;
          margin-top: 0.5rem;
          border: 2px solid #991B1B;
        }

        .beach {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 25%;
          background: linear-gradient(180deg, #FDE68A 0%, #FCD34D 100%);
          border-radius: 0 0 1.5rem 1.5rem;
          z-index: 4;
        }

        .coconut-character {
          position: absolute;
          left: 15%;
          bottom: 10%;
          background: #92400E;
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #78350F;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .coconut-face {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .eyes {
          font-size: 1.5rem;
        }

        .smile {
          font-size: 1rem;
        }

        /* Email Card */
        .email-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1.5rem;
          border: 4px solid #0891B2;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
        }

        .email-input-wrapper {
          display: flex;
          gap: 1rem;
          flex-direction: column;
        }

        @media (min-width: 640px) {
          .email-input-wrapper {
            flex-direction: row;
          }
        }

        .email-input {
          flex: 1;
          padding: 1rem 1.5rem;
          border: 3px solid #E5E7EB;
          border-radius: 1rem;
          font-size: 1rem;
          color: #0891B2;
          font-weight: 600;
          background: #F9FAFB;
        }

        .email-input:focus {
          outline: none;
          border-color: #0891B2;
        }

        .generate-btn {
          background: linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%);
          color: white;
          border: none;
          padding: 1rem 2.5rem;
          border-radius: 1rem;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4);
          white-space: nowrap;
        }

        .generate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(6, 182, 212, 0.5);
        }

        /* Services Section */
        .services-section {
          background: white;
          padding: 3rem 1.5rem;
          border-radius: 2rem 2rem 0 0;
          margin-top: 2rem;
        }

        .services-title {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 900;
          color: #0F172A;
          margin-bottom: 2rem;
          font-family: 'Comic Sans MS', cursive, sans-serif;
          letter-spacing: 2px;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto 2rem;
        }

        .service-card {
          background: white;
          border: 4px solid #0F172A;
          border-radius: 1.5rem;
          padding: 3rem 2rem;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
        }

        .service-card:hover {
          transform: translateY(-8px) rotate(2deg);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
          background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%);
        }

        .service-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .service-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0F172A;
          font-family: 'Comic Sans MS', cursive, sans-serif;
          letter-spacing: 1px;
        }

        .service-dots {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 2rem;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #CBD5E1;
          transition: all 0.3s;
        }

        .dot.active {
          background: #0891B2;
          transform: scale(1.3);
        }

        /* Inbox Section */
        .inbox-section {
          background: white;
          padding: 3rem 1.5rem;
        }

        .inbox-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .inbox-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 900;
          color: #0F172A;
          margin-bottom: 2rem;
        }

        .active-email-box {
          background: linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%);
          border-radius: 1.5rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 4px solid #0891B2;
          box-shadow: 0 8px 20px rgba(6, 182, 212, 0.3);
        }

        .email-display {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: flex-start;
        }

        @media (min-width: 768px) {
          .email-display {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .email-label {
          font-weight: 700;
          color: #0891B2;
          font-size: 1rem;
        }

        .email-address {
          font-family: 'Courier New', monospace;
          color: #0F172A;
          font-weight: 700;
          font-size: 1rem;
          word-break: break-all;
          flex: 1;
        }

        .copy-button {
          background: linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%);
          color: #92400E;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(252, 211, 77, 0.4);
          white-space: nowrap;
        }

        .copy-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(252, 211, 77, 0.5);
        }

        /* Messages */
        .messages-wrapper {
          background: #F9FAFB;
          border-radius: 1.5rem;
          padding: 1.5rem;
          border: 3px solid #E5E7EB;
        }

        .messages-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .message-count {
          font-weight: 700;
          color: #0891B2;
          font-size: 1.125rem;
        }

        .refresh-btn {
          background: linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }

        .refresh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4);
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message-item {
          background: white;
          border-radius: 1rem;
          border: 3px solid #E5E7EB;
          overflow: hidden;
          transition: all 0.3s;
        }

        .message-item:hover {
          border-color: #22D3EE;
          box-shadow: 0 6px 16px rgba(34, 211, 238, 0.2);
        }

        .message-item.expanded {
          border-color: #0891B2;
          box-shadow: 0 8px 20px rgba(6, 182, 212, 0.3);
        }

        .message-header {
          padding: 1.25rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .message-header:hover {
          background: #F0F9FF;
        }

        .message-subject {
          font-weight: 700;
          color: #0F172A;
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
        }

        .message-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: #64748B;
        }

        @media (min-width: 640px) {
          .message-meta {
            flex-direction: row;
            gap: 1rem;
          }
        }

        .from {
          font-weight: 600;
        }

        .date {
          color: #94A3B8;
        }

        .message-body {
          padding: 0 1.25rem 1.25rem;
          background: #F9FAFB;
          border-top: 2px solid #E5E7EB;
        }

        .attachments {
          margin-top: 1rem;
          padding: 1rem;
          background: #FEF3C7;
          border-radius: 0.75rem;
          border: 2px solid #FDE68A;
        }

        .attachments ul {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0 0 0;
        }

        .attachment-item {
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pagination-btn {
          background: linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }

        .pagination-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4);
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-weight: 600;
          color: #0891B2;
        }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #64748B;
        }

        .spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid #E0F2FE;
          border-top-color: #0891B2;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #64748B;
        }

        /* Error State */
        .error-state {
          background: #FEE2E2;
          color: #991B1B;
          padding: 1.5rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 3px solid #FCA5A5;
        }

        .error-icon {
          font-size: 2rem;
        }

        /* Feedback Section */
        .feedback-section {
          background: white;
          padding: 3rem 1.5rem;
          border-top: 4px solid #E5E7EB;
        }

        .feedback-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 900;
          color: #0F172A;
          margin-bottom: 2rem;
          font-family: 'Comic Sans MS', cursive, sans-serif;
          letter-spacing: 2px;
        }

        .feedback-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .feedback-text {
          font-size: 1.25rem;
          color: #475569;
          font-style: italic;
          line-height: 1.8;
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
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .footer-container {
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
          color: #22D3EE;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #94A3B8;
          font-size: 0.875rem;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .nav-item {
            display: none;
          }

          .tropical-scene {
            min-height: 300px;
            padding: 1rem;
          }

          .palm-tree {
            font-size: 3rem;
          }

          .treasure-chest {
            padding: 0.75rem;
          }

          .chest-icon {
            font-size: 1.5rem;
          }

          .chest-label {
            font-size: 0.625rem;
          }

          .boat {
            font-size: 2rem;
          }

          .boat-label {
            font-size: 0.6rem;
            padding: 0.4rem 0.75rem;
          }

          .coconut-character {
            width: 3rem;
            height: 3rem;
          }

          .services-title {
            font-size: 1.75rem;
          }

          .service-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default HomePage
