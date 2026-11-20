const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');

// Staff & attendance over HTTP with a real Postgres (TEST_DATABASE_URL); sign-in and the plan faked.
const dbUrl = process.env.TEST_DATABASE_URL;
if (dbUrl) process.env.DATABASE_URL = dbUrl;

test('staff & attendance: plan, permissions, one record a day, tenant isolation, payroll, payments', { skip: !dbUrl && 'TEST_DATABASE_URL not set' }, async (t) => {
  const fake = (rel, exports) => { const file = require.resolve(path.join('..', rel)); require.cache[file] = { id: file, filename: file, loaded: true, exports }; };
  let actor = null;
  const realAuth = require('../middleware/auth');
  fake('middleware/auth', { ...realAuth, authenticateToken: (req, _res, next) => { req.user = actor; next(); } });
  fake('middleware/companyContext', (req, _res, next) => { req.companyId = actor.company_id; next(); });
  const charisOs = require('../services/charisOsService');
  let entitlements = [];
  charisOs.getSnapshot = async () => ({ status: 'active', entitlements });
  const grant = (code, limit = null) => ({ feature_code: code, enabled: true, limit_type: limit === null ? 'unlimited' : 'limited', limit_value: limit });

  const models = require('../models');
  const { sequelize, Company, Expense, StaffAttendance } = models;
  await sequelize.sync().catch(() => sequelize.sync());
  const app = express();
  app.use(express.json());
  app.use('/api/staff', require('../routes/staff'));
  const server = app.listen(0);
  t.after(async () => { server.close(); await sequelize.close(); });
  const base = `http://127.0.0.1:${server.address().port}/api/staff`;
  const call = async (method, url, body) => { const r = await fetch(base + url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); const text = await r.text(); return { status: r.status, body: text.startsWith('{') || text.startsWith('[') ? JSON.parse(text) : text }; };

  const shop = await Company.create({ name: `Staff QA ${crypto.randomUUID()}` });
  const other = await Company.create({ name: `Other QA ${crypto.randomUUID()}` });
  const owner = { id: crypto.randomUUID(), company_id: shop.id, role: 'owner', permissions: {} };
  const clerk = { id: crypto.randomUUID(), company_id: shop.id, role: 'staff', permissions: { attendance_mark: true } };
  const today = new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  await t.test('without the Enterprise feature the module is closed', async () => {
    actor = owner; entitlements = [];
    assert.equal((await call('GET', '/')).status, 403);
  });

  await t.test('a plan with the module but no staff limit row has no staff limit; bad ids are 404', async () => {
    actor = owner; entitlements = [grant('staff_attendance_payroll')];
    const extra = await call('POST', '/', { name: 'Unlisted', salary: 1 });
    assert.equal(extra.status, 201, JSON.stringify(extra.body));
    assert.equal((await call('DELETE', `/${extra.body.id}`)).status, 200);
    assert.equal((await call('PUT', '/attendance', { date: today, entries: [{ staff_id: 'null', status: 'present' }] })).status, 404);
    assert.equal((await call('GET', '/not-a-uuid/attendance')).status, 404);
    entitlements = [grant('staff_attendance_payroll'), { ...grant('staff_members'), enabled: false }];
    assert.equal((await call('POST', '/', { name: 'Switched off', salary: 1 })).status, 403);
  });

  entitlements = [grant('staff_attendance_payroll'), grant('staff_members', 2)];
  let asha; let ravi;
  await t.test('owner adds staff; the plan staff limit applies; bad input is refused', async () => {
    actor = owner;
    assert.equal((await call('POST', '/', { name: 'A', salary: 100 })).status, 400);
    assert.equal((await call('POST', '/', { name: 'Asha', salary_type: 'weekly', salary: 100 })).status, 400);
    asha = (await call('POST', '/', { name: 'Asha', role: 'Cashier', salary_type: 'monthly', salary: 30000, weekly_offs: [0], phone: '9845012345' })).body;
    ravi = (await call('POST', '/', { name: 'Ravi', salary_type: 'daily', salary: 700 })).body;
    assert.ok(asha.id && ravi.id);
    assert.equal((await call('POST', '/', { name: 'Third', salary: 1 })).status, 403, 'limit of 2 staff');
  });

  await t.test('a staff login with only "mark attendance" can mark today but not see salaries or pay', async () => {
    actor = clerk;
    const list = (await call('GET', '/')).body;
    assert.equal(list.length, 2);
    assert.equal(list[0].salary, undefined, 'no salary for attendance-only logins');
    assert.equal((await call('GET', '/payroll')).status, 403);
    assert.equal((await call('POST', '/payments', { staff_id: asha.id, type: 'advance', amount: 100 })).status, 403);
    assert.equal((await call('POST', '/', { name: 'Sneaky', salary: 1 })).status, 403);
    const saved = await call('PUT', '/attendance', { date: today, entries: [{ staff_id: asha.id, status: 'present' }, { staff_id: ravi.id, status: 'half_day' }] });
    assert.equal(saved.status, 200, JSON.stringify(saved.body));
    const old = new Date(Date.parse(`${today}T00:00:00Z`) - 10 * 86400_000).toISOString().slice(0, 10);
    assert.equal((await call('PUT', '/attendance', { date: old, entries: [{ staff_id: asha.id, status: 'absent' }] })).status, 403, 'older days are locked for staff logins');
  });

  await t.test('one record per person per day: marking again updates it', async () => {
    actor = owner;
    assert.equal((await call('PUT', '/attendance', { date: today, entries: [{ staff_id: asha.id, status: 'present', overtime_hours: 2 }] })).status, 200);
    assert.equal(await StaffAttendance.count({ where: { staff_id: asha.id, date: today } }), 1);
    const day = (await call('GET', `/attendance?date=${today}`)).body;
    assert.equal(day.staff.find((s) => s.id === asha.id).record.status, 'present');
    assert.equal((await call('PUT', '/attendance', { date: today, entries: [{ staff_id: asha.id, status: 'maybe' }] })).status, 400);
    const times = await call('PUT', '/attendance', { date: today, entries: [{ staff_id: asha.id, status: 'present', check_in: '18:00', check_out: '09:00' }] });
    assert.equal(times.status, 400);
    assert.match(times.body.error, /later than check-in/);
  });

  await t.test("another business's staff cannot be marked, edited or paid", async () => {
    actor = { ...owner, company_id: other.id };
    assert.equal((await call('PUT', '/attendance', { date: today, entries: [{ staff_id: asha.id, status: 'absent' }] })).status, 404);
    assert.equal((await call('PUT', `/${asha.id}`, { salary: 1 })).status, 404);
    assert.equal((await call('POST', '/payments', { staff_id: asha.id, type: 'salary', amount: 10 })).status, 404);
    assert.equal((await call('GET', '/')).body.length, 0);
  });

  await t.test('payroll comes from attendance; a salary payment is also an expense', async () => {
    actor = owner;
    assert.equal((await call('POST', '/payments', { staff_id: asha.id, type: 'advance', amount: 1000, month })).status, 201);
    const paid = await call('POST', '/payments', { staff_id: asha.id, type: 'salary', amount: 500, month });
    assert.equal(paid.status, 201);
    const expense = await Expense.findByPk(paid.body.expense_id);
    assert.equal(expense.category, 'Salary');
    assert.equal(Number(expense.amount), 500);
    const payroll = (await call('GET', `/payroll?month=${month}`)).body;
    const row = payroll.rows.find((r) => r.staff.id === asha.id);
    assert.equal(row.counts.present, 1);
    assert.equal(row.overtimeHours, 2);
    assert.equal(row.advances, 1000);
    assert.equal(row.paid, 500);
    assert.equal(payroll.rows.find((r) => r.staff.id === ravi.id).gross, 350, 'daily wage: half day');
    const csv = await call('GET', `/payroll/export?month=${month}`);
    assert.equal(csv.status, 200);
    assert.match(csv.body, /Asha/);
  });

  await t.test('attendance before the joining date is refused, and the day list leaves them out', async () => {
    actor = owner; entitlements = [grant('staff_attendance_payroll'), grant('staff_members', 10)];
    const late = (await call('POST', '/', { name: 'Late Joiner', salary_type: 'hourly', salary: 100, joining_date: today })).body;
    assert.ok(late.id, JSON.stringify(late));
    const before = new Date(Date.parse(`${today}T00:00:00Z`) - 86400_000).toISOString().slice(0, 10);
    const refused = await call('PUT', '/attendance', { date: before, entries: [{ staff_id: late.id, status: 'present' }] });
    assert.equal(refused.status, 400);
    assert.match(refused.body.error, /joining date/);
    assert.ok(!(await call('GET', `/attendance?date=${before}`)).body.staff.some((s) => s.id === late.id));
    assert.ok((await call('GET', `/attendance?date=${today}`)).body.staff.some((s) => s.id === late.id));
    assert.equal((await call('DELETE', `/${late.id}`)).status, 200);
  });

  await t.test('removing a member keeps their history', async () => {
    actor = owner;
    assert.equal((await call('DELETE', `/${ravi.id}`)).status, 200);
    assert.equal((await call('GET', '/')).body.length, 1);
    assert.equal(await StaffAttendance.count({ where: { staff_id: ravi.id } }), 1);
  });
});
