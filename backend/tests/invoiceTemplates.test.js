const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const FRONTEND_CORE = path.join(__dirname, '../../frontend/src/lib/invoice/invoiceCore.js');
const BACKEND_CORE = path.join(__dirname, '../services/invoicePdf/invoiceCore.mjs');
const core = () => import(BACKEND_CORE);
const { generateInvoicePdf } = require('../services/invoicePdf');

const company = { name: 'Sri Ganesh Medicals', state: 'Karnataka', city: 'Mysuru', address: '12 Market Road', pincode: '570001', gst_number: '29ABCDE1234F1Z5', phone: '9876543210', bank_name: 'HDFC Bank', account_number: '50100012345678', ifsc_code: 'HDFC0001234', settings: {} };
const item = (name, quantity, unit_price, tax_rate, extra = {}) => ({ quantity, unit_price, tax_rate, discount: 0, Product: { name, hsn_code: '3004', unit: 'PCS', gst_rate: tax_rate }, ...extra });
const invoice = (customerState, items = [item('Paracetamol 650', 10, 20, 12), item('Bandage roll', 2, 50, 5), item('Thermometer', 1, 250, 18)]) => ({
  invoice_number: 'INV-102', invoice_date: '2026-10-30', payment_status: 'partial', paid_amount: 100,
  Customer: { name: 'Ravi Traders', state: customerState, gst_number: '29XYZAB9876C1Z2', phone: '9000000000' }, items,
});
const pdfWidth = (buffer) => Number(/\/MediaBox \[0 0 ([\d.]+) /.exec(buffer.toString('latin1'))[1]);
const pdfHeight = (buffer) => Number(/\/MediaBox \[0 0 [\d.]+ ([\d.]+)\]/.exec(buffer.toString('latin1'))[1]);

test('the backend runs an identical copy of the invoice core', () => {
  assert.equal(fs.readFileSync(BACKEND_CORE, 'utf8'), fs.readFileSync(FRONTEND_CORE, 'utf8'), 'run `npm run sync:invoice-core` in backend/');
});

test('there are eight templates across free, premium and pro', async () => {
  const { TEMPLATES } = await core();
  assert.deepEqual(TEMPLATES.map((t) => `${t.id}:${t.tier}`), ['modern:free', 'classic-gst:free', 'minimal:free', 'thermal:free', 'bold:premium', 'elegant:premium', 'corporate:pro', 'creative:pro']);
});

test('every template renders a PDF on each of its papers at the right page size', async () => {
  const { TEMPLATES, PAPERS } = await core();
  for (const template of TEMPLATES) {
    for (const paper of template.papers) {
      const buffer = await generateInvoicePdf(invoice('Karnataka'), { ...company, settings: { template_id: template.id, paper } });
      assert.equal(buffer.subarray(0, 4).toString(), '%PDF', `${template.id} ${paper}`);
      assert.ok(Math.abs(pdfWidth(buffer) - PAPERS[paper].width) < 1, `${template.id} ${paper} width ${pdfWidth(buffer)}`);
    }
  }
});

test('a thermal bill is 80 mm wide and grows with the number of items', async () => {
  const short = await generateInvoicePdf(invoice('Karnataka'), { ...company, settings: { template_id: 'thermal' } });
  const many = Array.from({ length: 40 }, (_, i) => item(`Item ${i + 1}`, 1, 10, 5));
  const long = await generateInvoicePdf(invoice('Karnataka', many), { ...company, settings: { template_id: 'thermal' } });
  assert.ok(Math.abs(pdfWidth(long) - 226.77) < 1);
  assert.ok(pdfHeight(long) > pdfHeight(short) + 300, `${pdfHeight(short)} → ${pdfHeight(long)}`);
});

test('old settings keep working: theme colour becomes the accent, unknown templates fall back to Modern', async () => {
  const { normalizeInvoiceSettings } = await core();
  const s = normalizeInvoiceSettings({ template_id: 'stylish', theme_color: '#16A34A', show_item_description: false, show_phone_number: false });
  assert.equal(s.template_id, 'modern');
  assert.equal(s.accent, '#16A34A');
  assert.equal(s.columns.description, false);
  assert.equal(s.party.phone, false);
  assert.equal(normalizeInvoiceSettings({ template_id: 'made-up' }).template_id, 'modern');
  assert.equal(normalizeInvoiceSettings({ template_id: 'adv-gst-tally' }).template_id, 'classic-gst');
  assert.equal(normalizeInvoiceSettings({ template_id: 'thermal', paper: 'A4' }).paper, 'thermal');
  assert.equal(normalizeInvoiceSettings({ accent: 'red' }).accent, null);
});

test('GST splits into CGST and SGST within the state and IGST across states', async () => {
  const { buildInvoiceDocument } = await core();
  const local = buildInvoiceDocument(invoice('karnataka'), company);
  assert.equal(local.interState, false);
  const paracetamol = local.lines[0];
  assert.deepEqual([paracetamol.taxable, paracetamol.tax, paracetamol.cgst, paracetamol.sgst, paracetamol.igst], [200, 24, 12, 12, 0]);
  assert.deepEqual(local.taxSummary.map((r) => [r.rate, r.taxable, r.cgst, r.sgst]), [[5, 100, 2.5, 2.5], [12, 200, 12, 12], [18, 250, 22.5, 22.5]]);
  assert.equal(local.totals.taxable, 550);
  assert.equal(local.totals.tax, 74); // 24 + 5 + 45

  const other = buildInvoiceDocument(invoice('Maharashtra'), company);
  assert.equal(other.interState, true);
  assert.deepEqual([other.lines[0].cgst, other.lines[0].sgst, other.lines[0].igst], [0, 0, 24]);
});

test('totals round to the rupee and are written in Indian words', async () => {
  const { buildInvoiceDocument, amountInWords } = await core();
  const doc = buildInvoiceDocument(invoice('Karnataka'), company);
  assert.equal(doc.totals.total, 624);
  assert.equal(doc.totals.due, 524);
  assert.equal(amountInWords(624), 'Rupees Six Hundred Twenty Four Only');
  assert.equal(amountInWords(12345678.5), 'Rupees One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight and Fifty Paise Only');
});

test('empty columns are hidden even when switched on', async () => {
  const { buildInvoiceDocument } = await core();
  const doc = buildInvoiceDocument(invoice('Karnataka'), { ...company, settings: { columns: { discount: true, batch: true } } });
  assert.equal(doc.columns.discount, false);
  assert.equal(doc.columns.batch, false);
  assert.equal(doc.columns.hsn, true);
});

test('the PDF prints the rupee sign', async () => {
  // DejaVu fonts carry ₹ (U+20B9); pdfkit's built-in fonts do not.
  const buffer = await generateInvoicePdf(invoice('Karnataka'), company);
  assert.match(buffer.toString('latin1'), /DejaVu/);
});
