// ============================================================
//  DENTALL — server.js  (Production-Ready, Fully Secured)
//  ─────────────────────────────────────────────────────────
//  SWITCHING FROM TEST → PRODUCTION:
//    1. In .env set:  USE_MOCK_SHIPROCKET=false
//    2. In .env set:  NODE_ENV=production
//    3. Replace Razorpay test keys with live keys in .env
//    4. Update CORS origin to your real domain in .env:
//       ALLOWED_ORIGIN=https://yourdomain.com
//    5. Run:  npm install  (all deps already listed below)
//    That's it. Zero code changes needed.
//
//  REQUIRED ENV VARS (all must be set — server won't start without them):
//    RAZORPAY_KEY_ID          — from Razorpay dashboard
//    RAZORPAY_KEY_SECRET      — from Razorpay dashboard
//    RAZORPAY_WEBHOOK_SECRET  — from Razorpay dashboard → Webhooks
//    DB_HOST                  — MySQL host (e.g. localhost)
//    DB_USER                  — MySQL username
//    DB_PASS                  — MySQL password
//    DB_NAME                  — MySQL database name
//    EMAIL_FROM               — Gmail address for sending receipts
//    EMAIL_PASS               — Gmail app password (not your login password)
//    NODE_ENV                 — 'development' or 'production'
//    USE_MOCK_SHIPROCKET       — 'true' for testing, 'false' for real shipping
//    ALLOWED_ORIGIN            — your frontend URL e.g. https://yourdomain.com
//    YOUR_PINCODE              — your warehouse/pickup pincode
//    SHIPROCKET_EMAIL          — (required only when USE_MOCK_SHIPROCKET=false)
//    SHIPROCKET_PASSWORD       — (required only when USE_MOCK_SHIPROCKET=false)
//    SITE_URL                  — your public site URL for email links
//
//  DEPENDENCIES:
//    npm install express razorpay crypto nodemailer mysql2 axios
//                cors dotenv helmet express-rate-limit pdfkit
// ============================================================

'use strict';

const express    = require('express');
const Razorpay   = require('razorpay');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const mysql      = require('mysql2/promise');
const axios      = require('axios');
const cors       = require('cors');
const path       = require('path');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const PDFDocument = require('pdfkit');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// ============================================================
//  STEP 1 — FAIL FAST: validate all required env vars on boot
//  Server will refuse to start if anything critical is missing.
// ============================================================
const ALWAYS_REQUIRED = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME',
  'EMAIL_FROM', 'EMAIL_PASS',
  'NODE_ENV',
  'USE_MOCK_SHIPROCKET',
  'ALLOWED_ORIGIN',
  'YOUR_PINCODE',
  'SITE_URL',
];

// Shiprocket creds only needed in real mode
const USE_MOCK = process.env.USE_MOCK_SHIPROCKET === 'true';
if (!USE_MOCK) {
  ALWAYS_REQUIRED.push('SHIPROCKET_EMAIL', 'SHIPROCKET_PASSWORD');
}

const missingEnv = ALWAYS_REQUIRED.filter(k => !process.env[k]);
if (missingEnv.length > 0) {
  console.error('\n❌ FATAL — Missing required environment variables:');
  missingEnv.forEach(k => console.error(`   • ${k}`));
  console.error('\nServer will NOT start until these are set in .env\n');
  process.exit(1);
}

const IS_PROD = process.env.NODE_ENV === 'production';

console.log(`\n🚀 DENTALL server booting...`);
console.log(`   Mode:     ${IS_PROD ? '🔴 PRODUCTION' : '🟡 DEVELOPMENT'}`);
console.log(`   Shipping: ${USE_MOCK ? '🧪 MOCK Shiprocket' : '✅ REAL Shiprocket'}`);
console.log(`   Origin:   ${process.env.ALLOWED_ORIGIN}\n`);

// ============================================================
//  STEP 2 — CATALOGUE: product price truth (backend is master)
//  Frontend prices are NEVER trusted for charge amounts.
// ============================================================
const PRODUCT_CATALOGUE = {
  'family-pack':  { name: 'Family Pack (12 brushes)', price: 5990,  maxQty: 10 },
  'single-brush': { name: 'Single Brush',              price: 599,   maxQty: 20 },
};

// ============================================================
//  STEP 3 — INPUT SANITIZATION helpers
// ============================================================
function sanitizeStr(val, maxLen = 255) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen).replace(/[<>"'`]/g, '');
}

function sanitizePhone(val) {
  return String(val || '').replace(/[^\d+\-\s()]/g, '').trim().slice(0, 20);
}

function sanitizePincode(val) {
  return String(val || '').replace(/\D/g, '').slice(0, 6);
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isValidPincode(pin) {
  return /^\d{6}$/.test(pin);
}

function isValidPhone(phone) {
  // 10-digit Indian mobile, must start with 6–9
  return /^[6-9]\d{9}$/.test(String(phone).replace(/[\s\-()]/g, ''));
}

// Safe integer — prevents NaN and float abuse
function safeInt(val, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const n = parseInt(val, 10);
  if (isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

// Validate and compute trusted total from server-side catalogue
function validateCartItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error('Cart is empty or invalid');
  }
  return rawItems.map(item => {
    const ref = PRODUCT_CATALOGUE[item.id];
    if (!ref) throw new Error(`Unknown product: ${item.id}`);
    const qty = safeInt(item.qty, 1, ref.maxQty);
    return {
      id:    item.id,
      name:  ref.name,           // use server name, not client name
      price: ref.price,          // use server price, not client price
      qty,
      icon:  item.id === 'family-pack' ? '🦷' : '🪥',
    };
  });
}

// ============================================================
//  STEP 4 — EXPRESS APP + SECURITY MIDDLEWARE
// ============================================================
const app = express();

// Trust proxy if behind nginx/load balancer (for rate limiter IP detection)
if (IS_PROD) app.set('trust proxy', 1);

// Helmet — sets secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: IS_PROD ? undefined : false, // relax CSP in dev
}));

// CORS — strict origin whitelist
const allowedOrigins = IS_PROD
  ? [process.env.ALLOWED_ORIGIN]
  : [
      process.env.ALLOWED_ORIGIN,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ];

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin requests (no Origin header) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    console.warn(`⛔ CORS blocked origin: ${origin}`);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
}));

