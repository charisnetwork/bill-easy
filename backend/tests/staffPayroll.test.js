const test = require('node:test');
const assert = require('node:assert/strict');
const { payrollFor, monthDays } = require('../services/staffPayroll');

// November 2026: 30 days, Sundays on 1, 8, 15, 22, 29.
const month = '2026-11';
const mark = (from, to, status, extra = {}) => monthDays(month).slice(from - 1, to).map((date) => ({ date, status, ...extra }));

test('monthly salary is pro-rata on payable days; Sundays off are paid; unmarked days are not', () => {
  const staff = { salary_type: 'monthly', salary: 30000, weekly_offs: [0] };
  // Every working day present except 2 absent and 1 half day; nothing marked on Sundays.
  const days = monthDays(month).filter((d) => new Date(`${d}T00:00:00Z`).getUTCDay() !== 0);
  const records = days.map((date, i) => ({ date, status: i === 0 || i === 1 ? 'absent' : i === 2 ? 'half_day' : 'present' }));
  const pay = payrollFor(staff, records, [], month, '2026-12-31');
  assert.equal(pay.counts.week_off, 5);
  assert.equal(pay.counts.absent, 2);
  assert.equal(pay.payableDays, 22 + 5 + 0.5); // 22 present + 5 Sundays + half day
  assert.equal(pay.gross, 27500);
  assert.equal(pay.counts.not_marked, 0);
});

test('overtime and advances; nothing marked means not paid but shown as not marked', () => {
  const staff = { salary_type: 'monthly', salary: 24000, weekly_offs: [] };
  const records = [...mark(1, 10, 'present'), { date: '2026-11-11', status: 'present', overtime_hours: 4 }];
  const pay = payrollFor(staff, records, [{ type: 'advance', amount: 2000 }, { type: 'salary', amount: 5000 }], month, '2026-12-31');
  assert.equal(pay.counts.not_marked, 19);
  assert.equal(pay.gross, 8800); // 11 / 30 x 24000
  assert.equal(pay.overtime, 400); // 4 h x (24000 / 30 / 8)
  assert.equal(pay.net, 8800 + 400 - 2000);
  assert.equal(pay.due, 7200 - 5000);
});

test('daily wages count days worked; hourly counts hours from check-in and check-out', () => {
  const daily = payrollFor({ salary_type: 'daily', salary: 700, weekly_offs: [0] }, [...mark(2, 6, 'present'), { date: '2026-11-07', status: 'half_day' }, { date: '2026-11-09', status: 'paid_leave' }], [], month, '2026-12-31');
  assert.equal(daily.payableDays, 5 + 0.5 + 1);
  assert.equal(daily.gross, 4550);
  const hourly = payrollFor({ salary_type: 'hourly', salary: 100, weekly_offs: [] }, [{ date: '2026-11-02', status: 'present', check_in: '09:00', check_out: '17:30' }, { date: '2026-11-03', status: 'present' }, { date: '2026-11-04', status: 'half_day' }], [], month, '2026-12-31');
  assert.equal(hourly.hours, 8.5 + 8 + 4);
  assert.equal(hourly.gross, 2050);
});

test('a running month pays only days so far; days before joining are not counted', () => {
  const staff = { salary_type: 'monthly', salary: 30000, weekly_offs: [0], joining_date: '2026-11-03' };
  const pay = payrollFor(staff, [{ date: '2026-11-03', status: 'present' }, { date: '2026-11-04', status: 'present' }], [], '2026-11', '2026-11-10');
  assert.equal(pay.counts.week_off, 1, 'only Sunday the 8th; the 1st is before joining, later Sundays are upcoming');
  assert.equal(pay.counts.not_marked, 5, '5th–7th, 9th, 10th');
  assert.equal(pay.upcoming, 20);
  assert.equal(pay.payableDays, 3);
  assert.equal(pay.gross, 3000);
});
