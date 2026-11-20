// Salary for one staff member for one month, from attendance and payments. Plain functions so the
// maths is tested on its own; the controller loads the rows.

const STATUSES = ['present', 'absent', 'half_day', 'paid_leave', 'unpaid_leave', 'week_off', 'holiday'];
const SALARY_TYPES = ['monthly', 'daily', 'hourly'];
const round2 = (n) => Math.round(n * 100) / 100;

/** Every date (YYYY-MM-DD) of a month 'YYYY-MM'. */
function monthDays(month) {
  const [y, m] = month.split('-').map(Number);
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`);
}

const minutes = (hhmm) => { const [h, m] = String(hhmm || '').split(':').map(Number); return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null; };
function hoursWorked(record) {
  const start = minutes(record.check_in); const end = minutes(record.check_out);
  if (start !== null && end !== null && end > start) return (end - start) / 60;
  return record.status === 'half_day' ? 4 : 8;
}

/**
 * staff: { salary_type, salary, weekly_offs }; records: attendance rows for the month;
 * payments: { type: 'salary'|'advance', amount } for the month.
 * A day with no record is a week off when it falls on a weekly-off day, otherwise "not marked"
 * (not paid, and shown so the owner can mark it). Unmarked days after `today` (month still
 * running) are not counted, and nothing before the joining date counts, marked or not.
 */
function payrollFor(staff, records, payments, month, today = new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10)) {
  const days = monthDays(month);
  const byDate = new Map(records.map((r) => [String(r.date).slice(0, 10), r]));
  const offs = new Set((staff.weekly_offs || []).map(Number));
  const counts = { present: 0, absent: 0, half_day: 0, paid_leave: 0, unpaid_leave: 0, week_off: 0, holiday: 0, not_marked: 0 };
  const joined = staff.joining_date ? String(staff.joining_date).slice(0, 10) : null;
  let hours = 0; let overtimeHours = 0; let upcoming = 0;
  for (const date of days) {
    const record = byDate.get(date);
    // Before joining nothing counts, even a record marked by mistake; later days only when marked.
    if (joined && date < joined) continue;
    if (!record && date > today) { upcoming += 1; continue; }
    if (!record) {
      const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
      counts[offs.has(weekday) ? 'week_off' : 'not_marked'] += 1;
      continue;
    }
    counts[record.status in counts ? record.status : 'present'] += 1;
    overtimeHours += Number(record.overtime_hours) || 0;
    if (record.status === 'present' || record.status === 'half_day') hours += hoursWorked(record);
  }
  const rate = Number(staff.salary) || 0;
  const halfDays = counts.half_day * 0.5;
  let gross; let hourlyRate; let payableDays;
  if (staff.salary_type === 'daily') {
    payableDays = counts.present + counts.paid_leave + halfDays;
    gross = rate * payableDays; hourlyRate = rate / 8;
  } else if (staff.salary_type === 'hourly') {
    payableDays = counts.present + halfDays;
    gross = rate * hours; hourlyRate = rate;
  } else {
    payableDays = counts.present + counts.paid_leave + counts.week_off + counts.holiday + halfDays;
    gross = (rate * payableDays) / days.length; hourlyRate = rate / days.length / 8;
  }
  const overtime = overtimeHours * hourlyRate;
  const sum = (type) => payments.filter((p) => p.type === type).reduce((total, p) => total + Number(p.amount || 0), 0);
  const advances = sum('advance'); const paid = sum('salary');
  const net = gross + overtime - advances;
  return {
    month, days: days.length, counts, upcoming, payableDays, hours: round2(hours), overtimeHours: round2(overtimeHours),
    gross: round2(gross), overtime: round2(overtime), advances: round2(advances), net: round2(net),
    paid: round2(paid), due: round2(Math.max(0, net - paid)),
  };
}

module.exports = { STATUSES, SALARY_TYPES, monthDays, payrollFor };
