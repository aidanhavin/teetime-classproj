// src/pages/AdminUserPage.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminUserPage({ token, user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    try {
      setLoading(true);
      setStatus('');

      const res = await fetch(`${API_BASE}/api/admin/users`, {
        // using bearer token instead of cookie
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setStatus(data.msg || 'Could not load users.');
      }
    } catch (err) {
      console.error('Admin load users error:', err);
      setStatus('⚠️ Could not reach server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // basic front-end guard
    if (!user || user.role !== 'admin') {
      setStatus('Not authorized.');
      setLoading(false);
      return;
    }
    if (!token) {
      setStatus('No token, authorization denied.');
      setLoading(false);
      return;
    }

    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  async function handleChangeRole(id, newRole) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(data.msg || 'Role updated.');
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id ? { ...u, role: newRole } : u
          )
        );
      } else {
        setStatus(data.msg || 'Could not update role.');
      }
    } catch (err) {
      console.error('Admin update role error:', err);
      setStatus('⚠️ Could not reach server.');
    }
  }

  return (
    <div className="page">
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Admin – Users</h1>
      <p>View all accounts and manage roles.</p>

      {status && <p style={{ marginBottom: '1rem' }}>{status}</p>}
      {loading && <p>Loading users…</p>}

      {!loading && users.length === 0 && (
        <p>No users found.</p>
      )}

      {users.length > 0 && (
        <table className="simple-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString()
                    : ''}
                </td>
                <td>
                  {u.role === 'admin' ? (
                    <button
                      className="btn btn-gray"
                      type="button"
                      onClick={() => handleChangeRole(u._id, 'user')}
                    >
                      Make User
                    </button>
                  ) : (
                    <button
                      className="btn"
                      type="button"
                      onClick={() => handleChangeRole(u._id, 'admin')}
                    >
                      Make Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