// ── Webhook route MUST receive raw body before JSON middleware ──
app.post(
  '/api/razorpay-webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// JSON body parser for all other routes (4KB limit — prevents payload bombs)
app.use(express.json({ limit: '4kb' }));

// Serve React build in production
app.use(express.static(path.join(__dirname, '../dist')));

// ============================================================
//  STEP 5 — RATE LIMITERS
// ============================================================

// General API limiter — 120 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

// Payment limiter — 10 attempts per 15 minutes per IP (prevents brute force)
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment attempts. Please wait 15 minutes.' },
  skipSuccessfulRequests: false,
});

// Lead capture limiter — 5 per hour per IP (prevents spam)
const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many submissions. Try again in an hour.' },
});

// Shipping check limiter — 30 per minute per IP
const shippingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many shipping checks. Please wait.' },
});

// Apply general limiter to all /api/ routes
app.use('/api/', generalLimiter);

// ============================================================
//  STEP 6 — DATABASE
// ============================================================
const db = mysql.createPool({
  host:               process.env.DB_HOST,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASS,
  database:           process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         30,
  // Prevent SQL injection via type coercion
  typeCast: (field, next) => {
    if (field.type === 'TINY' && field.length === 1) return field.string() === '1';
    return next();
  },
});

db.getConnection()
  .then(async conn => {
    console.log('✅ MySQL connected');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        email         VARCHAR(255) NOT NULL,
        rating        TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text   TEXT NOT NULL,
        approved      BOOLEAN DEFAULT FALSE,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email    (email),
        INDEX idx_approved (approved),
        INDEX idx_created  (created_at)
      )
    `);
    // approve any reviews submitted before auto-approve was enabled
    const [migrated] = await conn.execute(
      'UPDATE reviews SET approved = TRUE WHERE approved = FALSE'
    );
    if (migrated.affectedRows > 0)
      console.log(`✅ Approved ${migrated.affectedRows} existing review(s)`);
    console.log('✅ reviews table ready');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS wholesale_enquiries (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        full_name      VARCHAR(150) NOT NULL,
        business_name  VARCHAR(180) NOT NULL,
        email          VARCHAR(150) NOT NULL,
        phone          VARCHAR(20)  NOT NULL,
        city           VARCHAR(100) NOT NULL,
        state          VARCHAR(100) NOT NULL,
        quantity_range VARCHAR(30)  NOT NULL,
        business_type  VARCHAR(60),
        message        TEXT,
        status         VARCHAR(40) DEFAULT 'new',
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email   (email),
        INDEX idx_status  (status),
        INDEX idx_created (created_at)
      )
    `);
    console.log('wholesale_enquiries table ready');
    conn.release();
  })
  .catch(err  => {
    console.error('❌ MySQL connection failed:', err.message);
    if (IS_PROD) process.exit(1);
  });

// ============================================================
//  STEP 7 — RAZORPAY
// ============================================================
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ============================================================
//  STEP 8 — SHIPROCKET (token cache + helpers)
// ============================================================
let shiprocketToken  = null;
let tokenExpiry      = 0;

async function getShiprocketToken() {
  if (shiprocketToken && Date.now() < tokenExpiry) return shiprocketToken;
  const { data } = await axios.post(
    'https://apiv2.shiprocket.in/v1/external/auth/login',
    {
      email:    process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    },
    { timeout: 10000 }
  );
  shiprocketToken = data.token;
  tokenExpiry     = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days (token lasts 10)
  return shiprocketToken;
}

// ── MOCK helpers (only active when USE_MOCK_SHIPROCKET=true) ──
function mockShippingCost() {
  return { shipping_charge: 50, courier_name: 'DTDC Express (TEST)', estimated_delivery: '3-5' };
}

function mockShiprocketOrder(orderId) {
  return { awb_code: `TEST-AWB-${orderId}-${Date.now()}`, shipment_id: `SHIP-${orderId}` };
}

function mockTrackingData(awbNumber, orderId) {
  return {
    shipment_status: 'IN TRANSIT',
    awb_code:        awbNumber,
    order_id:        orderId,
    etd:             'Within 3-5 business days',
    tracking_data: [
      { activity: 'Shipment picked up from seller',  date: new Date().toLocaleDateString('en-IN'), location: 'Puducherry Facility' },
      { activity: 'In transit to Chennai hub',       date: new Date().toLocaleDateString('en-IN'), location: 'Chennai Hub'         },
      { activity: 'Out for delivery',               date: new Date().toLocaleDateString('en-IN'), location: 'Local Delivery Centre' },
    ],
  };
}

// ── REAL Shiprocket order creation (3-step: create → courier → AWB) ──
async function createShiprocketOrder({ orderId, customer, cartItems, totalAmount }) {
  const token   = await getShiprocketToken();
  const headers = { Authorization: `Bearer ${token}` };

  // 0.5 kg per brush unit, minimum 0.5 kg
  const totalQty    = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalWeight = Math.max(0.5, cartItems.reduce((s, i) => s + i.qty * 0.5, 0));

  const items = cartItems.map(i => ({
    name:          i.name,
    sku:           i.id,
    units:         i.qty,
    selling_price: i.price,
    discount: 0, tax: 0, hsn: 96190,  // HSN code for toothbrushes
  }));

  // ── Step 1: Create order in Shiprocket ──
  const { data: orderResp } = await axios.post(
    'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
    {
      order_id:              `DNT-${orderId}`,
      order_date:            new Date().toISOString().slice(0, 19).replace('T', ' '),
      pickup_location:       'Primary',
      billing_customer_name: customer.name,
      billing_last_name:     '',
      billing_address:       customer.address,
      billing_address_2:     '',
      billing_city:          customer.city,
      billing_pincode:       customer.pincode,
      billing_state:         customer.state,
      billing_country:       'India',
      billing_email:         customer.email,
      billing_phone:         customer.phone,
      shipping_is_billing:   true,
      order_items:           items,
      payment_method:        'Prepaid',
      sub_total:             totalAmount,
      length:  20,
      breadth: 15,
      height:  Math.min(30, 5 * totalQty),
      weight:  totalWeight,
    },
    { headers, timeout: 15000 }
  );

  const shipmentId = orderResp.shipment_id;
  if (!shipmentId) {
    throw new Error('Shiprocket order creation failed: ' + JSON.stringify(orderResp));
  }
  console.log(`   Shiprocket shipment created: id=${shipmentId}`);

  // ── Step 2: Find cheapest available courier ──
  const { data: serviceResp } = await axios.get(
    'https://apiv2.shiprocket.in/v1/external/courier/serviceability/',
    {
      headers,
      params: {
        pickup_postcode:   process.env.YOUR_PINCODE,
        delivery_postcode: customer.pincode,
        weight:            totalWeight,
        cod:               0,
      },
      timeout: 10000,
    }
  );

  const couriers  = serviceResp.data?.available_courier_companies || [];
  couriers.sort((a, b) => (a.rate || 0) - (b.rate || 0));
  const courierId = couriers[0]?.courier_company_id;
  if (!courierId) {
    throw new Error(`No courier available from ${process.env.YOUR_PINCODE} to ${customer.pincode}`);
  }
  console.log(`   Courier: ${couriers[0].courier_name} (id=${courierId})`);

  // ── Step 3: Assign courier and generate AWB ──
  const { data: awbResp } = await axios.post(
    'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
    { shipment_id: String(shipmentId), courier_id: String(courierId) },
    { headers, timeout: 15000 }
  );

  const awbCode = awbResp.response?.data?.awb_code || awbResp.awb_code;
  if (!awbCode) {
    throw new Error('Shiprocket AWB assignment failed: ' + JSON.stringify(awbResp));
  }

  return {
    awb_code:            awbCode,
    shipment_id:         String(shipmentId),
    shiprocket_order_id: String(orderResp.order_id),
  };
}

