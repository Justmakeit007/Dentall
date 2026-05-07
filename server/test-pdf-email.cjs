// ============================================================
//  DENTALL — test-pdf-email.js
//  Run: node test-pdf-email.js
//  Tests: PDF generation + email with attachment
// ============================================================

require('dotenv').config();
const nodemailer  = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs          = require('fs');
const path        = require('path');

// ── Colours for console output ────────────────────────────
const G = s => `\x1b[32m${s}\x1b[0m`;  // green
const R = s => `\x1b[31m${s}\x1b[0m`;  // red
const Y = s => `\x1b[33m${s}\x1b[0m`;  // yellow
const B = s => `\x1b[36m${s}\x1b[0m`;  // cyan

// ── Sample order data for testing ────────────────────────
const SAMPLE_CUSTOMER = {
  name:    'Test Customer',
  email:   process.env.EMAIL_FROM,   // sends to yourself for testing
  phone:   '+91 98765 43210',
  address: '12, Anna Salai',
  city:    'Chennai',
  state:   'Tamil Nadu',
  pincode: '600001',
};

const SAMPLE_ORDER = {
  orderId:             999,
  razorpay_payment_id: 'pay_TEST123456789',
  cartItems: [
    { name: 'Family Pack (12 brushes)', qty: 1, price: 5990, icon: '🦷' },
  ],
  totalAmount:    6040,
  shippingCharge: 50,
  awb:            { awb_code: 'TEST-AWB-999-1234567890' },
};

