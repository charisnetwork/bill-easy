/**
 * /api/subscription when CHARIS_SUBSCRIPTION_MODE=enforce.
 *
 * Plans, prices, coupons and payment verification come from Charis OS. The browser never
 * supplies amounts, entitlements or the billing tenant; the owner's session decides them.
 */
const charisOs = require('../services/charisOsService');

const MANAGED = 'charis_os';

const send = (res, status, body) => {
  res.set('Cache-Control', 'private, no-store');
  return res.status(status).json(body);
};

const fail = (res, error, next) => {
  if (error instanceof charisOs.CharisOsError) return send(res, error.status, { error: error.message, code: error.code });
  return next(error);
};

const handle = (action) => async (req, res, next) => {
  try { return send(res, 200, await action(req)); }
  catch (error) { return fail(res, error, next); }
};

const allowOnly = (body, keys) => {
  const value = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const extra = Object.keys(value).filter(key => !keys.includes(key));
  if (extra.length) throw new charisOs.CharisOsError(400, 'INVALID_FIELDS', `Unsupported fields: ${extra.join(', ')}`);
  return value;
};

const planView = (plan) => ({
  id: plan.id,
  name: plan.name,
  description: plan.description || '',
  price: Number(plan.price),
  currency: plan.currency,
  duration_value: plan.duration_value,
  duration_unit: plan.duration_unit,
  recommended: plan.recommended === true,
  features: plan.entitlements,
});

const getPlans = handle(async () => {
  const catalog = await charisOs.getCatalog();
  return { managed_by: MANAGED, checkout_enabled: catalog.checkout_enabled === true, plans: catalog.plans.map(planView) };
});

const getCurrentSubscription = handle(async (req) => {
  const [snapshot, tenantId] = await Promise.all([charisOs.getSnapshot(req.companyId), charisOs.billingTenantId(req.companyId)]);
  let planId = null;
  if (snapshot.status !== 'unassigned') {
    try { planId = (await charisOs.checkout(req.companyId)).current_term?.plan_id || null; }
    catch { planId = null; } // Plan highlighting only; access decisions use the snapshot.
  }
  return {
    managed_by: MANAGED,
    status: snapshot.status,
    subscription_id: snapshot.subscription_id,
    plan_id: planId,
    plan_name: snapshot.plan_name,
    starts_at: snapshot.starts_at,
    ends_at: snapshot.ends_at,
    shared_from_primary_business: tenantId !== req.companyId,
    features: snapshot.entitlements,
    // Fields the existing UI already reads.
    Plan: { plan_name: snapshot.plan_name },
    start_date: snapshot.starts_at,
    expiry_date: snapshot.ends_at,
  };
});

const usageEntry = (snapshot, code, used) => {
  let limit = null;
  try { limit = charisOs.limitFor(snapshot, code); }
  catch { return { used, limit: 0, unlimited: false, included: false, percentage: 100 }; }
  return { used, limit, unlimited: limit === null, included: true, percentage: limit ? Math.min(100, (used / limit) * 100) : 0 };
};

const getUsage = handle(async (req) => {
  const [snapshot, usage] = await Promise.all([charisOs.getSnapshot(req.companyId), charisOs.usageFor(req.companyId)]);
  return { managed_by: MANAGED, status: snapshot.status, invoices: usageEntry(snapshot, 'invoices', usage.invoices), products: usageEntry(snapshot, 'products', usage.products) };
});

const getCheckout = handle(async (req) => ({ managed_by: MANAGED, ...(await charisOs.checkout(req.companyId)) }));

const quote = handle(async (req) => {
  const body = allowOnly(req.body, ['plan_id', 'coupon_code']);
  return charisOs.checkout(req.companyId, 'quote', { plan_id: body.plan_id, coupon_code: body.coupon_code || null });
});

const createOrder = async (req, res, next) => {
  try {
    const body = allowOnly(req.body, ['plan_id', 'idempotency_key', 'coupon_code', 'previous_subscription_id', 'previous_version', 'replacement_acknowledged']);
    await charisOs.syncCompany(req.companyId);
    const result = await charisOs.checkout(req.companyId, 'orders', { ...body, coupon_code: body.coupon_code || null, actor_id: String(req.user.id) });
    return send(res, 201, { managed_by: MANAGED, ...result });
  } catch (error) { return fail(res, error, next); }
};

const verify = handle(async (req) => {
  const body = allowOnly(req.body, ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature']);
  return { managed_by: MANAGED, ...(await charisOs.checkout(req.companyId, 'verify', body)) };
});

const sync = handle(async (req) => {
  await charisOs.claimFreePlan(req.companyId, req.user.id);
  return { managed_by: MANAGED, synced: true };
});

/** Local plan changes, local coupons and unverified payment upgrades are disabled in OS mode. */
const managedElsewhere = (_req, res) => send(res, 409, {
  error: 'Plans and payments are managed by Charis OS. Choose a plan on the Subscription page.',
  code: 'MANAGED_BY_CHARIS_OS',
});

module.exports = { getPlans, getCurrentSubscription, getUsage, getCheckout, quote, createOrder, verify, sync, managedElsewhere };
