// src/pages/AdminDashBoardPage.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminDashboardPage({ token, user }) {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // For filtering bookings-by-date
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Normalize bookingsByDate from backend (might be {date,count} or {_id,count})
  function normalizeBookingsByDate(raw = []) {
    return raw
      .map((row) => ({
        date: row.date || row._id || '',
        count: row.count || 0,
      }))
      .filter((r) => r.date);
  }

  // Derive signups last N days from users collection (client-side)
  function getSignupsLastNDays(usersList, days = 7) {
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(today.getDate() - (days - 1)); // inclusive window

    const countsMap = {};

    usersList.forEach((u) => {
      if (!u.createdAt) return;
      const d = new Date(u.createdAt);
      if (isNaN(d.getTime())) return;
      if (d < cutoff) return;

      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      countsMap[key] = (countsMap[key] || 0) + 1;
    });

    const entries = Object.entries(countsMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return entries;
  }

  async function loadAdminData() {
    if (!token) {
      setStatus('No token, authorization denied');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setStatus('');
        // Fetch stats and users in parallel
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE}/api/admin/users`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const statsData = await statsRes.json().catch(() => ({}));
      const usersData = await usersRes.json().catch(() => ({}));
        // Handle errors and set status messages accordingly
      if (!statsRes.ok) {
        setStatus(statsData.msg || 'Could not load admin stats.');
      } else if (!usersRes.ok) {
        setStatus(usersData.msg || 'Could not load users.');
      } else {
        setStats(statsData);
        setUsers(usersData.users || []);
        setStatus('');
      }
    } catch (err) {
      console.error('Admin data fetch error:', err);
      setStatus('⚠️ Could not reach server.');
    } finally {
      setLoading(false);
    }
  }
// Load admin data on component mount and when token/user changes
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setStatus('Not authorized.');
      setLoading(false);
      return;
    }
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  // ----- Derived values for dashboard sections -----

  const totalUsers = stats?.totalUsers ?? users.length;
  const totalBookings = stats?.totalBookings ?? 0;
  const pendingBookings = stats?.pendingBookings ?? 0;
  const approvedBookings = stats?.approvedBookings ?? 0;
  const cancelledBookings = stats?.cancelledBookings ?? 0;

  const adminCount = users.filter((u) => u.role === 'admin').length;

  const signupsLast7 = getSignupsLastNDays(users, 7);
  const totalSignupsLast7 = signupsLast7.reduce((sum, row) => sum + row.count, 0);

  const bookingsByDateRaw = normalizeBookingsByDate(stats?.bookingsByDate || []);

  // Apply simple date-range filter to bookingsByDate
  const filteredBookingsByDate = bookingsByDateRaw.filter((row) => {
    const d = row.date;
    if (!d) return false;
    if (filterStartDate && d < filterStartDate) return false;
    if (filterEndDate && d > filterEndDate) return false;
    return true;
  });

  const totalFilteredBookings = filteredBookingsByDate.reduce(
    (sum, row) => sum + row.count,
    0
  );

  return (
    <div className="page">
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h1 style={{ marginBottom: 0 }}>Admin Dashboard</h1>

        <button
          type="button"
          className="btn"
          onClick={() => navigate('/admin/users')}
        >
          Manage Users
        </button>

        <button
          type="button"
          className="btn btn-gray"
          onClick={() => navigate('/admin/bookings')}
        >
          View / Cancel Bookings
        </button>
      </div>

      <p>Overview of tee sheet usage, users, and booking activity.</p>

      {status && <p style={{ marginBottom: '1rem' }}>{status}</p>}
      {loading && <p>Loading dashboard…</p>}

      {!loading && (
        <>
          {/* USER STATISTICS */}
          <h2>User Statistics</h2>
          <div className="admin-grid">
            <div className="card">
              <h3>Total Users</h3>
              <p>{totalUsers}</p>
            </div>
            <div className="card">
              <h3>Admins</h3>
              <p>{adminCount}</p>
            </div>
            <div className="card">
              <h3>Signups (Last 7 Days)</h3>
              <p>{totalSignupsLast7}</p>
            </div>
          </div>

          {/* ACTIVITY OVERVIEW */}
          <h2 style={{ marginTop: '2rem' }}>Activity Overview</h2>
          <div className="admin-grid">
            <div className="card">
              <h3>Total Bookings</h3>
              <p>{totalBookings}</p>
            </div>
            <div className="card">
              <h3>Pending</h3>
              <p>{pendingBookings}</p>
            </div>
            <div className="card">
              <h3>Approved</h3>
              <p>{approvedBookings}</p>
            </div>
            <div className="card">
              <h3>Cancelled</h3>
              <p>{cancelledBookings}</p>
            </div>
          </div>

          {/* USER SIGNUPS TABLE (TIME-BASED TREND) */}
          <h2 style={{ marginTop: '2rem' }}>User Signups (Last 7 Days)</h2>
          {signupsLast7.length === 0 ? (
            <p>No signups in the last 7 days.</p>
          ) : (
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>New Users</th>
                </tr>
              </thead>
              <tbody>
                {signupsLast7.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* BOOKINGS BY DATE + FILTER (TIME BASED TREND + FILTER TOOL) */}
          <h2 style={{ marginTop: '2rem' }}>Bookings by Date</h2>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ marginRight: '1rem' }}>
              Start Date:{' '}
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </label>
            <label>
              End Date:{' '}
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </label>
          </div>

          {filteredBookingsByDate.length === 0 ? (
            <p>No bookings for the selected range.</p>
          ) : (
            <>
              <p>Total bookings in range: {totalFilteredBookings}</p>
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookingsByDate.map((row) => (
                    <tr key={row.date}>
                      <td>{row.date}</td>
                      <td>{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}


