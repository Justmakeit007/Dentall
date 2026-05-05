// ============================================================
//  DENTALL — server.js
//  Fixed version: orderId field, mock Shiprocket, full flow
// ============================================================

const express  = require('express');
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const nodemailer = require('nodemailer');
const mysql    = require('mysql2/promise');
const axios    = require('axios');
const cors     = require('cors');
const path     = require('path');
// ADD near the top with your other requires:
const PDFDocument = require('pdfkit');
require('dotenv').config();

const app = express();


// ── Webhook route must use raw body BEFORE json middleware ──
app.post(
  '/api/razorpay-webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const signature   = req.headers['x-razorpay-signature'];
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret')
      .update(req.body)
      .digest('hex');

    if (signature === expectedSig) {
      const event = JSON.parse(req.body);
      console.log('✅ Webhook received:', event.event);
      // Optionally update order status here as a backup safety net
    }
    res.json({ received: true });
  }
);

app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',   // ← add Vite's default port
    'http://localhost:5174',   // ← add fallback Vite port
    'https://yourdomain.com',
  ],
  credentials: true,
}));

// Serve React build in production
app.use(express.static(path.join(__dirname, '../dist')));

// ── MySQL connection pool ──────────────────────────────────
const db = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || '',
  database: process.env.DB_NAME     || 'dentall_db',
  waitForConnections: true,
  connectionLimit:    10,
});

// Test DB connection on startup
db.getConnection()
  .then(conn => { console.log('✅ MySQL connected'); conn.release(); })
  .catch(err  => console.error('❌ MySQL connection failed:', err.message));

// ── Razorpay instance ──────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===========================================================
//  ENVIRONMENT FLAG
//  Set USE_MOCK_SHIPROCKET=true in .env while testing locally.
//  Remove it (or set false) once you have real Shiprocket creds.
// ===========================================================
// const USE_MOCK = process.env.USE_MOCK_SHIPROCKET === 'true';
const USE_MOCK = true;

// ── Shiprocket token cache ─────────────────────────────────
let shiprocketToken  = null;
let tokenExpiry      = 0;

async function getShiprocketToken() {
  if (shiprocketToken && Date.now() < tokenExpiry) return shiprocketToken;
  const { data } = await axios.post(
    'https://apiv2.shiprocket.in/v1/external/auth/login',
    {
      email:    process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }
  );
  shiprocketToken = data.token;
  tokenExpiry     = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days
  return shiprocketToken;
}

// ── Mock Shiprocket helpers ────────────────────────────────
function mockShippingCost() {
  return {
    shipping_charge:     50,
    courier_name:        'DTDC Express (TEST)',
    estimated_delivery:  '3-5',
  };
}

function mockShiprocketOrder(orderId) {
  return {
    awb_code:    `TEST-AWB-${orderId}-${Date.now()}`,
    shipment_id: `SHIP-${orderId}`,
  };
}

function mockTrackingData(awbNumber) {
  return {
    shipment_status: 'IN TRANSIT',
    awb_code:        awbNumber,
    order_id:        awbNumber,
    etd:             'Within 3-5 business days',
    tracking_data: [
      {
        activity: 'Shipment picked up from seller',
        date:     new Date().toLocaleDateString('en-IN'),
        location: 'Puducherry Facility',
      },
      {
        activity: 'In transit to Chennai hub',
        date:     new Date().toLocaleDateString('en-IN'),
        location: 'Chennai Hub',
      },
      {
        activity: 'Out for delivery',
        date:     new Date().toLocaleDateString('en-IN'),
        location: 'Local Delivery Centre',
      },
    ],
  };
}

