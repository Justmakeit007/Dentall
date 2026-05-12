import React, { useState, useEffect, useRef } from "react";
import "./styles/index.css";
import BrushColorShowcase from "./components/BrushColorShowcase";
import ReviewFormSection from "./components/ReviewFormSection";
import ShipmentPage from "./components/ShipmentPage";
import TrackingSection from "./components/TrackingSection";
import videoThumbnail from "./assets/thumbnail dentall.png";
import {
  FAMILY_PACK_PRICE,
  FEATURES,
  INDIA_STATES,
  MOBILE_PANELS,
  PATIENT_CONDITIONS,
  PHASES,
  PRODUCTS,
  REVIEWS,
  SINGLE_PRICE,
} from "./data/dentallData";
import { clamp, easeInOut, lerp } from "./utils/math";
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
  const [showWholesale, setShowWholesale] = useState(false);
  const [wholesaleSubmitted, setWholesaleSubmitted] = useState(false);
  const [wholesaleSubmitting, setWholesaleSubmitting] = useState(false);
  const [wholesaleError, setWholesaleError] = useState('');
  const [wholesaleForm, setWholesaleForm] = useState({
    name: '',
    business: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    qty: '',
    type: '',
    message: '',
  });

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

  const closeWholesale = () => {
    setShowWholesale(false);
    setWholesaleSubmitted(false);
    setWholesaleError('');
  };

  const submitWholesaleEnquiry = async (e) => {
    e.preventDefault();
    setWholesaleSubmitting(true);
    setWholesaleError('');
    try {
      const res = await fetch('/api/wholesale-enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wholesaleForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not submit enquiry. Please try again.');
      setWholesaleSubmitted(true);
      showToast('Wholesale enquiry submitted. Pricing PDF sent to your email.');
    } catch (err) {
      setWholesaleError(err.message || 'Could not submit enquiry. Please try again.');
    } finally {
      setWholesaleSubmitting(false);
    }
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
        <div className="dn-logo"><div className="dn-logo">DENTALL<sup>®</sup>
        <span className="dn-logo-tagline">a quality product from Brooks &amp; Meadows</span>
  
</div></div>
        <div className="dn-nav-links">
          <a href="#features-grid" onClick={e=>{e.preventDefault();scrollTo('features-grid')}}>Features</a>
          <a href="#social"        onClick={e=>{e.preventDefault();scrollTo('social')}}>Reviews</a>
          {/* <a href="#tracking"      onClick={e=>{e.preventDefault();scrollTo('tracking')}}>Track</a> */}
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
        {/* <a href="#tracking"      onClick={e=>{e.preventDefault();scrollTo('tracking')}}>Track Order</a> */}
        <a href="#shipment"      onClick={e=>{e.preventDefault();setShowShipment(true);}}>Shipment</a>
        <a href="#order"         onClick={e=>{e.preventDefault();scrollTo('order')}}>Order</a>
        <button className="dn-cart-btn" style={{fontSize:'1rem',padding:'.8rem 2rem'}} onClick={()=>{setDrawerOpen(false);setCartOpen(true);}}>
          🛒 Cart {cartCount > 0 && <span className="dn-cart-badge">{cartCount}</span>}
        </button>
        <button className="dn-nav-cta" onClick={()=>scrollTo('order')}>Family Pack — ₹599</button>
      </div>

      {/* ── Hero ── */}
<section className="dn-hero" id="hero">
  <div className="dn-hero-bg" />
  <div className="dn-hero-content">
    <div className="dn-hero-tag">Professional Dental Care</div>
    <h1 className="dn-h1">Brush with<br/><em>Confidence</em><br/>Every Day.</h1>
    <p className="dn-hero-sub">DENTALL's precision-engineered bristle system and ergonomic grip deliver a dentist-quality clean — every single morning. Starting at just ₹49 per brush.</p>
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
              Dentists recommend replacing your toothbrush every <strong style={{color:'#fff'}}>3 months</strong> — that's 4 brushes per person per year.
              Our Family Pack of <strong style={{color:'#fff'}}>12 brushes</strong> covers a family of 4 for a full year — no reordering, no forgetting.
            </p>
            <div className="dn-pack-perks" style={{marginTop:'1.5rem'}}>
              {['12 brushes in one box','Covers 4 people × 12 months','Change every 3 months','Free shipping included','Never run out mid-year'].map(p=>(
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
              {/* <div className="dn-pack-math-row"><span>Per person per year</span><strong>₹150</strong></div> */}
              <div className="dn-pack-math-divider"/>
              <div className="dn-pack-math-total">
                <div className="dn-pack-math-total-label">Family pack total</div>
                <div className="dn-pack-math-price">₹599 <span>/ year</span></div>
              </div>
              <button className="dn-submit-btn" style={{margin:'1rem 0 0',fontSize:'.82rem'}} onClick={()=>scrollTo('order')}>Order Family Pack →</button>
              <button className="dn-add-cart-btn" style={{background:'rgba(255,255,255,.1)',borderColor:'rgba(255,255,255,.4)',color:'#fff',marginTop:'.6rem'}}
                onClick={()=>addToCart({id:'family-pack',name:'Family Pack (12 brushes)',price:599,icon:'🦷'})}>
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
          <img className="dn-video-thumb" src={videoThumbnail} alt="Dentall product video thumbnail" loading="lazy"/>
          <div className="dn-video-thumb-overlay"/>
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
            {['✓ Dentist recommended','✓ 12K+ happy customers','✓ Change every 3 months','✓ BPA-free materials','✓ Free shipping'].map(c=>(
              <span key={c} className="dn-order-perk-chip">{c}</span>
            ))}
          </div>
        </div>

        {/* Big product cards */}
        <div className="dn-products-big-grid">
          {PRODUCTS.map(p => (
            <div key={p.id} className={`dn-big-card ${p.badge==='Best Value'?'featured':''} ${p.id==='wholesale'?'wholesale':''}`}>
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
                onClick={()=>p.id === 'wholesale' ? setShowWholesale(true) : addToCart({id:p.id,name:p.name,price:p.price,icon:p.icon})}>
                {p.id === 'wholesale' ? 'Enquire for Wholesale' : '+ Add to Cart'}
              </button>
            </div>
          ))}
        </div>

        <p style={{textAlign:'center',fontSize:'.68rem',color:'var(--text-light)'}}>
          🔒 Razorpay secured · 🚚 Shiprocket delivery · ↩ 30-day returns
        </p>
      </section>

      {/* ── Tracking ── */}
      {showWholesale && (
        <div className="dn-wholesale-modal" onClick={closeWholesale}>
          <div className="dn-wholesale-backdrop" />
          <div className="dn-wholesale-box" onClick={e=>e.stopPropagation()}>
            <div className="dn-wholesale-header">
              <div>
                <h2>Wholesale Enquiry</h2>
                <p>Fill in your details - our team will contact you within 24 hours</p>
              </div>
              <button className="dn-wholesale-close" onClick={closeWholesale} aria-label="Close wholesale enquiry">x</button>
            </div>
            {wholesaleSubmitted ? (
              <div className="dn-wholesale-success">
                <div className="dn-wholesale-success-icon">✓</div>
                <h3>Enquiry Received!</h3>
                <p>Thank you for your interest in DENTALL wholesale. We have emailed your pricing PDF and saved your enquiry for our sales team.</p>
              </div>
            ) : (
              <form className="dn-wholesale-body" onSubmit={submitWholesaleEnquiry}>
                <div className="dn-wholesale-grid">
                  <div className="dn-wholesale-field">
                    <label>Full Name *</label>
                    <input required type="text" placeholder="Your name" value={wholesaleForm.name}
                      onChange={e=>setWholesaleForm(f=>({...f,name:e.target.value}))}/>
                  </div>
                  <div className="dn-wholesale-field">
                    <label>Business / Company Name *</label>
                    <input required type="text" placeholder="Your business name" value={wholesaleForm.business}
                      onChange={e=>setWholesaleForm(f=>({...f,business:e.target.value}))}/>
                  </div>
                  <div className="dn-wholesale-field">
                    <label>Email Address *</label>
                    <input required type="email" placeholder="you@example.com" value={wholesaleForm.email}
                      onChange={e=>setWholesaleForm(f=>({...f,email:e.target.value}))}/>
                  </div>
                  <div className="dn-wholesale-field">
                    <label>Phone Number *</label>
                    <input required type="tel" placeholder="+91 98765 43210" value={wholesaleForm.phone}
                      onChange={e=>setWholesaleForm(f=>({...f,phone:e.target.value}))}/>
                  </div>
                  <div className="dn-wholesale-field">
                    <label>City *</label>
                    <input required type="text" placeholder="City" value={wholesaleForm.city}
                      onChange={e=>setWholesaleForm(f=>({...f,city:e.target.value}))}/>
                  </div>
                  <div className="dn-wholesale-field">
                    <label>State *</label>
                    <select required value={wholesaleForm.state}
                      onChange={e=>setWholesaleForm(f=>({...f,state:e.target.value}))}>
                      <option value="">Select state</option>
                      {INDIA_STATES.map(s=><option key={s} value={s}>{s}</option>)}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="dn-wholesale-field">
                    <label>Quantity Required (brushes) *</label>
                    <select required value={wholesaleForm.qty}
                      onChange={e=>setWholesaleForm(f=>({...f,qty:e.target.value}))}>
                      <option value="">Select quantity range</option>
                      <option value="100-499">100 - 499</option>
                      <option value="500-999">500 - 999</option>
                      <option value="1000-4999">1,000 - 4,999</option>
                      <option value="5000+">5,000+</option>
                    </select>
                  </div>
                  <div className="dn-wholesale-field">
                    <label>Business Type</label>
                    <select value={wholesaleForm.type}
                      onChange={e=>setWholesaleForm(f=>({...f,type:e.target.value}))}>
                      <option value="">Select type</option>
                      <option value="retailer">Retailer</option>
                      <option value="distributor">Distributor</option>
                      <option value="clinic">Dental Clinic / Hospital</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="dn-wholesale-field full">
                    <label>Additional Message</label>
                    <textarea placeholder="Tell us more about your requirements, preferred delivery schedule, or custom branding needs..."
                      value={wholesaleForm.message}
                      onChange={e=>setWholesaleForm(f=>({...f,message:e.target.value}))}/>
                  </div>
                </div>
                {wholesaleError && <div className="dn-wholesale-error">{wholesaleError}</div>}
                <button type="submit" className="dn-wholesale-submit" disabled={wholesaleSubmitting}>
                  {wholesaleSubmitting ? 'Submitting...' : 'Submit Wholesale Enquiry ->'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

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
