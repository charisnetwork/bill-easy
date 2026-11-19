const { Op } = require('sequelize');
const { Staff, StaffAttendance, StaffPayment, Expense, sequelize } = require('../models');
const { STATUSES, SALARY_TYPES, monthDays, payrollFor } = require('../services/staffPayroll');
const { partyFields } = require('../utils/partyFields');

// Owner and admins can do everything here; a staff login only what its permissions tick:
// staff_view (see the staff list), attendance_mark (mark attendance), payroll_view (see salaries).
const STAFF_PERMISSIONS = ['staff_view', 'attendance_mark', 'payroll_view'];
const isAdmin = (req) => ['owner', 'admin'].includes(req.user?.role);
const can = (req, key) => isAdmin(req) || req.user?.permissions?.[key] === true;
// Staff logins may change attendance only for the last few days; older days are locked for them.
const EDIT_WINDOW_DAYS = 3;

const bad = (message, status = 400) => Object.assign(new Error(message), { status });
const fail = (res, error, fallback) => (error.status && error.status < 500
  ? res.status(error.status).json({ error: error.message })
  : (console.error(fallback, error.message), res.status(500).json({ error: fallback })));
const deny = (res) => res.status(403).json({ error: 'Your role does not have permission for this', code: 'PERMISSION_REQUIRED' });

const today = () => new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10); // India date
const dateValue = (value, label) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) throw bad(`${label} must be a date (YYYY-MM-DD)`);
  return value;
};
const monthValue = (value) => {
  const month = typeof value === 'string' && value ? value : today().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw bad('Month must be YYYY-MM');
  return month;
};
const money = (value, label, { optional = false } = {}) => {
  if (optional && (value === undefined || value === null || value === '')) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100_000_000) throw bad(`${label} must be a positive amount`);
  return Math.round(n * 100) / 100;
};
// Malformed ids are "not found" rather than a database error.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const staffId = (value) => {
  if (typeof value !== 'string' || !UUID.test(value)) throw bad('Staff member not found', 404);
  return value;
};
const time = (value, label) => {
  if (value === undefined || value === null || value === '') return null;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(value))) throw bad(`${label} must be HH:MM`);
  return String(value);
};

function staffData(body, partial) {
  const data = {};
  if (!partial || body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 2 || name.length > 120) throw bad('Name is required (2–120 characters)');
    data.name = name;
  }
  const contact = partyFields({ phone: body.phone, email: body.email });
  if (body.phone !== undefined) data.phone = contact.phone;
  if (body.email !== undefined) data.email = contact.email;
  for (const [key, label, max] of [['role', 'Designation', 80], ['department', 'Department', 80], ['notes', 'Notes', 1000]]) {
    if (body[key] !== undefined) {
      const text = String(body[key] ?? '').trim();
      if (text.length > max) throw bad(`${label} must not exceed ${max} characters`);
      data[key] = text || null;
    }
  }
  if (body.joining_date !== undefined) data.joining_date = body.joining_date ? dateValue(body.joining_date, 'Joining date') : null;
  if (!partial || body.salary_type !== undefined) {
    const type = body.salary_type ?? 'monthly';
    if (!SALARY_TYPES.includes(type)) throw bad('Salary type must be monthly, daily or hourly');
    data.salary_type = type;
  }
  if (!partial || body.salary !== undefined) data.salary = money(body.salary ?? 0, 'Salary');
  if (body.weekly_offs !== undefined) {
    if (!Array.isArray(body.weekly_offs) || body.weekly_offs.some((d) => !Number.isInteger(d) || d < 0 || d > 6) || body.weekly_offs.length > 6) throw bad('Weekly off days must be weekdays 0–6');
    data.weekly_offs = [...new Set(body.weekly_offs)].sort();
  }
  if (body.is_active !== undefined) data.is_active = body.is_active === true;
  return data;
}

const findStaff = (req, id) => Staff.findOne({ where: { id: staffId(id), company_id: req.companyId, deleted_at: null } });

// ---- Staff records ----

const getStaff = async (req, res) => {
  if (!can(req, 'staff_view') && !can(req, 'attendance_mark')) return deny(res);
  try {
    const where = { company_id: req.companyId, deleted_at: null, ...(req.query.include !== 'inactive' && { is_active: true }) };
    const staff = await Staff.findAll({ where, order: [['name', 'ASC']] });
    // People who only mark attendance see names, not salaries.
    res.json(can(req, 'payroll_view') ? staff : staff.map(({ id, name, role, department, weekly_offs, is_active }) => ({ id, name, role, department, weekly_offs, is_active })));
  } catch (error) { fail(res, error, 'Failed to fetch staff'); }
};

const addStaff = async (req, res) => {
  try {
    const staff = await Staff.create({ company_id: req.companyId, ...staffData(req.body, false) });
    res.status(201).json(staff);
  } catch (error) { fail(res, error, 'Failed to add staff member'); }
};

const updateStaff = async (req, res) => {
  try {
    const staff = await findStaff(req, req.params.id);
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    await staff.update(staffData(req.body, true));
    res.json(staff);
  } catch (error) { fail(res, error, 'Failed to update staff member'); }
};