// ===========================================================
//  ROUTE 1 — GET LIVE SHIPPING COST
// ===========================================================
app.post('/api/shipping-cost', async (req, res) => {
  const { pincode, weight } = req.body;

  if (!pincode || String(pincode).length !== 6) {
    return res.status(400).json({ error: 'Valid 6-digit pincode required' });
  }

  // ── MOCK MODE ──
  if (USE_MOCK) {
    console.log(`[MOCK] Shipping cost for pincode ${pincode}`);
    return res.json(mockShippingCost());
  }

  // ── REAL SHIPROCKET ──
  try {
    const token      = await getShiprocketToken();
    const { data }   = await axios.get(
      'https://apiv2.shiprocket.in/v1/external/courier/serviceability/',
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          pickup_postcode:   process.env.YOUR_PINCODE || '605001',
          delivery_postcode: pincode,
          weight:            weight || 0.5,
          cod:               0,
        },
      }
    );
    const companies = data.data?.available_courier_companies || [];
    // Sort by rate ascending, pick cheapest
    companies.sort((a, b) => (a.rate || 0) - (b.rate || 0));
    const cheapest = companies[0];

    res.json({
      shipping_charge:    cheapest?.rate              || 0,
      courier_name:       cheapest?.courier_name      || 'Standard',
      estimated_delivery: cheapest?.estimated_delivery_days || '5-7',
    });
  } catch (e) {
    console.error('Shiprocket serviceability error:', e.response?.data || e.message);
    res.status(500).json({ error: 'Could not fetch shipping rates', details: e.message });
  }
});

