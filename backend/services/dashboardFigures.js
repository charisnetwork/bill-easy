// Date maths and derived figures for the dashboard. Pure functions (no database) so they
// can be tested directly. Months and days are India time (UTC+5:30, no daylight saving).

const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n) => String(n).padStart(2, '0');

// Calendar date in India for an instant: { y, m (0-11), d }.
function istParts(now = new Date()) {
  const t = new Date(now.getTime() + IST_OFFSET_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate() };
}

// The instant an India-time day starts. Month/day overflow is normalised (m = 12 is next January).
function istStart(y, m, d = 1) {
  return new Date(Date.UTC(y, m, d) - IST_OFFSET_MS);
}

// "YYYY-MM" for a (possibly overflowing) year/month pair.
function monthKey(y, m) {
  const date = new Date(Date.UTC(y, m, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

function dayKey(date) {
  const { y, m, d } = istParts(date);
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

// The last `count` India-time months ending with the current one: [{ key, start, end }], oldest first.
function lastMonths(now = new Date(), count = 6) {
  const { y, m } = istParts(now);
  const months = [];
  for (let i = count - 1; i >= 0; i--) {
    months.push({ key: monthKey(y, m - i), start: istStart(y, m - i, 1), end: istStart(y, m - i + 1, 1) });
  }
  return months;
}

// The last `count` India-time days ending today: ["YYYY-MM-DD"], oldest first, plus the range they cover.
function lastDays(now = new Date(), count = 14) {
  const { y, m, d } = istParts(now);
  const days = [];
  for (let i = count - 1; i >= 0; i--) days.push(dayKey(istStart(y, m, d - i)));
  return { days, start: istStart(y, m, d - count + 1), end: istStart(y, m, d + 1) };
}

// Percentage change from previous to current, one decimal. null when there is nothing to compare
// against (no previous figure), so the dashboard can hide the trend instead of inventing one.
function percentChange(current, previous) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  if (p === 0) return null;
  return Math.round(((c - p) / Math.abs(p)) * 1000) / 10;
}

// Monthly GST returns for a regular (monthly) filer: GSTR-1 is due on the 11th and GSTR-3B on the
// 20th of the month after the tax period. Returns the next due date of each, soonest first.
function gstDueDates(now = new Date()) {
  const { y, m, d } = istParts(now);
  const today = istStart(y, m, d);
  return [
    { form: 'GSTR-1', day: 11 },
    { form: 'GSTR-3B', day: 20 },
  ].map(({ form, day }) => {
    // Still on or before this month's due day: it is last month's return. Otherwise this month's.
    const dueMonth = d <= day ? m : m + 1;
    const due = istStart(y, dueMonth, day);
    const period = monthKey(y, dueMonth - 1);
    return {
      form,
      period,
      period_label: monthLabel(period),
      due_date: dayKey(due),
      days_left: Math.round((due - today) / DAY_MS),
    };
  }).sort((a, b) => a.days_left - b.days_left);
}

// A 0-100 score from the business's own numbers, with the parts shown to the user.
// null until there are sales in this or last month to judge.
function healthScore({ thisMonth, lastMonth, pendingAmount, overdueAmount }) {
  const sales = (thisMonth?.sales || 0) + (lastMonth?.sales || 0);
  if (sales <= 0) return null;
  const profit = (thisMonth?.profit || 0) + (lastMonth?.profit || 0);
  const collections = (thisMonth?.collections || 0) + (lastMonth?.collections || 0);

  const clamp = (v) => Math.max(0, Math.min(1, v));
  const margin = profit / sales;
  const parts = [
    { key: 'margin', label: 'Profit margin', value: Math.round(margin * 1000) / 10, points: Math.round(clamp(margin / 0.2) * 40), max: 40 },
    { key: 'collections', label: 'Collected vs billed', value: Math.round((collections / sales) * 1000) / 10, points: Math.round(clamp(collections / sales) * 40), max: 40 },
    {
      key: 'overdue',
      label: 'Receivables overdue',
      value: pendingAmount > 0 ? Math.round((overdueAmount / pendingAmount) * 1000) / 10 : 0,
      points: Math.round((pendingAmount > 0 ? clamp(1 - overdueAmount / pendingAmount) : 1) * 20),
      max: 20,
    },
  ];
  return { score: parts.reduce((sum, p) => sum + p.points, 0), parts };
}

module.exports = { istParts, istStart, monthKey, monthLabel, dayKey, lastMonths, lastDays, percentChange, gstDueDates, healthScore };
