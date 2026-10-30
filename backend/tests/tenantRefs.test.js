const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');

const dbUrl = process.env.TEST_DATABASE_URL;
if (dbUrl) process.env.DATABASE_URL = dbUrl;

const express = require('express');
const charisOs = require('../services/charisOsService');
const { assertOwnedByCompany } = require('../services/tenantRefs');

// Real routers and controllers; only login and company resolution are faked. Requests act for
// business A, and every id that belongs to business B must be refused before anything is written.
let actingCompany = null;
const fake = (rel, exports) => {
  const file = require.resolve(path.join('..', rel));
  require.cache[file] = { id: file, filename: file, loaded: true, exports };
};
const realAuth = require('../middleware/auth');
fake('middleware/auth', { ...realAuth, authenticateToken: (req, _res, next) => { req.user = { id: crypto.randomUUID(), company_id: actingCompany, role: 'owner' }; next(); } });
fake('middleware/companyContext', (req, _res, next) => { req.companyId = actingCompany; next(); });

const unlimited = (code) => ({ feature_code: code, enabled: true, limit_type: 'unlimited', limit_value: null });
charisOs.getSnapshot = async () => ({ status: 'active', entitlements: ['invoices', 'purchase_bills', 'purchase_orders', 'recurring_invoices', 'godowns'].map(unlimited) });
charisOs.usageFor = async () => ({});

test('ids are checked against the acting business', async () => {
  const models = require('../models');
  const original = models.Product.count;
  let asked = null;
  models.Product.count = async (options) => { asked = options.where; return 1; };
  try {
    const own = crypto.randomUUID();
    await assertOwnedByCompany('company-a', { product: [own, own, undefined, ''] });
    assert.deepEqual(asked, { id: [own], company_id: 'company-a' });
    await assert.rejects(assertOwnedByCompany('company-a', { product: [own, crypto.randomUUID()] }), { status: 404, message: 'Product not found' });
    await assert.rejects(assertOwnedByCompany('company-a', { product: 'not-a-uuid' }), { status: 404 });
    await assert.rejects(assertOwnedByCompany('company-a', { product: { $ne: null } }), { status: 404 });
  } finally { models.Product.count = original; }
});

