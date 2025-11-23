// src/RegisterPage.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// This component allows users to register for an account
export default function RegisterPage({ setUser, setToken }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  // Send a POST request to the backend to register the user with the form data
    // upon success, set the user and token in the parent component and navigate to the home page
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user || null);

        if (data.token) {
          setToken(data.token);
          localStorage.setItem('authToken', data.token);
        }

        setStatus('Account created!');
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        setStatus(data.msg || 'Could not register.');
      }
    } catch (err) {
      console.error('Register error:', err);
      setStatus('Could not reach server.');
    } finally {
      setLoading(false);
    }
  }

  // The form includes fields for name, email, and password, and a submit button. Can also toggle to login page
  return (
    <div className="page auth-page">
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Create Account</h1>
      <p>Register once and start booking tee times in seconds!</p>

   {/* The Toggle between login and register pages */}
      <div className="auth-toggle">
        <button
          type="button"
          className="auth-toggle-btn"
          onClick={() => navigate('/auth')}
        >
          Log In
        </button>
        <button
          type="button"
          className="auth-toggle-btn active"
        >
          Register
        </button>
      </div>
      {}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
          { /* email is required and must be a valid email address */}
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

      {/* The password field is required and must be at least 6 characters long */}
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
          {/* The submit button is disabled while the registration is submitting */}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Register'}
        </button>
      </form>

      {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
    </div>
  );
}