// ================================================================
//  PDF GENERATOR  (exact same function used in server.js)
// ================================================================
function generateReceiptPDF(customer, orderData) {
  return new Promise((resolve, reject) => {
    try {
      const doc    = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data',  chunk => chunks.push(chunk));
      doc.on('end',   ()    => resolve(Buffer.concat(chunks)));
      doc.on('error', err   => reject(err));

      // Header
      doc.rect(0, 0, 612, 110).fill('#FF5C00');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(30).text('DENTALL', 50, 28);
      doc.fillColor('rgba(255,255,255,0.75)').font('Helvetica').fontSize(10).text('Professional Dental Care', 50, 66);
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(14).text('RECEIPT', 50, 84, { align: 'right', width: 512 });

      // Order info box
      doc.rect(50, 128, 512, 85).fill('#FFF3E8').stroke('#FFD4A8');
      doc.fillColor('#FF5C00').font('Helvetica-Bold').fontSize(12)
         .text(`Order ID: DNT-${orderData.orderId}`, 65, 142);
      doc.fillColor('#4A2C10').font('Helvetica').fontSize(10)
         .text(`Payment ID : ${orderData.razorpay_payment_id}`, 65, 160)
         .text(`Date       : ${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}`, 65, 176)
         .text(`AWB        : ${orderData.awb?.awb_code || 'Processing...'}`, 65, 192);

      // Bill To
      doc.fillColor('#1C0D02').font('Helvetica-Bold').fontSize(12).text('Bill To', 50, 232);
      doc.moveTo(50, 248).lineTo(562, 248).strokeColor('#E8D5B0').lineWidth(1).stroke();
      doc.fillColor('#4A2C10').font('Helvetica').fontSize(10)
         .text(customer.name    || '', 50, 256)
         .text(customer.email   || '', 50, 272)
         .text(customer.phone   || '', 50, 288)
         .text(customer.address || '', 50, 304)
         .text(`${customer.city || ''} — ${customer.pincode || ''}`, 50, 320)
         .text(`${customer.state || ''}, India`, 50, 336);

      // Items table header
      doc.rect(50, 360, 512, 26).fill('#3B1A08');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10)
         .text('Item',  65,  370)
         .text('Qty',   390, 370, { width: 40, align: 'center' })
         .text('Rate',  440, 370, { width: 60, align: 'right'  })
         .text('Total', 510, 370, { width: 52, align: 'right'  });

      // Items rows
      let y = 394;
      (orderData.cartItems || []).forEach((item, i) => {
        if (i % 2 === 0) doc.rect(50, y - 4, 512, 22).fill('#FFF6EA');
        doc.fillColor('#1C0D02').font('Helvetica').fontSize(10)
           .text(item.name, 65, y, { width: 310 })
           .text(String(item.qty), 390, y, { width: 40, align: 'center' })
           .text(`Rs.${item.price.toLocaleString('en-IN')}`, 440, y, { width: 60, align: 'right' })
           .text(`Rs.${(item.price * item.qty).toLocaleString('en-IN')}`, 510, y, { width: 52, align: 'right' });
        y += 24;
      });

      // Totals
      y += 8;
      doc.moveTo(50, y).lineTo(562, y).strokeColor('#E8D5B0').lineWidth(1).stroke();
      y += 14;
      doc.fillColor('#4A2C10').font('Helvetica').fontSize(10)
         .text('Shipping', 400, y)
         .text(orderData.shippingCharge === 0 ? 'FREE' : `Rs.${orderData.shippingCharge}`, 510, y, { width: 52, align: 'right' });
      y += 20;
      doc.rect(360, y, 202, 32).fill('#FF5C00');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(14)
         .text('TOTAL', 370, y + 9)
         .text(`Rs.${orderData.totalAmount.toLocaleString('en-IN')}`, 370, y + 9, { width: 180, align: 'right' });
      y += 50;

      // Thank you note
      doc.rect(50, y, 512, 60).fill('#F0FDF9').stroke('#C3EDE5');
      doc.fillColor('#1C0D02').font('Helvetica-Bold').fontSize(11)
         .text('Thank you for choosing DENTALL! 🦷', 65, y + 14, { width: 480, align: 'center' });
      doc.fillColor('#4A2C10').font('Helvetica').fontSize(9)
         .text('Replace your brush every 4 months · support@dentall.in', 65, y + 32, { width: 480, align: 'center' });

      // Footer
      doc.rect(0, 760, 612, 82).fill('#F5EDDC');
      doc.fillColor('#8A6040').font('Helvetica').fontSize(8.5)
         .text('DENTALL — Professional Dental Care', 50, 772, { align: 'center', width: 512 })
         .text('© 2025 DENTALL. All rights reserved. | support@dentall.in', 50, 788, { align: 'center', width: 512 });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

// ================================================================
//  MAIN TEST RUNNER
// ================================================================
async function runTests() {
  console.log('\n' + B('━'.repeat(55)));
  console.log(B('  DENTALL — PDF + Email Test Suite'));
  console.log(B('━'.repeat(55)) + '\n');

  let passed = 0;
  let failed = 0;

  // ── TEST 1: Environment variables ──────────────────────
  console.log(Y('TEST 1 — Environment Variables'));
  const required = ['EMAIL_FROM', 'EMAIL_PASS', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
  let envOk = true;
  required.forEach(key => {
    if (process.env[key]) {
      console.log(G(`  ✓ ${key} is set`));
    } else {
      console.log(R(`  ✗ ${key} is MISSING — add to .env`));
      envOk = false;
    }
  });
  if (!process.env.DB_HOST) console.log(Y('  ⚠ DB_HOST not set (DB tests will skip)'));
  envOk ? passed++ : failed++;
  console.log();

  // ── TEST 2: PDF generation ─────────────────────────────
  console.log(Y('TEST 2 — PDF Generation'));
  try {
    const pdfBuffer = await generateReceiptPDF(SAMPLE_CUSTOMER, SAMPLE_ORDER);

    if (!pdfBuffer || pdfBuffer.length < 1000) {
      throw new Error(`PDF too small: ${pdfBuffer?.length || 0} bytes`);
    }

    // Check PDF header magic bytes
    const header = pdfBuffer.slice(0, 4).toString('ascii');
    if (header !== '%PDF') {
      throw new Error(`Invalid PDF header: "${header}"`);
    }

    // Save locally so you can open and inspect it
    const outPath = path.join(__dirname, 'test-receipt.pdf');
    fs.writeFileSync(outPath, pdfBuffer);

    console.log(G(`  ✓ PDF generated successfully`));
    console.log(G(`  ✓ PDF size: ${pdfBuffer.length.toLocaleString()} bytes`));
    console.log(G(`  ✓ PDF header valid (%PDF)`));
    console.log(G(`  ✓ Saved to: ${outPath}`));
    console.log(Y(`  → Open test-receipt.pdf to visually inspect it`));
    passed++;

    // ── TEST 3: Email with PDF attachment ──────────────────
    console.log();
    console.log(Y('TEST 3 — Email with PDF Attachment'));

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transport first
    await transporter.verify();
    console.log(G('  ✓ Gmail SMTP connection verified'));

    const info = await transporter.sendMail({
      from:    `DENTALL 🦷 <${process.env.EMAIL_FROM}>`,
      to:      process.env.EMAIL_FROM,  // sends to yourself
      subject: `🧪 TEST — DENTALL Receipt #DNT-999 with PDF`,
      html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FFFBF5;border-radius:12px;overflow:hidden;border:1px solid #E8D5B0">
        <div style="background:linear-gradient(135deg,#3B1A08,#FF5C00,#7C3AED);padding:2rem;text-align:center">
          <h1 style="color:#fff;margin:0">DENTALL 🦷</h1>
          <p style="color:rgba(255,255,255,.8);margin:.3rem 0 0">TEST EMAIL — PDF Receipt Test</p>
        </div>
        <div style="padding:2rem">
          <h2 style="color:#FF5C00">✅ PDF + Email Test Passed!</h2>
          <p style="color:#4A2C10;line-height:1.75">
            This is a test receipt for <strong>Order DNT-999</strong>.<br>
            The PDF receipt is attached below.
          </p>
          <div style="background:#FFF3E8;border-left:4px solid #FF5C00;padding:1rem;border-radius:4px;margin:1rem 0">
            <p style="margin:0;color:#FF5C00;font-weight:700">Order ID: DNT-999</p>
            <p style="margin:.3rem 0 0;color:#4A2C10">Payment ID: pay_TEST123456789</p>
            <p style="margin:.3rem 0 0;color:#00D4B4;font-weight:600">AWB: TEST-AWB-999-1234567890</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin:1rem 0">
            <tr style="background:#3B1A08">
              <th style="padding:8px;color:#fff;text-align:left">Item</th>
              <th style="padding:8px;color:#fff;text-align:center">Qty</th>
              <th style="padding:8px;color:#fff;text-align:right">Total</th>
            </tr>
            <tr style="background:#FFF6EA">
              <td style="padding:8px">🦷 Family Pack (12 brushes)</td>
              <td style="padding:8px;text-align:center">1</td>
              <td style="padding:8px;text-align:right">₹5,990</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px;color:#8A6040">Shipping</td>
              <td style="padding:8px;text-align:right;color:#00D4B4;font-weight:600">₹50</td>
            </tr>
            <tr style="background:#FF5C00">
              <td colspan="2" style="padding:10px;font-weight:700;color:#fff">TOTAL</td>
              <td style="padding:10px;text-align:right;font-weight:900;color:#fff;font-size:1.1rem">₹6,040</td>
            </tr>
          </table>
          <p style="color:#8A6040;font-size:.82rem">📎 PDF receipt is attached · Check your attachments</p>
        </div>
        <div style="background:#F5EDDC;padding:1rem;text-align:center;font-size:.72rem;color:#8A6040">
          © 2025 DENTALL — This is an automated test email
        </div>
      </div>`,
      attachments: [{
        filename:    'DENTALL-Receipt-DNT-999-TEST.pdf',
        content:     pdfBuffer,
        contentType: 'application/pdf',
      }],
    });

    console.log(G(`  ✓ Email sent successfully`));
    console.log(G(`  ✓ Message ID: ${info.messageId}`));
    console.log(G(`  ✓ Sent to: ${process.env.EMAIL_FROM}`));
    console.log(Y(`  → Check your inbox (and spam folder) for the test email with PDF`));
    passed++;

  } catch (e) {
    console.log(R(`  ✗ FAILED: ${e.message}`));
    console.log(R(`  Stack: ${e.stack?.split('\n')[1]?.trim() || 'N/A'}`));
    failed++;
  }

  // ── TEST 4: Quick DB connection check ──────────────────
  console.log();
  console.log(Y('TEST 4 — Database Connection'));
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    console.log(Y('  ⚠ Skipped — DB env vars not set'));
  } else {
    try {
      const mysql = require('mysql2/promise');
      const conn  = await mysql.createConnection({
        host:     process.env.DB_HOST,
        user:     process.env.DB_USER,
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME,
      });
      const [rows] = await conn.execute('SELECT COUNT(*) as count FROM orders');
      console.log(G(`  ✓ DB connected`));
      console.log(G(`  ✓ Orders table exists — ${rows[0].count} order(s) in DB`));
      await conn.end();
      passed++;
    } catch (e) {
      console.log(R(`  ✗ DB failed: ${e.message}`));
      if (e.message.includes("doesn't exist")) {
        console.log(Y(`  → Run the CREATE TABLE SQL shown in the setup guide`));
      }
      failed++;
    }
  }

  // ── TEST 5: Razorpay key format check ──────────────────
  console.log();
  console.log(Y('TEST 5 — Razorpay Key Format'));
  const keyId     = process.env.RAZORPAY_KEY_ID     || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const isTest    = keyId.startsWith('rzp_test_');
  const isLive    = keyId.startsWith('rzp_live_');

  if (isTest) {
    console.log(G(`  ✓ Key ID format valid (test mode)`));
    console.log(Y(`  ⚠ You're in TEST mode — use test cards only`));
    console.log(Y(`  → Test card: 4111 1111 1111 1111 | Exp: 12/26 | CVV: 123`));
    passed++;
  } else if (isLive) {
    console.log(G(`  ✓ Key ID format valid (LIVE mode)`));
    console.log(Y(`  ⚠ You're in LIVE mode — real money will be charged!`));
    passed++;
  } else {
    console.log(R(`  ✗ Key ID format invalid: "${keyId.slice(0,15)}..."`));
    console.log(Y(`  → Should start with rzp_test_ or rzp_live_`));
    failed++;
  }

  if (keySecret.length >= 20) {
    console.log(G(`  ✓ Key Secret length looks correct (${keySecret.length} chars)`));
  } else {
    console.log(R(`  ✗ Key Secret too short (${keySecret.length} chars) — check .env`));
    failed++;
  }

  // ── Summary ────────────────────────────────────────────
  console.log('\n' + B('━'.repeat(55)));
  console.log(`  Results: ${G(passed + ' passed')}  ${failed > 0 ? R(failed + ' failed') : '0 failed'}`);
  console.log(B('━'.repeat(55)));

  if (failed === 0) {
    console.log(G('\n  ✅ ALL TESTS PASSED — your setup is ready!\n'));
    console.log(Y('  Next steps:'));
    console.log('  1. Open test-receipt.pdf and confirm it looks correct');
    console.log('  2. Check your email inbox for the test receipt with PDF');
    console.log('  3. Run: node server.js  to start the server');
    console.log('  4. Place a test order using card: 4111 1111 1111 1111\n');
  } else {
    console.log(R(`\n  ❌ ${failed} test(s) failed — fix the issues above then re-run\n`));
  }
}

runTests().catch(e => {
  console.error(R('\n❌ Unexpected error: ' + e.message));
  process.exit(1);
});
