import { useState } from "react";
import { GOOGLE_REVIEW_ENABLED, GOOGLE_PLACE_ID } from "../data/dentallData";

/* ─── REVIEW FORM SECTION ────────────────────────────────────── */
export default function ReviewFormSection({ onSubmitSuccess }) {
  const [form, setForm]         = useState({ name: '', email: '', rating: 0, text: '' });
  const [hovered, setHovered]   = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) return setError('Please enter your name (at least 2 characters).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return setError('Please enter a valid email address.');
    if (form.rating === 0) return setError('Please select a star rating.');
    if (!form.text.trim() || form.text.trim().length < 10) return setError('Please write a review (at least 10 characters).');
    setSubmitting(true); setError('');
    try {
      const res  = await fetch('/api/reviews', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: form.name, email: form.email, rating: form.rating, text: form.text }),
      });
      const ct   = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : {};
      if (!res.ok) throw new Error(data.error || `Server error (${res.status}) — is the server running?`);
      setSuccess(true);
      onSubmitSuccess?.();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const displayRating = hovered || form.rating;

  return (
    <section className="dn-write-review" id="write-review">
      <div className="dn-write-review-inner">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="dn-section-label">Share your experience</div>
          <div className="dn-section-title" style={{ fontSize: 'clamp(1.3rem,2vw,2rem)' }}>
            Leave a <em>review</em>
          </div>
          <p style={{ color: 'var(--text-light)', fontSize: '.88rem', marginTop: '.5rem' }}>
            Your feedback helps thousands of families make the right choice.
          </p>
        </div>

        <div className="dn-write-review-card">
          {success ? (
            <div className="dn-review-success">
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
              <div className="dn-section-title" style={{ fontSize: '1.5rem' }}>Thank you!</div>
              <p style={{ color: 'var(--text-light)', fontSize: '.9rem', marginTop: '.6rem', lineHeight: 1.7 }}>
                Your review has been submitted and is awaiting moderation.<br />
                We really appreciate you taking the time!
              </p>
              {GOOGLE_REVIEW_ENABLED && GOOGLE_PLACE_ID && (
                <a
                  href={`https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dn-review-submit-btn"
                  style={{ display: 'inline-block', textDecoration: 'none', marginTop: '1.2rem' }}
                >
                  ⭐ Leave us a review on Google too
                </a>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '.5rem' }}>
                <div style={{ fontSize: '.68rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>
                  Your rating
                </div>
                <div className="dn-star-picker">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      className={`dn-star-btn${displayRating >= n ? ' lit' : ''}`}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => set('rating', n)}
                    >★</button>
                  ))}
                </div>
              </div>

              <div className="dn-review-form-row">
                <div className="dn-review-field">
                  <label>Your name</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Priya S."
                    maxLength={100}
                  />
                </div>
                <div className="dn-review-field">
                  <label>Email address</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="priya@example.com"
                    maxLength={150}
                  />
                </div>
              </div>

              <div className="dn-review-field">
                <label>Your review</label>
                <textarea
                  required
                  rows={4}
                  value={form.text}
                  onChange={e => set('text', e.target.value)}
                  placeholder="What did you love about DENTALL? How has it helped your oral health?"
                  maxLength={1000}
                />
                <div style={{ textAlign: 'right', fontSize: '.68rem', color: 'var(--text-light)' }}>
                  {form.text.length}/1000
                </div>
              </div>

              {error && (
                <div style={{ color: '#e53935', fontSize: '.82rem', marginBottom: '.8rem', padding: '.6rem .9rem', background: 'rgba(229,57,53,.06)', borderRadius: 6 }}>
                  ⚠ {error}
                </div>
              )}

              <button className="dn-review-submit-btn" type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Review →'}
              </button>
              <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '.72rem', marginTop: '.8rem' }}>
                Reviews are moderated before appearing on the site · Your email is never published
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
