import React, { useState, useEffect, useRef } from "react";
import "./styles/index.css";

/* ─── CONSTANTS ────────────────────────────────────────────────── */
const SINGLE_PRICE    = 599;
const FAMILY_PACK_PRICE = 5990;
const KID_PRICE         = 399;   
// const RAZORPAY_KEY_ID = "rzp_test_SlG1HvlDp3i5Fw"; // ← replace with your key

const FEATURES = [
  { num:"01", icon:"🦷", title:"Nano Bristle Technology", text:"10,000 micro-filaments per cm² with varying stiffness — hard on plaque, gentle on enamel and gums." },
  { num:"02", icon:"✋", title:"Ergonomic Red Grip", text:"Dual-material TPE inlay provides non-slip control and reduces wrist strain during the full two-minute brush." },
  { num:"03", icon:"🔬", title:"Anti-Bacterial Materials", text:"Medical-grade polypropylene inhibits bacteria build-up between bristle tufts, keeping each brush hygienic longer." },
  { num:"04", icon:"💧", title:"Easy-Rinse Design", text:"Open bristle cluster spacing allows water to flow through freely, washing away toothpaste and debris completely." },
];
const PATIENT_CONDITIONS = [
  { icon:'❤️', group:'Heart Patients',  color:'#E8294A', colorBg:'rgba(232,41,74,.14)', colorBadge:'rgba(232,41,74,.22)', colorText:'#FF8099',
    title:'Safe for blood thinners & anticoagulants',
    text:'Ultra-soft nano bristles apply zero shear force on gum tissue — eliminating bleeding risk for patients on warfarin, aspirin, or post-cardiac surgery medication.' },
  { icon:'🫘', group:'Renal Patients',   color:'#3B82F6', colorBg:'rgba(59,130,246,.14)', colorBadge:'rgba(59,130,246,.22)', colorText:'#93C5FD',
    title:'Reduces systemic bacterial load',
    text:'Anti-bacterial medical-grade PP suppresses oral pathogens at source — critical for kidney disease and dialysis patients where oral bacteria directly raise systemic infection risk.' },
  { icon:'😁', group:'Braces Wearers',  color:'#A855F7', colorBg:'rgba(168,85,247,.14)', colorBadge:'rgba(168,85,247,.22)', colorText:'#D8B4FE',
    title:'Cleans around brackets & wires',
    text:'10,000 micro-filaments per cm² reach into the tight gaps between brackets and under arch-wires, preventing the demineralisation that causes white spots.' },
];

const REVIEWS = [
  { text:"The red grip is so comfortable — I never feel like I'm pressing too hard. My dentist noticed my gums are healthier after just 2 months.", author:"Arjun M.", city:"Mumbai" },
  { text:"My dentist actually noticed a difference at my last checkup. Less plaque, healthier gums. She asked what I'd changed — I showed her DENTALL.", author:"Priya S.", city:"Bangalore" },
  { text:"The bristles are incredibly soft yet my teeth feel polished clean. It's the only toothbrush I've used that doesn't leave my gums sore.", author:"Riya K.", city:"Chennai" },
  { text:"We got the family pack for all four of us. The schedule is genius — every 4 months we simply swap and we've never missed a replacement since.", author:"Vikram T.", city:"Pune" },
  { text:"Worth every rupee. My kids actually look forward to brushing now. The red design is fun and the bristles are gentle enough for them.", author:"Sunita R.", city:"Delhi" },
  { text:"Switched from an electric brush and honestly the clean feels just as thorough. The ergonomic handle makes all the difference.", author:"Karthik N.", city:"Hyderabad" },
];

const PRODUCTS = [
  {
    id:    'single-brush',
    icon:  '🪥',
    name:  'Single Brush',
    sub:   '1 brush · lasts 4 months',
    price: SINGLE_PRICE,
    badge: null,
    perks: ['Nano bristle head', 'Ergonomic grip', 'Anti-bacterial PP'],
  },
  {
    id:    'family-pack',
    icon:  '🦷',
    name:  'Family Pack',
    sub:   '12 brushes · 1 year · 4 people',
    price: FAMILY_PACK_PRICE,
    badge: 'Best Value',
    perks: ['Covers a family of 4', 'Change every 4 months', 'Free shipping'],
  },
  {
    id:    'kids-brush',
    icon:  '🌈',
    name:  "Kids' Brush",
    sub:   '1 brush · ultra-soft · ages 3–12',
    price: KID_PRICE,
    badge: 'New',
    perks: ['Extra-soft bristles', 'Compact head', 'Fun grip colours'],
  },
];
const PHASES = [
  { name:'Brush Overview',  step:'Introducing' },
  { name:'The Bristle Head', step:'Part 01' },
  { name:'The Grip Body',    step:'Part 02' },
  { name:'The Handle Base',  step:'Part 03' },
];
const MOBILE_PANELS = {
  1: { tag:'01 — Bristle Head',   title:'Ultra-Soft Nano Bristles',  desc:'10,000 micro-filaments per cm² reach between teeth and below the gumline, removing 99.3% of plaque.' },
  2: { tag:'02 — Ergonomic Handle', title:'Precision Grip Zone',       desc:'Dual-material soft-touch grip contoured to the hand. Red TPE inlay provides non-slip control at every angle.' },
  3: { tag:'03 — Handle End',      title:'Anti-Slip Base',             desc:'The flared end provides stability on wet surfaces and an ergonomic rest point for the palm.' },
};

const INDIA_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Puducherry','Chandigarh','Jammu and Kashmir','Ladakh'];

/* ─── HELPERS ─────────────────────────────────────────────────── */
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
function easeInOut(t) { return t < .5 ? 2*t*t : -1+(4-2*t)*t; }


/* ─── BRUSH COLOR SHOWCASE ─────────────────────────────────── */
const BRUSH_COLORS = [
  {
    name: 'Crimson Red',
    filter: 'none',
    dot: '#E8294A',
    label: 'Signature Red',
  },
  {
    name: 'Ocean Blue',
    filter: 'hue-rotate(200deg) saturate(1.4)',
    dot: '#1A72E8',
    label: 'Ocean Blue',
  },
  {
    name: 'Forest Green',
    filter: 'hue-rotate(100deg) saturate(1.3) brightness(0.95)',
    dot: '#22A85A',
    label: 'Forest Green',
  },
  {
    name: 'Midnight Black',
    filter: 'grayscale(0.9) brightness(0.35)',
    dot: '#2C2C2C',
    label: 'Midnight Black',
  },
];