// ===========================================================
//  ROUTE 2 — CREATE RAZORPAY ORDER
//  FIX: returns 'orderId' (not 'id') so frontend matches
// ===========================================================
app.post('/api/create-order', async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount < 100) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const order = await razorpay.orders.create({
      amount:   Math.round(amount), // paise, must be integer
      currency: 'INR',
      receipt:  `dnt_${Date.now()}`,
    });

    console.log('✅ Razorpay order created:', order.id, '| Amount:', order.amount);

    // ── KEY FIX: return 'orderId' so App.js destructuring works ──
    res.json({
      orderId: order.id,      // ← was 'id', now 'orderId'
      amount:  order.amount,
    });
  } catch (e) {
    console.error('Razorpay order creation failed:', e);
    res.status(500).json({ error: e.message });
  }
});
async function generateReceiptPDF(customer, orderData) {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data',  chunk => chunks.push(chunk));
    doc.on('end',   ()    => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Header ──
    doc.rect(0, 0, 612, 100).fill('#FF5C00');
    doc.fillColor('#ffffff')
       .font('Helvetica-Bold')
       .fontSize(28)
       .text('DENTALL', 50, 30);
    doc.fontSize(10)
       .font('Helvetica')
       .text('Professional Dental Care', 50, 65);
    doc.fillColor('#ffffff')
       .fontSize(10)
       .text('RECEIPT', 490, 45, { align: 'right' });

    // ── Order Info Box ──
    doc.rect(50, 120, 512, 80).fill('#FFF3E8');
    doc.fillColor('#FF5C00')
       .font('Helvetica-Bold')
       .fontSize(11)
       .text(`Order ID: DNT-${orderData.orderId}`, 65, 135);
    doc.fillColor('#4A2C10')
       .font('Helvetica')
       .fontSize(10)
       .text(`Payment ID: ${orderData.razorpay_payment_id}`, 65, 153)
       .text(`Date: ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`, 65, 170)
       .text(`AWB: ${orderData.awb?.awb_code || 'Processing'}`, 300, 153);

    // ── Customer Details ──
    doc.fillColor('#1C0D02')
       .font('Helvetica-Bold')
       .fontSize(12)
       .text('Bill To:', 50, 220);
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#4A2C10')
       .text(customer.name,    50, 238)
       .text(customer.email,   50, 253)
       .text(customer.phone,   50, 268)
       .text(customer.address, 50, 283)
       .text(`${customer.city || ''} - ${customer.pincode || ''}`, 50, 298)
       .text(`${customer.state || ''}, India`, 50, 313);

    // ── Items Table Header ──
    doc.rect(50, 340, 512, 25).fill('#3B1A08');
    doc.fillColor('#ffffff')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('Item',     65,  349)
       .text('Qty',      380, 349)
       .text('Price',    430, 349)
       .text('Total',    490, 349);

    // ── Items Rows ──
    let y = 375;
    orderData.cartItems.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(50, y - 5, 512, 22).fill('#FFF6EA');
      doc.fillColor('#1C0D02')
         .font('Helvetica')
         .fontSize(10)
         .text(item.name,                          65,  y)
         .text(String(item.qty),                   385, y)
         .text(`Rs.${item.price.toLocaleString('en-IN')}`,  430, y)
         .text(`Rs.${(item.price * item.qty).toLocaleString('en-IN')}`, 485, y);
      y += 25;
    });

    // ── Totals ──
    y += 10;
    doc.moveTo(50, y).lineTo(562, y).strokeColor('#E8D5B0').lineWidth(1).stroke();
    y += 15;
    doc.fillColor('#4A2C10').font('Helvetica').fontSize(10)
       .text('Shipping:', 400, y)
       .text(orderData.shippingCharge === 0 ? 'FREE' : `Rs.${orderData.shippingCharge}`, 490, y);
    y += 20;
    doc.rect(380, y - 5, 182, 28).fill('#FF5C00');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(13)
       .text('TOTAL:', 390, y + 2)
       .text(`Rs.${orderData.totalAmount.toLocaleString('en-IN')}`, 455, y + 2);

    // ── Footer ──
    doc.rect(0, 750, 612, 92).fill('#F5EDDC');
    doc.fillColor('#8A6040').font('Helvetica').fontSize(9)
       .text('Thank you for choosing DENTALL!', 50, 762, { align: 'center', width: 512 })
       .text('Replace your brush every 4 months for best results.', 50, 777, { align: 'center', width: 512 })
       .text('Questions? support@dentall.in', 50, 792, { align: 'center', width: 512 })
       .text('© 2025 DENTALL. All rights reserved.', 50, 807, { align: 'center', width: 512 });

    doc.end();
  });
}
async function sendReceiptEmail(customer, orderData) {
  if (!customer.email || !customer.email.includes('@')) {
    console.log('⚠️  Skipping email — no valid recipient');
    return;
  }

  const pdfBuffer = await generateReceiptPDF(customer, orderData);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from:    `DENTALL 🦷 <${process.env.EMAIL_FROM}>`,
    to:      customer.email,
    subject: `✅ Your DENTALL Order #DNT-${orderData.orderId} — Receipt Enclosed`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#3B1A08,#FF5C00);padding:2rem;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:1.8rem">DENTALL 🦷</h1>
        <p style="color:rgba(255,255,255,.8);margin:.3rem 0 0">Order Confirmed!</p>
      </div>
      <div style="padding:2rem;background:#FFFBF5;border:1px solid #E8D5B0">
        <h2 style="color:#FF5C00">Hi ${customer.name}! 🎉</h2>
        <p style="color:#4A2C10;line-height:1.7">
          Your payment of <strong>₹${orderData.totalAmount.toLocaleString('en-IN')}</strong> 
          was successful. Your DENTALL brushes will be shipped within 24 hours.
        </p>
        <div style="background:#FFF3E8;border-left:4px solid #FF5C00;padding:1rem;margin:1.5rem 0;border-radius:4px">
          <p style="margin:0;color:#FF5C00;font-weight:700">Order ID: DNT-${orderData.orderId}</p>
          <p style="margin:.3rem 0 0;color:#4A2C10;font-size:.9rem">AWB: ${orderData.awb?.awb_code || 'Will be updated soon'}</p>
        </div>
        <p style="color:#8A6040;font-size:.85rem">
          📎 Your PDF receipt is attached to this email.<br>
          📦 Track your order on our website using your Order ID.
        </p>
      </div>
      <div style="background:#F5EDDC;padding:1rem;text-align:center;border-radius:0 0 12px 12px;font-size:.75rem;color:#8A6040">
        © 2025 DENTALL — support@dentall.in
      </div>
    </div>`,
    attachments: [{
      filename:    `DENTALL-Receipt-DNT-${orderData.orderId}.pdf`,
      content:     pdfBuffer,
      contentType: 'application/pdf',
    }],
  });

  console.log(`✅ PDF receipt emailed to ${customer.email}`);
}

// ===========================================================
//  ROUTE 3 — VERIFY PAYMENT + SAVE DB + SHIP + EMAIL
// ===========================================================
app.post('/api/verify-payment', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    customerDetails,
    cartItems,
    totalAmount,
    shippingCharge,
  } = req.body;

  // ── 1. Verify Razorpay signature ──────────────────────────
  const body        = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    console.error('❌ Signature mismatch');
    return res.status(400).json({ error: 'Invalid payment signature' });
  }
  console.log('✅ Payment signature verified');

  // ── 2. Save order to MySQL ────────────────────────────────
  let orderId;
  try {
    const [result] = await db.execute(
      `INSERT INTO orders
       (razorpay_order_id, razorpay_payment_id,
        customer_name, customer_email, customer_phone,
        customer_address, customer_city, customer_state, customer_pincode,
        items_json, subtotal, shipping_charge, total,
        status, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
      [
        razorpay_order_id,
        razorpay_payment_id,
        customerDetails.name,
        customerDetails.email,
        customerDetails.phone,
        customerDetails.address,
        customerDetails.city    || '',
        customerDetails.state   || '',
        customerDetails.pincode || '',
        JSON.stringify(cartItems),
        totalAmount - shippingCharge,
        shippingCharge,
        totalAmount,
        'paid',
      ]
    );
    orderId = result.insertId;
    console.log('✅ Order saved to DB, ID:', orderId);
  } catch (dbErr) {
    console.error('❌ DB insert failed:', dbErr.message);
    return res.status(500).json({ error: 'DB save failed', details: dbErr.message });
  }

  // ── 3. Create shipment on Shiprocket ─────────────────────
  let awb;
  try {
    awb = USE_MOCK
      ? mockShiprocketOrder(orderId)
      : await createShiprocketOrder({ orderId, customerDetails, cartItems, totalAmount });

    // Save AWB back to DB
    await db.execute(
      `UPDATE orders SET awb_number = ?, shiprocket_order_id = ? WHERE id = ?`,
      [awb.awb_code, awb.shipment_id, orderId]
    );
    console.log('✅ Shipment created, AWB:', awb.awb_code);
  } catch (shipErr) {
    console.error('⚠️  Shiprocket failed (order still saved):', shipErr.message);
    awb = { awb_code: `PENDING-${orderId}`, shipment_id: null };
  }

  // ── 4. Send receipt email ─────────────────────────────────
  try {
    await sendReceiptEmail(
      customerDetails,
      {
        orderId,
        razorpay_payment_id,
        cartItems,
        totalAmount,
        shippingCharge,
        awb,
      }
    );
  } catch (mailErr) {
    console.error('⚠️  Email failed (non-fatal):', mailErr.message);
  }

  res.json({ success: true, orderId, awb: awb.awb_code });
});