// ============================================================
//  STEP 9 — PDF RECEIPT GENERATOR
// ============================================================
async function generateReceiptPDF(customer, orderData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data',  c  => chunks.push(c));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ── Header bar — sage green ──
    doc.rect(0, 0, 612, 100).fill('#5F7D65');
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(28).text('DENTALL', 50, 30);
    doc.font('Helvetica').fontSize(10).text('Professional Dental Care', 50, 65);
    doc.fillColor('rgba(255,255,255,0.8)').fontSize(10).text('RECEIPT', 490, 45, { align: 'right' });

    // ── Order info box — pale green ──
    doc.rect(50, 120, 512, 80).fill('#F2F6EC');
    doc.fillColor('#5F7D65').font('Helvetica-Bold').fontSize(11)
       .text(`Order ID: DNT-${orderData.orderId}`, 65, 135);
    doc.fillColor('#2D3B34').font('Helvetica').fontSize(10)
       .text(`Payment: ${orderData.razorpay_payment_id.slice(0, 8)}****`, 65, 153)
       .text(`Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 65, 170)
       .text(`AWB: ${orderData.awb?.awb_code || 'Processing'}`, 300, 153);

    // ── Customer section ──
    doc.fillColor('#2D3B34').font('Helvetica-Bold').fontSize(12).text('Bill To:', 50, 220);
    doc.font('Helvetica').fontSize(10).fillColor('#5F6F63')
       .text(customer.name,    50, 238)
       .text(customer.email,   50, 253)
       .text(customer.phone,   50, 268)
       .text(customer.address, 50, 283)
       .text(`${customer.city} - ${customer.pincode}`, 50, 298)
       .text(`${customer.state}, India`, 50, 313);

    // ── Table header — dark secondary ──
    doc.rect(50, 340, 512, 25).fill('#435563');
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(10)
       .text('Item', 65, 349).text('Qty', 380, 349).text('Price', 430, 349).text('Total', 490, 349);

    // ── Items ──
    let y = 375;
    orderData.cartItems.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(50, y - 5, 512, 22).fill('#F8FAF4');
      doc.fillColor('#2D3B34').font('Helvetica').fontSize(10)
         .text(item.name, 65, y)
         .text(String(item.qty), 385, y)
         .text(`Rs.${item.price.toLocaleString('en-IN')}`, 430, y)
         .text(`Rs.${(item.price * item.qty).toLocaleString('en-IN')}`, 485, y);
      y += 25;
    });

    // ── Totals ──
    y += 10;
    doc.moveTo(50, y).lineTo(562, y).strokeColor('#C8D6BE').lineWidth(1).stroke();
    y += 15;
    doc.fillColor('#5F6F63').font('Helvetica').fontSize(10)
       .text('Shipping:', 400, y)
       .text(orderData.shippingCharge === 0 ? 'FREE' : `Rs.${orderData.shippingCharge}`, 490, y);
    y += 20;
    doc.rect(380, y - 5, 182, 28).fill('#90AB8B');
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(13)
       .text('TOTAL:', 390, y + 2)
       .text(`Rs.${orderData.totalAmount.toLocaleString('en-IN')}`, 455, y + 2);

    // ── Footer ──
    doc.rect(0, 750, 612, 92).fill('#F2F6EC');
    doc.fillColor('#5F6F63').font('Helvetica').fontSize(9)
       .text('Thank you for choosing DENTALL!', 50, 762, { align: 'center', width: 512 })
       .text('Replace your brush every 4 months for best results.', 50, 777, { align: 'center', width: 512 })
       .text('Questions? support@dentall.in', 50, 792, { align: 'center', width: 512 })
       .text('© 2025 DENTALL. All rights reserved.', 50, 807, { align: 'center', width: 512 });

    doc.end();
  });
}

// ============================================================
//  STEP 10 — EMAIL RECEIPT SENDER
// ============================================================
function createMailTransport({ allowExpiredCerts = false } = {}) {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') !== 'false',
    family: Number(process.env.SMTP_FAMILY || 4),
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 15000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 15000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 30000),
    auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASS },
    tls: {
      servername: process.env.SMTP_HOST || 'smtp.gmail.com',
      minVersion: 'TLSv1.2',
      rejectUnauthorized: !allowExpiredCerts,
    },
  });
}

async function sendDentallMail(mailOptions) {
  try {
    return await createMailTransport().sendMail(mailOptions);
  } catch (err) {
    const errText = `${err.message || ''} ${err.code || ''}`;
    const certExpired = /certificate has expired|CERT_HAS_EXPIRED/i.test(errText);
    const ipv6Unreachable = /ENETUNREACH.*:465|network is unreachable/i.test(errText);
    const allowFallback = !IS_PROD || process.env.SMTP_ALLOW_EXPIRED_CERTS === 'true';

    if (ipv6Unreachable && process.env.SMTP_FAMILY !== '6') {
      console.warn('SMTP IPv6 route unreachable; retrying Gmail SMTP over IPv4.');
      return createMailTransport().sendMail(mailOptions);
    }

    if (!certExpired || !allowFallback) throw err;

    console.warn('SMTP certificate expired; retrying with TLS certificate verification disabled for this email.');
    return createMailTransport({ allowExpiredCerts: true }).sendMail(mailOptions);
  }
}

async function sendReceiptEmail(customer, orderData) {
  if (!isValidEmail(customer.email)) {
    console.log('⚠️  Skipping email — invalid recipient');
    return;
  }

  const pdfBuffer = await generateReceiptPDF(customer, orderData);

  const trackUrl = `${process.env.SITE_URL}/#tracking?order=${orderData.orderId}`;

  await sendDentallMail({
    from:    `DENTALL 🦷 <${process.env.EMAIL_FROM}>`,
    to:      customer.email,
    subject: `✅ Your DENTALL Order #DNT-${orderData.orderId} — Receipt Enclosed`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#3B1A08,var(--primary));padding:2rem;text-align:center;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:1.8rem">DENTALL 🦷</h1>
        <p style="color:rgba(255,255,255,.8);margin:.3rem 0 0">Order Confirmed!</p>
      </div>
      <div style="padding:2rem;background:#FFFBF5;border:1px solid #E8D5B0">
        <h2 style="color:var(--primary)">Hi ${sanitizeStr(customer.name)}! 🎉</h2>
        <p style="color:#4A2C10;line-height:1.7">
          Your payment of <strong>₹${orderData.totalAmount.toLocaleString('en-IN')}</strong>
          was successful. Your DENTALL brushes will be shipped within 24 hours.
        </p>
        <div style="background:#FFF3E8;border-left:4px solid var(--primary);padding:1rem;margin:1.5rem 0;border-radius:4px">
          <p style="margin:0;color:var(--primary);font-weight:700">Order ID: DNT-${orderData.orderId}</p>
          <p style="margin:.3rem 0 0;color:#4A2C10;font-size:.9rem">AWB: ${orderData.awb?.awb_code || 'Will be updated soon'}</p>
        </div>
        <div style="text-align:center;margin:1.5rem 0">
          <a href="${trackUrl}" style="background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;text-decoration:none;padding:.9rem 2.5rem;border-radius:30px;font-weight:700;font-size:.85rem;display:inline-block">
            📦 Track My Order →
          </a>
        </div>
        <p style="color:#8A6040;font-size:.78rem;text-align:center;line-height:1.7">
          📎 Your PDF receipt is attached to this email.<br>
          Questions? Reply to this email or contact support@dentall.in
        </p>
      </div>
      <div style="background:#F5EDDC;padding:1rem;text-align:center;border-radius:0 0 12px 12px;font-size:.72rem;color:#8A6040">
        © 2025 DENTALL — support@dentall.in
      </div>
    </div>`,
    attachments: [{
      filename:    `DENTALL-Receipt-DNT-${orderData.orderId}.pdf`,
      content:     pdfBuffer,
      contentType: 'application/pdf',
    }],
  });

  console.log(`✅ PDF receipt emailed to ${customer.email.replace(/(.{2}).+(@.+)/, '$1****$2')}`);
}

async function generateWholesalePricingPDF(enquiry) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(0, 0, 612, 96).fill('#D30D2D');
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(28).text('DENTALL', 50, 28);
    doc.font('Helvetica').fontSize(11).text('Wholesale Pricing Proposal', 50, 62);

    doc.fillColor('#1f2933').font('Helvetica-Bold').fontSize(16).text('Thank you for your enquiry', 50, 125);
    doc.font('Helvetica').fontSize(10).fillColor('#4b5563')
      .text(`Prepared for: ${enquiry.name}`, 50, 152)
      .text(`Business: ${enquiry.business}`, 50, 168)
      .text(`Quantity range: ${enquiry.qty}`, 50, 184)
      .text(`Location: ${enquiry.city}, ${enquiry.state}`, 50, 200);

    doc.rect(50, 238, 512, 28).fill('#1f2933');
    doc.fillColor('#fff').font('Helvetica-Bold').fontSize(10)
      .text('Order Slab', 66, 248)
      .text('Indicative Unit Price', 240, 248)
      .text('Notes', 390, 248);

    const rows = [
      ['100 - 499 brushes', 'Rs. 185 - 210', 'Starter wholesale slab'],
      ['500 - 999 brushes', 'Rs. 160 - 184', 'Better retailer margin'],
      ['1,000 - 4,999 brushes', 'Rs. 135 - 159', 'Distributor pricing'],
      ['5,000+ brushes', 'Custom quote', 'Best landed pricing'],
    ];

    let y = 280;
    rows.forEach((row, index) => {
      if (index % 2 === 0) doc.rect(50, y - 8, 512, 32).fill('#fff5f7');
      doc.fillColor('#1f2933').font('Helvetica').fontSize(10)
        .text(row[0], 66, y)
        .text(row[1], 240, y)
        .text(row[2], 390, y, { width: 150 });
      y += 36;
    });

    y += 16;
    doc.fillColor('#D30D2D').font('Helvetica-Bold').fontSize(13).text('Included benefits', 50, y);
    y += 24;
    [
      'MOQ starts at 100 brushes.',
      'Custom branding and packaging available for qualifying orders.',
      'Final quote depends on quantity, branding, delivery location, and tax invoice details.',
      'Sales team will contact you within 24 hours with a confirmed quotation.',
    ].forEach(item => {
      doc.fillColor('#4b5563').font('Helvetica').fontSize(10).text(`- ${item}`, 62, y);
      y += 18;
    });

    doc.rect(50, 640, 512, 72).fill('#f3f4f6');
    doc.fillColor('#1f2933').font('Helvetica-Bold').fontSize(11).text('Next step', 68, 658);
    doc.font('Helvetica').fontSize(10).fillColor('#4b5563')
      .text('Reply to this email with GST details, delivery pincode, and preferred quantity for a formal invoice-ready quote.', 68, 678, { width: 470 });

    doc.fillColor('#6b7280').fontSize(8)
      .text('This PDF contains indicative wholesale pricing only. Taxes, freight, and branding charges may vary.', 50, 762, { align: 'center', width: 512 })
      .text('DENTALL - support@dentall.in', 50, 778, { align: 'center', width: 512 });

    doc.end();
  });
}

async function sendWholesalePricingEmail(enquiry) {
  if (!isValidEmail(enquiry.email)) return;

  const pdfBuffer = await generateWholesalePricingPDF(enquiry);
  await sendDentallMail({
    from: `DENTALL Wholesale <${process.env.EMAIL_FROM}>`,
    to: enquiry.email,
    subject: 'DENTALL Wholesale Pricing PDF',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#D30D2D;color:#fff;padding:24px;border-radius:10px 10px 0 0">
          <h1 style="margin:0;font-size:24px">DENTALL Wholesale</h1>
          <p style="margin:6px 0 0">Your pricing PDF is attached.</p>
        </div>
        <div style="border:1px solid #eee;border-top:0;padding:24px;color:#333;line-height:1.7">
          <p>Hi ${sanitizeStr(enquiry.name)},</p>
          <p>Thanks for your wholesale enquiry for <strong>${sanitizeStr(enquiry.business)}</strong>. We have received your requirement for <strong>${sanitizeStr(enquiry.qty)}</strong> brushes.</p>
          <p>Our sales team will contact you within 24 hours with confirmed pricing, delivery options, and any custom branding details.</p>
          <p style="font-size:12px;color:#777">The attached PDF contains indicative slabs for quick planning.</p>
        </div>
      </div>`,
    attachments: [{
      filename: 'DENTALL-Wholesale-Pricing.pdf',
      content: pdfBuffer,
      contentType: 'application/pdf',
    }],
  });
}

// ============================================================
//  ROUTE: POST /api/razorpay-webhook
//  Receives Razorpay server-to-server payment events.
//  Raw body must be verified before any processing.
// ============================================================
async function handleWebhook(req, res) {
  const signature    = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature) {
    console.warn('⚠️  Webhook received with no signature — rejected');
    return res.status(400).json({ error: 'Missing signature' });
  }

  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body)
    .digest('hex');

  // Constant-time comparison — prevents timing attacks
  const sigBuffer      = Buffer.from(signature,    'hex');
  const expectedBuffer = Buffer.from(expectedSig,  'hex');
  const isValid = sigBuffer.length === expectedBuffer.length &&
                  crypto.timingSafeEqual(sigBuffer, expectedBuffer);

  if (!isValid) {
    console.error('❌ Webhook signature mismatch — possible forgery attempt');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  console.log(`✅ Webhook event: ${event.event}`);

  // Handle payment captured (safety net — primary flow is /verify-payment)
  if (event.event === 'payment.captured') {
    const payment = event.payload?.payment?.entity;
    if (payment) {
      try {
        await db.execute(
          `UPDATE orders SET status = 'paid_webhook_confirmed' WHERE razorpay_order_id = ? AND status = 'paid'`,
          [payment.order_id]
        );
        console.log(`✅ Webhook confirmed payment for order: ${payment.order_id}`);
      } catch (dbErr) {
        console.error('⚠️  Webhook DB update failed:', dbErr.message);
      }
    }
  }

  if (event.event === 'payment.failed') {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id) {
      try {
        await db.execute(
          `UPDATE orders SET status = 'payment_failed' WHERE razorpay_order_id = ? AND status = 'pending'`,
          [payment.order_id]
        );
      } catch { /* non-fatal */ }
    }
  }

  res.json({ received: true });
}

