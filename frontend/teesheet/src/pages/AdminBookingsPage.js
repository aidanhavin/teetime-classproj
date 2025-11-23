// src/pages/AdminBookingsPage.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminBookingsPage({ token, user }) {
  const navigate = useNavigate();

  const [date, setDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadBookings(chosenDate = date) {
    if (!token) {
      setStatus('No token, authorization denied.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setStatus('');

      const res = await fetch(
        `${API_BASE}/api/admin/bookings?date=${encodeURIComponent(chosenDate)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setBookings(data.bookings || []);
      } else {
        setStatus(data.msg || 'Could not load bookings.');
      }
    } catch (err) {
      console.error('Admin bookings load error:', err);
      setStatus('Could not reach server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // basic guard
    if (!user || user.role !== 'admin') {
      setStatus('Not authorized.');
      setLoading(false);
      return;
    }
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  async function handleCancel(id) {
    if (!window.confirm('Cancel this booking?')) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/admin/bookings/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'cancelled' }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setStatus(data.msg || 'Booking cancelled.');
        setBookings((prev) =>
          prev.map((b) =>
            b._id === id ? { ...b, status: 'cancelled' } : b
          )
        );
      } else {
        setStatus(data.msg || 'Could not cancel booking.');
      }
    } catch (err) {
      console.error('Admin cancel booking error:', err);
      setStatus('⚠️ Could not reach server.');
    }
  }

  return (
    <div className="page">
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Admin – Bookings</h1>
      <p>View and cancel any tee time for a given date.</p>

      <div style={{ margin: '1rem 0' }}>
        <label>
          Date:{' '}
          <input
            type="date"
            value={date}
            onChange={(e) => {
              const newDate = e.target.value;
              setDate(newDate);
              loadBookings(newDate);
            }}
          />
        </label>
      </div>

      {status && <p style={{ marginBottom: '1rem' }}>{status}</p>}
      {loading && <p>Loading bookings…</p>}

      {!loading && bookings.length === 0 && (
        <p>No bookings for this date.</p>
      )}

      {bookings.length > 0 && (
        <table className="simple-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Course</th>
              <th>User</th>
              <th>Email</th>
              <th>Players</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.teeTime}</td>
                <td>{b.course}</td>
                <td>{b.user?.name || '—'}</td>
                <td>{b.user?.email || '—'}</td>
                <td>{b.players}</td>
                <td>{b.status}</td>
                <td>
                  <button
                    className="btn btn-gray"
                    type="button"
                    disabled={b.status === 'cancelled'}
                    onClick={() => handleCancel(b._id)}
                  >
                    {b.status === 'cancelled' ? 'Cancelled' : 'Cancel Booking'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
