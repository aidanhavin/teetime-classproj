import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookingPage from './pages/BookingPage';
import CoursesPage from './pages/CoursePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './AuthPage';
import RegisterPage from './RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminDashBoardPage from './pages/AdminDashBoardPage';
import AdminUserPage from './pages/AdminUserPage';
import AdminBookingsPage from './pages/AdminBookingsPage';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function App() {
  const [user, setUser] = useState(null);     // {id, name, email, role}
  const [token, setToken] = useState(null);   // JWT string

  // On app load, check if there's a saved token and try to fetch the current user's info
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (!savedToken) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (!res.ok) {
          // token invalid/expired
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          return;
        }

        const data = await res.json();
        setToken(savedToken);
        setUser(data.user || null);
      } catch (err) {
        console.error('/me error:', err);
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    })();
  }, []);

  async function handleLogout() {
    try {
      // this just clears cookie on backend; I now mainly rely on the token
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  }

  // The main app component includes the Navbar and sets up routes for different pages, passing down user and token as needed
   return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<BookingPage token={token} />} />
          <Route path="/my-bookings" element={<MyBookingsPage token={token} />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={<AdminDashBoardPage token={token} user={user} />}
          />
          <Route
            path="/admin/users"
            element={<AdminUserPage token={token} user={user} />}
          />
          <Route
            path="/admin/bookings"
            element={<AdminBookingsPage token={token} user={user} />}
          />

          {/* Auth */}
          <Route
            path="/auth"
            element={<AuthPage setUser={setUser} setToken={setToken} />}
          />
          <Route
            path="/register"
            element={<RegisterPage setUser={setUser} setToken={setToken} />}
          />
        </Routes>
      </div>
    </>
  );
}