// ===========================================================
//  ROUTE 4 — TRACK SHIPMENT
// ===========================================================
app.get('/api/track/:orderId', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT awb_number, status, customer_name, created_at FROM orders WHERE id = ?',
      [req.params.orderId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { awb_number, status, customer_name, created_at } = rows[0];

    // ── MOCK MODE ──
    if (USE_MOCK || !awb_number || awb_number.startsWith('TEST-') || awb_number.startsWith('PENDING-')) {
      console.log(`[MOCK] Tracking for order ${req.params.orderId}, AWB: ${awb_number}`);
      return res.json({
        ...mockTrackingData(awb_number || req.params.orderId),
        order_id:      req.params.orderId,
        customer_name,
        order_date:    created_at,
      });
    }

    // ── REAL SHIPROCKET ──
    const token    = await getShiprocketToken();
    const { data } = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb_number}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json({
      ...data.tracking_data,
      order_id:      req.params.orderId,
      customer_name,
      order_date:    created_at,
    });
  } catch (e) {
    console.error('Tracking error:', e.response?.data || e.message);
    res.status(500).json({ error: e.message });
  }
});

// ===========================================================
//  ROUTE 5 — GET ALL ORDERS (simple admin check)
// ===========================================================
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, customer_name, customer_email, total, status,
              awb_number, created_at
       FROM orders ORDER BY created_at DESC LIMIT 50`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===========================================================
//  HELPERS
// ===========================================================
async function createShiprocketOrder({ orderId, customerDetails, cartItems, totalAmount }) {
  const token = await getShiprocketToken();
  const items = cartItems.map(i => ({
    name:          i.name,
    sku:           i.id,
    units:         i.qty,
    selling_price: i.price,
    discount:      0,
    tax:           0,
    hsn:           0,
  }));

  const { data } = await axios.post(
    'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
    {
      order_id:              `DNT-${orderId}`,
      order_date:            new Date().toISOString().slice(0, 19).replace('T', ' '),
      pickup_location:       'Primary',
      billing_customer_name: customerDetails.name,
      billing_address:       customerDetails.address,
      billing_city:          customerDetails.city    || '',
      billing_pincode:       customerDetails.pincode || '',
      billing_state:         customerDetails.state   || '',
      billing_country:       'India',
      billing_email:         customerDetails.email,
      billing_phone:         customerDetails.phone,
      shipping_is_billing:   true,
      order_items:           items,
      payment_method:        'Prepaid',
      sub_total:             totalAmount,
      length:  20,
      breadth: 10,
      height:  5,
      weight:  0.5,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!data.awb_code) {
    throw new Error('Shiprocket did not return AWB code: ' + JSON.stringify(data));
  }
  return { awb_code: data.awb_code, shipment_id: data.shipment_id };
}


// async function sendReceiptEmail(customer, orderData) {
//   if (!customer.email || !customer.email.includes('@')) {
//     console.log('⚠️  Skipping email — no valid recipient address');
//     return;
//   }
//   const isDev     = process.env.NODE_ENV !== 'production';
//   const transport = isDev
//     ? { service: 'gmail', auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASS } }
//     : { host: 'smtp.hostinger.com', port: 465, secure: true, auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASS } };

//   const transporter = nodemailer.createTransport(transport);

//   const itemsHtml = orderData.cartItems.map(i =>
//     `<tr>
//        <td style="padding:8px;border:1px solid #e8d5b0">${i.name}</td>
//        <td style="padding:8px;border:1px solid #e8d5b0;text-align:center">×${i.qty}</td>
//        <td style="padding:8px;border:1px solid #e8d5b0;text-align:right">₹${(i.price * i.qty).toLocaleString('en-IN')}</td>
//      </tr>`
//   ).join('');

