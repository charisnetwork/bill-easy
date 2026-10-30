const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');

const dbUrl = process.env.TEST_DATABASE_URL;
if (dbUrl) process.env.DATABASE_URL = dbUrl;

const express = require('express');
const charisOs = require('../services/charisOsService');

// Routes are mounted for real; only login, company resolution and the controllers that would touch
// business tables are replaced, so the test exercises the gates that sit in front of them.
const companyId = crypto.randomUUID();
const fake = (rel, exports) => {
  const file = require.resolve(path.join('..', rel));
  require.cache[file] = { id: file, filename: file, loaded: true, exports };
};
const realAuth = require('../middleware/auth');
fake('middleware/auth', { ...realAuth, authenticateToken: (req, _res, next) => { req.user = { id: 'u1', company_id: companyId, role: 'owner' }; next(); } });
fake('middleware/companyContext', (req, _res, next) => { req.companyId = companyId; next(); });
const ok = (_req, res) => res.json({ reached: true });
fake('controllers/godownController', { getGodowns: ok, createGodown: ok, updateGodown: ok, deleteGodown: ok, transferStock: ok });
fake('controllers/purchaseOrderController', { getPurchaseOrders: ok, getPurchaseOrder: ok, downloadPdf: ok, createPurchaseOrder: ok, updatePurchaseOrder: ok, deletePurchaseOrder: ok });
fake('controllers/purchaseController', { getPurchases: ok, getPurchase: ok, createPurchase: ok, updatePurchase: ok, deletePurchase: ok, recordPayment: ok, parsePurchasePDF: ok });

const app = express();
app.use(express.json());
app.use('/api/company', require('../routes/company'));
app.use('/api/purchase-orders', require('../routes/purchaseOrders'));
app.use('/api/purchases', require('../routes/purchases'));
app.use('/api/reports', require('../routes/reports'));

const limit = (code, value) => ({ feature_code: code, enabled: true, limit_type: value === null ? 'unlimited' : 'limited', limit_value: value });
const off = (code) => ({ feature_code: code, enabled: false, limit_type: 'unlimited', limit_value: null });
let entitlements = [];
let usage = {};
charisOs.getSnapshot = async () => ({ status: 'active', entitlements });
charisOs.usageFor = async () => usage;

let server;
let base;
test.before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

const call = async (method, url) => {
  const res = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json' }, body: method === 'GET' ? undefined : '{}' });
  return { status: res.status, body: await res.json() };
};

test('purchase orders are locked when the plan does not include them', async () => {
  entitlements = [off('purchase_orders')];
  for (const [method, url] of [['GET', '/api/purchase-orders'], ['POST', '/api/purchase-orders'], ['GET', '/api/purchase-orders/x/pdf']]) {
    const { status, body } = await call(method, url);
    assert.equal(status, 403, `${method} ${url}`);
    assert.equal(body.code, 'FEATURE_NOT_AVAILABLE');
    assert.equal(body.feature, 'purchase_orders');
  }
  entitlements = [limit('purchase_orders', null)];
  assert.equal((await call('GET', '/api/purchase-orders')).body.reached, true);
});

test('a business at its godown limit cannot add one but can still edit, delete and transfer', async () => {
  entitlements = [limit('godowns', 2)];
  usage = { godowns: 2 };
  const created = await call('POST', '/api/company/godowns');
  assert.equal(created.status, 403);
  assert.equal(created.body.code, 'QUOTA_EXCEEDED');
  assert.equal(created.body.limit, 2);
  for (const [method, url] of [['PUT', '/api/company/godowns/g1'], ['DELETE', '/api/company/godowns/g1'], ['POST', '/api/company/stock-transfer']]) {
    assert.equal((await call(method, url)).body.reached, true, `${method} ${url}`);
  }
  usage = { godowns: 1 };
  assert.equal((await call('POST', '/api/company/godowns')).body.reached, true);
});

test('purchase bills stop at the monthly limit, also when uploading a bill PDF', async () => {
  entitlements = [limit('purchase_bills', 50)];
  usage = { purchase_bills: 50 };
  for (const url of ['/api/purchases', '/api/purchases/parse-pdf']) {
    const { status, body } = await call('POST', url);
    assert.equal(status, 403, url);
    assert.equal(body.feature, 'purchase_bills');
  }
  assert.equal((await call('PUT', '/api/purchases/p1')).body.reached, true);
});

test('report downloads', { skip: !dbUrl && 'TEST_DATABASE_URL not set' }, async (t) => {
  const { sequelize, UsageCounter } = require('../models');
  await UsageCounter.sync();
  t.after(() => sequelize.close());
  entitlements = [limit('report_exports', 10)];

  await t.test('the 11th download in a month is refused on a limit of 10', async () => {
    for (let i = 1; i <= 10; i++) assert.deepEqual((await call('POST', '/api/reports/exports')).body, { used: i, limit: 10 });
    const refused = await call('POST', '/api/reports/exports');
    assert.equal(refused.status, 403);
    assert.equal(refused.body.code, 'QUOTA_EXCEEDED');
    assert.equal(refused.body.feature, 'report_exports');
  });

  await t.test('the plan page shows every limit with its use this month', async () => {
    const { getUsage } = require('../controllers/charisOsSubscriptionController');
    entitlements = [limit('invoices', 50), limit('report_exports', 10), limit('ai_messages', null), off('purchase_bills')];
    usage = { invoices: 3, products: 0, purchase_bills: 0, godowns: 1 };
    const body = await new Promise((resolve, reject) => getUsage({ companyId }, { set() { return this; }, status() { return this; }, json: resolve }, reject));
    assert.deepEqual(body.invoices, { used: 3, limit: 50, unlimited: false, included: true, percentage: 6 });
    assert.deepEqual(body.report_exports, { used: 10, limit: 10, unlimited: false, included: true, percentage: 100 });
    assert.deepEqual(body.ai_messages, { used: 0, limit: null, unlimited: true, included: true, percentage: 0 });
    assert.equal(body.purchase_bills.included, false);
  });
});
