/**
 * Questions the database answers directly, without the AI model: an invoice number, an exact
 * customer or item name, dues, low stock and today's sales. These never use an AI message.
 * Returns null when the question needs the AI.
 */
const { Op, fn, col } = require('sequelize');

const rupees = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
// Exact (case-insensitive) match: user text must not act as a LIKE wildcard.
const exactly = (text) => ({ [Op.iLike]: text.replace(/[\\%_]/g, '\\$&') });
const date = (value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// "INV-102", "invoice 102", "#102", "BE/24-25/0012"
const INVOICE_NUMBER = /^\s*(?:inv(?:oice)?\s*(?:no\.?|number)?\s*[#:]?\s*|#)?([A-Za-z]{0,6}[\s/-]?[\w/-]*\d[\w/-]*)\s*$/i;

async function findInvoice(companyId, text, { Invoice, Customer }) {
  const match = text.match(INVOICE_NUMBER);
  if (!match) return null;
  const candidates = [...new Set([text.trim(), match[1]])];
  for (const candidate of candidates) {
    const invoice = await Invoice.findOne({
      where: { company_id: companyId, invoice_number: exactly(candidate) },
      include: Customer ? [{ model: Customer, attributes: ['name'] }] : undefined,
    });
    if (invoice) {
      const due = Number(invoice.total_amount || 0) - Number(invoice.paid_amount || 0);
      return {
        reply: `Invoice ${invoice.invoice_number} for ${invoice.Customer?.name || 'a customer'} on ${date(invoice.invoice_date)}: ${rupees(invoice.total_amount)}, status ${invoice.payment_status}${due > 0 ? `, ${rupees(due)} due` : ''}.`,
        data: { invoice: invoice.invoice_number },
      };
    }
  }
  return null;
}

async function answer(companyId, question, models = require('../models')) {
  const text = String(question || '').trim();
  if (!text || text.length > 80) return null;
  const lower = text.toLowerCase();
  const { Customer, Product, Invoice } = models;

  if (/\b(dues|outstanding|who owes|pending payments?)\b/.test(lower)) {
    const debtors = await Customer.findAll({
      where: { company_id: companyId, outstanding_balance: { [Op.gt]: 0 } },
      order: [['outstanding_balance', 'DESC']], limit: 5, attributes: ['name', 'outstanding_balance'],
    });
    if (!debtors.length) return { reply: 'No customer has dues right now.', data: { debtors: [] } };
    return { reply: `Top dues:\n${debtors.map((d) => `• ${d.name}: ${rupees(d.outstanding_balance)}`).join('\n')}`, data: { debtors: debtors.length } };
  }

  if (/\blow stock\b|\bout of stock\b|\breorder\b/.test(lower)) {
    const items = await Product.findAll({
      where: { company_id: companyId, stock_quantity: { [Op.lte]: col('low_stock_alert') } },
      order: [['stock_quantity', 'ASC']], limit: 10, attributes: ['name', 'stock_quantity'],
    });
    if (!items.length) return { reply: 'All items are above their low-stock level.', data: { items: [] } };
    return { reply: `Low stock:\n${items.map((p) => `• ${p.name}: ${Number(p.stock_quantity)} left`).join('\n')}`, data: { items: items.length } };
  }

  if (/\b(today'?s? sales|sales today)\b/.test(lower) && Invoice?.findOne) {
    const start = new Date(Date.now() + 330 * 60 * 1000);
    start.setUTCHours(0, 0, 0, 0);
    const row = await Invoice.findOne({
      where: { company_id: companyId, invoice_date: { [Op.gte]: new Date(start.getTime() - 330 * 60 * 1000) }, status: { [Op.ne]: 'cancelled' } },
      attributes: [[fn('COALESCE', fn('SUM', col('total_amount')), 0), 'total'], [fn('COUNT', col('id')), 'count']], raw: true,
    });
    return { reply: `Today's sales: ${rupees(row?.total)} from ${Number(row?.count || 0)} invoice(s).`, data: {} };
  }

  const invoice = await findInvoice(companyId, text, models);
  if (invoice) return invoice;

  const customer = await Customer.findOne({ where: { company_id: companyId, name: exactly(text) }, attributes: ['name', 'phone', 'outstanding_balance'] });
  if (customer) {
    return { reply: `${customer.name}${customer.phone ? ` (${customer.phone})` : ''}: ${Number(customer.outstanding_balance) > 0 ? `${rupees(customer.outstanding_balance)} due` : 'no dues'}.`, data: { customer: customer.name } };
  }

  const product = await Product.findOne({ where: { company_id: companyId, name: exactly(text) }, attributes: ['name', 'stock_quantity', 'sale_price', 'gst_rate'] });
  if (product) {
    return { reply: `${product.name}: ${Number(product.stock_quantity)} in stock, sale price ${rupees(product.sale_price)}, GST ${Number(product.gst_rate)}%.`, data: { product: product.name } };
  }
  return null;
}

module.exports = { answer };