//   const trackUrl = isDev
//     ? `http://localhost:3000?order=${orderData.orderId}`
//     : `https://yourdomain.com?order=${orderData.orderId}`;

//   await transporter.sendMail({
//     from:    `DENTALL 🦷 <${process.env.EMAIL_FROM}>`,
//     to:      customer.email,
//     subject: `✅ Your DENTALL order #DNT-${orderData.orderId} is confirmed!`,
//     html: `
//     <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#FFFBF5;border-radius:12px;overflow:hidden;border:1px solid #E8D5B0">
//       <!-- Header -->
//       <div style="background:linear-gradient(135deg,#3B1A08,#FF5C00,#7C3AED);padding:2rem;text-align:center">
//         <div style="font-family:Georgia,serif;font-size:1.8rem;font-weight:900;color:#fff;letter-spacing:.1em">DENTALL</div>
//         <div style="color:rgba(255,255,255,.75);font-size:.85rem;margin-top:.3rem">Professional Dental Care</div>
//       </div>

//       <!-- Body -->
//       <div style="padding:2rem">
//         <h2 style="color:#FF5C00;font-family:Georgia,serif;margin-bottom:.5rem">Order Confirmed! 🎉</h2>
//         <p style="color:#4A2C10;line-height:1.7">Hi <strong>${customer.name}</strong>, your payment was successful and your DENTALL brushes are on their way!</p>

//         <!-- Order Details Box -->
//         <div style="background:#FFF3E8;border:1px solid rgba(255,92,0,.2);border-radius:8px;padding:1rem 1.2rem;margin:1.5rem 0">
//           <div style="display:flex;justify-content:space-between;margin-bottom:.4rem">
//             <span style="font-size:.75rem;color:#8A6040;text-transform:uppercase;letter-spacing:.1em">Order ID</span>
//             <strong style="color:#FF5C00">DNT-${orderData.orderId}</strong>
//           </div>
//           <div style="display:flex;justify-content:space-between;margin-bottom:.4rem">
//             <span style="font-size:.75rem;color:#8A6040;text-transform:uppercase;letter-spacing:.1em">Payment ID</span>
//             <strong style="color:#4A2C10;font-size:.82rem">${orderData.razorpay_payment_id}</strong>
//           </div>
//           <div style="display:flex;justify-content:space-between">
//             <span style="font-size:.75rem;color:#8A6040;text-transform:uppercase;letter-spacing:.1em">AWB / Tracking</span>
//             <strong style="color:#00D4B4">${orderData.awb.awb_code}</strong>
//           </div>
//         </div>

