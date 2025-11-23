import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function bookNow() {
    setLoading(true);
    navigate('/book');
  }

  // simple home page with nav bar and buttons to navigate the website 
  return (
    <div className="App">
      <h1>Glenn Eagles Tee Times!</h1>
      
      <img src="https://assets-us-01.kc-usercontent.com/00be6aeb-6ab1-00f0-f77a-4c8f38e69314/12c4f7b7-04bc-499a-b66a-511071ff1c92/Scottie%20Scheffler%20World%20No.1%202024.jpg" alt="Golf Course" style={{ width: '100%', maxWidth: 600, borderRadius: 8, marginBottom: 20 }} />

      <p>Welcome to Glenn Eagles! Book your tee time, explore our course, and enjoy the best golfing experience.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 3 }}>
        <button className="btn" onClick={bookNow} disabled={loading}>
          {loading ? 'Loading…' : 'Go to Booking'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <button className="btn" onClick={() => navigate('/courses')}>Tour The Course</button>
        <button className="btn" onClick={() => navigate('/about')}>About</button>
        <button className="btn" onClick={() => navigate('/contact')}>Contact</button>
        <button className="btn" onClick={() => navigate('/store')}>Store</button>
      </div>
    </div>
  );
}
