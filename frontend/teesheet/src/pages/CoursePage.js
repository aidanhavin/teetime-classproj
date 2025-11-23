// src/pages/CoursePage.js
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function CoursePage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <button className="btn back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>King&apos;s Course – Gleneagles Country Club (Plano, TX)</h1>

      {/*  */}
      <div style={{ margin: '1rem 0' }}>
        <img
          src="https://bocaratonobserver.com/downloads/6418/download/Gleneagles-i-C8XznRQ-X5_web.jpg?cb=2778aa9aa72bfd174e3af35a1098cf78&w=1200"
          alt="A hole on the King's Course at Gleneagles Country Club in Plano, Texas"
          className="course-hero-image"
          style={{ maxWidth: '100%', borderRadius: '8px' }}
        />
      </div>

      <p>
        The King&apos;s Course at Gleneagles Country Club in Plano, Texas is an
        18 hole championship layout that runs through rolling North Texas
        terrain and along the edges of White Rock Creek. It was originally
        designed by Bruce Devlin, Robert von Hagge, and Rick Robbins, and later
        renovated to sharpen sightlines, update bunkering, and modernize how
        the course plays from tee to green.
      </p>

      <p>
        Playing as a par 72 from the back tees, the King&apos;s Course stretches
        over 7,000 yards and is known for its demanding combination of narrow
        fairways, strategic water hazards, and well protected greens.
      </p>

      <p>
        The routing blends a links style feel fairways framed by mounding and
        bunkers with classic parkland elements, including tree lined corridors
        and creek carries. Many holes ask you to pick a line off the tee and
        commit, while the greens complexes favor solid approach shots and a
        confident short game. From sunrise tee times to late afternoon rounds,
        the King&apos;s Course gives you a proper test without feeling
        gimmicky.
      </p>

      <h2>Course Highlights</h2>
      <ul>
        <li>18 hole championship course in Plano, Texas</li>
        <li>Par 72 layout with multiple tee boxes for all skill levels</li>
        <li>
          Rolling fairways, strategic bunkering, and frequent water in play
        </li>
        <li>
          White Rock Creek influences both strategy and scenery on several
          holes
        </li>
        <li>
          Ideal mix of challenging shot values and playable options for members
          and guests
        </li>
      </ul>

      <p>
        Whether you&apos;re grinding out a competitive round or just sneaking in
        an afternoon tee time, the King&apos;s Course delivers a legit private
        club experience and a tee sheet you&apos;ll want to keep coming back
        to.
      </p>
    </div>
  );
}
