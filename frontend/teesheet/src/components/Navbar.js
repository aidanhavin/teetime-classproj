// src/components/Navbar.js

import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      {/* Logo / brand – click to go home */}
      <div
        className="nav-left"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        <span className="logo">Tee Sheet</span>
      </div>

      {/* Main nav links */}
      <div className="nav-links">
        <Link to="/" className="nav-item">Home</Link>
        <Link to="/courses" className="nav-item">Courses</Link>
        <Link to="/book" className="nav-item">Book</Link>
        <Link to="/about" className="nav-item">About</Link>
        <Link to="/contact" className="nav-item">Contact</Link>
      </div>

      {/* Right side: auth / user actions */}
      <div className="nav-right">
        {user ? (
          <>
            <Link to="/my-bookings" className="nav-item">My Bookings</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-item">Admin</Link>
            )}
            <span className="nav-user">Hi, {user.name}</span>
            <button
              type="button"
              className="btn nav-btn"
              onClick={onLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn nav-btn"
            onClick={() => navigate('/auth')}
          >
            Login / Register
          </button>
        )}
      </div>
    </nav>
  );
}
