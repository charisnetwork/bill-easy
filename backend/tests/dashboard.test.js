const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

// Real Postgres for the dashboard queries (set TEST_DATABASE_URL, e.g. a throwaway local container).
const dbUrl = process.env.TEST_DATABASE_URL;
if (dbUrl) process.env.DATABASE_URL = dbUrl;

const figures = require('../services/dashboardFigures');

const ist = (s) => new Date(`${s}+05:30`);

test('months and days are India time', () => {
  // 1 Oct 01:30 in India is still 30 Sep in UTC.
  assert.deepEqual(figures.istParts(new Date('2026-09-30T20:00:00Z')), { y: 2026, m: 9, d: 1 });
  const months = figures.lastMonths(ist('2026-01-10T09:00:00'), 3);
  assert.deepEqual(months.map((m) => m.key), ['2025-11', '2025-12', '2026-01']);
  assert.equal(months[2].start.toISOString(), '2025-12-31T18:30:00.000Z');
  assert.equal(months[2].end.toISOString(), '2026-01-31T18:30:00.000Z');
  const { days, start } = figures.lastDays(ist('2026-03-02T00:10:00'), 3);
  assert.deepEqual(days, ['2026-02-28', '2026-03-01', '2026-03-02']);
  assert.equal(start.toISOString(), '2026-02-27T18:30:00.000Z');
});

test('percent change is null when there is nothing to compare against', () => {
  assert.equal(figures.percentChange(500, 0), null);
  assert.equal(figures.percentChange(0, 0), null);
  assert.equal(figures.percentChange(1500, 1000), 50);
  assert.equal(figures.percentChange(0, 1000), -100);
  assert.equal(figures.percentChange(100, -200), 150); // a loss turning into a profit is an improvement
  assert.equal(figures.percentChange(1, 3), -66.7);
});

test('GST due dates: GSTR-1 on the 11th and GSTR-3B on the 20th of the next month', () => {
  assert.deepEqual(figures.gstDueDates(ist('2026-10-15T12:00:00')), [
    { form: 'GSTR-3B', period: '2026-09', period_label: 'September 2026', due_date: '2026-10-20', days_left: 5 },
    { form: 'GSTR-1', period: '2026-10', period_label: 'October 2026', due_date: '2026-11-11', days_left: 27 },
  ]);
  // On the due day itself the return is still due (0 days left).
  const onDay = figures.gstDueDates(ist('2026-12-11T23:00:00'));
  assert.deepEqual(onDay[0], { form: 'GSTR-1', period: '2026-11', period_label: 'November 2026', due_date: '2026-12-11', days_left: 0 });
  // After the 20th of December both returns are for December, due in January.
  assert.deepEqual(figures.gstDueDates(ist('2026-12-25T10:00:00')).map((g) => [g.form, g.period, g.due_date, g.days_left]), [
    ['GSTR-1', '2026-12', '2027-01-11', 17],
    ['GSTR-3B', '2026-12', '2027-01-20', 26],
  ]);
});

test('health score waits for sales and is built from the business own numbers', () => {
  assert.equal(figures.healthScore({ thisMonth: { sales: 0 }, lastMonth: { sales: 0 }, pendingAmount: 0, overdueAmount: 0 }), null);
  const health = figures.healthScore({
    thisMonth: { sales: 1000, profit: 100, collections: 500 },
    lastMonth: { sales: 0, profit: 0, collections: 0 },
    pendingAmount: 500,
    overdueAmount: 250,
  });
  // 10% margin = 20/40, half collected = 20/40, half the receivables overdue = 10/20.
  assert.deepEqual(health.parts.map((p) => p.points), [20, 20, 10]);
  assert.equal(health.score, 50);
});

