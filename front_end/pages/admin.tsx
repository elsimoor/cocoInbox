import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../Components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { stats, loading, error, fetchStats } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !user.roles?.includes('admin'))) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.roles?.includes('admin')) {
      fetchStats();
    }
  }, [user]);

  if (authLoading || !user) {
    return <div>Loading...</div>;
  }

  if (!user.roles?.includes('admin')) {
    return (
      <Layout title="Admin Dashboard">
        <div>You are not authorized to view this page.</div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">System overview and statistics</p>

        {loading && <div>Loading statistics...</div>}
        {error && <div className="error">{error}</div>}

        {stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Users</div>
                <div className="stat-value">{stats.users.total}</div>
                <div className="stat-details">
                  <span>{stats.users.free} free</span>
                  <span>{stats.users.pro} pro</span>
                  <span>{stats.users.admin} admin</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Ephemeral Emails</div>
                <div className="stat-value">{stats.content.emails}</div>
                <div className="stat-details">
                  <span>{stats.content.activeEmails} active</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Secure Notes</div>
                <div className="stat-value">{stats.content.notes}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Secure Files</div>
                <div className="stat-value">{stats.content.files}</div>
              </div>
            </div>

            <div className="recent-users">
              <h2>Recent Users</h2>
              {stats.recentUsers.length === 0 ? (
                <p>No users yet.</p>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>{u.name || '-'}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .admin-dashboard {
          max-width: 1200px;
          margin: 0 auto;
        }
        h1 {
          font-size: 36px;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .subtitle {
          color: #64748b;
          margin-bottom: 32px;
          font-size: 18px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .stat-label {
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
        }
        .stat-details {
          display: flex;
          gap: 12px;
          font-size: 14px;
          color: #64748b;
        }
        .stat-details span {
          padding: 4px 8px;
          background: #f1f5f9;
          border-radius: 6px;
        }
        .recent-users {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .recent-users h2 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 24px;
          color: #1e293b;
        }
        .users-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .users-table th,
        .users-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
        }
        .users-table th {
          color: #1e293b;
          font-weight: 600;
        }
        .error {
          background: #fee2e2;
          color: #b91c1c;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
      `}</style>
    </Layout>
  );
}
