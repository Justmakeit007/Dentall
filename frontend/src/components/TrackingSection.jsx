import { useEffect, useState } from "react";

/* ─── TRACKING COMPONENT ──────────────────────────────────────── */
export default function TrackingSection() {
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