//         <!-- Items Table -->
//         <table style="width:100%;border-collapse:collapse;margin-bottom:1rem">
//           <thead>
//             <tr style="background:#F5EDDC">
//               <th style="padding:8px;border:1px solid #e8d5b0;text-align:left;font-size:.75rem;color:#8A6040;text-transform:uppercase">Item</th>
//               <th style="padding:8px;border:1px solid #e8d5b0;text-align:center;font-size:.75rem;color:#8A6040;text-transform:uppercase">Qty</th>
//               <th style="padding:8px;border:1px solid #e8d5b0;text-align:right;font-size:.75rem;color:#8A6040;text-transform:uppercase">Price</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${itemsHtml}
//             <tr>
//               <td colspan="2" style="padding:8px;border:1px solid #e8d5b0;color:#8A6040">Shipping</td>
//               <td style="padding:8px;border:1px solid #e8d5b0;text-align:right;color:#00D4B4;font-weight:600">
//                 ${orderData.shippingCharge === 0 ? 'FREE' : `₹${orderData.shippingCharge}`}
//               </td>
//             </tr>
//             <tr style="background:#FFF3E8">
//               <td colspan="2" style="padding:8px;border:1px solid #e8d5b0;font-weight:700;color:#1C0D02">Total</td>
//               <td style="padding:8px;border:1px solid #e8d5b0;text-align:right;font-weight:900;color:#FF5C00;font-size:1rem">
//                 ₹${orderData.totalAmount.toLocaleString('en-IN')}
//               </td>
//             </tr>
//           </tbody>
//         </table>

//         <!-- Delivery Address -->
//         <div style="background:#F0FDF9;border:1px solid rgba(0,212,180,.2);border-radius:8px;padding:1rem;margin-bottom:1.5rem">
//           <div style="font-size:.7rem;color:#8A6040;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.4rem">Delivery Address</div>
//           <div style="color:#1C0D02;font-size:.85rem;line-height:1.6">
//             ${customer.name}<br>
//             ${customer.address}<br>
//             ${customer.city || ''} ${customer.pincode || ''}<br>
//             ${customer.state || ''}, India
//           </div>
//         </div>

//         <!-- Track Button -->
//         <div style="text-align:center;margin:1.5rem 0">
//           <a href="${trackUrl}" style="background:linear-gradient(135deg,#FF5C00,#7C3AED);color:#fff;text-decoration:none;padding:.9rem 2.5rem;border-radius:30px;font-weight:700;font-size:.85rem;letter-spacing:.08em;text-transform:uppercase;display:inline-block">
//             📦 Track My Order →
//           </a>
//         </div>

//         <p style="color:#8A6040;font-size:.78rem;line-height:1.7;text-align:center">
//           Your package will be picked up within 24 hours and delivered in 3–7 business days.<br>
//           Questions? Reply to this email or contact us at support@dentall.in
//         </p>
//       </div>

