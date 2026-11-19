const test = require('node:test');
const assert = require('node:assert/strict');

// Real Postgres (set TEST_DATABASE_URL, e.g. a throwaway local container).
const dbUrl = process.env.TEST_DATABASE_URL;
if (dbUrl) process.env.DATABASE_URL = dbUrl;

function response() {
  const result = { status: 200, body: null };
  const res = { status(code) { result.status = code; return this; }, json(body) { result.body = body; return this; } };
  return { result, res };
}

test('creating invoices: numbers, items, stock, GST and quotation conversion', { skip: !dbUrl && 'TEST_DATABASE_URL not set' }, async (t) => {
  const models = require('../models');
  const { sequelize, Company, Customer, Product, Godown, StockLevel, StockMovement, Invoice, InvoiceItem, Quotation } = models;
  const { createInvoice } = require('../controllers/invoiceController');
  t.after(async () => { await sequelize.close(); });
  await sequelize.sync().catch(() => sequelize.sync());

  const make = async (gst) => {
    const company = await Company.create({ name: `Shop ${Date.now()}${Math.random()}`, gst_registered: gst, gst_number: gst ? '27AAPFU0939F1ZV' : '' });
    const customer = await Customer.create({ company_id: company.id, name: 'Asha Traders' });
    const godown = await Godown.create({ company_id: company.id, name: 'Main', is_default: true });
    const rice = await Product.create({ company_id: company.id, name: 'Rice', stock_quantity: 20, sale_price: 100, purchase_price: 80 });
    const oil = await Product.create({ company_id: company.id, name: 'Oil', stock_quantity: 10, sale_price: 200, purchase_price: 150 });
    await StockLevel.create({ company_id: company.id, product_id: rice.id, godown_id: godown.id, quantity: 20 });
    await StockLevel.create({ company_id: company.id, product_id: oil.id, godown_id: godown.id, quantity: 10 });
    return { company, customer, godown, rice, oil };
  };
  const create = async (shop, body) => {
    const { result, res } = response();
    await createInvoice({ companyId: shop.company.id, user: { id: null }, body: { customer_id: shop.customer.id, godown_id: shop.godown.id, paid_amount: 0, ...body } }, res);
    return result;
  };
  const items = (shop) => [
    { product_id: shop.rice.id, quantity: 3, unit_price: 100, tax_rate: 5 },
    { product_id: shop.oil.id, quantity: 2, unit_price: 200, tax_rate: 18 },
  ];

  await t.test('a registered business: first number INV-1, all items saved, stock and movements recorded, GST charged', async () => {
    // Another business already has INV-1..INV-3: this one still starts at INV-1.
    const other = await make(true);
    for (let i = 0; i < 3; i++) assert.equal((await create(other, { items: items(other) })).status, 201);
    const shop = await make(true);
    const result = await create(shop, { items: items(shop) });
    assert.equal(result.status, 201, JSON.stringify(result.body));
    const invoice = await Invoice.findByPk(result.body.invoice.id);
    assert.equal(invoice.invoice_number, 'INV-1');
    assert.equal(await InvoiceItem.count({ where: { invoice_id: invoice.id } }), 2);
    assert.equal(Number(invoice.tax_amount), 15 + 72);
    assert.equal(Number((await Product.findByPk(shop.rice.id)).stock_quantity), 17);
    assert.equal(Number((await StockLevel.findOne({ where: { product_id: shop.oil.id, godown_id: shop.godown.id } })).quantity), 8);
    assert.equal(await StockMovement.count({ where: { reference_id: invoice.id, type: 'out' } }), 2);
    assert.equal((await create(shop, { items: items(shop) })).body.invoice.invoice_number, 'INV-2');
  });

  await t.test('an unregistered business is never charged GST (Bill of Supply)', async () => {
    const shop = await make(false);
    const result = await create(shop, { items: items(shop) });
    assert.equal(result.status, 201);
    assert.equal(Number(result.body.invoice.tax_amount), 0);
  });

  await t.test('a quotation can be converted once; the second time is refused', async () => {
    const shop = await make(true);
    const quotation = await Quotation.create({ company_id: shop.company.id, customer_id: shop.customer.id, quotation_number: 'QTN-1' });
    const first = await create(shop, { items: items(shop), quotation_id: quotation.id });
    assert.equal(first.status, 201);
    await quotation.reload();
    assert.equal(quotation.status, 'accepted');
    assert.equal(quotation.converted_invoice_id, first.body.invoice.id);
    const second = await create(shop, { items: items(shop), quotation_id: quotation.id });
    assert.equal(second.status, 409);
    assert.match(second.body.error, /already converted to INV-1/);
    assert.equal(await Invoice.count({ where: { company_id: shop.company.id } }), 1, 'no second invoice was saved');
  });
});