test('dashboard summary', { skip: !dbUrl && 'TEST_DATABASE_URL not set' }, async (t) => {
  const models = require('../models');
  const { sequelize, Company, Customer, Supplier, Product, Invoice, InvoiceItem, Purchase, Expense, Payment } = models;
  const ReportService = require('../services/reportService');
  const charisOs = require('../services/charisOsService');
  const originalLimit = charisOs.businessLimit;
  charisOs.businessLimit = async () => 1;
  t.after(async () => { charisOs.businessLimit = originalLimit; await sequelize.close(); });

  // The tables reference each other, so create the whole schema. Other test files sync single
  // tables in parallel; one retry covers a clash with them.
  await sequelize.sync().catch(() => sequelize.sync());

  const now = ist('2026-10-15T12:00:00');

  await t.test('a new business shows zeros and no invented trends', async () => {
    const company = await Company.create({ name: 'Empty Shop' });
    const data = await ReportService.getDashboardSummary(company.id, null, now);
    assert.equal(data.monthlySales, 0);
    assert.equal(data.todaySales, 0);
    assert.equal(data.pendingPayments, 0);
    for (const key of ['sales', 'profit', 'expenses', 'collections']) {
      assert.deepEqual(data.comparison[key], { current: 0, previous: 0, change: null });
    }
    assert.equal(data.dailySales.length, 14);
    assert.ok(data.dailySales.every((d) => d.sales === 0));
    assert.deepEqual(data.lowStock, { count: 0, items: [] });
    assert.equal(data.receivables.overdueCount, 0);
    assert.deepEqual(data.recentInvoices, []);
    assert.deepEqual(data.recentActivity, []);
    assert.deepEqual(data.topProducts, []);
    assert.equal(data.health, null);
    assert.equal(data.gst.registered, false);
    assert.deepEqual(data.gst.dueDates.map((g) => g.due_date), ['2026-10-20', '2026-11-11']);
  });

  await t.test('figures come from the business records', async () => {
    const company = await Company.create({ name: 'Busy Shop', gst_number: '29ABCDE1234F1Z5' });
    const other = await Company.create({ name: 'Other Shop' });
    const c = company.id;
    const customer = await Customer.create({ company_id: c, name: 'Asha Traders' });
    const supplier = await Supplier.create({ company_id: c, name: 'Ravi Wholesale' });
    const p1 = await Product.create({ company_id: c, name: 'Rice 25kg', stock_quantity: 2, low_stock_alert: 5 });
    await Product.create({ company_id: c, name: 'Dal 1kg', stock_quantity: 5, low_stock_alert: 5 });
    const p3 = await Product.create({ company_id: c, name: 'Oil 1L', stock_quantity: 50, low_stock_alert: 10 });
    await Product.create({ company_id: c, name: 'Delivery', type: 'service', stock_quantity: 0, low_stock_alert: 10 });

    const inv = (number, date, total, paid, status, extra = {}) => Invoice.create({
      company_id: c, customer_id: customer.id, invoice_number: number, invoice_date: date,
      total_amount: total, paid_amount: paid, payment_status: status, status: 'sent', ...extra,
    });
    const inv1 = await inv('INV-1', ist('2026-10-03T10:00:00'), 1000, 1000, 'paid');
    const inv2 = await inv('INV-2', ist('2026-10-10T10:00:00'), 500, 200, 'partial', { due_date: ist('2026-10-12T00:00:00') });
    await inv('INV-3', ist('2026-10-05T10:00:00'), 9999, 0, 'unpaid', { status: 'cancelled' });
    await inv('INV-4', ist('2026-09-20T10:00:00'), 800, 400, 'partial');
    // 1 Oct 01:30 India time: October, although it is 30 September in UTC.
    await inv('INV-5', new Date('2026-09-30T20:00:00Z'), 100, 100, 'paid');
    await Invoice.create({ company_id: other.id, customer_id: customer.id, invoice_number: 'X-1', invoice_date: ist('2026-10-03T10:00:00'), total_amount: 7777, status: 'sent' });

    await Payment.create({ company_id: c, customer_id: customer.id, invoice_id: inv2.id, payment_type: 'received', amount: 200, payment_date: ist('2026-10-14T10:00:00') });
    await InvoiceItem.create({ invoice_id: inv1.id, product_id: p3.id, quantity: 2, unit_price: 500, total: 1000 });
    await InvoiceItem.create({ invoice_id: inv2.id, product_id: p1.id, quantity: 1, unit_price: 500, total: 500 });
    await Purchase.create({ company_id: c, supplier_id: supplier.id, bill_number: 'B-1', bill_date: ist('2026-10-04T10:00:00'), total_amount: 300, paid_amount: 300, payment_status: 'paid' });
    await Expense.create({ company_id: c, category: 'Rent', amount: 100, date: ist('2026-10-01T10:00:00') });
    await Expense.create({ company_id: c, category: 'Rent', amount: 50, date: ist('2026-09-01T10:00:00') });

    const data = await ReportService.getDashboardSummary(c, null, now);

    assert.deepEqual(data.comparison.sales, { current: 1600, previous: 800, change: 100 });
    assert.deepEqual(data.comparison.expenses, { current: 100, previous: 50, change: 100 });
    assert.deepEqual(data.comparison.profit, { current: 1200, previous: 750, change: 60 });
    // Oct: 1000 + 100 paid on the invoice, 200 recorded as a payment (not counted twice). Sep: 400.
    assert.deepEqual(data.comparison.collections, { current: 1300, previous: 400, change: 225 });
    assert.equal(data.thisMonth.moneyOut, 400); // purchase paid 300 + expense 100
    assert.equal(data.monthlySales, 1600);

    const daily = Object.fromEntries(data.dailySales.map((d) => [d.date, d.sales]));
    assert.equal(data.dailySales[0].date, '2026-10-02');
    assert.equal(data.dailySales[13].date, '2026-10-15');
    assert.equal(daily['2026-10-03'], 1000);
    assert.equal(daily['2026-10-10'], 500);
    assert.equal(data.dailySales.reduce((s, d) => s + d.sales, 0), 1500);

    assert.equal(data.lowStock.count, 2);
    assert.deepEqual(data.lowStock.items.map((i) => [i.name, i.stock, i.minimum]), [['Rice 25kg', 2, 5], ['Dal 1kg', 5, 5]]);

    assert.equal(data.receivables.pendingAmount, 700); // 300 left on INV-2, 400 on INV-4
    assert.equal(data.receivables.pendingCount, 2);
    assert.equal(data.receivables.overdueAmount, 300);
    assert.equal(data.receivables.overdueCount, 1);
    assert.deepEqual(data.receivables.topCustomers.map((r) => [r.name, r.amount, r.invoices]), [['Asha Traders', 700, 2]]);

    assert.deepEqual(data.topProducts.map((p) => [p.name, p.revenue]), [['Oil 1L', 1000], ['Rice 25kg', 500]]);
    assert.equal(data.recentInvoices.length, 5);
    assert.equal(data.recentInvoices[0].number, 'INV-2');
    assert.ok(data.recentActivity.length > 0 && data.recentActivity.length <= 8);
    assert.equal(data.gst.registered, true);
    assert.ok(data.health && data.health.score >= 0 && data.health.score <= 100);
  });
});
