'use strict';
/**
 * Shiprocket end-to-end test script
 * Run:  node test-shiprocket.js
 * Make sure USE_MOCK_SHIPROCKET=false is in your .env before running.
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const axios = require('axios');

const SR_BASE  = 'https://apiv2.shiprocket.in/v1/external';
const EMAIL    = process.env.SHIPROCKET_EMAIL;
const PASSWORD = process.env.SHIPROCKET_PASSWORD;
const FROM_PIN = process.env.YOUR_PINCODE;         // your warehouse pincode
const TO_PIN   = '600001';                          // Chennai — change for your test

let token  = null;
let passed = 0;
let failed = 0;

function ok(label, detail = '') {
  passed++;
  console.log(`  ✅  ${label}${detail ? '  →  ' + detail : ''}`);
}
function fail(label, err) {
  failed++;
  console.error(`  ❌  ${label}`);
  if (err) console.error(`       ${err?.response?.data ? JSON.stringify(err.response.data) : err.message}`);
}
function section(title) {
  console.log(`\n${'─'.repeat(55)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(55));
}

/* ── 1. Env check ───────────────────────────────────────── */
section('1 / ENV CHECK');
const missing = ['SHIPROCKET_EMAIL','SHIPROCKET_PASSWORD','YOUR_PINCODE'].filter(k => !process.env[k]);
if (missing.length) {
  console.error(`  ❌  Missing env vars: ${missing.join(', ')}`);
  console.error('     Set them in backend/.env and rerun.');
  process.exit(1);
}
ok('All required env vars present');
console.log(`     Email   : ${EMAIL}`);
console.log(`     From PIN: ${FROM_PIN}  →  To PIN: ${TO_PIN}`);

/* ── 2. Authentication ──────────────────────────────────── */
section('2 / AUTHENTICATION');
async function testAuth() {
  try {
    const { data } = await axios.post(`${SR_BASE}/auth/login`, { email: EMAIL, password: PASSWORD }, { timeout: 12000 });
    if (!data.token) throw new Error('No token in response');
    token = data.token;
    ok('Login successful', `token starts with: ${token.slice(0, 20)}…`);
  } catch (e) { fail('Login failed', e); }
}

/* ── 3. Serviceability / shipping cost ──────────────────── */
section('3 / SERVICEABILITY  (shipping cost)');
async function testServiceability() {
  if (!token) return fail('Skipped — no auth token');
  try {
    const { data } = await axios.get(`${SR_BASE}/courier/serviceability/`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { pickup_postcode: FROM_PIN, delivery_postcode: TO_PIN, weight: 0.5, cod: 0 },
      timeout: 12000,
    });
    const couriers = data.data?.available_courier_companies || [];
    if (!couriers.length) throw new Error('No couriers returned');
    couriers.sort((a, b) => (a.rate || 0) - (b.rate || 0));
    const best = couriers[0];
    ok(`${couriers.length} couriers found`, `cheapest: ${best.courier_name} @ ₹${best.rate}, ETA ${best.estimated_delivery_days} days`);
    return best;
  } catch (e) { fail('Serviceability check failed', e); return null; }
}

/* ── 4. Create test order ───────────────────────────────── */
section('4 / CREATE TEST ORDER');
async function testCreateOrder() {
  if (!token) return fail('Skipped — no auth token');
  const testOrderId = `TEST-${Date.now()}`;
  try {
    const { data } = await axios.post(`${SR_BASE}/orders/create/adhoc`, {
      order_id:              testOrderId,
      order_date:            new Date().toISOString().slice(0, 19).replace('T', ' '),
      pickup_location:       'Home',
      billing_customer_name: 'Test Customer',
      billing_last_name:     '',
      billing_address:       '12 Test Street',
      billing_address_2:     '',
      billing_city:          'Chennai',
      billing_pincode:       TO_PIN,
      billing_state:         'Tamil Nadu',
      billing_country:       'India',
      billing_email:         'test@dentall.in',
      billing_phone:         '9876543210',
      shipping_is_billing:   true,
      order_items: [{
        name:          'Dentall Family Pack (Test)',
        sku:           'family-pack',
        units:         1,
        selling_price: 599,
        discount: 0, tax: 0, hsn: 96190,
      }],
      payment_method: 'Prepaid',
      sub_total:      599,
      length: 20, breadth: 15, height: 5, weight: 0.5,
    }, { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 });

    const shipmentId = data.shipment_id;
    const orderId    = data.order_id;
    if (!shipmentId) throw new Error('No shipment_id: ' + JSON.stringify(data));
    ok('Order created in Shiprocket', `order_id=${orderId}  shipment_id=${shipmentId}`);
    return { shipmentId, orderId, testOrderId };
  } catch (e) { fail('Order creation failed', e); return null; }
}

/* ── 5. Assign AWB ──────────────────────────────────────── */
section('5 / AWB ASSIGNMENT');
async function testAssignAwb(shipmentId, courierId) {
  if (!token || !shipmentId) return fail('Skipped — missing token or shipment');
  try {
    const { data } = await axios.post(
      `${SR_BASE}/courier/assign/awb`,
      { shipment_id: String(shipmentId), courier_id: String(courierId) },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
    );
    const awb = data.response?.data?.awb_code || data.awb_code;
    if (!awb) throw new Error('No AWB in response: ' + JSON.stringify(data));
    ok('AWB assigned', awb);
    return awb;
  } catch (e) { fail('AWB assignment failed', e); return null; }
}

/* ── 6. Track shipment ──────────────────────────────────── */
section('6 / TRACKING');
async function testTracking(awb) {
  if (!token || !awb) return fail('Skipped — no AWB');
  try {
    const { data } = await axios.get(`${SR_BASE}/courier/track/awb/${awb}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 12000,
    });
    const status = data.tracking_data?.shipment_status || data.shipment_status || 'unknown';
    ok('Tracking API responded', `status: ${status}`);
    console.log(`     AWB: ${awb}`);
  } catch (e) { fail('Tracking failed', e); }
}

/* ── 7. Cancel test order ───────────────────────────────── */
section('7 / CANCEL TEST ORDER  (cleanup)');
async function cancelOrder(orderId) {
  if (!token || !orderId) return;
  try {
    await axios.post(`${SR_BASE}/orders/cancel`, { ids: [String(orderId)] }, {
      headers: { Authorization: `Bearer ${token}` }, timeout: 10000,
    });
    ok('Test order cancelled in Shiprocket', `order_id=${orderId}`);
  } catch (e) { fail('Cancel failed (you may need to delete it manually in Shiprocket dashboard)', e); }
}

/* ── Run all steps ──────────────────────────────────────── */
(async () => {
  await testAuth();
  const best    = await testServiceability();
  const order   = await testCreateOrder();
  const awb     = order ? await testAssignAwb(order.shipmentId, best?.courier_company_id) : null;
  await testTracking(awb);
  await cancelOrder(order?.orderId);

  section('RESULTS');
  console.log(`  Passed: ${passed}   Failed: ${failed}`);
  if (failed === 0) {
    console.log('\n  🎉  All Shiprocket functions working. Safe to go live.');
    console.log('      Set USE_MOCK_SHIPROCKET=false in Hostinger env vars.\n');
  } else {
    console.log('\n  ⚠️   Fix the failures above before enabling live mode.\n');
  }
  process.exit(failed > 0 ? 1 : 0);
})();