/** Removes from the lists; attendance and payments stay for the records. */
const removeStaff = async (req, res) => {
  try {
    const staff = await findStaff(req, req.params.id);
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    await staff.update({ deleted_at: new Date(), is_active: false });
    res.json({ message: 'Staff member removed. Their attendance and payments are kept.' });
  } catch (error) { fail(res, error, 'Failed to remove staff member'); }
};

// ---- Attendance ----

/** One day: every active staff member with their record for that day (if any). */
const getDayAttendance = async (req, res) => {
  if (!can(req, 'attendance_mark') && !can(req, 'staff_view')) return deny(res);
  try {
    const date = req.query.date ? dateValue(req.query.date, 'Date') : today();
    const staff = await Staff.findAll({ where: { company_id: req.companyId, deleted_at: null, is_active: true }, attributes: ['id', 'name', 'role', 'weekly_offs'], order: [['name', 'ASC']] });
    const records = await StaffAttendance.findAll({ where: { company_id: req.companyId, date } });
    const byStaff = new Map(records.map((r) => [r.staff_id, r]));
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    res.json({
      date, locked: !isAdmin(req) && date < shiftDate(today(), -EDIT_WINDOW_DAYS),
      staff: staff.map((s) => ({ id: s.id, name: s.name, role: s.role, weeklyOff: (s.weekly_offs || []).includes(weekday), record: byStaff.get(s.id) || null })),
    });
  } catch (error) { fail(res, error, 'Failed to load attendance'); }
};

