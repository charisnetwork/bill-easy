/**
 * Atomic invoice-quota consumption. The subscription row is locked inside the
 * invoice transaction, so two concurrent invoice requests cannot both consume
 * the final slot. Usage is reset lazily at the billing-period boundary; no cron
 * is required for correctness.
 */
function periodStart(date, cycle) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

function addCycle(start, cycle) {
  const end = new Date(start);
  const months = cycle === 'yearly' ? 12 : cycle === '6month' ? 6 : cycle === '3month' ? 3 : 1;
  end.setUTCMonth(end.getUTCMonth() + months);
  return end;
}

async function consumeInvoiceQuota({ Subscription, Plan, companyId, transaction }) {
  const subscription = await Subscription.findOne({
    where: { company_id: companyId }, include: [Plan], transaction, lock: transaction.LOCK.UPDATE,
  });
  if (!subscription || !subscription.Plan || !['active', 'trial'].includes(subscription.status)) {
    const error = new Error('No active subscription'); error.code = 'NO_SUBSCRIPTION'; throw error;
  }
  const plan = subscription.Plan;
  const usage = { ...(subscription.usage || {}) };
  const start = periodStart(subscription.start_date || new Date(), plan.billing_cycle);
  const end = addCycle(start, plan.billing_cycle);
  const now = new Date();
  if (!usage.invoice_period_start || new Date(usage.invoice_period_start).getTime() !== start.getTime() || now >= end) {
    usage.invoices = 0;
    usage.invoice_period_start = now >= end ? periodStart(now, plan.billing_cycle).toISOString() : start.toISOString();
    usage.invoice_period_end = addCycle(new Date(usage.invoice_period_start), plan.billing_cycle).toISOString();
  }
  const limit = plan.max_invoices_per_month;
  if (Number.isFinite(limit) && limit >= 0 && (usage.invoices || 0) >= limit) {
    const error = new Error('Invoice quota exceeded'); error.code = 'QUOTA_EXCEEDED'; error.limit = limit; throw error;
  }
  usage.invoices = (usage.invoices || 0) + 1;
  await subscription.update({ usage }, { transaction });
}

module.exports = { consumeInvoiceQuota };
