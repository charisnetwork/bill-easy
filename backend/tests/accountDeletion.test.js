const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');

const dbUrl = process.env.TEST_DATABASE_URL;
if (dbUrl) process.env.DATABASE_URL = dbUrl;

test('delete account', { skip: !dbUrl && 'TEST_DATABASE_URL not set' }, async (t) => {
  const models = require('../models');
  const { sequelize, Company, User, UserCompany, Customer, Product, Invoice, InvoiceItem, UsageCounter } = models;
  await sequelize.sync().catch(() => sequelize.sync()); // shared with other test files running in parallel
  t.after(() => sequelize.close());
  const { deleteAccount } = require('../controllers/authController');
  const password = await bcrypt.hash('Qa-Only-Pass9!', 4);

  async function business(label, owner) {
    const company = await Company.create({ name: `QA ${label}`, owner_id: owner.id });
    await UserCompany.create({ user_id: owner.id, company_id: company.id, role: 'owner' });
    const customer = await Customer.create({ company_id: company.id, name: 'QA customer' });
    const product = await Product.create({ company_id: company.id, name: 'QA item' });
    const invoice = await Invoice.create({ company_id: company.id, customer_id: customer.id, invoice_number: `INV-${label}`, total_amount: 118 });
    await InvoiceItem.create({ invoice_id: invoice.id, product_id: product.id, quantity: 1, unit_price: 100, total: 118 });
    await UsageCounter.create({ company_id: company.id, feature_code: 'ai_messages', period: '2026-11', count: 3 });
    return company;
  }
  const user = (label, extra = {}) => User.create({ email: `${label}-${crypto.randomUUID()}@example.com`, name: label, password, role: 'owner', ...extra });

  const leaving = await user('leaving');
  const shop = await business('shop', leaving);
  const branch = await business('branch', leaving);
  await leaving.update({ company_id: shop.id });
  const cashier = await user('cashier', { role: 'staff', company_id: shop.id });
  await UserCompany.create({ user_id: cashier.id, company_id: shop.id, role: 'staff' });

  const staying = await user('staying');
  const other = await business('other', staying);
  await staying.update({ company_id: other.id });
  // Works in the deleted shop and in another business: keeps their login.
  const shared = await user('shared', { role: 'staff', company_id: shop.id });
  await UserCompany.bulkCreate([{ user_id: shared.id, company_id: shop.id, role: 'staff' }, { user_id: shared.id, company_id: other.id, role: 'staff' }]);

  const call = (actor, body) => new Promise((resolve) => {
    const res = { code: 200, cleared: false, status(c) { this.code = c; return this; }, clearCookie() { this.cleared = true; return this; }, json(b) { resolve({ status: this.code, body: b, cleared: this.cleared }); } };
    deleteAccount({ user: actor, body }, res);
  });

  assert.equal((await call(leaving, { password: 'wrong', confirmation: 'DELETE' })).status, 400);
  assert.equal((await call(leaving, { password: 'Qa-Only-Pass9!', confirmation: 'delete' })).status, 400);
  assert.equal(await Company.count({ where: { id: shop.id } }), 1);

  const done = await call(leaving, { password: 'Qa-Only-Pass9!', confirmation: 'DELETE' });
  assert.equal(done.status, 200, JSON.stringify(done.body));
  assert.equal(done.cleared, true);
  assert.deepEqual([...done.body.businesses].sort(), ['QA branch', 'QA shop']);

  const gone = [shop.id, branch.id];
  assert.equal(await Company.count({ where: { id: gone } }), 0);
  assert.equal(await Invoice.count({ where: { company_id: gone } }), 0);
  assert.equal(await InvoiceItem.count({ include: [{ model: Invoice, where: { company_id: other.id }, required: true }] }), 1);
  assert.equal(await Product.count({ where: { company_id: gone } }), 0);
  assert.equal(await UsageCounter.count({ where: { company_id: gone } }), 0);
  assert.equal(await User.count({ where: { id: [leaving.id, cashier.id] } }), 0);

  // The other business and the shared login are untouched; the shared login moves to the business it still has.
  assert.equal(await Invoice.count({ where: { company_id: other.id } }), 1);
  assert.equal(await UsageCounter.count({ where: { company_id: other.id } }), 1);
  const sharedNow = await User.findByPk(shared.id);
  assert.equal(sharedNow.company_id, other.id);
  assert.equal(await UserCompany.count({ where: { user_id: shared.id } }), 1);
  assert.ok(await User.findByPk(staying.id));
});
