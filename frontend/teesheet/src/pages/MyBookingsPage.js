import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function MyBookingsPage({ token }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadBookings() {
    // no token = not logged in
    if (!token) {
      setLoading(false);
      setStatus('Please log in to view your bookings.');
      return;
    }

    try {
      setLoading(true);
      setStatus('');

      const res = await fetch(`${API_BASE}/api/bookings/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setBookings(data.bookings || []);
      } else {
        setStatus(data.msg || 'Could not load bookings.');
      }
    } catch (err) {
      console.error('My bookings load error:', err);
      setStatus('⚠️ Could not reach server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleCancel(id) {
    if (!window.confirm('Cancel this booking?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      console.error('Cancel booking error:', err);
      setStatus('⚠️ Could not reach server.');
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  }

  return (
    <div className="page">
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>My Bookings</h1>
      <p>View and manage your scheduled tee times.</p>

      {status && <p style={{ marginBottom: '1rem' }}>{status}</p>}
      {loading && <p>Loading your bookings…</p>}

      {!loading && bookings.length === 0 && (
        <p>You have no bookings yet.</p>
      )}

      {bookings.length > 0 && (
        <table className="simple-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Course</th>
              <th>Players</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{formatDate(b.teeDate)}</td>
                <td>{b.teeTime}</td>
                <td>{b.course}</td>
                <td>{b.players}</td>
                <td>{b.status}</td>
                <td>
                  {b.status === 'cancelled' ? (
                    <span>Cancelled</span>
                  ) : (
                    <button
                      className="btn btn-gray"
                      type="button"
                      onClick={() => handleCancel(b._id)}
                    >
                      Cancel
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