function BrushColorShowcase() {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    startAutoSlide();

    return () => clearInterval(timerRef.current);
  }, []);

  const startAutoSlide = () => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % BRUSH_COLORS.length);
    }, 2800);
  };

  const handleClick = (idx) => {
    clearInterval(timerRef.current);

    setActive(idx);

    startAutoSlide();
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.2rem',
      }}
    >
      {/* Showcase */}
      <div
        style={{
          position: 'relative',
          width: 320,
          height: 460,
          paddingTop: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1200px',
        }}
      >
        {/* Dynamic color glow */}
        <div
          style={{
            position: 'absolute',
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: `${BRUSH_COLORS[active].dot}25`,
            filter: 'blur(70px)',
            transition: 'all 0.7s ease',
            animation: 'pulseGlow 3s ease-in-out infinite',
          }}
        />

        {/* Color label — right side of brush, vertically centred */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: -16,
            transform: 'translateY(-50%) translateX(100%)',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            border: `1.5px solid ${BRUSH_COLORS[active].dot}40`,
            borderRadius: 30,
            padding: '0.45rem 1.1rem',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: BRUSH_COLORS[active].dot,
            transition: 'all 0.4s ease',
            boxShadow: `0 6px 20px ${BRUSH_COLORS[active].dot}25`,
            whiteSpace: 'nowrap',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: BRUSH_COLORS[active].dot,
            display: 'inline-block',
            flexShrink: 0,
            boxShadow: `0 0 6px ${BRUSH_COLORS[active].dot}`,
          }} />
          {BRUSH_COLORS[active].label}
        </div>

        {/* Brush images */}
        {BRUSH_COLORS.map((c, i) => (
          <img
            key={i}
            src="image/green.png"
            alt={c.name}
            style={{
              position: 'absolute',
              width: 220,

              filter: `
                ${c.filter}
                drop-shadow(0 24px 60px ${c.dot}35)
                drop-shadow(0 8px 20px rgba(0,0,0,.15))
              `,

              opacity: i === active ? 1 : 0,

              transform:
                i === active
                  ? 'rotateY(0deg) scale(1)'
                  : 'rotateY(-90deg) scale(0.82)',

              transformOrigin: 'center center',

              transition: `
                opacity 0.65s ease,
                transform 0.8s cubic-bezier(.4,0,.2,1)
              `,

              backfaceVisibility: 'hidden',

              animation:
                i === active
                  ? 'float-hero 4s ease-in-out infinite'
                  : 'none',

              zIndex: i === active ? 2 : 1,
            }}
          />
        ))}
      </div>

      {/* Color selectors */}
      <div
        style={{
          display: 'flex',
          gap: '0.9rem',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '-1rem',
        }}
      >
        {BRUSH_COLORS.map((c, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            title={c.name}
            style={{
              width: i === active ? 30 : 20,
              height: i === active ? 30 : 20,
              borderRadius: '50%',
              background: c.dot,

              border:
                i === active
                  ? '3px solid white'
                  : '2px solid transparent',

              cursor: 'pointer',

              transition:
                'all 0.35s cubic-bezier(.4,0,.2,1)',

              transform:
                i === active
                  ? 'scale(1.18)'
                  : 'scale(1)',

              boxShadow:
                i === active
                  ? `0 0 22px ${c.dot}`
                  : '0 4px 10px rgba(0,0,0,0.15)',

              outline: 'none',
            }}
            aria-label={c.name}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── TRACKING COMPONENT ──────────────────────────────────────── */
function TrackingSection() {
  const [orderId, setOrderId]         = useState('');
  const [trackData, setTrackData]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  // Auto-load from URL param  e.g. /track?order=42
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('order');
    if (id) { setOrderId(id); fetchTracking(id); }
  }, []);

  const fetchTracking = async (id) => {
    setLoading(true); setError(''); setTrackData(null);
    try {
      const res = await fetch(`/api/track/${id}`);
      if (!res.ok) throw new Error('Order not found');
      const data = await res.json();
      setTrackData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Map Shiprocket status to progress steps
  const getStepStatus = (stepName, currentStatus) => {
    const order = ['PENDING','PICKUP SCHEDULED','IN TRANSIT','OUT FOR DELIVERY','DELIVERED'];
    const statusMap = {
      'PICKUP SCHEDULED': 1, 'PICKUP GENERATED': 1,
      'IN TRANSIT': 2, 'SHIPPED': 2,
      'OUT FOR DELIVERY': 3,
      'DELIVERED': 4,
    };
    const current = statusMap[currentStatus?.toUpperCase()] ?? 0;
    const steps   = { 'Ordered':0, 'Picked up':1, 'In transit':2, 'Out for delivery':3, 'Delivered':4 };
    const idx     = steps[stepName] ?? 0;
    if (idx < current)  return 'done';
    if (idx === current) return 'active';
    return '';
  };

  const currentStatus = trackData?.shipment_status || '';
//   const handlePayment = async () => {
//   try {
//     const res = await fetch('/api/create-order', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         amount: totalAmount * 100
//       })
//     });

//     const order = await res.json();

//     console.log("ORDER RESPONSE:", order);

//     if (!order.orderId) {
//       alert("Order ID missing!");
//       return;
//     }

//     const options = {
//       key: "rzp_test_SlG1HvlDp3i5Fw",
//       amount: order.amount,
//       currency: "INR",
//       order_id: order.orderId,
//       name: "Dentall",
//       description: "Test Transaction",

//       handler: function (response) {
//         console.log("PAYMENT SUCCESS:", response);
//         alert("Payment Successful!");
//       },

//       theme: {
//         color: "var(--primary)"
//       }
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();

//   } catch (err) {
//     console.error(err);
//     alert("Payment failed to initialize");
//   }
// };

//   return (
//     <section className="dn-tracking-section" id="tracking">
//       <div style={{textAlign:'center',fontSize:'.58rem',letterSpacing:'.28em',textTransform:'uppercase',color:'var(--primary)',fontWeight:700,marginBottom:'.3rem'}}>Track your order</div>
//       <div style={{textAlign:'center',fontFamily:'Fraunces,serif',fontSize:'1.1rem',fontWeight:900,color:'var(--text-dark)',marginBottom:'.7rem'}}>Where's my package?</div>

//       <div className="dn-tracking-card">
//         <div className="dn-tracking-lookup">
//           <input
//             value={orderId}
//             onChange={e => setOrderId(e.target.value)}
//             placeholder="Enter your order ID (e.g. 42)"
//             onKeyDown={e => e.key === 'Enter' && fetchTracking(orderId)}
//           />
//           <button onClick={() => fetchTracking(orderId)} disabled={loading || !orderId}>
//             {loading ? 'Loading…' : 'Track →'}
//           </button>
//         </div>

//         {error && (
//           <div style={{color:'var(--primary-dark)',fontSize:'.82rem',marginBottom:'1rem',padding:'.8rem',background:'rgba(255,61,87,.06)',borderRadius:'8px',border:'1px solid rgba(255,61,87,.2)'}}>
//             ⚠ {error}
//           </div>
//         )}

//         {trackData && (
//           <>
//             <div className="dn-tracking-header">
//               <div>
//                 <div className="dn-tracking-order-id">Order #{trackData.order_id || orderId}</div>
//                 <div className="dn-tracking-awb">AWB: {trackData.awb_code || '—'}</div>
//               </div>
//               <div className="dn-tracking-status-badge">{currentStatus || 'Processing'}</div>
//             </div>

//             {/* Progress bar */}
//             <div className="dn-tracking-progress">
//               {['Ordered','Picked up','In transit','Out for delivery','Delivered'].map((step, i, arr) => (
//                 <React.Fragment key={step}>
//                   <div className={`dn-track-step ${getStepStatus(step, currentStatus)}`}>
//                     <div className="dn-track-step-dot">{getStepStatus(step, currentStatus) === 'done' ? '✓' : i + 1}</div>
//                     <div className="dn-track-step-label">{step}</div>
//                   </div>
//                   {i < arr.length - 1 && (
//                     <div className={`dn-track-line ${getStepStatus(arr[i+1], currentStatus) !== '' ? 'done' : ''}`} />
//                   )}
//                 </React.Fragment>
//               ))}
//             </div>

//             {/* Estimated delivery */}
//             {trackData.etd && (
//               <div style={{background:'rgba(255,92,0,0.06)',border:'1px solid rgba(255,92,0,.15)',borderRadius:'8px',padding:'.8rem 1rem',marginBottom:'1.5rem',fontSize:'.82rem',color:'var(--text-mid)'}}>
//                 📦 Estimated delivery: <strong style={{color:'var(--primary)'}}>{trackData.etd}</strong>
//               </div>
//             )}

//             {/* Event log */}
//             {trackData.tracking_data?.length > 0 && (
//               <div className="dn-tracking-events">
//                 <div style={{fontSize:'.65rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--text-light)',fontWeight:700,marginBottom:'.8rem'}}>Activity</div>
//                 {trackData.tracking_data.map((ev, i) => (
//                   <div key={i} className="dn-tracking-event">
//                     <div className={`dn-event-dot ${i > 0 ? 'old' : ''}`} />
//                     <div>
//                       <div className="dn-event-text">{ev.activity || ev.status}</div>
//                       <div className="dn-event-time">{ev.date} — {ev.location}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         )}

//         {!trackData && !loading && !error && (
//           <div style={{textAlign:'center',padding:'2rem',color:'var(--text-light)',fontSize:'.85rem'}}>
//             Enter your order ID above to see live tracking updates
//           </div>
//         )}
//       </div>
//     </section>
//   );
 }

/* ─── REVIEW FORM SECTION ────────────────────────────────────── */
function ReviewFormSection({ onSubmitSuccess }) {
  const [form, setForm]         = useState({ name: '', email: '', rating: 0, text: '' });
  const [hovered, setHovered]   = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) return setError('Please select a star rating.');
    if (!form.text.trim()) return setError('Please write a short review.');
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

/* ─── SHIPMENT DETAILS PAGE ───────────────────────────────────── */
function ShipmentPage({ onClose }) {
  const [awbInput, setAwbInput]     = useState('');
  const [orderInput, setOrderInput] = useState('');
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    const hash      = window.location.hash;
    const queryPart = hash.includes('?') ? hash.split('?')[1] : '';
    const params    = new URLSearchParams(queryPart);
    const awb       = params.get('awb');
    const order     = params.get('order');
    if (awb)   { setAwbInput(awb);     fetchByAWB(awb); }
    if (order) { setOrderInput(order); fetchByOrder(order); }
  }, []);

  const fetchByOrder = async (id) => {
    if (!id) return;
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetch(`/api/track/${id}`);
      if (!res.ok) throw new Error('Order not found');
      setData(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const fetchByAWB = async (awb) => {
    if (!awb) return;
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetch(`/api/shipment/awb/${encodeURIComponent(awb)}`);
      if (!res.ok) throw new Error('Shipment not found');
      setData(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const STATUS_STEPS = ['Ordered', 'Picked up', 'In transit', 'Out for delivery', 'Delivered'];
  const STATUS_MAP   = {
    'PICKUP SCHEDULED': 1, 'PICKUP GENERATED': 1,
    'IN TRANSIT': 2,       'SHIPPED': 2,
    'OUT FOR DELIVERY': 3,
    'DELIVERED': 4,
  };
  const currentStep = STATUS_MAP[(data?.shipment_status || '').toUpperCase()] ?? 0;
  const isDelivered = currentStep === 4;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'var(--bg-main)',
      overflowY: 'auto',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark), var(--secondary))',
        padding: '1.5rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '2px solid rgba(255,255,255,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onClose && (
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              width: 36, height: 36, borderRadius: '50%', fontSize: '1rem', cursor: 'pointer',
            }}>←</button>
          )}
          <div>
            <div style={{ fontSize: '.65rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 2 }}>Dentall</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>Shipment Details</div>
          </div>
        </div>
        <div style={{ fontSize: '1.5rem' }}>📦</div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Search bar */}
        <div style={{
          background: 'var(--white)', border: '1px solid var(--border-light)',
          borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-soft)',
        }}>
          <div style={{ fontSize: '.65rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700, marginBottom: '1rem' }}>
            Track your shipment
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.68rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: '.4rem' }}>
                Order ID
              </label>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input
                  value={orderInput}
                  onChange={e => setOrderInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 42"
                  onKeyDown={e => e.key === 'Enter' && fetchByOrder(orderInput)}
                  style={{ flex: 1, background: 'var(--off-white)', border: '1.5px solid var(--border-mid)', color: 'var(--text-dark)', padding: '.65rem .9rem', fontFamily: "'DM Sans',sans-serif", fontSize: '.86rem', borderRadius: 8, outline: 'none' }}
                />
                <button
                  onClick={() => fetchByOrder(orderInput)}
                  disabled={loading || !orderInput}
                  style={{ background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', color: '#fff', border: 'none', padding: '.65rem 1rem', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', opacity: (!orderInput || loading) ? 0.5 : 1 }}>
                  Track
                </button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.68rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: '.4rem' }}>
                AWB / Tracking No.
              </label>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input
                  value={awbInput}
                  onChange={e => setAwbInput(e.target.value)}
                  placeholder="e.g. SR1234567"
                  onKeyDown={e => e.key === 'Enter' && fetchByAWB(awbInput)}
                  style={{ flex: 1, background: 'var(--off-white)', border: '1.5px solid var(--border-mid)', color: 'var(--text-dark)', padding: '.65rem .9rem', fontFamily: "'DM Sans',sans-serif", fontSize: '.86rem', borderRadius: 8, outline: 'none' }}
                />
                <button
                  onClick={() => fetchByAWB(awbInput)}
                  disabled={loading || !awbInput}
                  style={{ background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', color: '#fff', border: 'none', padding: '.65rem 1rem', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', opacity: (!awbInput || loading) ? 0.5 : 1 }}>
                  Track
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--border-mid)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 1rem' }} />
            Fetching shipment data from Shiprocket…
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(255,61,87,.06)', border: '1px solid rgba(255,61,87,.2)', borderRadius: 8, padding: '1rem 1.2rem', color: 'var(--text-dark)', fontSize: '.85rem', marginBottom: '1rem' }}>
            ⚠ {error}
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <>
            <div style={{
              background: isDelivered
                ? 'linear-gradient(135deg, rgba(0,212,180,.08), rgba(0,212,180,.03))'
                : 'linear-gradient(135deg, var(--primary-muted), rgba(67,85,99,.04))',
              border: `1px solid ${isDelivered ? 'rgba(0,212,180,.3)' : 'var(--border-mid)'}`,
              borderRadius: 12, padding: '1.5rem', marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
                    Order #{data.order_id || orderInput}
                  </div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>
                    AWB: {data.awb_code || '—'}
                  </div>
                  {data.courier_name && (
                    <div style={{ fontSize: '.8rem', color: 'var(--text-mid)' }}>via {data.courier_name}</div>
                  )}
                </div>
                <div style={{
                  background: isDelivered ? 'rgba(0,212,180,.12)' : 'var(--primary-muted)',
                  border: `1px solid ${isDelivered ? 'rgba(0,212,180,.3)' : 'var(--primary-muted)'}`,
                  color: isDelivered ? 'var(--success)' : 'var(--primary-dark)',
                  fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em',
                  textTransform: 'uppercase', padding: '.45rem 1rem', borderRadius: 20,
                }}>
                  {isDelivered ? '✓ Delivered' : (data.shipment_status || 'Processing')}
                </div>
              </div>

              {/* Progress steps */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {STATUS_STEPS.map((step, i, arr) => {
                  const done   = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <React.Fragment key={step}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--white)',
                          border: `2px solid ${done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--border-mid)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '.7rem', color: (done || active) ? '#fff' : 'var(--text-light)',
                          marginBottom: '.4rem', fontWeight: 700,
                          boxShadow: active ? '0 0 0 4px var(--primary-muted)' : 'none',
                        }}>
                          {done ? '✓' : i + 1}
                        </div>
                        <div style={{ fontSize: '.55rem', color: (done || active) ? 'var(--text-dark)' : 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em', textAlign: 'center', fontWeight: (done || active) ? 600 : 400, lineHeight: 1.3 }}>
                          {step}
                        </div>
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ flex: 1, height: 2, background: done ? 'var(--success)' : 'var(--border-mid)', marginTop: '-1.2rem', transition: 'background .3s' }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { label: 'Courier', value: data.courier_name || '—' },
                { label: 'Estimated delivery', value: data.etd || '—' },
                { label: 'Order date', value: data.order_date ? new Date(data.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                { label: 'Customer', value: data.customer_name || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--white)', border: '1px solid var(--border-light)', borderRadius: 10, padding: '1rem' }}>
                  <div style={{ fontSize: '.65rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Activity timeline */}
            {data.tracking_data?.length > 0 && (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border-light)', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ fontSize: '.65rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-light)', fontWeight: 700, marginBottom: '1.2rem' }}>
                  Activity log
                </div>
                <div>
                  {data.tracking_data.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', paddingBottom: i < data.tracking_data.length - 1 ? '1rem' : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? 'var(--primary)' : 'var(--border-mid)', marginTop: 4, flexShrink: 0 }} />
                        {i < data.tracking_data.length - 1 && (
                          <div style={{ width: 1, flex: 1, background: 'var(--border-light)', marginTop: 4 }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: i < data.tracking_data.length - 1 ? '0.5rem' : 0 }}>
                        <div style={{ fontSize: '.85rem', fontWeight: i === 0 ? 600 : 400, color: i === 0 ? 'var(--text-dark)' : 'var(--text-mid)', marginBottom: 2 }}>
                          {ev.activity || ev.status}
                        </div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-light)' }}>
                          {ev.date}{ev.location ? ` — ${ev.location}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!data && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: .4 }}>📦</div>
            <div style={{ fontSize: '.88rem' }}>Enter your Order ID or AWB number above to see live shipment details from Shiprocket</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── APP ──────────────────────────────────────────────────────── */
export default function DentallApp() {
  const [cursorPos, setCursorPos]     = useState({ x:-100, y:-100 });
  const [cursorBig, setCursorBig]     = useState(false);
  const [drawerOpen, setDrawerOpen]   = useState(false);

  const scrollStageRef = useRef(null);
  const [brushTransform, setBrushTransform] = useState({ scale:1, ty:0, rot:-6 });
  const [phaseIdx, setPhaseIdx]       = useState(-1);
  const [dotIdx, setDotIdx]           = useState(0);
  const [activeRings, setActiveRings] = useState([false,false,false]);
  const [visiblePanels, setVisiblePanels]   = useState([]);
  const [mobilePanelPhase, setMobilePanelPhase] = useState(0);

  const featRefs = useRef([]);
  const [featVisible, setFeatVisible] = useState(Array(4).fill(false));

  const [selectedPack, setSelectedPack] = useState('family');
  const [qty, setQty]     = useState(1);
  const [form, setForm]   = useState({ fname:'', lname:'', email:'', phone:'', address:'', city:'', state:'', pincode:'' });
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState({ show:false, msg:'' });
  const [showVideo, setShowVideo] = useState(false);

  /* ── Cart ── */
  const [cartOpen, setCartOpen]   = useState(false);
  const [cartItems, setCartItems] = useState([]);

  /* ── Shipping (live from Shiprocket) ── */
  const [shippingCharge, setShippingCharge]     = useState(null);
  const [shippingCourier, setShippingCourier]   = useState('');
  const [shippingEta, setShippingEta]           = useState('');
  const [shippingLoading, setShippingLoading]   = useState(false);
  const [shippingPincode, setShippingPincode]   = useState('');

  /* ── Payment modal ── */
  const [showPayment, setShowPayment]     = useState(false);
  const [payProcessing, setPayProcessing] = useState(false);
  const [paySuccess, setPaySuccess]       = useState(false);
  const [successOrder, setSuccessOrder]   = useState({ orderId:'', awb:'' });
  const [showShipment, setShowShipment]   = useState(false);
  const [dbReviews, setDbReviews]         = useState([]);

  const fetchReviews = () => {
    fetch('/api/reviews')
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length > 0) setDbReviews(data); })
      .catch(() => {});
  };

  useEffect(() => { fetchReviews(); }, []);

  /* ── Modal pincode (in payment modal) ── */
  const [modalShipping, setModalShipping]       = useState(null);
  const [modalShipLoading, setModalShipLoading] = useState(false);

  const packPrice = selectedPack === 'family' ? FAMILY_PACK_PRICE : SINGLE_PRICE;
  const cartSubtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartShipping = modalShipping?.charge ?? 0;
  const cartTotal    = cartSubtotal + cartShipping;
  const orderTotal   = packPrice * qty;


  /* ── Load Razorpay script once ── */
  useEffect(() => {
    if (document.getElementById('rzp-script')) return;
    const s = document.createElement('script');
    s.id = 'rzp-script';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.head.appendChild(s);
  }, []);

  /* ── Custom cursor (optimized) ── */
  useEffect(() => {
    let cursorDot = null;
    let cursorRing = null;
    let animationId = null;

    const initCursor = () => {
      cursorDot = document.querySelector('.dentall-cursor-dot');
      cursorRing = document.querySelector('.dentall-cursor-ring');
    };

    const updateCursor = (e) => {
      if (!cursorDot || !cursorRing) return;

      // Use requestAnimationFrame for smooth updates
      if (animationId) cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(() => {
        const x = e.clientX;
        const y = e.clientY;
        cursorDot.style.left = `${x - 5}px`;
        cursorDot.style.top = `${y - 5}px`;
        cursorRing.style.left = `${x - 16}px`;
        cursorRing.style.top = `${y - 16}px`;
      });
    };

    const handleMouseOver = (e) => {
      if (['BUTTON', 'A', 'INPUT', 'SELECT'].includes(e.target.tagName)) {
        setCursorBig(true);
      }
    };

    const handleMouseOut = () => {
      setCursorBig(false);
    };

    // Initialize after DOM is ready
    const timer = setTimeout(initCursor, 100);

    window.addEventListener('mousemove', updateCursor, { passive: true });
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      clearTimeout(timer);
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  /* ── Scroll stage ── */
  useEffect(() => {
    const onScroll = () => {
      const stage = scrollStageRef.current;
      if (!stage) return;
      const rect   = stage.getBoundingClientRect();
      const stageH = stage.offsetHeight - window.innerHeight;
      const scrolled  = -rect.top;
      const progress  = clamp(scrolled / stageH, 0, 1);
      const isMobile  = window.innerWidth <= 768;
      let scale = 1, ty = 0, rot = -6;
      let rings = [false,false,false], panels = [], phase = -1, dot = 0, mobilePhase = 0;
      if (progress < 0.08) {
        const maxScale = isMobile ? 1.2 : 1.05;
        scale = lerp(isMobile ? 0.9 : .85, maxScale, easeInOut(progress/0.08));
        rot = lerp(-10,-6,progress/0.08); dot=0;
      } else if (progress < 0.18) {
        const t=(progress-0.08)/0.1;
        const maxS = isMobile ? 1.6 : 2.0; const maxTY = isMobile ? 60 : 150;
        scale=lerp(isMobile ? 1.2 : 1.05, maxS, easeInOut(t)); ty=lerp(0, maxTY, easeInOut(t)); rot=lerp(-6,0,t); dot=1;
      } else if (progress < 0.35) {
        scale= isMobile ? 1.6 : 2.0; ty= isMobile ? 60 : 150; rot=0;
        rings=[true,false,false]; phase=1; dot=1; mobilePhase=1;
        if ((progress-0.18)/0.17 > 0.2) panels=['fp-head','fp-head2'];
      } else if (progress < 0.45) {
        const t=(progress-0.35)/0.1;
        scale=lerp(isMobile ? 1.6 : 2.0, 1.0, easeInOut(t)); ty=lerp(isMobile ? 60 : 150, 0, easeInOut(t)); rot=lerp(0,-4,t); dot=1;
      } else if (progress < 0.52) {
        const t=(progress-0.45)/0.07;
        const maxS2 = isMobile ? 1.5 : 1.7;
        scale=lerp(1.0, maxS2, easeInOut(t)); rot=lerp(-4,2,t); dot=2;
      } else if (progress < 0.70) {
        scale= isMobile ? 1.5 : 1.7; rot=2;
        rings=[false,true,false]; phase=2; dot=2; mobilePhase=2;
        if ((progress-0.52)/0.18 > 0.2) panels=['fp-body','fp-body2'];
      } else if (progress < 0.79) {
        const t=(progress-0.70)/0.09;
        scale=lerp(isMobile ? 1.5 : 1.7, 1.0, easeInOut(t)); rot=lerp(2,-6,t); dot=2;
      } else if (progress < 0.87) {
        const t=(progress-0.79)/0.08;
        const maxS3 = isMobile ? 1.7 : 2.2; const minTY = isMobile ? -80 : -160;
        scale=lerp(1.0, maxS3, easeInOut(t)); ty=lerp(0, minTY, easeInOut(t)); rot=lerp(-6,0,t); dot=3;
      } else {
        scale= isMobile ? 1.7 : 2.2; ty= isMobile ? -80 : -160; rot=0;
        rings=[false,false,true]; phase=3; dot=3; mobilePhase=3;
        if ((progress-0.87)/0.13 > 0.2) panels=['fp-handle','fp-handle2'];
      }
      setBrushTransform({ scale, ty, rot });
      setActiveRings(rings); setPhaseIdx(phase); setDotIdx(dot);
      setVisiblePanels(panels); setMobilePanelPhase(mobilePhase);
    };
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Intersection observer for feat cards ── */
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const idx = parseInt(e.target.dataset.idx, 10);
        if (e.isIntersecting) setFeatVisible(prev => { const n=[...prev]; n[idx]=true; return n; });
      });
    }, { threshold:.15 });
    featRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ── Cart helpers ── */
  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
    showToast(`${item.name} added to cart!`);
  };
  const updateCartQty = (id, delta) =>
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.id !== id));
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const showToast = (msg) => {
    setToast({ show:true, msg });
    setTimeout(() => setToast({ show:false, msg:'' }), 3500);
  };

  /* ── Fetch live shipping cost from Shiprocket via backend ── */
  const fetchShippingCost = async (pincode) => {
    if (!pincode || pincode.length !== 6) return;
    setShippingLoading(true);
    try {
      const totalWeight = cartItems.reduce((sum, item) => sum + (item.qty * 0.5), 0); // 0.5kg per brush
      const res  = await fetch('/api/shipping-cost', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ pincode, weight: totalWeight }),
      });
      const data = await res.json();
      setShippingCharge(data.shipping_charge ?? 0);
      setShippingCourier(data.courier_name    ?? 'Standard');
      setShippingEta(data.estimated_delivery  ?? '');
    } catch {
      setShippingCharge(0);
    } finally {
      setShippingLoading(false);
    }
  };

  /* Fetch shipping inside payment modal */
  const fetchModalShipping = async (pin) => {
  if (!pin || pin.length !== 6) return;
  setModalShipLoading(true);
  try {
    const totalWeight = cartItems.reduce((sum, item) => sum + (item.qty * 0.5), 0); // 0.5kg per brush
    const res = await fetch('/api/shipping-cost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincode: pin, weight: totalWeight }),
    });
    const data = await res.json();
    setModalShipping({
      charge:  data.shipping_charge ?? 0,
      courier: data.courier_name    ?? 'Standard',
      eta:     data.estimated_delivery ?? '',
    });
  } catch {
    setModalShipping({ charge: 0, courier: 'Standard', eta: '' });
  } finally {
    setModalShipLoading(false);
  }
};

  /* ── Razorpay payment flow ──     secrued payment handled on 7/5/26*/
  const handleRazorpayCheckout = async () => {
  if (cartItems.length === 0) return;
  setPayProcessing(true);
 
  try {
    // Step 1 — create order on backend.
    // Server computes amount from its own catalogue — client amount is ignored.
    const orderRes = await fetch('/api/create-order', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems,                                  // server re-validates these
        shippingCharge: modalShipping?.charge ?? 0, // server caps this safely
      }),
    });
 
    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => ({}));
      showToast(err.error || 'Could not create order. Please try again.');
      setPayProcessing(false);
      return;
    }
 
    // Server returns keyId — never hardcoded in frontend
    const { orderId: rzpOrderId, amount, keyId, computedTotal } = await orderRes.json();
 
    if (!rzpOrderId || !keyId) {
      showToast('Order creation failed. Please try again.');
      setPayProcessing(false);
      return;
    }
 
    // Step 2 — open Razorpay checkout
    const options = {
      key:         keyId,          // ← from server, not hardcoded
      amount,                      // ← server-computed paise amount
      currency:    'INR',
      name:        'DENTALL',
      description: 'Professional toothbrushes',
      image:       '/image/green.png',
      order_id:    rzpOrderId,
      prefill: {
        name:    (form.fname + ' ' + form.lname).trim(),
        email:   form.email,
        contact: form.phone,
      },
      notes: {
        address: form.address,
        pincode: form.pincode,
      },
      theme: { color: 'var(--primary)' },
 
      handler: async (response) => {
        // Step 3 — verify on backend
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              customerDetails: {
                name:    (form.fname + ' ' + form.lname).trim(),
                email:   form.email,
                phone:   form.phone,
                address: form.address,
                city:    form.city,
                state:   form.state,
                pincode: form.pincode,
              },
              cartItems,
              shippingCharge: modalShipping?.charge ?? 0,
              // NOTE: totalAmount is NOT sent — server computes it from
              // cartItems + shippingCharge using its own catalogue prices.
            }),
          });
 
          const result = await verifyRes.json();
 
          if (!verifyRes.ok) {
            showToast(result.error || 'Verification failed. Contact support with your payment ID.');
            setPayProcessing(false);
            return;
          }
 
          if (result.success) {
            setSuccessOrder({ orderId: result.orderId, awb: result.awb });
            setPaySuccess(true);
            setCartItems([]);
            setModalShipping(null);
          } else {
            showToast('Payment verification failed. Please contact support.');
          }
        } catch (verifyErr) {
          console.error('Verify error:', verifyErr);
          showToast('Verification error. Please contact support with your payment ID.');
        } finally {
          setPayProcessing(false);
        }
      },
 
      modal: {
        ondismiss: () => {
          setPayProcessing(false);
          showToast('Payment cancelled.');
        },
      },
    };
 
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      showToast('Payment failed: ' + (resp.error?.description || 'Unknown error'));
      setPayProcessing(false);
    });
    rzp.open();
 
  } catch (e) {
    console.error('Checkout error:', e);
    showToast('Something went wrong. Please try again.');
    setPayProcessing(false);
  }
}

  const closePayment = () => {
    setShowPayment(false);
    setPaySuccess(false);
    setPayProcessing(false);
    setModalShipping(null);
  };

  /* ── Order form (direct, not cart) ── */
  const changeQty   = d => setQty(q => Math.max(1, Math.min(10, q + d)));
  const handleField = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const placeOrder = () => {
    const errs = {};
    ['fname','email','phone','address','city','state','pincode'].forEach(k => {
      if (!form[k].trim()) errs[k] = true;
    });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    // Add to cart and open payment
    const item = selectedPack === 'family'
      ? { id:'family-pack', name:'Family Pack (12 brushes)', price: FAMILY_PACK_PRICE, icon:'🦷' }
      : { id:'single-brush', name:'Single Brush',            price: SINGLE_PRICE,      icon:'🪥' };
    // Add qty copies
    setCartItems([{ ...item, qty }]);
    setShowPayment(true);
  };

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
    setDrawerOpen(false);
  };

  const mobilePanel = mobilePanelPhase > 0 ? MOBILE_PANELS[mobilePanelPhase] : null;
  /* ─── RENDER ─────────────────────────────────────────────────── */
  return (
    <>
      <div className="dentall-cursor-dot" style={{ width: cursorBig ? 18 : 10, height: cursorBig ? 18 : 10 }} />
      <div className="dentall-cursor-ring" />

      <div className={`dn-toast ${toast.show?'show':''}`}>{toast.msg}</div>

      {/* ── Cart Overlay & Drawer ── */}
      <div className={`dn-cart-overlay ${cartOpen?'open':''}`} onClick={()=>setCartOpen(false)} />
      <div className={`dn-cart-drawer ${cartOpen?'open':''}`}>
        <div className="dn-cart-head">
          <div className="dn-cart-title">
            Your Cart {cartCount > 0 && <span style={{color:'var(--text-light)',fontSize:'.82rem',fontWeight:400}}>({cartCount})</span>}
          </div>
          <button className="dn-cart-close" onClick={()=>setCartOpen(false)}>✕</button>
        </div>
        <div className="dn-cart-body">
          {cartItems.length === 0 ? (
            <div className="dn-cart-empty">
              <div className="dn-cart-empty-icon">🛒</div>
              <div className="dn-cart-empty-text">Your cart is empty</div>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="dn-cart-item">
                <div className="dn-cart-item-icon">{item.icon}</div>
                <div>
                  <div className="dn-cart-item-name">{item.name}</div>
                  <div className="dn-cart-item-price">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
                </div>
                <div className="dn-cart-item-actions">
                  <button className="dn-cart-qty-btn" onClick={()=>updateCartQty(item.id,-1)}>−</button>
                  <div className="dn-cart-qty-val">{item.qty}</div>
                  <button className="dn-cart-qty-btn" onClick={()=>updateCartQty(item.id,1)}>+</button>
                  <button className="dn-cart-remove" onClick={()=>removeFromCart(item.id)}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
  <div className="dn-cart-foot" style={{ padding: '1.2rem 1.6rem' }}>

    {/* Subtotal */}
    <div className="dn-cart-subtotal">
      <span className="dn-cart-subtotal-label">Subtotal</span>
      <span className="dn-cart-subtotal-val">₹{cartSubtotal.toLocaleString('en-IN')}</span>
    </div>

    {/* Total */}
    <div className="dn-cart-total-row" style={{ marginTop: '.8rem' }}>
      <span className="dn-cart-total-label">Total</span>
      <span className="dn-cart-total-val">₹{cartSubtotal.toLocaleString('en-IN')}
        <span style={{ fontSize: '.65rem', color: 'var(--text-light)', fontWeight: 400 }}> + shipping</span>
      </span>
    </div>

    {/* Checkout button — no form validation here, just open modal */}
    <button
      className="dn-cart-checkout-btn"
      onClick={() => {
        setCartOpen(false);
        setShowPayment(true);
      }}
    >
      Proceed to Checkout →
    </button>
    <p style={{ textAlign: 'center', fontSize: '.65rem', color: 'var(--text-light)', marginTop: '.6rem' }}>
      🔒 Razorpay · 🚚 Shiprocket · ↩ 30-day returns
    </p>
  </div>
)}
      </div>

      {/* ── Nav ── */}
      <nav className="dn-nav">
        <div className="dn-logo"><div className="dn-logo">
  DENTALL<sup>®</sup>
</div></div>
        <div className="dn-nav-links">
          <a href="#features-grid" onClick={e=>{e.preventDefault();scrollTo('features-grid')}}>Features</a>
          <a href="#social"        onClick={e=>{e.preventDefault();scrollTo('social')}}>Reviews</a>
          <a href="#tracking"      onClick={e=>{e.preventDefault();scrollTo('tracking')}}>Track</a>
          <a href="#shipment"      onClick={e=>{e.preventDefault();setShowShipment(true);}}>Shipment</a>
          <button className="dn-cart-btn" onClick={()=>setCartOpen(o=>!o)}>
            🛒 Cart {cartCount > 0 && <span className="dn-cart-badge">{cartCount}</span>}
          </button>
          <button className="dn-nav-cta" onClick={()=>scrollTo('order')}>Order Now</button>
        </div>
        <button className={`dn-hamburger ${drawerOpen?'open':''}`} onClick={()=>setDrawerOpen(o=>!o)} aria-label="Menu">
          <span/><span/><span/>
        </button>
      </nav>

      <div className={`dn-drawer ${drawerOpen?'open':''}`}>
        <a href="#features-grid" onClick={e=>{e.preventDefault();scrollTo('features-grid')}}>Features</a>
        <a href="#social"        onClick={e=>{e.preventDefault();scrollTo('social')}}>Reviews</a>
        <a href="#tracking"      onClick={e=>{e.preventDefault();scrollTo('tracking')}}>Track Order</a>
        <a href="#shipment"      onClick={e=>{e.preventDefault();setShowShipment(true);}}>Shipment</a>
        <a href="#order"         onClick={e=>{e.preventDefault();scrollTo('order')}}>Order</a>
        <button className="dn-cart-btn" style={{fontSize:'1rem',padding:'.8rem 2rem'}} onClick={()=>{setDrawerOpen(false);setCartOpen(true);}}>
          🛒 Cart {cartCount > 0 && <span className="dn-cart-badge">{cartCount}</span>}
        </button>
        <button className="dn-nav-cta" onClick={()=>scrollTo('order')}>Family Pack — ₹5,990</button>
      </div>

      {/* ── Hero ── */}
<section className="dn-hero" id="hero">
  <div className="dn-hero-bg" />
  <div className="dn-hero-content">
    <div className="dn-hero-tag">Professional Dental Care</div>
    <h1 className="dn-h1">Brush with<br/><em>Confidence</em><br/>Every Day.</h1>
    <p className="dn-hero-sub">DENTALL's precision-engineered bristle system and ergonomic grip deliver a dentist-quality clean — every single morning. Starting at just ₹599 per brush.</p>
    <div className="dn-hero-ctas">
      <button className="dn-btn-primary" onClick={()=>scrollTo('order')}>Shop Now — from ₹599</button>
      <button className="dn-btn-ghost"   onClick={()=>scrollTo('scroll-stage')}>Explore Features</button>
    </div>
  </div>
  <div className="dn-hero-image-wrap">
    <BrushColorShowcase />
    <div className="dn-hero-badge">
      <div style={{fontSize:'1.3rem'}}>🦷</div>
      <div>
        <div className="dn-badge-label">Dentist Rating</div>
        <div className="dn-badge-val">★★★★★ 4.9 / 5.0</div>
      </div>
    </div>
  </div>
  <div className="dn-scroll-hint">Scroll to explore</div>
</section>

      {/* ── Family Pack Banner ── */}
      <section className="dn-pack-banner" id="family-pack">
        <div className="dn-pack-inner">
          <div>
            <div className="dn-pack-label">The smart way to stock up</div>
            <h2 className="dn-pack-title">One pack.<br/><em>A full year</em> of fresh smiles for the whole family.</h2>
            <p className="dn-pack-desc">
              Dentists recommend replacing your toothbrush every <strong style={{color:'#fff'}}>4 months</strong> — that's 3 brushes per person per year.
              Our Family Pack of <strong style={{color:'#fff'}}>12 brushes</strong> covers a family of 4 for a full year — no reordering, no forgetting.
            </p>
            <div className="dn-pack-perks" style={{marginTop:'1.5rem'}}>
              {['12 brushes in one box','Covers 4 people × 12 months','Change every 4 months','Free shipping included','Never run out mid-year'].map(p=>(
                <div key={p} className="dn-pack-perk"><div className="dn-pack-perk-dot"/> {p}</div>
              ))}
            </div>
            <div style={{marginTop:'1.5rem'}}>
              <div className="dn-pack-timeline-label" style={{color:'rgba(255,255,255,.5)',marginBottom:'.5rem'}}>Replace schedule — all year covered</div>
              <div className="dn-pack-timeline">
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i)=>(
                  <div key={m} className={`dn-pack-month ${[0,3,6,9].includes(i)?'change':''}`}>
                    {![0,3,6,9].includes(i) && m}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="dn-pack-math">
              <div className="dn-pack-math-row"><span>Per brush</span><strong>₹50</strong></div>
              <div className="dn-pack-math-row"><span>Family pack (12 brushes)</span><strong>₹599</strong></div>
              <div className="dn-pack-math-row"><span>Per person per year</span><strong>₹150</strong></div>
              <div className="dn-pack-math-divider"/>
              <div className="dn-pack-math-total">
                <div className="dn-pack-math-total-label">Family pack total</div>
                <div className="dn-pack-math-price">₹599 <span>/ year</span></div>
              </div>
              <button className="dn-submit-btn" style={{margin:'1rem 0 0',fontSize:'.82rem'}} onClick={()=>scrollTo('order')}>Order Family Pack →</button>
              <button className="dn-add-cart-btn" style={{background:'rgba(255,255,255,.1)',borderColor:'rgba(255,255,255,.4)',color:'#fff',marginTop:'.6rem'}}
                onClick={()=>addToCart({id:'family-pack',name:'Family Pack (12 brushes)',price:5990,icon:'🦷'})}>
                🛒 Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Video ── */}
      <section className="dn-video-section" id="video">
        <div className="dn-video-label">See it in action</div>
        <h2 className="dn-video-title">Two minutes.<br/><em>A lifetime</em> of better oral health.</h2>
        <div className="dn-video-placeholder" onClick={()=>setShowVideo(true)}>
          <div className="dn-video-grid"/><div className="dn-video-glow"/><div className="dn-video-scanline"/>
          <div className="dn-video-corner dn-video-corner-tl"/><div className="dn-video-corner dn-video-corner-tr"/>
          <div className="dn-video-corner dn-video-corner-bl"/><div className="dn-video-corner dn-video-corner-br"/>
          <div className="dn-video-live">Product Film</div>
          <div className="dn-video-duration">1:52</div>
          <button className="dn-video-play-btn" aria-label="Play video"><div className="dn-play-icon"/></button>
          <div className="dn-video-caption">DENTALL Pro — Product Story</div>
        </div>
      </section>

      {/* ── Scroll Stage ── */}
      <section id="scroll-stage" ref={scrollStageRef} className="dn-scroll-stage">
        <div className="dn-sticky-canvas">
          <div className="dn-brush-scene">

            {/* ── Left intro panel ── */}
            <div className={`dn-scroll-intro ${phaseIdx === -1 ? 'visible' : ''}`}>
              <div className="dn-scroll-intro-tag">Product Anatomy</div>
              <div className="dn-scroll-intro-title">Three parts.<br/><em>One perfect</em> clean.</div>
              <div className="dn-scroll-intro-desc">Scroll down to discover how each component of DENTALL's design works in harmony for a superior clean.</div>
              <div className="dn-scroll-intro-steps">
                {[['01','Bristle Head'],['02','Grip Body'],['03','Handle Base']].map(([num,name])=>(
                  <div key={num} className="dn-scroll-intro-step">
                    <span className="dn-scroll-intro-num">{num}</span>
                    <span className="dn-scroll-intro-name">{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right stats panel ── */}
            <div className={`dn-scroll-stats ${phaseIdx === -1 ? 'visible' : ''}`}>
              {[
                { num:'99.3%', label:'Plaque removed',    fill:'99' },
                { num:'10K+',  label:'Micro-filaments/cm²', fill:'85' },
                { num:'4 mo',  label:'Replacement cycle', fill:'70' },
              ].map(s=>(
                <div key={s.label} className="dn-scroll-stat-item">
                  <div className="dn-scroll-stat-num">{s.num}</div>
                  <div className="dn-scroll-stat-label">{s.label}</div>
                  <div className="dn-scroll-stat-bar">
                    <div className="dn-scroll-stat-fill" style={{width:`${s.fill}%`}} />
                  </div>
                </div>
              ))}
            </div>

            {/* ── Scroll-down cue ── */}
            <div className={`dn-scroll-down-cue ${phaseIdx === -1 ? 'visible' : ''}`}>
              <div className="dn-scroll-down-cue-text">Scroll to explore</div>
              <div className="dn-scroll-down-cue-line" />
              <div className="dn-scroll-down-cue-arrow" />
            </div>

            <div className={`dn-mobile-feature-card ${mobilePanel?'visible':''}`}>
              {mobilePanel && <>
                <div className="dn-mobile-fp-tag">{mobilePanel.tag}</div>
                <div className="dn-mobile-fp-title">{mobilePanel.title}</div>
                <div className="dn-mobile-fp-desc">{mobilePanel.desc}</div>
              </>}
            </div>
            <div id="dn-brush-wrapper" style={{transform:`scale(${brushTransform.scale}) translateY(${brushTransform.ty}px) rotate(${brushTransform.rot}deg)`}}>
              <img id="dn-brush-img" src="image/green.png" alt="DENTALL brush detail" onError={e=>{e.target.style.opacity=0;}}/>
              <div className={`dn-img-highlight ${activeRings[0]?'active':''}`} style={{width:70,height:70,top:'2%',left:'50%',transform:'translate(-50%,0)'}}/>
              <div className={`dn-img-highlight ${activeRings[1]?'active':''}`} style={{width:80,height:80,top:'45%',left:'50%',transform:'translate(-50%,-50%)'}}/>
              <div className={`dn-img-highlight ${activeRings[2]?'active':''}`} style={{width:70,height:70,bottom:'8%',left:'50%',transform:'translate(-50%,0)'}}/>
            </div>
            <div id="dn-phase-label" className={phaseIdx >= 0 ? 'visible' : ''}>
              <div className="dn-pl-step">{phaseIdx>=0?PHASES[phaseIdx].step:''}</div>
              <div className="dn-pl-name">{phaseIdx>=0?PHASES[phaseIdx].name:''}</div>
            </div>
            <div className={`dn-feature-panel right ${visiblePanels.includes('fp-head')?'visible':''}`} style={{top:'18%'}}>
              <div className="dn-fp-line"/><div className="dn-fp-tag">01 — Bristle Head</div>
              <div className="dn-fp-title">Ultra-Soft Nano Bristles</div>
              <div className="dn-fp-desc">10,000 micro-filaments per cm² reach between teeth and below the gumline, removing 99.3% of plaque.</div>
            </div>
            <div className={`dn-feature-panel left ${visiblePanels.includes('fp-head2')?'visible':''}`} style={{top:'40%'}}>
              <div className="dn-fp-line"/><div className="dn-fp-tag">01b — Tongue Cleaner</div>
              <div className="dn-fp-title">Integrated Tongue Cleaner</div>
              <div className="dn-fp-desc">Reverse-side ribbed texture eliminates odour-causing bacteria — no separate tool needed.</div>
            </div>
            <div className={`dn-feature-panel left ${visiblePanels.includes('fp-body')?'visible':''}`} style={{top:'28%'}}>
              <div className="dn-fp-line"/><div className="dn-fp-tag">02 — Ergonomic Handle</div>
              <div className="dn-fp-title">Precision Grip Zone</div>
              <div className="dn-fp-desc">Dual-material soft-touch grip contoured to the hand. Red TPE inlay provides non-slip control.</div>
            </div>
            <div className={`dn-feature-panel right ${visiblePanels.includes('fp-body2')?'visible':''}`} style={{top:'52%'}}>
              <div className="dn-fp-line"/><div className="dn-fp-tag">02b — Durability</div>
              <div className="dn-fp-title">Long-Life Construction</div>
              <div className="dn-fp-desc">Medical-grade polypropylene resists bacteria. Replace only the head every 3 months.</div>
            </div>
            <div className={`dn-feature-panel right ${visiblePanels.includes('fp-handle')?'visible':''}`} style={{top:'38%'}}>
              <div className="dn-fp-line"/><div className="dn-fp-tag">03 — Handle End</div>
              <div className="dn-fp-title">Anti-Slip Base</div>
              <div className="dn-fp-desc">The flared end provides stability on wet surfaces and an ergonomic rest point for the palm.</div>
            </div>
            <div className={`dn-feature-panel left ${visiblePanels.includes('fp-handle2')?'visible':''}`} style={{top:'58%'}}>
              <div className="dn-fp-line"/><div className="dn-fp-tag">03b — Branding</div>
              <div className="dn-fp-title">Dentall Certified</div>
              <div className="dn-fp-desc">BPA-free, ISO 9001 certified. Each brush is quality tested for consistent bristle density.</div>
            </div>
          </div>
        </div>
      </section>

      <div id="dn-progress-dots">
        {[0,1,2,3].map(i=><div key={i} className={`dn-dot ${dotIdx===i?'active':''}`}/>)}
      </div>

      {/* ── Hygiene Cap Section ── */}
      <section className="dn-cap-section" id="hygiene-cap">
        {/* Left: text */}
        <div>
          <div className="dn-cap-tag">Included in every order</div>
          <h2 className="dn-cap-title">Hygiene cap that<br/><em>travels with you.</em></h2>
          <p className="dn-cap-desc">
            Every DENTALL brush ships with a precision-fit transparent travel cap. Snap it on in seconds — your bristles stay protected from bathroom germs, bags, and surfaces wherever you go.
          </p>
          <div className="dn-cap-points">
            {[
              { icon:'🛡️', title:'Germ shield', desc:'Sealed clip design blocks airborne bacteria and contact contamination between uses.' },
              { icon:'✈️', title:'Travel ready', desc:'Slim, lightweight, and TSA-friendly. Fits flush so it never catches in your bag.' },
              { icon:'🔒', title:'Snap-lock closure', desc:'One-hand open and close. The hinged clip stays shut even upside down.' },
              { icon:'♻️', title:'BPA-free polypropylene', desc:'Same hygienic-grade plastic as the handle. Safe, durable, and recyclable.' },
            ].map(pt => (
              <div key={pt.title} className="dn-cap-point">
                <div className="dn-cap-point-icon">{pt.icon}</div>
                <div className="dn-cap-point-body">
                  <div className="dn-cap-point-title">{pt.title}</div>
                  <div className="dn-cap-point-desc">{pt.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="dn-cap-badge">Included free with every brush</div>
        </div>

        {/* Right: images */}
        <div className="dn-cap-images">
          <img src="src\assets\brush cap.png" alt="Cap on brush"       className="dn-cap-img dn-cap-img-main"        />
          <img src="src\assets\cap open.png" alt="Hygiene cap open"   className="dn-cap-img dn-cap-img-side dn-cap-img-side-top"    />
          <img src="src\assets\cap close.png" alt="Hygiene cap closed" className="dn-cap-img dn-cap-img-side dn-cap-img-side-bottom" />
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="dn-features-grid" id="features-grid">
        <div className="dn-section-label">What sets us apart</div>
        <div className="dn-section-title">Engineered for <em>every tooth</em>, every day.</div>
        <div className="dn-merged-grid">
          {[[0],[1],[2],[3]].map((indices, cardIdx) => (
            <div
              key={cardIdx}
              ref={el=>{featRefs.current[cardIdx]=el}}
              data-idx={cardIdx}
              className={`dn-merged-card ${featVisible[cardIdx]?'visible':''}`}
              style={{transitionDelay:`${cardIdx*0.12}s`}}
            >
              <div className="dn-merged-features">
                {indices.map(fi => (
                  <div key={fi} className="dn-merged-feat-item">
                    <div className="dn-merged-feat-header">
                      <span className="dn-merged-feat-num">{FEATURES[fi].num}</span>
                      <span className="dn-merged-feat-icon">{FEATURES[fi].icon}</span>
                      <span className="dn-merged-feat-title">{FEATURES[fi].title}</span>
                    </div>
                    <div className="dn-merged-feat-text">{FEATURES[fi].text}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Patient Conditions ── */}
      <section className="dn-patient-section" id="patient-conditions">
        <div className="dn-patient-section-label">Especially designed for</div>
        <div className="dn-patient-section-title">Made for <em>sensitive</em> health needs.</div>
        <p className="dn-patient-section-sub">DENTALL's nano-bristle engineering goes beyond everyday cleaning — built for patients who need gentler, safer oral care every single day.</p>
        <div className="dn-patient-grid">
          {PATIENT_CONDITIONS.map((p, i) => (
            <div key={i} className="dn-patient-card">
              <div className="dn-patient-card-accent" style={{background:p.color}}/>
              <div className="dn-patient-card-glow" style={{background:p.color}}/>
              <div className="dn-patient-card-icon" style={{background:p.colorBg}}>{p.icon}</div>
              <div className="dn-patient-card-badge" style={{background:p.colorBadge,color:p.colorText}}>{p.group}</div>
              <div className="dn-patient-card-divider" style={{background:p.color}}/>
              <div className="dn-patient-card-title">{p.title}</div>
              <div className="dn-patient-card-text">{p.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="dn-social" id="social">
        <div className="dn-social-header">
          <div className="dn-section-label">Customer voices</div>
          <div className="dn-section-title">Trusted by <em>12,000+</em> households</div>
        </div>
        <div className="dn-reviews-track-wrapper">
          <div className="dn-reviews-scroll-track">
            {(() => {
              const list = dbReviews.length
                ? dbReviews.map(r => ({ text: r.review_text, author: r.customer_name, city: '', rating: r.rating }))
                : REVIEWS.map(r => ({ ...r, rating: 5 }));
              return [...list, ...list, ...list].map((r, i) => (
                <div key={i} className="dn-review-card">
                  <div className="dn-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <div className="dn-review-text">"{r.text}"</div>
                  <div className="dn-review-author">
                    {r.author}
                    {r.city && <span style={{color:'var(--text-light)',fontWeight:400}}> — {r.city}</span>}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
        {/* <div className="dn-stats-row">
          {[['99.3%','Plaque removed'],['12K+','Happy customers'],['4.9','Average rating'],['200+','Dentist partners']].map(([n,l])=>(
            <div key={l} className="dn-stat">
              <div className="dn-stat-num">{n}</div>
              <div className="dn-stat-label">{l}</div>
            </div>
          ))}
        </div> */}
      </section>

      {/* ── Write a Review ── */}
      <ReviewFormSection onSubmitSuccess={fetchReviews} />

      {/* ── Order ── */}
      <section className="dn-order" id="order">

        {/* Small centred info header */}
        <div className="dn-order-header">
          <div className="dn-section-label">Ready to upgrade?</div>
          <div className="dn-order-title">Choose your pack. <em>Start smiling better.</em></div>
          <div className="dn-order-desc" style={{maxWidth:520,margin:'0 auto .6rem'}}>Free shipping across India · 30-day return guarantee · Razorpay secured</div>
          <div className="dn-order-perk-chips">
            {['✓ Dentist recommended','✓ 12K+ happy customers','✓ Change every 4 months','✓ BPA-free materials','✓ Free shipping'].map(c=>(
              <span key={c} className="dn-order-perk-chip">{c}</span>
            ))}
          </div>
        </div>

        {/* Big product cards */}
        <div className="dn-products-big-grid">
          {PRODUCTS.map(p => (
            <div key={p.id} className={`dn-big-card ${p.badge==='Best Value'?'featured':''}`}>
              {p.badge && <div className="dn-big-card-ribbon">{p.badge}</div>}
              <div className="dn-big-card-icon">{p.icon}</div>
              <div className="dn-big-card-name">{p.name}</div>
              <div className="dn-big-card-sub">{p.sub}</div>
              <div className="dn-big-card-price">₹{p.price.toLocaleString('en-IN')}</div>
              <div className="dn-big-card-price-note">
                {p.id==='family-pack' ? '≈ ₹499/person/year' : p.id==='kids-brush' ? 'Ultra-soft for ages 3–12' : 'Single brush · 4-month use'}
              </div>
              <div className="dn-big-card-divider"/>
              <div className="dn-big-card-perks">
                {p.perks.map(pk=>(
                  <div key={pk} className="dn-big-card-perk">
                    <span className="dn-big-card-perk-check">✓</span>{pk}
                  </div>
                ))}
              </div>
              <button className="dn-big-card-btn"
                onClick={()=>addToCart({id:p.id,name:p.name,price:p.price,icon:p.icon})}>
                + Add to Cart
              </button>
            </div>
          ))}
        </div>

        <p style={{textAlign:'center',fontSize:'.68rem',color:'var(--text-light)'}}>
          🔒 Razorpay secured · 🚚 Shiprocket delivery · ↩ 30-day returns
        </p>
      </section>

      {/* ── Tracking ── */}
      <TrackingSection />

      {/* ── Footer ── */}
      <footer className="dn-footer">
        <div className="dn-footer-logo">DENTALL</div>
        <div className="dn-footer-copy">© 2025 Dentall. All rights reserved.</div>
        <div className="dn-footer-links">
          <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a>
        </div>
      </footer>

      {/* ── Payment Modal ── */}
      {showPayment && (
        <div className="dn-pay-overlay" onClick={e=>{if(e.target.className==='dn-pay-overlay')closePayment();}}>
          <div className="dn-pay-modal">
            <div className="dn-pay-header">
              <div className="dn-pay-header-left">
                <div className="dn-pay-secure-tag">Secure Checkout</div>
                <div className="dn-pay-modal-title">Complete Your Order</div>
              </div>
              <button className="dn-pay-close" onClick={closePayment}>✕</button>
            </div>

            {paySuccess ? (
              <div className="dn-pay-success">
                <div className="dn-pay-success-icon">✓</div>
                <div className="dn-pay-success-title">Order Placed!</div>
                <p className="dn-pay-success-sub">Your DENTALL brushes will be shipped within 24 hours. Check your email for the receipt.</p>
                <div className="dn-pay-success-ref">Order ID: DNT-{successOrder.orderId}</div>
                {successOrder.awb && (
                  <div className="dn-pay-success-awb">
                    AWB / Tracking: {successOrder.awb}
                    <div style={{fontSize:'.68rem',marginTop:'.3rem',color:'rgba(0,212,180,.7)'}}>
                      Use this number in the Track section above
                    </div>
                  </div>
                )}
                <button className="dn-pay-done-btn" onClick={()=>{closePayment();setShowShipment(true);}}>View Shipment Details →</button>
              </div>
            ) : (
              <div className="dn-pay-body">

                {/* Order summary */}
                <div className="dn-pay-order-summary">
                  <div className="dn-pay-summary-label">Order Summary</div>
                  {cartItems.map(item=>(
                    <div key={item.id} className="dn-pay-summary-row">
                      <span>{item.icon} {item.name} × {item.qty}</span>
                      <span>₹{(item.price*item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="dn-pay-summary-row">
                    <span>Shipping</span>
                    <span style={{color: modalShipping?.charge===0?'var(--accent)':'var(--text-dark)',fontWeight:600}}>
                      {modalShipping ? (modalShipping.charge===0 ? 'FREE' : `₹${modalShipping.charge}`) : '—'}
                    </span>
                  </div>
                  <div className="dn-pay-summary-row total">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* ── Delivery Details Form — shown here, not in cart ── */}
<div className="dn-pay-section-label">Delivery Details</div>

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem', marginBottom: '.8rem' }}>
  {[['fname','First Name','Arjun'], ['lname','Last Name','Sharma']].map(([key, lbl, ph]) => (
    <div className="dn-pay-field" key={key} style={{ marginBottom: 0 }}>
      <label>{lbl}</label>
      <input
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={ph}
        style={{ borderColor: errors[key] ? 'var(--danger)' : '' }}
      />
    </div>
  ))}
</div>

<div className="dn-pay-field">
  <label>Email</label>
  <input
    type="email" value={form.email}
    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
    placeholder="arjun@email.com"
    style={{ borderColor: errors.email ? 'var(--danger)' : '' }}
  />
</div>

<div className="dn-pay-field">
  <label>Phone</label>
  <input
    type="tel" value={form.phone}
    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
    placeholder="+91 98765 43210"
    style={{ borderColor: errors.phone ? 'var(--danger)' : '' }}
  />
</div>

<div className="dn-pay-field">
  <label>Address</label>
  <input
    value={form.address}
    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
    placeholder="Flat no, Street"
    style={{ borderColor: errors.address ? 'var(--danger)' : '' }}
  />
</div>

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem' }}>
  <div className="dn-pay-field">
    <label>City</label>
    <input
      value={form.city}
      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
      placeholder="Chennai"
      style={{ borderColor: errors.city ? 'var(--danger)' : '' }}
    />
  </div>
  <div className="dn-pay-field">
    <label>Pincode</label>
    <input
      value={form.pincode}
      onChange={e => {
        const v = e.target.value.replace(/\D/g,'').slice(0,6);
        setForm(f => ({ ...f, pincode: v }));
        if (v.length === 6) fetchModalShipping(v);
      }}
      placeholder="600001"
      style={{ borderColor: errors.pincode ? 'var(--danger)' : '' }}
    />
  </div>
</div>

{modalShipLoading && (
  <div className="dn-shipping-loading" style={{marginBottom:'1rem'}}>Checking shipping rates…</div>
)}
{modalShipping && !modalShipLoading && (
  <div className="dn-shipping-info-box" style={{marginBottom:'1rem'}}>
    <div className="dn-shipping-info-row">
      <span className="dn-shipping-info-courier">{modalShipping.courier}</span>
      <span className="dn-shipping-info-price">
        {modalShipping.charge===0 ? 'FREE' : `₹${modalShipping.charge}`}
      </span>
    </div>
    {modalShipping.eta && (
      <div className="dn-shipping-info-eta">Estimated delivery in {modalShipping.eta} business days</div>
    )}
  </div>
)}

<div className="dn-pay-field">
  <label>State</label>
  <select
    value={form.state}
    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
    style={{ borderColor: errors.state ? 'var(--danger)' : '' }}
  >
    <option value="">Select state</option>
    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
  </select>
</div>

                {/* Pay via Razorpay */}
                <div className="dn-pay-section-label" style={{marginTop:'1rem'}}>Payment</div>
                <p style={{fontSize:'.82rem',color:'var(--text-mid)',lineHeight:1.6,marginBottom:'1rem'}}>
                  Clicking the button below will open the Razorpay secure payment window where you can pay by card, UPI, net banking, or wallet.
                </p>

                <button
                  className="dn-razorpay-btn"
                  onClick={handleRazorpayCheckout}
                  disabled={payProcessing || cartItems.length===0}>
                  {payProcessing
                    ? '⏳ Opening Razorpay…'
                    : <>Pay ₹{cartTotal.toLocaleString('en-IN')} <span className="dn-razorpay-logo">via Razorpay</span></>}
                </button>

                <div className="dn-pay-footer-badges">
                  <span className="dn-pay-badge">🔒 256-bit SSL</span>
                  <span className="dn-pay-badge">🛡️ PCI DSS Compliant</span>
                  <span className="dn-pay-badge">↩ 30-Day Returns</span>
                  <span className="dn-pay-badge">🚚 Shiprocket Delivery</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Shipment Page ── */}
      {showShipment && <ShipmentPage onClose={() => setShowShipment(false)} />}

      {/* ── Video Modal ── */}
      {showVideo && (
        <div className="dn-video-modal" onClick={()=>setShowVideo(false)}>
          <div className="dn-video-backdrop"/>
          <div className="dn-video-container" onClick={e=>e.stopPropagation()}>
            <button className="dn-video-close" onClick={()=>setShowVideo(false)}>✕</button>
            <iframe width="100%" height="100%"
              src="https://www.youtube.com/embed/y7_2sUZiBbc?autoplay=1&mute=1"
              title="Dentall Product Video" frameBorder="0"
              allow="autoplay; encrypted-media" allowFullScreen/>
          </div>
        </div>
      )}

    </>
  );
}