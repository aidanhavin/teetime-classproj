// src/AuthPage.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AuthPage({ setUser, setToken }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // still fine, but we rely on token below
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // data.user now includes role from backend
        const { user, token } = data;

        setUser(user || null);

        if (token) {
          setToken(token);
          localStorage.setItem('authToken', token);
        }

        setStatus('✅ Logged in!');
        setTimeout(() => {
          navigate('/');
        }, 400);
      } else {
        setStatus(data.msg || 'Invalid credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setStatus('⚠️ Could not reach server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page auth-page">
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Log In</h1>
      <p>Sign in to book and manage your tee times.</p>

      <div className="auth-toggle">
        <button
          type="button"
          className="auth-toggle-btn active"
        >
          Log In
        </button>
        <button
          type="button"
          className="auth-toggle-btn"
          onClick={() => navigate('/register')}
        >
          Register
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
    </div>
  );
}

