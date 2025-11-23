import { useNavigate } from 'react-router-dom';

export default function StorePage() {
  const navigate = useNavigate();


  // skeleton store setup - backend not started.
  return (
    <div className="page">
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Store</h1>
      <p>This will be a pro shop store page. golf balls, food, merchandise, and more.</p>
    </div>
  );
}