test('cross-business ids are refused', { skip: !dbUrl && 'TEST_DATABASE_URL not set' }, async (t) => {
  const { sequelize, Company, Product, Godown, Customer, Supplier, StockLevel, StockMovement, Invoice, Purchase, Quotation, CreditNote, PurchaseOrder, RecurringSubscription } = require('../models');
  await sequelize.sync();
  t.after(() => sequelize.close());

  const app = express();
  app.use(express.json());
  app.use('/api/invoices', require('../routes/invoices'));
  app.use('/api/purchases', require('../routes/purchases'));
  app.use('/api/quotations', require('../routes/quotations'));
  app.use('/api/credit-notes', require('../routes/creditNotes'));
  app.use('/api/purchase-orders', require('../routes/purchaseOrders'));
  app.use('/api/recurring', require('../routes/recurring'));
  app.use('/api/company', require('../routes/company'));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const send = async (method, url, body) => {
    const res = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { status: res.status, body: await res.json() };
  };

  const business = async (name) => {
    const company = await Company.create({ name });
    const product = await Product.create({ company_id: company.id, name: `${name} soap`, stock_quantity: 100 });
    const godown = await Godown.create({ company_id: company.id, name: `${name} main`, is_default: true });
    const spare = await Godown.create({ company_id: company.id, name: `${name} spare` });
    await StockLevel.create({ company_id: company.id, product_id: product.id, godown_id: godown.id, quantity: 100 });
    const customer = await Customer.create({ company_id: company.id, name: `${name} buyer` });
    const supplier = await Supplier.create({ company_id: company.id, name: `${name} vendor` });
    return { id: company.id, product: product.id, godown: godown.id, spare: spare.id, customer: customer.id, supplier: supplier.id };
  };
  const a = await business('A');
  const b = await business('B');
  actingCompany = a.id;

  const bUntouched = async () => {
    assert.equal(Number((await Product.findByPk(b.product)).stock_quantity), 100);
    assert.equal(Number((await StockLevel.findOne({ where: { product_id: b.product, godown_id: b.godown } })).quantity), 100);
    assert.equal(await StockLevel.count({ where: { godown_id: [b.godown, b.spare], company_id: a.id } }), 0);
    assert.equal(await StockMovement.count({ where: { product_id: b.product } }), 0);
    assert.equal(Number((await Customer.findByPk(b.customer)).outstanding_balance || 0), 0);
    assert.equal(Number((await Supplier.findByPk(b.supplier)).outstanding_balance || 0), 0);
  };
  const line = (product_id) => ({ product_id, quantity: 5, unit_price: 10, tax_rate: 0 });
  const refused = async (method, url, body, label) => {
    const { status, body: res } = await send(method, url, body);
    assert.equal(status, 404, `${method} ${url} ${label}: ${JSON.stringify(res)}`);
    assert.match(res.error, / not found$/);
    await bUntouched();
  };

  await t.test('invoices', async () => {
    await refused('POST', '/api/invoices', { customer_id: a.customer, items: [line(b.product)] }, 'foreign product');
    await refused('POST', '/api/invoices', { customer_id: a.customer, godown_id: b.godown, items: [line(a.product)] }, 'foreign godown');
    await refused('POST', '/api/invoices', { customer_id: b.customer, items: [line(a.product)] }, 'foreign customer');
    assert.equal(await Invoice.count({ where: { company_id: a.id } }), 0);

    const created = await send('POST', '/api/invoices', { customer_id: a.customer, godown_id: a.godown, items: [line(a.product)] });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    assert.equal(Number((await Product.findByPk(a.product)).stock_quantity), 95);
    const id = created.body.invoice.id;
    await refused('PUT', `/api/invoices/${id}`, { customer_id: a.customer, items: [line(b.product)] }, 'foreign product');
    await refused('PUT', `/api/invoices/${id}`, { customer_id: a.customer, godown_id: b.godown, items: [line(a.product)] }, 'foreign godown');
    assert.equal(Number((await Product.findByPk(a.product)).stock_quantity), 95, 'a refused edit leaves the original sale in place');
  });

  await t.test('purchase bills', async () => {
    await refused('POST', '/api/purchases', { supplier_id: a.supplier, items: [line(b.product)] }, 'foreign product');
    await refused('POST', '/api/purchases', { supplier_id: a.supplier, godown_id: b.godown, items: [line(a.product)] }, 'foreign godown');
    await refused('POST', '/api/purchases', { supplier_id: b.supplier, items: [line(a.product)] }, 'foreign supplier');
    assert.equal(await Purchase.count({ where: { company_id: a.id } }), 0);

    const created = await send('POST', '/api/purchases', { supplier_id: a.supplier, godown_id: a.godown, items: [line(a.product)] });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    const id = created.body.purchase.id;
    await refused('PUT', `/api/purchases/${id}`, { supplier_id: a.supplier, items: [line(b.product)] }, 'foreign product');
    await refused('PUT', `/api/purchases/${id}`, { supplier_id: a.supplier, godown_id: b.godown, items: [line(a.product)] }, 'foreign godown');
  });

  await t.test('stock transfer', async () => {
    await refused('POST', '/api/company/stock-transfer', { product_id: b.product, from_godown_id: a.godown, to_godown_id: a.spare, quantity: 1 }, 'foreign product');
    await refused('POST', '/api/company/stock-transfer', { product_id: a.product, from_godown_id: a.godown, to_godown_id: b.godown, quantity: 1 }, 'foreign destination');
    await refused('POST', '/api/company/stock-transfer', { product_id: a.product, from_godown_id: b.godown, to_godown_id: a.spare, quantity: 1 }, 'foreign source');
    const moved = await send('POST', '/api/company/stock-transfer', { product_id: a.product, from_godown_id: a.godown, to_godown_id: a.spare, quantity: 1 });
    assert.equal(moved.status, 200, JSON.stringify(moved.body));
  });

  await t.test('quotations, credit notes, purchase orders and recurring invoices', async () => {
    await refused('POST', '/api/quotations', { customer_id: a.customer, items: [line(b.product)] }, 'foreign product');
    await refused('POST', '/api/quotations', { customer_id: a.customer, godown_id: b.godown, items: [line(a.product)] }, 'foreign godown');
    assert.equal(await Quotation.count({ where: { company_id: a.id } }), 0);

    const invoice = await Invoice.findOne({ where: { company_id: a.id } });
    await refused('POST', '/api/credit-notes', { invoice_id: invoice.id, items: [line(b.product)] }, 'foreign product');
    assert.equal(await CreditNote.count({ where: { company_id: a.id } }), 0);

    await refused('POST', '/api/purchase-orders', { supplier_id: a.supplier, items: [line(b.product)] }, 'foreign product');
    await refused('POST', '/api/purchase-orders', { supplier_id: b.supplier, items: [line(a.product)] }, 'foreign supplier');
    assert.equal(await PurchaseOrder.count({ where: { company_id: a.id } }), 0);

    await refused('POST', '/api/recurring', { customer_id: a.customer, profile_name: 'Monthly', items: [line(b.product)] }, 'foreign product');
    await refused('POST', '/api/recurring', { customer_id: b.customer, profile_name: 'Monthly', items: [line(a.product)] }, 'foreign customer');
    assert.equal(await RecurringSubscription.count({ where: { company_id: a.id } }), 0);
  });
});
