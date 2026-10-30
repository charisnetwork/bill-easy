/**
 * Invoice templates, design settings and the printable invoice model.
 *
 * ONE SOURCE for the screen (React) and the PDF (pdfkit): the backend runs an identical copy at
 * backend/services/invoicePdf/invoiceCore.mjs (`npm run sync:invoice-core` in backend/; a test
 * fails when the copies differ). Pure JavaScript: no imports, no browser or Node APIs.
 */

/* ── Templates ─────────────────────────────────────────────────────────────── */

export const TEMPLATES = [
  { id: 'modern', name: 'Modern', tier: 'free', header: 'band', table: 'striped', accent: '#4F46E5', font: 'sans', papers: ['A4', 'A5'] },
  { id: 'classic-gst', name: 'Classic GST', tier: 'free', header: 'split', table: 'boxed', accent: '#0F766E', font: 'sans', papers: ['A4', 'A5'] },
  { id: 'minimal', name: 'Minimal', tier: 'free', header: 'split', table: 'plain', accent: '#0F172A', font: 'sans', papers: ['A4', 'A5'] },
  { id: 'thermal', name: 'Thermal', tier: 'free', header: 'compact', table: 'plain', accent: '#000000', font: 'mono', papers: ['thermal'] },
  { id: 'bold', name: 'Bold', tier: 'premium', header: 'band', table: 'boxed', accent: '#DC2626', font: 'sans', papers: ['A4', 'A5'] },
  { id: 'elegant', name: 'Elegant', tier: 'premium', header: 'centered', table: 'lined', accent: '#8B5CF6', font: 'serif', papers: ['A4', 'A5'] },
  { id: 'corporate', name: 'Corporate', tier: 'pro', header: 'split', table: 'striped', accent: '#1D4ED8', font: 'sans', papers: ['A4'] },
  { id: 'creative', name: 'Creative', tier: 'pro', header: 'centered', table: 'striped', accent: '#E66E26', font: 'sans', papers: ['A4'] },
];

/** Charis OS feature code that unlocks each tier (free needs none). */
export const TIER_FEATURES = { free: null, premium: 'premium_templates', pro: 'pro_templates' };

/** Page sizes in PDF points (1 pt = 1/72 inch). Thermal is 80 mm wide; its height grows with the bill. */
export const PAPERS = {
  A4: { width: 595.28, height: 841.89, label: 'A4' },
  A5: { width: 419.53, height: 595.28, label: 'A5' },
  thermal: { width: 226.77, height: null, label: '80 mm thermal' },
};

export const ACCENTS = ['#4F46E5', '#0F766E', '#1D4ED8', '#DC2626', '#E66E26', '#16A34A', '#8B5CF6', '#0F172A'];
export const FONTS = { sans: 'Sans', serif: 'Serif', mono: 'Mono' };

export const templateById = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

/** True when the plan's feature switches allow this template. */
export const templateAllowed = (id, features = {}) => {
  const template = TEMPLATES.find((t) => t.id === id);
  if (!template) return false;
  const code = TIER_FEATURES[template.tier];
  return !code || features[code] === true;
};

/* ── Design settings ───────────────────────────────────────────────────────── */

export const COLUMN_KEYS = ['hsn', 'description', 'discount', 'tax_split', 'batch', 'expiry', 'free_qty', 'alt_unit'];
export const PARTY_KEYS = ['phone', 'gstin', 'shipping_address', 'place_of_supply'];
export const SHOW_KEYS = ['bank', 'upi_qr', 'signature', 'terms', 'po_number', 'eway_bill', 'vehicle_number', 'time', 'party_balance', 'amount_in_words'];

