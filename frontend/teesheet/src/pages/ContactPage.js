import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

// Contact page setup - backend logic mostly done - still need to add an email
// response to the user that their message was received. Thinking of integrating
// option to get a text instead (for later).
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ContactPage() {
  // nav bar integration
  const navigate = useNavigate();

  // form input boxes
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState('');

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();

      // successful or unsuccessful output
      if (res.ok) {
        setStatus(data.msg || 'Message sent successfully!');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus(data.msg || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      setStatus('⚠️ Could not reach the server.');
    }
  }

  // back button to return to home page
  return (
    <div className="contact-page">
      {/* Back Button */}
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Contact Us!</h1>
      <p>Have a question or need help scheduling a tee time?</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          name="name"
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="email"
          type="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
        />
        <button className="btn" type="submit">
          Send Message
        </button>
      </form>

      {status && <p>{status}</p>}
    </div>
  );
}