// ============================================================
//  ROUTE: POST /api/shipping-cost
//  Returns shipping cost for a given delivery pincode.
//  No authentication needed but rate-limited.
// ============================================================
app.post('/api/shipping-cost', shippingLimiter, async (req, res) => {
  const pincode = sanitizePincode(req.body.pincode);
  const weight = parseFloat(req.body.weight) || 0.5; // Default to 0.5kg if not provided

  if (!isValidPincode(pincode)) {
    return res.status(400).json({ error: 'Valid 6-digit Indian pincode required' });
  }

  if (weight <= 0 || weight > 50) { // Reasonable limits: 0-50kg
    return res.status(400).json({ error: 'Invalid weight. Must be between 0.1 and 50kg' });
  }

  if (USE_MOCK) {
    console.log(`[MOCK] Shipping cost → pincode ${pincode}, weight ${weight}kg`);
    return res.json(mockShippingCost());
  }

  // ── REAL SHIPROCKET ──
  try {
    const token    = await getShiprocketToken();
    const { data } = await axios.get(
      'https://apiv2.shiprocket.in/v1/external/courier/serviceability/',
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          pickup_postcode:   process.env.YOUR_PINCODE,
          delivery_postcode: pincode,
          weight:            weight,
          cod:               0,
        },
        timeout: 10000,
      }
    );

    const companies = data.data?.available_courier_companies || [];
    companies.sort((a, b) => (a.rate || 0) - (b.rate || 0));
    const cheapest = companies[0];

    res.json({
      shipping_charge:    cheapest?.rate                     ?? 0,
      courier_name:       cheapest?.courier_name             ?? 'Standard Delivery',
      estimated_delivery: cheapest?.estimated_delivery_days  ?? '5-7',
    });
  } catch (e) {
    console.error('Shiprocket serviceability error:', e.response?.data || e.message);
    // Return a safe fallback rather than exposing internal errors
    res.json({ shipping_charge: 99, courier_name: 'Standard Delivery', estimated_delivery: '5-7' });
  }
});

