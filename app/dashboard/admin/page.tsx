// app/dashboard/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  _id: string;
  name?: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (email: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: newRole }),
      });
      
      if (response.ok) {
        setUsers(users.map(user => 
          user.email === email ? { ...user, role: newRole } : user
        ));
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Delete ${email}?`)) return;
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setUsers(users.filter(user => user.email !== email));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert-error">{error}</div>
        <button onClick={fetchUsers} className="btn-primary mt-4">Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
          User Management
        </h1>
        <button onClick={fetchUsers} className="btn-secondary text-sm">
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Verified</h3>
          <p>{users.filter(u => u.isVerified).length}</p>
        </div>
        <div className="stat-card">
          <h3>Admins</h3>
          <p>{users.filter(u => u.role === 'admin').length}</p>
        </div>
      </div>

      {/* Mobile: Card View */}
      <div className="users-list">
        {users.map((user) => (
          <div key={user._id} className="user-card">
            <div className="user-card-header">
              <span className="user-name">{user.name || 'No Name'}</span>
              <span className={`text-xs px-2 py-1 rounded ${user.isVerified ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {user.isVerified ? '✓ Verified' : '✗ Unverified'}
              </span>
            </div>
            
            <div className="user-email">{user.email}</div>
            
            <div className="user-details">
              <div className="user-detail-item">
                <span className="user-detail-label">Role</span>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.email, e.target.value)}
                  className="user-detail-value bg-transparent border border-border rounded px-2 py-1"
                  style={{ background: 'var(--surface)' }}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="user-detail-item">
                <span className="user-detail-label">Joined</span>
                <span className="user-detail-value">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="user-actions">
              <Link
                href={`/dashboard/admin/profile?userId=${user._id}`}
                className="btn-secondary text-sm"
              >
                ✏️ Edit
              </Link>
              <button
                onClick={() => handleDeleteUser(user.email)}
                className="text-red-500 text-sm px-3 py-1 rounded border border-red-500/30 hover:bg-red-500/10"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table View */}
      <div className="desktop-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name || 'N/A'}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.email, e.target.value)}
                    className="input text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{user.isVerified ? '✓' : '✗'}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/admin/profile?userId=${user._id}`} className="btn-secondary text-sm px-2 py-1">
                      Edit
                    </Link>
                    <button onClick={() => handleDeleteUser(user.email)} className="text-red-500 text-sm">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="card text-center py-8">
          <p className="opacity-70">No users found</p>
        </div>
      )}
    </div>
  );
}