export const DEFAULT_SETTINGS = {
  template_id: 'modern',
  accent: null, // null: the template's own colour
  font: null, // null: the template's own font
  paper: 'A4',
  logo_position: 'left',
  columns: { hsn: true, description: true, discount: true, tax_split: true, batch: false, expiry: false, free_qty: false, alt_unit: false },
  party: { phone: true, gstin: true, shipping_address: false, place_of_supply: true },
  show: { bank: true, upi_qr: true, signature: true, terms: true, po_number: false, eway_bill: true, vehicle_number: false, time: false, party_balance: false, amount_in_words: true },
  footer_note: '',
  upi_id: '',
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const OLD_TEMPLATE_IDS = { stylish: 'modern', luxury: 'elegant', custom: 'modern', 'adv-gst': 'classic-gst', 'adv-gst-tally': 'classic-gst', 'gst-standard': 'classic-gst', billbook: 'classic-gst', 'billbook-a5': 'classic-gst', classic: 'classic-gst', simple: 'minimal' };

const pickBooleans = (keys, base, ...sources) => Object.fromEntries(keys.map((key) => {
  for (const source of sources) if (source && typeof source[key] === 'boolean') return [key, source[key]];
  return [key, base[key]];
}));

/**
 * Complete, valid design settings from whatever is stored on the company (also older keys such
 * as theme_color, show_item_description or template ids from earlier versions).
 */
export function normalizeInvoiceSettings(stored = {}) {
  const s = stored || {};
  const rawId = s.template_id || s.invoice_template;
  const mappedId = OLD_TEMPLATE_IDS[rawId] || rawId;
  const template_id = TEMPLATES.some((t) => t.id === mappedId) ? mappedId : DEFAULT_SETTINGS.template_id;
  const template = templateById(template_id);
  const accent = [s.accent, s.theme_color].find((c) => HEX.test(c || '')) || null;
  const paper = template.papers.includes(s.paper) ? s.paper : template.papers[0];
  const legacyColumns = { description: s.show_item_description, free_qty: s.enable_free_quantity, alt_unit: s.show_alternate_unit };
  const legacyParty = { phone: s.show_phone_number };
  const legacyShow = { po_number: s.show_po_number, eway_bill: s.show_eway_bill, vehicle_number: s.show_vehicle_number, time: s.show_time, party_balance: s.show_party_balance };
  return {
    template_id,
    accent,
    font: Object.hasOwn(FONTS, s.font) ? s.font : null,
    paper,
    logo_position: ['left', 'right', 'center'].includes(s.logo_position) ? s.logo_position : 'left',
    columns: pickBooleans(COLUMN_KEYS, DEFAULT_SETTINGS.columns, s.columns, legacyColumns),
    party: pickBooleans(PARTY_KEYS, DEFAULT_SETTINGS.party, s.party, legacyParty),
    show: pickBooleans(SHOW_KEYS, DEFAULT_SETTINGS.show, s.show, legacyShow),
    footer_note: typeof s.footer_note === 'string' ? s.footer_note.slice(0, 300) : '',
    upi_id: typeof s.upi_id === 'string' ? s.upi_id.trim().slice(0, 80) : '',
  };
}

/** Colour and font actually used: the business's choice, else the template's. */
export const resolvedStyle = (settings) => {
  const template = templateById(settings.template_id);
  return { template, accent: settings.accent || template.accent, font: settings.font || template.font };
};

/* ── Printable invoice model ───────────────────────────────────────────────── */

const num = (value) => {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const formatMoney = (amount, { symbol = '₹' } = {}) =>
  `${symbol}${round2(num(amount)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const belowHundred = (n) => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}`);
const belowThousand = (n) => [n >= 100 ? `${ONES[Math.floor(n / 100)]} Hundred` : '', belowHundred(n % 100)].filter(Boolean).join(' ');

const words = (n) => {
  const parts = [];
  if (n >= 10000000) { parts.push(`${words(Math.floor(n / 10000000))} Crore`); n %= 10000000; }
  if (n >= 100000) { parts.push(`${belowHundred(Math.floor(n / 100000))} Lakh`); n %= 100000; }
  if (n >= 1000) { parts.push(`${belowHundred(Math.floor(n / 1000))} Thousand`); n %= 1000; }
  if (n) parts.push(belowThousand(n));
  return parts.join(' ');
};

/** Indian numbering: 12345678 → "Rupees One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight Only". */
export function amountInWords(amount) {
  const value = Math.abs(num(amount));
  const rupees = Math.floor(value);
  const paise = Math.round((value - rupees) * 100);
  return `Rupees ${words(rupees) || 'Zero'}${paise ? ` and ${belowHundred(paise)} Paise` : ''} Only`;
}

const sameState = (a, b) => !a || !b || String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
const joinAddress = (...parts) => parts.map((p) => (p == null ? '' : String(p).trim())).filter(Boolean).join(', ');

/**
 * Everything a template prints, already computed: lines with taxable value and CGST/SGST or IGST,
 * the tax summary per rate, totals, amount in words, bank/UPI and the visible columns.
 * Works with an invoice as returned by GET /api/invoices/:id (Customer, items[].Product).
 */
export function buildInvoiceDocument(invoice = {}, company = {}, storedSettings = company?.settings) {
  const settings = normalizeInvoiceSettings(storedSettings);
  const style = resolvedStyle(settings);
  const customer = invoice.Customer || invoice.customer || {};
  const interState = !sameState(company.state, customer.state);

  const lines = (invoice.items || invoice.InvoiceItems || []).map((item, index) => {
    const product = item.Product || item.product || {};
    const quantity = num(item.quantity);
    const rate = num(item.unit_price ?? item.rate);
    const discount = num(item.discount);
    const taxRate = num(item.tax_rate ?? product.gst_rate ?? product.tax_rate);
    const taxable = round2(quantity * rate - discount);
    const tax = item.tax_amount != null && item.tax_amount !== '' ? num(item.tax_amount) : round2((taxable * taxRate) / 100);
    const total = item.total != null && item.total !== '' ? num(item.total) : round2(taxable + tax);
    return {
      sn: index + 1,
      name: product.name || item.name || item.description || 'Item',
      description: product.name && item.description && item.description !== product.name ? item.description : '',
      hsn: product.hsn_code || item.hsn_code || '',
      unit: product.unit || item.unit || '',
      quantity, rate, discount, taxable, taxRate, tax, total,
      cgst: interState ? 0 : round2(tax / 2),
      sgst: interState ? 0 : round2(tax - round2(tax / 2)),
      igst: interState ? tax : 0,
      batch: item.batch_number || item.batch || '',
      expiry: item.expiry_date || item.expiry || '',
      free_qty: num(item.free_quantity ?? item.free_qty),
    };
  });

  const byRate = new Map();
  for (const line of lines) {
    const row = byRate.get(line.taxRate) || { rate: line.taxRate, taxable: 0, cgst: 0, sgst: 0, igst: 0, tax: 0 };
    row.taxable = round2(row.taxable + line.taxable);
    row.cgst = round2(row.cgst + line.cgst);
    row.sgst = round2(row.sgst + line.sgst);
    row.igst = round2(row.igst + line.igst);
    row.tax = round2(row.tax + line.tax);
    byRate.set(line.taxRate, row);
  }
  const taxSummary = [...byRate.values()].sort((a, b) => a.rate - b.rate);

  const taxable = round2(lines.reduce((sum, l) => sum + l.taxable, 0));
  const tax = round2(lines.reduce((sum, l) => sum + l.tax, 0));
  const discount = num(invoice.discount_amount);
  const beforeRound = round2(taxable + tax - discount);
  const total = invoice.total_amount != null ? num(invoice.total_amount) : Math.round(beforeRound);
  const paid = num(invoice.paid_amount);
  const extras = { ...(invoice.extra_fields || {}), ...(invoice.industry_metadata || {}) };

  const columns = { ...settings.columns };
  if (!lines.some((l) => l.discount > 0)) columns.discount = false; // never an all-zero column
  if (!lines.some((l) => l.hsn)) columns.hsn = false;
  if (!lines.some((l) => l.batch)) columns.batch = false;
  if (!lines.some((l) => l.expiry)) columns.expiry = false;
  if (!lines.some((l) => l.free_qty)) columns.free_qty = false;
  if (!lines.some((l) => l.description)) columns.description = false;

  return {
    settings, style, columns, interState,
    title: company.gst_number ? 'TAX INVOICE' : 'INVOICE',
    seller: {
      name: company.name || '',
      tagline: company.tagline || '',
      address: joinAddress(company.address, company.city, company.state && company.pincode ? `${company.state} - ${company.pincode}` : company.state || company.pincode),
      phone: company.phone || '', email: company.email || '',
      gstin: company.gst_number || '', state: company.state || '',
      logo: company.logo || null, signature: company.signature || null,
    },
    buyer: {
      name: customer.name || 'Cash customer',
      address: joinAddress(customer.address, customer.city, customer.state, customer.pincode),
      shippingAddress: joinAddress(customer.shipping_address) || '',
      phone: customer.phone || '', gstin: customer.gst_number || '', state: customer.state || '',
      balance: num(customer.outstanding_balance),
    },
    meta: {
      number: invoice.invoice_number || '',
      date: invoice.invoice_date || null,
      dueDate: invoice.due_date || null,
      placeOfSupply: customer.state || company.state || '',
      poNumber: extras.po_number || '',
      ewayBill: invoice.eway_bill_number || extras.eway_bill_number || '',
      vehicleNumber: extras.vehicle_number || '',
      status: invoice.payment_status || 'unpaid',
    },
    lines, taxSummary,
    totals: { taxable, tax, discount, roundOff: round2(total - beforeRound), total, paid, due: round2(Math.max(0, total - paid)), words: amountInWords(total) },
    bank: {
      name: company.bank_name || '', account: company.account_number || '', ifsc: company.ifsc_code || '', branch: company.branch_name || '',
      upiId: settings.upi_id, qr: company.qr_code || null,
    },
    terms: invoice.terms || company.terms_conditions || '',
    notes: invoice.notes || '',
    footerNote: settings.footer_note,
  };
}
