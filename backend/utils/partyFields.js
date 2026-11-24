// Contact details of customers and suppliers: bad GSTINs flow into GSTR-1 and invoices, and
// junk phone numbers break WhatsApp sharing. Blank is always allowed.
const GSTIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GSTIN_FORMAT = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const invalid = (message) => Object.assign(new Error(message), { status: 400 });

function gstinCheckChar(first14) {
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const product = GSTIN_CHARS.indexOf(first14[i]) * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return GSTIN_CHARS[(36 - (sum % 36)) % 36];
}

function gstin(value) {
  if (value === undefined) return undefined;
  const text = String(value ?? '').trim().toUpperCase();
  if (!text) return null;
  if (!GSTIN_FORMAT.test(text) || gstinCheckChar(text.slice(0, 14)) !== text[14]) throw invalid('GSTIN is not valid. Enter the 15-character GSTIN or leave it blank.');
  return text;
}

/** Indian mobile (10 digits, 6–9…), Indian landline with STD code, or an international +number. */
function phone(value) {
  if (value === undefined) return undefined;
  const text = String(value ?? '').trim();
  if (!text) return null;
  if (!/^[+0-9 ()-]+$/.test(text)) throw invalid('Phone number must contain only digits (and + for international numbers).');
  if (text.length > 20) throw invalid('Phone number is too long.');
  const digits = text.replace(/[^0-9]/g, '');
  if (text.startsWith('+') && !text.startsWith('+91')) {
    if (digits.length < 7 || digits.length > 15) throw invalid('International phone numbers need 7–15 digits after the +.');
    return `+${digits}`;
  }
  const local = digits.replace(/^91(?=[6-9]\d{9}$)/, '');
  if (/^[6-9]\d{9}$/.test(local) || /^0\d{9,11}$/.test(local)) return local;
  throw invalid('Enter a 10-digit mobile number, a landline with STD code, or an international number starting with +.');
}

function email(value) {
  if (value === undefined) return undefined;
  const text = String(value ?? '').trim();
  if (!text) return null;
  if (text.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text)) throw invalid('Email address is not valid.');
  return text.toLowerCase();
}

/** Validated phone, email and GSTIN from a request body (undefined keys are left untouched). */
function partyFields(body) {
  return { phone: phone(body.phone), email: email(body.email), gst_number: gstin(body.gst_number) };
}

module.exports = { partyFields, gstin, gstinCheckChar };