function shiftDate(date, days) {
  const d = new Date(`${date}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10);
}

/** Saves a day's attendance for several people at once (also "Mark all present"). */
const saveAttendance = async (req, res) => {
  if (!can(req, 'attendance_mark')) return deny(res);
  const transaction = await sequelize.transaction();
  try {
    const date = dateValue(req.body.date, 'Date');
    if (date > today()) throw bad('Attendance cannot be marked for a future date');
    if (!isAdmin(req) && date < shiftDate(today(), -EDIT_WINDOW_DAYS)) throw bad(`Attendance older than ${EDIT_WINDOW_DAYS} days can only be changed by the owner or an admin`, 403);
    const entries = Array.isArray(req.body.entries) ? req.body.entries : [];
    if (!entries.length || entries.length > 500) throw bad('Send between 1 and 500 attendance entries');
    const ids = [...new Set(entries.map((e) => staffId(e?.staff_id)))];
    const owned = await Staff.count({ where: { id: { [Op.in]: ids }, company_id: req.companyId, deleted_at: null }, transaction });
    if (owned !== ids.length) throw bad('One or more staff members were not found', 404);
    const rows = entries.map((e) => {
      if (!STATUSES.includes(e.status)) throw bad(`Status must be one of: ${STATUSES.join(', ')}`);
      const overtime = e.overtime_hours === undefined || e.overtime_hours === '' ? 0 : Number(e.overtime_hours);
      if (!Number.isFinite(overtime) || overtime < 0 || overtime > 16) throw bad('Overtime must be between 0 and 16 hours');
      const notes = e.notes === undefined || e.notes === null ? null : String(e.notes).slice(0, 500);
      return { company_id: req.companyId, staff_id: e.staff_id, date, status: e.status, check_in: time(e.check_in, 'Check-in'), check_out: time(e.check_out, 'Check-out'), overtime_hours: overtime, notes, marked_by: req.user?.id || null };
    });
    await StaffAttendance.bulkCreate(rows, { transaction, updateOnDuplicate: ['status', 'check_in', 'check_out', 'overtime_hours', 'notes', 'marked_by', 'company_id', 'updatedAt'], conflictAttributes: ['staff_id', 'date'] });
    await transaction.commit();
    res.json({ message: `Attendance saved for ${rows.length} ${rows.length === 1 ? 'person' : 'people'}`, saved: rows.length });
  } catch (error) {
    await transaction.rollback();
    fail(res, error, 'Failed to save attendance');
  }
};

/** One person's month: every day with its status (weekly offs filled in when not marked). */
const getMonthAttendance = async (req, res) => {
  if (!can(req, 'staff_view') && !can(req, 'attendance_mark')) return deny(res);
  try {
    const month = monthValue(req.query.month);
    const staff = await Staff.findOne({ where: { id: staffId(req.params.id), company_id: req.companyId } });
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    const days = monthDays(month);
    const records = await StaffAttendance.findAll({ where: { staff_id: staff.id, company_id: req.companyId, date: { [Op.between]: [days[0], days[days.length - 1]] } } });
    const byDate = new Map(records.map((r) => [String(r.date), r]));
    const offs = new Set(staff.weekly_offs || []);
    res.json({
      month, staff: { id: staff.id, name: staff.name },
      days: days.map((date) => { const r = byDate.get(date); return { date, status: r?.status ?? (offs.has(new Date(`${date}T00:00:00Z`).getUTCDay()) ? 'week_off' : null), overtime_hours: r ? Number(r.overtime_hours) : 0, marked: Boolean(r) }; }),
    });
  } catch (error) { fail(res, error, 'Failed to load attendance'); }
};

// ---- Payroll ----

async function payrollRows(req, month) {
  const days = monthDays(month);
  const [staff, records, payments] = await Promise.all([
    Staff.findAll({ where: { company_id: req.companyId, [Op.or]: [{ deleted_at: null }, { deleted_at: { [Op.gte]: `${days[0]}T00:00:00Z` } }] }, order: [['name', 'ASC']] }),
    StaffAttendance.findAll({ where: { company_id: req.companyId, date: { [Op.between]: [days[0], days[days.length - 1]] } } }),
    StaffPayment.findAll({ where: { company_id: req.companyId, month } }),
  ]);
  return staff.map((s) => ({
    staff: { id: s.id, name: s.name, role: s.role, salary_type: s.salary_type, salary: Number(s.salary) },
    ...payrollFor(s, records.filter((r) => r.staff_id === s.id), payments.filter((p) => p.staff_id === s.id), month),
  }));
}

const getPayroll = async (req, res) => {
  if (!can(req, 'payroll_view')) return deny(res);
  try {
    const month = monthValue(req.query.month);
    const rows = await payrollRows(req, month);
    const total = (key) => Math.round(rows.reduce((sum, r) => sum + r[key], 0) * 100) / 100;
    res.json({ month, rows, totals: { gross: total('gross'), overtime: total('overtime'), advances: total('advances'), net: total('net'), paid: total('paid'), due: total('due') } });
  } catch (error) { fail(res, error, 'Failed to calculate payroll'); }
};

const csvCell = (value) => { const text = String(value ?? ''); return /^[=+\-@]/.test(text) ? `'${text}` : /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; };
const exportPayroll = async (req, res) => {
  if (!can(req, 'payroll_view')) return deny(res);
  try {
    const month = monthValue(req.query.month);
    const rows = await payrollRows(req, month);
    const header = ['Name', 'Designation', 'Salary type', 'Rate', 'Present', 'Half days', 'Paid leave', 'Week off', 'Holiday', 'Absent', 'Unpaid leave', 'Not marked', 'Payable days', 'Overtime hours', 'Gross', 'Overtime pay', 'Advances', 'Net', 'Paid', 'Due'];
    const lines = rows.map((r) => [r.staff.name, r.staff.role, r.staff.salary_type, r.staff.salary, r.counts.present, r.counts.half_day, r.counts.paid_leave, r.counts.week_off, r.counts.holiday, r.counts.absent, r.counts.unpaid_leave, r.counts.not_marked, r.payableDays, r.overtimeHours, r.gross, r.overtime, r.advances, r.net, r.paid, r.due]);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="payroll-${month}.csv"`);
    res.send(`﻿${[header, ...lines].map((line) => line.map(csvCell).join(',')).join('\n')}\n`);
  } catch (error) { fail(res, error, 'Failed to export payroll'); }
};

const getPayments = async (req, res) => {
  if (!can(req, 'payroll_view')) return deny(res);
  try {
    const month = monthValue(req.query.month);
    const payments = await StaffPayment.findAll({ where: { company_id: req.companyId, month, ...(req.query.staff_id && { staff_id: staffId(req.query.staff_id) }) }, include: [{ model: Staff, attributes: ['name'] }], order: [['date', 'DESC']] });
    res.json(payments);
  } catch (error) { fail(res, error, 'Failed to load payments'); }
};

/** Records an advance, or a salary payment (also saved as a "Salary" expense). */
const addPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const type = req.body.type;
    if (!['salary', 'advance'].includes(type)) throw bad('Type must be salary or advance');
    const staff = await Staff.findOne({ where: { id: staffId(req.body.staff_id), company_id: req.companyId }, transaction });
    if (!staff) throw bad('Staff member not found', 404);
    const amount = money(req.body.amount, 'Amount');
    if (!amount) throw bad('Amount must be more than zero');
    const date = req.body.date ? dateValue(req.body.date, 'Date') : today();
    const month = monthValue(req.body.month || date.slice(0, 7));
    const method = typeof req.body.payment_method === 'string' ? req.body.payment_method.slice(0, 30) : 'Cash';
    const notes = req.body.notes ? String(req.body.notes).slice(0, 500) : null;
    let expense = null;
    if (type === 'salary') {
      expense = await Expense.create({ company_id: req.companyId, category: 'Salary', amount, payment_method: method, date, notes: `Salary ${month} · ${staff.name}${notes ? ` · ${notes}` : ''}` }, { transaction });
    }
    const payment = await StaffPayment.create({ company_id: req.companyId, staff_id: staff.id, type, month, amount, date, payment_method: method, notes, expense_id: expense?.id ?? null, created_by: req.user?.id || null }, { transaction });
    await transaction.commit();
    res.status(201).json(payment);
  } catch (error) {
    await transaction.rollback();
    fail(res, error, 'Failed to record payment');
  }
};

module.exports = {
  STAFF_PERMISSIONS,
  getStaff, addStaff, updateStaff, removeStaff,
  getDayAttendance, saveAttendance, getMonthAttendance,
  getPayroll, exportPayroll, getPayments, addPayment,
  // Kept name for the old route.
  recordAttendance: saveAttendance,
};