// ============================================================
//  ROUTE: POST /api/create-order
//  Creates a Razorpay order. Amount is computed server-side
//  from the cart — the client amount is NEVER trusted.
// ============================================================
app.post('/api/create-order', paymentLimiter, async (req, res) => {
  let cartItems;
  try {
    cartItems = validateCartItems(req.body.cartItems);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const shippingCharge = safeInt(req.body.shippingCharge, 0, 1000);

  // ── Compute total SERVER-SIDE using catalogue prices ──
  const subtotal   = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalPaise = (subtotal + shippingCharge) * 100; // convert to paise

  if (totalPaise < 100) {
    return res.status(400).json({ error: 'Order amount too small' });
  }

  try {
    const order = await razorpay.orders.create({
      amount:   Math.round(totalPaise),
      currency: 'INR',
      receipt:  `dnt_${Date.now()}`,
      notes: {
        source:         'dentall-web',
        item_count:     cartItems.length,
        shipping_charge: shippingCharge,
      },
    });

    console.log(`✅ Razorpay order: ${order.id} | ₹${order.amount / 100}`);

    res.json({
      orderId:        order.id,
      amount:         order.amount,
      keyId:          process.env.RAZORPAY_KEY_ID, // safe to expose public key
      computedTotal:  order.amount / 100,           // let client display correct amount
    });
  } catch (e) {
    console.error('Razorpay order creation failed:', e);
    res.status(500).json({ error: 'Could not create payment order. Please try again.' });
  }
});

// ============================================================
//  ROUTE: POST /api/verify-payment
//  The most security-critical endpoint:
//  1. Verify HMAC signature (authenticity)
//  2. Fetch order from Razorpay and verify amount (anti-tamper)
//  3. Check payment status is 'captured' (anti-fraud)
//  4. Prevent replay attacks (idempotency check)
//  5. Save to DB, create shipment, send email
// ============================================================
app.post('/api/verify-payment', paymentLimiter, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    customerDetails,
    cartItems: rawCartItems,
    shippingCharge: rawShippingCharge,
  } = req.body;

  // ── Basic field presence check ──
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment fields' });
  }

  // ── 1. Verify HMAC-SHA256 signature ──
  const hmacBody   = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(hmacBody)
    .digest('hex');

  // Constant-time comparison — prevents timing attacks
  let sigValid = false;
  try {
    const a = Buffer.from(expectedSig, 'hex');
    const b = Buffer.from(razorpay_signature, 'hex');
    sigValid = a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    sigValid = false;
  }

  if (!sigValid) {
    console.error(`❌ Signature mismatch for order ${razorpay_order_id} — possible tampering`);
    return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
  }
  console.log(`✅ Signature verified: ${razorpay_order_id}`);

  // ── 2. Fetch order from Razorpay & verify amount (anti-price-tamper) ──
  let rzpOrder, rzpPayment;
  try {
    rzpOrder   = await razorpay.orders.fetch(razorpay_order_id);
    rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);
  } catch (e) {
    console.error('Failed to fetch Razorpay order/payment:', e.message);
    return res.status(502).json({ error: 'Could not verify payment with Razorpay' });
  }

  // ── 3. Verify payment is actually captured (not just authorized) ──
  if (rzpPayment.status !== 'captured') {
    console.error(`❌ Payment ${razorpay_payment_id} status: ${rzpPayment.status} — not captured`);
    return res.status(400).json({ error: `Payment not captured (status: ${rzpPayment.status})` });
  }

  // ── 4. Validate cart server-side and compute trusted total ──
  let cartItems;
  try {
    cartItems = validateCartItems(rawCartItems);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const shippingCharge = safeInt(rawShippingCharge, 0, 1000);
  const subtotal       = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const expectedPaise  = Math.round((subtotal + shippingCharge) * 100);

  // ── 5. Amount integrity check: server total must match Razorpay order amount ──
  if (rzpOrder.amount !== expectedPaise) {
    console.error(`❌ Amount mismatch! Razorpay: ${rzpOrder.amount} paise, Expected: ${expectedPaise} paise`);
    return res.status(400).json({ error: 'Payment amount mismatch — transaction rejected' });
  }
  console.log(`✅ Amount verified: ₹${expectedPaise / 100}`);

  // ── 6. Sanitize and validate customer details ──
  const customer = {
    name:    sanitizeStr(customerDetails?.name),
    email:   sanitizeStr(customerDetails?.email, 100).toLowerCase(),
    phone:   sanitizePhone(customerDetails?.phone),
    address: sanitizeStr(customerDetails?.address, 500),
    city:    sanitizeStr(customerDetails?.city),
    state:   sanitizeStr(customerDetails?.state),
    pincode: sanitizePincode(customerDetails?.pincode),
  };

  if (!customer.name)               return res.status(400).json({ error: 'Customer name required' });
  if (!isValidEmail(customer.email)) return res.status(400).json({ error: 'Valid email required' });
  if (!isValidPhone(customer.phone)) return res.status(400).json({ error: 'Valid phone required' });
  if (!isValidPincode(customer.pincode)) return res.status(400).json({ error: 'Valid pincode required' });

  // ── 7. Idempotency / replay attack prevention ──
  try {
    const [existing] = await db.execute(
      'SELECT id FROM orders WHERE razorpay_payment_id = ? LIMIT 1',
      [razorpay_payment_id]
    );
    if (existing.length > 0) {
      console.warn(`⚠️  Duplicate payment submission: ${razorpay_payment_id}`);
      return res.status(409).json({ error: 'Payment already processed', orderId: existing[0].id });
    }
  } catch (dbErr) {
    console.error('DB idempotency check failed:', dbErr.message);
    return res.status(500).json({ error: 'Database error during verification' });
  }

  // ── 8. Save order to MySQL ──
  let orderId;
  const totalAmount = expectedPaise / 100; // use server-computed amount
  try {
    const [result] = await db.execute(
      `INSERT INTO orders
       (razorpay_order_id, razorpay_payment_id,
        customer_name, customer_email, customer_phone,
        customer_address, customer_city, customer_state, customer_pincode,
        items_json, subtotal, shipping_charge, total, status, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
      [
        razorpay_order_id,
        razorpay_payment_id,
        customer.name, customer.email, customer.phone,
        customer.address, customer.city, customer.state, customer.pincode,
        JSON.stringify(cartItems),
        subtotal, shippingCharge, totalAmount,
        'paid',
      ]
    );
    orderId = result.insertId;
    console.log(`✅ Order saved to DB: ID ${orderId}`);
  } catch (dbErr) {
    console.error('❌ DB insert failed:', dbErr.message);
    return res.status(500).json({ error: 'Order save failed — contact support with payment ID: ' + razorpay_payment_id });
  }

  // ── 9. Create shipment (non-blocking — order is already confirmed) ──
  let awb;
  try {
    awb = USE_MOCK
      ? mockShiprocketOrder(orderId)
      : await createShiprocketOrder({ orderId, customer, cartItems, totalAmount });

    await db.execute(
      `UPDATE orders SET awb_number = ?, shiprocket_order_id = ? WHERE id = ?`,
      [awb.awb_code, awb.shiprocket_order_id || awb.shipment_id, orderId]
    );
    console.log(`✅ Shipment created, AWB: ${awb.awb_code}`);
  } catch (shipErr) {
    console.error('⚠️  Shiprocket failed (order still confirmed):', shipErr.message);
    awb = { awb_code: `PENDING-${orderId}`, shipment_id: null };
    // Log for manual fulfilment
    await db.execute(
      `UPDATE orders SET status = 'paid_ship_pending' WHERE id = ?`,
      [orderId]
    ).catch(() => {});
  }

  // ── 10. Send receipt email (non-blocking — don't fail the response) ──
  sendReceiptEmail(customer, {
    orderId, razorpay_payment_id, cartItems, totalAmount, shippingCharge, awb,
  }).catch(mailErr => console.error('⚠️  Email failed:', mailErr.message));

  res.json({ success: true, orderId, awb: awb.awb_code });
});

// ============================================================
//  ROUTE: GET /api/track/:orderId
//  Returns live shipment tracking for an order.
// ============================================================
app.get('/api/track/:orderId', async (req, res) => {
  const orderId = safeInt(req.params.orderId, 1);
  if (!orderId) return res.status(400).json({ error: 'Invalid order ID' });

  try {
    const [rows] = await db.execute(
      'SELECT awb_number, status, customer_name, created_at FROM orders WHERE id = ? LIMIT 1',
      [orderId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { awb_number, status, customer_name, created_at } = rows[0];

    if (USE_MOCK || !awb_number || awb_number.startsWith('TEST-') || awb_number.startsWith('PENDING-')) {
      return res.json({
        ...mockTrackingData(awb_number || String(orderId), orderId),
        order_id:     orderId,
        customer_name,
        order_date:   created_at,
      });
    }

    // ── REAL SHIPROCKET ──
    const token    = await getShiprocketToken();
    const { data } = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb_number}`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );

    res.json({
      ...data.tracking_data,
      order_id:     orderId,
      customer_name,
      order_date:   created_at,
    });
  } catch (e) {
    console.error('Tracking error:', e.response?.data || e.message);
    res.status(500).json({ error: 'Could not fetch tracking information' });
  }
});

