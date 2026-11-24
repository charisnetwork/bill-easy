// Same money rules as backend/services/lineItemRules.js, so the form explains a problem before
// saving. The server checks again; this copy only gives the message sooner.
const num = (value) => (value === undefined || value === null || value === '' ? 0 : Number(value));

export function lineItemProblem(body = {}) {
  if (!Array.isArray(body.items)) return null;
  let subtotal = 0;
  for (const item of body.items) {
    const qty = Number(item?.quantity);
    const rate = num(item?.unit_price);
    const discount = num(item?.discount);
    if (!Number.isFinite(qty) || qty <= 0) return 'Quantity must be more than 0';
    if (!Number.isFinite(rate) || rate < 0) return 'Rate cannot be negative';
    if (!Number.isFinite(discount) || discount < 0) return 'Discount cannot be negative';
    if (discount > qty * rate) return "Discount can't be more than the line amount";
    subtotal += qty * rate - discount;
  }
  const billDiscount = num(body.discount);
  if (!Number.isFinite(billDiscount) || billDiscount < 0) return 'Discount cannot be negative';
  if (body.discount_type === 'percentage') {
    if (billDiscount > 100) return "Discount can't be more than 100%";
  } else if (billDiscount > subtotal + 1e-9) {
    return "Discount can't be more than the subtotal";
  }
  return null;
}

/** Keeps a typed number inside [min, max] for the on-screen summary (never a negative bill). */
export const clamp = (value, min, max = Infinity) => Math.min(Math.max(Number.isFinite(value) ? value : 0, min), max);