//       <!-- Footer -->
//       <div style="background:#F5EDDC;padding:1rem 2rem;text-align:center;font-size:.7rem;color:#8A6040">
//         © 2025 DENTALL — Professional Dental Care. All rights reserved.
//       </div>
//     </div>`,
//   });
// }
// ── Visitor lead capture ──
app.post('/api/capture-lead', async (req, res) => {
  const { name, email, phone } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  // Save to DB
  try {
    await db.execute(
      `INSERT IGNORE INTO leads (name, email, phone, created_at) VALUES (?,?,?,NOW())`,
      [name || '', email, phone || '']
    );
  } catch(e) {
    console.error('Lead DB save failed:', e.message);
  }

  // Send offer email
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from:    `DENTALL 🦷 <${process.env.EMAIL_FROM}>`,
      to:      email,
      subject: '🦷 Special Offer Just for You — 10% Off Your First DENTALL Order!',
      html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#3B1A08,#FF5C00,#7C3AED);padding:2.5rem;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:2rem">DENTALL 🦷</h1>
          <p style="color:rgba(255,255,255,.85);margin:.5rem 0 0;font-size:1rem">Professional Dental Care</p>
        </div>
        <div style="padding:2.5rem;background:#FFFBF5;border:1px solid #E8D5B0">
          <h2 style="color:#FF5C00;margin-top:0">Hi${name ? ' ' + name : ''}! Welcome 👋</h2>
          <p style="color:#4A2C10;line-height:1.8;font-size:.95rem">
            Thanks for visiting DENTALL. We noticed you're interested in better oral care — 
            and we'd love to help you get started.
          </p>

          <!-- Offer Box -->
          <div style="background:linear-gradient(135deg,#FF5C00,#7C3AED);border-radius:12px;padding:2rem;text-align:center;margin:1.5rem 0">
            <p style="color:rgba(255,255,255,.8);margin:0;font-size:.85rem;text-transform:uppercase;letter-spacing:.1em">Exclusive Welcome Offer</p>
            <h2 style="color:#fff;font-size:3rem;margin:.3rem 0">10% OFF</h2>
            <p style="color:rgba(255,255,255,.9);margin:0 0 1rem">on your first order</p>
            <div style="background:#fff;border-radius:8px;padding:.8rem 1.5rem;display:inline-block">
              <span style="color:#FF5C00;font-weight:900;font-size:1.2rem;letter-spacing:.1em">WELCOME10</span>
            </div>
          </div>

          <!-- Products -->
          <h3 style="color:#1C0D02">What's in our range:</h3>
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:.8rem;background:#FFF3E8;border-radius:8px;margin-bottom:.5rem">
                <strong style="color:#FF5C00">🪥 Single Brush</strong><br>
                <span style="color:#4A2C10;font-size:.88rem">Perfect for trying DENTALL</span><br>
                <strong style="color:#1C0D02">₹599</strong> <span style="color:#00D4B4;font-weight:700">→ ₹539 with code</span>
              </td>
            </tr>
            <tr><td style="height:.5rem"></td></tr>
            <tr>
              <td style="padding:.8rem;background:#FFF3E8;border-radius:8px">
                <strong style="color:#FF5C00">🦷 Family Pack (12 brushes)</strong><br>
                <span style="color:#4A2C10;font-size:.88rem">Full year for a family of 4</span><br>
                <strong style="color:#1C0D02">₹5,990</strong> <span style="color:#00D4B4;font-weight:700">→ ₹5,391 with code</span>
              </td>
            </tr>
          </table>

          <div style="text-align:center;margin:2rem 0">
            <a href="${process.env.SITE_URL || 'http://localhost:5173'}/#order" 
               style="background:linear-gradient(135deg,#FF5C00,#7C3AED);color:#fff;text-decoration:none;padding:1rem 2.5rem;border-radius:30px;font-weight:700;font-size:.9rem;display:inline-block">
              Shop Now →
            </a>
          </div>

          <p style="color:#8A6040;font-size:.78rem;text-align:center;line-height:1.7">
            ⏰ Offer valid for 48 hours only<br>
            🔒 Secure payment via Razorpay<br>
            🚚 Free shipping on family pack
          </p>
        </div>
        <div style="background:#F5EDDC;padding:1rem;text-align:center;font-size:.72rem;color:#8A6040;border-radius:0 0 12px 12px">
          © 2025 DENTALL — support@dentall.in<br>
          <a href="#" style="color:#8A6040">Unsubscribe</a>
        </div>
      </div>`,
    });

    console.log(`✅ Offer email sent to ${email}`);
    res.json({ success: true });
  } catch(e) {
    console.error('Offer email failed:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Catch-all: serve React app for any non-API route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🚀 DENTALL server running on http://localhost:${PORT}`);
  console.log(`   Mode: ${USE_MOCK ? '🧪 MOCK Shiprocket' : '🚀 REAL Shiprocket'}`);
  console.log(`   ENV:  ${process.env.NODE_ENV || 'development'}\n`);
});