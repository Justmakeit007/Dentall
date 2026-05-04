// server.js
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── ROUTE 1: Get live shipping cost from Shiprocket ───
app.post('/api/shipping-cost', async (req, res) => {
  const { pincode, weight } = req.body;
  try {
    const token = await getShiprocketToken();
    const { data } = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          pickup_postcode: process.env.YOUR_PINCODE,
          delivery_postcode: pincode,
          weight: weight || 0.5,
          cod: 0,
        },
      }
    );
    const cheapest = data.data?.available_courier_companies?.[0];
    res.json({
      shipping_charge: cheapest?.rate || 0,
      courier_name: cheapest?.courier_name || 'Standard',
      estimated_delivery: cheapest?.estimated_delivery_days,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── ROUTE 2: Create Razorpay order ───
app.post('/api/create-order', async (req, res) => {
  const { amount, customerDetails } = req.body; // amount in paise
  try {
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });
    res.json({ id: order.id, amount: order.amount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── ROUTE 3: Verify payment + save to DB + book shipment + send email ───
app.post('/api/verify-payment', async (req, res) => {
  const {
    razorpay_order_id, razorpay_payment_id,
    razorpay_signature, customerDetails, cartItems,
    totalAmount, shippingCharge,
  } = req.body;

  // 1. Verify Razorpay signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body).digest('hex');

  if (expectedSig !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid payment signature' });
  }

  // 2. Save order to MySQL
  const [result] = await db.execute(
    `INSERT INTO orders
     (razorpay_order_id, razorpay_payment_id, customer_name, customer_email,
      customer_phone, customer_address, customer_pincode,
      items_json, subtotal, shipping_charge, total, status, created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
    [
      razorpay_order_id, razorpay_payment_id,
      customerDetails.name, customerDetails.email,
      customerDetails.phone, customerDetails.address, customerDetails.pincode,
      JSON.stringify(cartItems),
      totalAmount - shippingCharge, shippingCharge, totalAmount,
      'paid',
    ]
  );
  const orderId = result.insertId;

  // 3. Create shipment on Shiprocket
  const awb = await createShiprocketOrder({ orderId, customerDetails, cartItems, totalAmount });

  // 4. Update DB with AWB number
  await db.execute(
    `UPDATE orders SET awb_number = ?, shiprocket_order_id = ? WHERE id = ?`,
    [awb.awb_code, awb.shipment_id, orderId]
  );

  // 5. Send receipt email
  await sendReceiptEmail(customerDetails, {
    orderId, razorpay_payment_id, cartItems,
    totalAmount, shippingCharge, awb,
  });

  res.json({ success: true, orderId, awb: awb.awb_code });
});

// ─── ROUTE 4: Track shipment ───
app.get('/api/track/:orderId', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT awb_number FROM orders WHERE id = ?`, [req.params.orderId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });

    const token = await getShiprocketToken();
    const { data } = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${rows[0].awb_number}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(data.tracking_data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/razorpay-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  if (signature === expectedSig) {
    const event = JSON.parse(req.body);
    console.log('Webhook received:', event.event);
    // You can update order status here as a backup
  }
  res.json({ received: true });
});

// ─── HELPERS ───
let shiprocketToken = null;
let tokenExpiry = 0;

async function getShiprocketToken() {
  if (shiprocketToken && Date.now() < tokenExpiry) return shiprocketToken;
  const { data } = await axios.post(
    'https://apiv2.shiprocket.in/v1/external/auth/login',
    { email: process.env.SHIPROCKET_EMAIL, password: process.env.SHIPROCKET_PASSWORD }
  );
  shiprocketToken = data.token;
  tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // ~9 days
  return shiprocketToken;
}

async function createShiprocketOrder({ orderId, customerDetails, cartItems, totalAmount }) {
  const token = await getShiprocketToken();
  const items = cartItems.map(i => ({
    name: i.name, sku: i.id, units: i.qty,
    selling_price: i.price, discount: 0, tax: 0,
  }));
  const { data } = await axios.post(
    'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
    {
      order_id: `DNT-${orderId}`,
      order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      pickup_location: 'Primary',
      billing_customer_name: customerDetails.name,
      billing_address: customerDetails.address,
      billing_city: customerDetails.city,
      billing_pincode: customerDetails.pincode,
      billing_state: customerDetails.state,
      billing_country: 'India',
      billing_email: customerDetails.email,
      billing_phone: customerDetails.phone,
      shipping_is_billing: true,
      order_items: items,
      payment_method: 'Prepaid',
      sub_total: totalAmount,
      length: 20, breadth: 10, height: 5, weight: 0.5,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return { awb_code: data.awb_code, shipment_id: data.shipment_id };
}

async function sendReceiptEmail(customer, orderData) {
//   const transporter = nodemailer.createTransport({
//     host: 'smtp.hostinger.com',
//     port: 465, secure: true,
//     auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASS },
//   });
  const transporter = nodemailer.createTransport({
  service: 'gmail',  // ← use this locally instead of Hostinger SMTP
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});
//   process.env.NODE_ENV === 'development'
//     ? { service: 'gmail', auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASS } }
//     : { host: 'smtp.hostinger.com', port: 465, secure: true, auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASS } }
// );

  const itemsHtml = orderData.cartItems
    .map(i => `<tr><td>${i.name}</td><td>×${i.qty}</td><td>₹${(i.price * i.qty).toLocaleString('en-IN')}</td></tr>`)
    .join('');

  await transporter.sendMail({
    from: `DENTALL <${process.env.EMAIL_FROM}>`,
    to: customer.email,
    subject: `Your DENTALL order #DNT-${orderData.orderId} is confirmed!`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#FF5C00">Order Confirmed! 🦷</h2>
        <p>Hi ${customer.name}, your payment was successful.</p>
        <p><strong>Order ID:</strong> DNT-${orderData.orderId}<br>
           <strong>Payment ID:</strong> ${orderData.razorpay_payment_id}<br>
           <strong>AWB / Tracking:</strong> ${orderData.awb.awb_code}</p>
        <table border="1" cellpadding="8" style="width:100%;border-collapse:collapse">
          <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
          ${itemsHtml}
          <tr><td colspan="2">Shipping</td><td>₹${orderData.shippingCharge}</td></tr>
          <tr><td colspan="2"><strong>Total</strong></td><td><strong>₹${orderData.totalAmount.toLocaleString('en-IN')}</strong></td></tr>
        </table>
        <p>Track your package: <a href="https://yourdomain.com/track?order=${orderData.orderId}">Click here</a></p>
        <p style="color:#888;font-size:12px">DENTALL — Professional dental care.</p>
      </div>`,
  });
}

app.listen(3000, () => console.log('Server running on port 3000'));