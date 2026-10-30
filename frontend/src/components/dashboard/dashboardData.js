// Helpers shared by the dashboard panels. Everything here is derived from GET /api/reports/dashboard.

export const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);

export const plural = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

export const dueInText = (days) => (days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due in ${days} days`);

// Whole days from today (India time) to a date; negative when it has passed.
export const daysFromToday = (date) => {
  const istDay = (d) => {
    const t = new Date(new Date(d).getTime() + 330 * 60 * 1000);
    return Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
  };
  return Math.round((istDay(date) - istDay(Date.now())) / 86400000);
};

// Things that need the owner's attention, most urgent first. Empty for a business with nothing due.
export const buildAlerts = (data) => {
  const alerts = [];
  const overdue = data?.receivables;
  if (overdue?.overdueCount > 0) {
    alerts.push({
      id: 'overdue',
      kind: 'overdue',
      title: 'Follow up on overdue invoices',
      desc: `${plural(overdue.overdueCount, 'invoice')} past due · ${formatINR(overdue.overdueAmount)} outstanding`,
      route: '/invoices',
    });
  }
  if (data?.lowStock?.count > 0) {
    alerts.push({
      id: 'low-stock',
      kind: 'stock',
      title: 'Low stock items need reorder',
      desc: `${plural(data.lowStock.count, 'item')} at or below the low-stock level`,
      route: '/products',
    });
  }
  if (data?.gst?.registered) {
    for (const g of data.gst.dueDates || []) {
      if (g.days_left <= 7) {
        alerts.push({
          id: `gst-${g.form}`,
          kind: 'gst',
          title: `${g.form} for ${g.period_label}`,
          desc: dueInText(g.days_left),
          route: '/reports',
        });
      }
    }
  }
  return alerts;
};