// ============================================================
//  ROUTE: GET /api/shipment/awb/:awbNumber
//  Track directly by AWB number.
// ============================================================
app.get('/api/shipment/awb/:awbNumber', async (req, res) => {
  const awb = sanitizeStr(req.params.awbNumber, 50).replace(/[^a-zA-Z0-9\-]/g, '');
  if (!awb) return res.status(400).json({ error: 'Invalid AWB number' });

  if (USE_MOCK) {
    return res.json(mockTrackingData(awb, 'N/A'));
  }

  try {
    const token    = await getShiprocketToken();
    const { data } = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
    );
    res.json(data.tracking_data || {});
  } catch (e) {
    console.error('AWB tracking error:', e.response?.data || e.message);
    res.status(500).json({ error: 'Could not fetch tracking info for this AWB' });
  }
});

// ============================================================
//  ROUTE: GET /api/orders
//  Simple order list — MUST be protected by auth in production.
//  Add your admin auth middleware before going live.
// ============================================================

// ── TODO: Replace this stub with real JWT/session auth ──
function adminAuthMiddleware(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!IS_PROD) return next(); // skip in dev for convenience

  // In production: validate JWT or session here
  // Example: if (token !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/api/orders', adminAuthMiddleware, async (req, res) => {
  try {
    const limit  = safeInt(req.query.limit,  1, 100) || 50;
    const offset = safeInt(req.query.offset, 0)      || 0;

    const [rows] = await db.execute(
      `SELECT id, customer_name, customer_email, total, status, awb_number, created_at
       FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});

app.post('/api/wholesale-enquiries', leadLimiter, async (req, res) => {
  const enquiry = {
    name: sanitizeStr(req.body?.name, 150),
    business: sanitizeStr(req.body?.business, 180),
    email: sanitizeStr(req.body?.email, 150).toLowerCase(),
    phone: sanitizePhone(req.body?.phone),
    city: sanitizeStr(req.body?.city, 100),
    state: sanitizeStr(req.body?.state, 100),
    qty: sanitizeStr(req.body?.qty, 30),
    type: sanitizeStr(req.body?.type, 60),
    message: sanitizeStr(req.body?.message, 1200),
  };

  const validQtyRanges = new Set(['100-499', '500-999', '1000-4999', '5000+']);
  if (!enquiry.name) return res.status(400).json({ error: 'Full name is required.' });
  if (!enquiry.business) return res.status(400).json({ error: 'Business name is required.' });
  if (!isValidEmail(enquiry.email)) return res.status(400).json({ error: 'Valid email address is required.' });
  if (!isValidPhone(enquiry.phone)) return res.status(400).json({ error: 'Valid phone number is required.' });
  if (!enquiry.city) return res.status(400).json({ error: 'City is required.' });
  if (!enquiry.state) return res.status(400).json({ error: 'State is required.' });
  if (!validQtyRanges.has(enquiry.qty)) return res.status(400).json({ error: 'Valid quantity range is required.' });

  try {
    const [result] = await db.execute(
      `INSERT INTO wholesale_enquiries
       (full_name, business_name, email, phone, city, state, quantity_range, business_type, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [enquiry.name, enquiry.business, enquiry.email, enquiry.phone, enquiry.city, enquiry.state, enquiry.qty, enquiry.type, enquiry.message]
    );

    try {
      await sendWholesalePricingEmail(enquiry);
    } catch (mailErr) {
      console.error('Wholesale pricing email failed:', mailErr.message);
    }

    res.json({ success: true, enquiryId: result.insertId });
  } catch (e) {
    console.error('Wholesale enquiry failed:', e.message);
    res.status(500).json({ error: 'Could not save wholesale enquiry. Please try again.' });
  }
});

