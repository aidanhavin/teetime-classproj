import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

  // About page – FAQs and info about how the site works
  return (
    <div className="page">
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>About GolfItUpNow</h1>
      <p>
        TeeTime is a simple web app for browsing available tee times, booking
        rounds, and managing your reservations online licensed to Glenn Eagles Country Club. This page answers common
        questions about how to use the site.
      </p>

      <h2>Frequently Asked Questions</h2>

      <div className="faq-list">
        <div className="faq-item">
          <h3>How do I book a tee time?</h3>
          <p>
            First, create an account or log in using the Login/Register option
            in the navigation bar. Then go to the <strong>Book</strong> page,
            choose a date, pick a time slot, select how many players you&apos;re
            booking for, and click <strong>Book</strong>. If the booking is
            successful, you&apos;ll see a confirmation message.
          </p>
        </div>

        <div className="faq-item">
          <h3>Can I book for multiple players?</h3>
          <p>
            Yes! When you select a tee time, you can specify how many players
            will be in your group (within the open slots available).
          </p>
        </div>

        <div className='Faq-item'>
          <h3>What if I forget my password?</h3>
          <p>
            Please contact the site administrator or club staff to reset your password.
          </p>
        </div>

        <div className="faq-item">
          <h3>Where can I see or cancel my existing bookings?</h3>
          <p>
            After logging in, open the <strong>My Bookings</strong> page from
            the navigation bar. You&apos;ll see a table of your upcoming and
            past tee times. If a booking is still active, you can cancel it
            using the <strong>Cancel</strong> button in the Actions column.
          </p>
        </div>

        <div className="faq-item">
          <h3>Do I need an account to use the site?</h3>
          <p>
            You can browse dates and available tee times without logging in, but
            you must create an account and sign in to actually book or manage
            tee times. This lets the system track your reservations and show
            them under <strong>My Bookings</strong>.
          </p>
        </div>

        <div className="faq-item">
          <h3>How does the contact form work?</h3>
          <p>
            The <strong>Contact</strong> page lets you send a message to the
            site administrator or club staff. Fill in your name, email, and
            message, then submit the form. The system forwards your message to a
            configured email address so someone can follow up with you.
          </p>
        </div>
      </div>
    </div>
  );
}

