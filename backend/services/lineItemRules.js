// Money rules for every bill with line items (invoices, quotations, purchases, purchase orders,
// credit notes, recurring invoices). The browser checks these too, but the server must refuse
// them: a negative quantity would make a negative bill and put stock back instead of taking it.

const num = (value) => (value === undefined || value === null || value === '' ? 0 : Number(value));

function lineItemProblem(body = {}) {
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

/** Route guard for create/update of anything with line items. */
function refuseBadLineItems(req, res, next) {
  const problem = lineItemProblem(req.body);
  if (problem) return res.status(400).json({ error: problem });
  return next();
}

module.exports = { lineItemProblem, refuseBadLineItems };