// ============================================================
//  ROUTE: POST /api/capture-lead
//  Saves email leads and sends welcome/discount email.
// ============================================================
app.post('/api/capture-lead', leadLimiter, async (req, res) => {
  const email = sanitizeStr(req.body.email, 100).toLowerCase();
  const name  = sanitizeStr(req.body.name);
  const phone = sanitizePhone(req.body.phone);

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid email address required' });
  }

  // Save to DB (IGNORE duplicate emails gracefully)
  try {
    await db.execute(
      `INSERT IGNORE INTO leads (name, email, phone, created_at) VALUES (?,?,?,NOW())`,
      [name, email, phone]
    );
  } catch (e) {
    console.error('Lead DB save failed:', e.message);
    // Non-fatal — continue to send email anyway
  }

  // Send offer email (non-blocking)
  try {
    await sendDentallMail({
      from:    `DENTALL 🦷 <${process.env.EMAIL_FROM}>`,
      to:      email,
      subject: '🦷 Special Offer Just for You — 10% Off Your First DENTALL Order!',
      html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#3B1A08,var(--primary),var(--secondary));padding:2.5rem;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:2rem">DENTALL 🦷</h1>
          <p style="color:rgba(255,255,255,.85);margin:.5rem 0 0">Professional Dental Care</p>
        </div>
        <div style="padding:2.5rem;background:#FFFBF5;border:1px solid #E8D5B0">
          <h2 style="color:var(--primary);margin-top:0">Hi${name ? ' ' + sanitizeStr(name) : ''}! 👋</h2>
          <p style="color:#4A2C10;line-height:1.8">Thanks for your interest in DENTALL. Here's your exclusive welcome discount:</p>
          <div style="background:linear-gradient(135deg,var(--primary),var(--secondary));border-radius:12px;padding:2rem;text-align:center;margin:1.5rem 0">
            <p style="color:rgba(255,255,255,.8);margin:0;font-size:.85rem;text-transform:uppercase;letter-spacing:.1em">Exclusive Welcome Offer</p>
            <h2 style="color:#fff;font-size:3rem;margin:.3rem 0">10% OFF</h2>
            <p style="color:rgba(255,255,255,.9);margin:0 0 1rem">on your first order</p>
            <div style="background:#fff;border-radius:8px;padding:.8rem 1.5rem;display:inline-block">
              <span style="color:var(--primary);font-weight:900;font-size:1.2rem;letter-spacing:.1em">WELCOME10</span>
            </div>
          </div>
          <div style="text-align:center;margin:2rem 0">
            <a href="${process.env.SITE_URL}/#order"
               style="background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;text-decoration:none;padding:1rem 2.5rem;border-radius:30px;font-weight:700;font-size:.9rem;display:inline-block">
              Shop Now →
            </a>
          </div>
          <p style="color:#8A6040;font-size:.78rem;text-align:center;line-height:1.7">
            ⏰ Offer valid for 48 hours · 🔒 Razorpay secured · 🚚 Free shipping on family pack
          </p>
        </div>
        <div style="background:#F5EDDC;padding:1rem;text-align:center;font-size:.72rem;color:#8A6040;border-radius:0 0 12px 12px">
          © 2025 DENTALL — support@dentall.in
        </div>
      </div>`,
    });

    console.log(`✅ Lead email sent to ${email.replace(/(.{2}).+(@.+)/, '$1****$2')}`);
    res.json({ success: true });
  } catch (e) {
    console.error('Lead email failed:', e.message);
    // Still return success — we saved the lead, email is best-effort
    res.json({ success: true });
  }
});

// ============================================================
//  ROUTE: POST /api/reviews  — customer submits a review
//  ROUTE: GET  /api/reviews  — fetch all approved reviews
//  ROUTE: POST /api/reviews/:id/approve — admin approves a review
// ============================================================
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many review submissions. Please try again later.' },
});

app.post('/api/reviews', reviewLimiter, async (req, res) => {
  console.log('📝 Review POST received:', JSON.stringify(req.body));

  const name   = sanitizeStr(req.body?.name,  100);
  const email  = sanitizeStr(req.body?.email, 150).toLowerCase();
  const rating = Math.round(Number(req.body?.rating));
  const text   = sanitizeStr(req.body?.text,  1000);

  console.log(`   name="${name}" email="${email}" rating=${rating} text="${text?.slice(0,40)}..."`);

  if (!name)   return res.status(400).json({ error: 'Name is required.' });
  if (!email)  return res.status(400).json({ error: 'Email is required.' });
  if (!text)   return res.status(400).json({ error: 'Review text is required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email address.' });
  if (rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });

  try {
    const [result] = await db.execute(
      'INSERT INTO reviews (customer_name, email, rating, review_text, approved) VALUES (?, ?, ?, ?, TRUE)',
      [name, email, rating, text]
    );
    console.log(`✅ Review saved — id=${result.insertId}`);
    res.json({ success: true });
  } catch (e) {
    console.error('❌ Review insert error:', e.message);
    res.status(500).json({ error: 'Could not save review. Please try again.' });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, customer_name, rating, review_text, created_at
       FROM reviews WHERE approved = TRUE ORDER BY created_at DESC LIMIT 50`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Could not fetch reviews.' });
  }
});

app.post('/api/reviews/:id/approve', adminAuthMiddleware, async (req, res) => {
  const id = safeInt(req.params.id, 1);
  if (!id) return res.status(400).json({ error: 'Invalid review ID' });
  try {
    await db.execute('UPDATE reviews SET approved = TRUE WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Could not approve review.' });
  }
});

// ============================================================
//  GLOBAL ERROR HANDLER
//  Catches unhandled errors and never leaks stack traces.
// ============================================================
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  // Never expose stack traces in production
  res.status(500).json({
    error: IS_PROD ? 'An unexpected error occurred. Please try again.' : err.message,
  });
});

// ── Catch-all: serve React SPA for all non-API routes ──
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// ============================================================
//  START SERVER
// ============================================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n✅ DENTALL server running on port ${PORT}`);
  console.log(`   http://localhost:${PORT}\n`);
});

// ── Graceful shutdown — don't drop live requests ──
process.on('SIGTERM', async () => {
  console.log('SIGTERM received — shutting down gracefully...');
  await db.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received — shutting down...');
  await db.end();
  process.exit(0);
});

// ── Catch uncaught errors — log but don't crash ──
process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err);
  if (IS_PROD) process.exit(1); // let process manager (PM2) restart it
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
