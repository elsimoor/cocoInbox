import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar() {
  const router = useRouter();
  const { user } = useAuth();

  const isActive = (path: string) => router.pathname === path;

  return (
    <aside className="sidebar">
      <div className="brand">Cocoinbox</div>
      <nav>
        <ul>
          <li className={isActive('/dashboard') ? 'active' : ''}>
            <Link href="/dashboard">
              <span className="icon">📊</span>
              Dashboard
            </Link>
          </li>
          <li className={isActive('/emails') ? 'active' : ''}>
            <Link href="/emails">
              <span className="icon">📧</span>
              Ephemeral Emails
            </Link>
          </li>
          {/* Inbox page: allow users to view messages received on their temporary addresses. */}
          <li className={isActive('/inbox') ? 'active' : ''}>
            <Link href="/inbox">
              <span className="icon">📨</span>
              Inbox
            </Link>
          </li>
          <li className={isActive('/notes') ? 'active' : ''}>
            <Link href="/notes">
              <span className="icon">📝</span>
              Secure Notes
            </Link>
          </li>
          <li className={isActive('/files') ? 'active' : ''}>
            <Link href="/files">
              <span className="icon">📁</span>
              Secure Files
            </Link>
          </li>

          {/* Show admin links only for admin users */}
          {user?.roles?.includes('admin') && (
            <>
              <li className="admin-divider">
                <span>Admin Panel</span>
              </li>
              <li className={isActive('/admin') ? 'active' : ''}>
                <Link href="/admin">
                  <span className="icon">📊</span>
                  Dashboard
                </Link>
              </li>
              <li className={isActive('/users') ? 'active' : ''}>
                <Link href="/users">
                  <span className="icon">👥</span>
                  Users
                </Link>
              </li>
              <li className={isActive('/domains') ? 'active' : ''}>
                <Link href="/domains">
                  <span className="icon">⚙️</span>
                  Domains
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <style jsx>{`
        .sidebar {
          width: 260px;
          background: #1e293b;
          color: white;
          padding: 20px;
          min-height: calc(100vh - 64px);
        }
        .brand {
          font-weight: bold;
          font-size: 20px;
          margin-bottom: 32px;
          color: #f1f5f9;
        }
        nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        nav li {
          margin: 4px 0;
          border-radius: 8px;
          transition: background 0.2s;
        }
        nav li.active {
          background: #334155;
        }
        nav li:hover {
          background: #334155;
        }
        nav a {
          color: #cbd5e1;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          font-weight: 500;
          transition: color 0.2s;
        }
        nav li.active a {
          color: #f1f5f9;
        }
        nav li:hover a {
          color: #f1f5f9;
        }
        .icon {
          font-size: 18px;
        }
        .admin-divider {
          margin-top: 24px;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          pointer-events: none;
        }
        .admin-divider:hover {
          background: transparent;
        }
        @media (max-width: 900px) {
          .sidebar { display: none; }
        }
      `}</style>
    </aside>
  );
}