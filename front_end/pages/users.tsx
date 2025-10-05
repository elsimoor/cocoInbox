import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin, AdminUser } from '../hooks/useAdmin';

export default function UsersManagement() {
  const { user, loading: authLoading } = useAuth();
  const { users, loading, error, fetchUsers, updateUserRoles, updateProStatus } = useAdmin();
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleToggleProStatus = async (userId: string, currentStatus: boolean) => {
    const result = await updateProStatus(userId, !currentStatus);
    if (result.error) {
      setUpdateError(result.error);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || !user.roles?.includes('admin'))) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.roles?.includes('admin')) {
      fetchUsers();
    }
  }, [user]);

  const handleEditRoles = (user: AdminUser) => {
    setEditingUser(user.id);
    setSelectedRoles([...user.roles]);
    setUpdateError(null);
  };

  const handleToggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSaveRoles = async (userId: string) => {
    const result = await updateUserRoles(userId, selectedRoles);
    if (result.error) {
      setUpdateError(result.error);
    } else {
      setEditingUser(null);
      setSelectedRoles([]);
      setUpdateError(null);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setSelectedRoles([]);
    setUpdateError(null);
  };

  if (authLoading || !user) {
    return <div>Loading...</div>;
  }

  if (!user.roles?.includes('admin')) {
    return (
      <Layout title="User Management">
        <div>You are not authorized to view this page.</div>
      </Layout>
    );
  }

  return (
    <Layout title="User Management">
      <div className="users-management">
        <h1>User Management</h1>
        <p className="subtitle">Manage user accounts and permissions</p>

        {loading && <div>Loading users...</div>}
        {error && <div className="error">{error}</div>}
        {updateError && <div className="error">{updateError}</div>}

        {!loading && users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Roles</th>
                  <th>Pro Status</th>
                  <th>Content</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.name || '-'}</td>
                    <td>
                      {editingUser === u.id ? (
                        <div className="role-editor">
                          <label>
                            <input
                              type="checkbox"
                              checked={selectedRoles.includes('user')}
                              onChange={() => handleToggleRole('user')}
                            />
                            User
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              checked={selectedRoles.includes('pro')}
                              onChange={() => handleToggleRole('pro')}
                            />
                            Pro
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              checked={selectedRoles.includes('admin')}
                              onChange={() => handleToggleRole('admin')}
                            />
                            Admin
                          </label>
                        </div>
                      ) : (
                        <div className="roles-badges">
                          {u.roles.map((role) => (
                            <span key={role} className={`role-badge role-${role}`}>
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        className={`pro-status-toggle ${u.is_pro ? 'pro' : 'free'}`}
                        onClick={() => handleToggleProStatus(u.id, u.is_pro)}
                        disabled={loading}
                      >
                        {u.is_pro ? '✓ Pro' : 'Free'}
                      </button>
                    </td>
                    <td>
                      <div className="content-counts">
                        <span>📧 {u.emailCount || 0}</span>
                        <span>📝 {u.noteCount || 0}</span>
                        <span>📁 {u.fileCount || 0}</span>
                      </div>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {editingUser === u.id ? (
                        <div className="action-buttons">
                          <button onClick={() => handleSaveRoles(u.id)} className="save-btn">
                            Save
                          </button>
                          <button onClick={handleCancel} className="cancel-btn">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditRoles(u)} className="edit-btn">
                          Edit Roles
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .users-management {
          max-width: 1400px;
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
        .users-table-container {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow-x: auto;
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
        .roles-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .role-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .role-user {
          background: #e0f2fe;
          color: #0284c7;
        }
        .role-pro {
          background: #fef3c7;
          color: #d97706;
        }
        .role-admin {
          background: #fce7f3;
          color: #db2777;
        }
        .pro-status-toggle {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pro-status-toggle.pro {
          background: #d1fae5;
          color: #059669;
        }
        .pro-status-toggle.pro:hover:not(:disabled) {
          background: #a7f3d0;
        }
        .pro-status-toggle.free {
          background: #f3f4f6;
          color: #6b7280;
        }
        .pro-status-toggle.free:hover:not(:disabled) {
          background: #e5e7eb;
        }
        .pro-status-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .content-counts {
          display: flex;
          gap: 8px;
          font-size: 12px;
        }
        .role-editor {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .role-editor label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }
        .role-editor input[type='checkbox'] {
          width: 14px;
          height: 14px;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        .edit-btn,
        .save-btn,
        .cancel-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .edit-btn {
          background: #2563eb;
          color: white;
        }
        .edit-btn:hover {
          background: #1d4ed8;
        }
        .save-btn {
          background: #10b981;
          color: white;
        }
        .save-btn:hover {
          background: #059669;
        }
        .cancel-btn {
          background: #6b7280;
          color: white;
        }
        .cancel-btn:hover {
          background: #4b5563;
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
