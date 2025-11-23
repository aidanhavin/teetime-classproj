// src/pages/BookingPage.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function BookingPage({ token }) {
  const navigate = useNavigate();

  const [date, setDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // per-slot players: { [teeTime]: players }
  const [playersBySlot, setPlayersBySlot] = useState({});

  function formatTime(t) {
    const [h, m] = t.split(':').map(Number);
    const d = new Date(2000, 0, 1, h, m);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  async function loadSlots(chosenDate = date) {
    try {
      setLoading(true);
      setStatus('');
      const res = await fetch(
        `${API_BASE}/api/bookings/slots?date=${encodeURIComponent(chosenDate)}`
      );

      const data = await res.json();
      if (res.ok) {
        setSlots(data.slots || []);
      } else {
        setStatus(data.msg || 'Could not load tee times.');
      }
    } catch (err) {
      console.error('Load slots error:', err);
      setStatus('Could not reach server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleBook(slot) {
    if (!token) {
      setStatus('Please log in to book a tee time.');
      return;
    }

    const players = playersBySlot[slot.teeTime] || 1;

    // optional sanity check vs available spots
    if (typeof slot.availableSpots === 'number' && players > slot.availableSpots) {
      setStatus(
        `Only ${slot.availableSpots} spot(s) left at ${formatTime(
          slot.teeTime
        )}. Please lower the number of players.`
      );
      return;
    }

    try {
      setStatus('Booking tee time...');
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teeDate: date,
          teeTime: slot.teeTime,
          players,
          notes: '',
          course: slot.course || 'Kings Course',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('Booking created!');
        loadSlots(date);
      } else {
        setStatus(data.msg || 'Could not create booking.');
      }
    } catch (err) {
      console.error('Book slot error:', err);
      setStatus('Could not reach server.');
    }
  }

  return (
    <div className="page">
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Tee Times</h1>
      <p>Select a date and book your preferred tee time.</p>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Date:{' '}
          <input
            type="date"
            value={date}
            onChange={(e) => {
              const newDate = e.target.value;
              setDate(newDate);
              loadSlots(newDate);
            }}
          />
        </label>
      </div>

      {status && <p style={{ marginBottom: '1rem' }}>{status}</p>}
      {loading && <p>Loading tee times...</p>}
      {!loading && slots.length === 0 && <p>No tee times for this date.</p>}

      <div className="tee-grid">
        {slots.map((slot) => {
          const full = slot.status === 'full';
          const selectedPlayers = playersBySlot[slot.teeTime] || 1;

          return (
            <div key={slot.teeTime} className="tee-card">
              <div className="tee-time">{formatTime(slot.teeTime)}</div>

              <div className="tee-meta">
                <div>{slot.course}</div>
                <div>{slot.holes} Holes</div>
                <div>
                  {slot.currentPlayers} / {slot.maxPlayers} players
                </div>
              </div>

              <div className="tee-price">
                ${slot.minPrice.toFixed(2)} – ${slot.maxPrice.toFixed(2)}
              </div>

              {/* per-slot players selector */}
              <div style={{ margin: '0.5rem 0' }}>
                <label>
                  Players:{' '}
                  <select
                    value={selectedPlayers}
                    onChange={(e) =>
                      setPlayersBySlot((prev) => ({
                        ...prev,
                        [slot.teeTime]: Number(e.target.value),
                      }))
                    }
                  >
                    <option value={1}>1 player</option>
                    <option value={2}>2 players</option>
                    <option value={3}>3 players</option>
                    <option value={4}>4 players</option>
                  </select>
                </label>
              </div>

              <button
                className="btn"
                disabled={full}
                onClick={() => handleBook(slot)}
              >
                {full ? 'FULL' : `BOOK (${selectedPlayers})`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

