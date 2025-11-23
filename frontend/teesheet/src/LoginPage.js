import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// This allows users to log in to their account
export default function LoginPage() {
  const navigate = useNavigate();
// State for form data, status messages, and loading state
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }
 // Send a POST request to the backend to log in the user with the form data
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // send/receive cookie
        body: JSON.stringify(form),
      });

      const data = await res.json();

      // If login is successful, set the status message and navigate to the home page
      if (res.ok) {
        setStatus('Logged in successfully!');
        setTimeout(() => {
          navigate('/book');
        }, 500);
      } else {
        setStatus(data.msg || 'Invalid credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setStatus('Could not reach server.');
    } finally {
      setLoading(false);
    }
  }
    // includes fields for email and password, and a submit button that is disabled while the login request is in progress
  return (
    <div className="page auth-page">
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Log In</h1>
      <p>Sign in to book and manage your tee times.</p>

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

      <p style={{ marginTop: '1rem' }}>
        Don&apos;t have an account?{' '}
        <button
          type="button"
          className="link-button"
          onClick={() => navigate('/register')}
        >
          Register here
        </button>
      </p>
    </div>
  );
}
