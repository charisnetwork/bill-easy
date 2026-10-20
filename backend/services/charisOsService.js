/**
 * Charis OS subscription client (contract_version 1).
 *
 * OS owns plans, coupons, affiliates and payment verification; Bill Easy enforces the
 * resulting entitlements. Disabled unless CHARIS_SUBSCRIPTION_MODE=enforce, in which case
 * local plan tables are no longer consulted for access decisions.
 *
 * Billing tenant: an owner's first business. Businesses added later share its plan;
 * invoice/product usage is still counted per business.
 */
const { Op } = require('sequelize');

class CharisOsError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const SNAPSHOT_TTL_MS = 60 * 1000;
const TENANT_TTL_MS = 5 * 60 * 1000;
const STATUSES = ['active', 'pending', 'suspended', 'cancelled', 'expired', 'unassigned'];

function charisOsConfig(source = process.env) {
  const mode = (source.CHARIS_SUBSCRIPTION_MODE || 'off').trim();
  if (!['off', 'enforce'].includes(mode)) throw new Error('CHARIS_SUBSCRIPTION_MODE must be off or enforce');
  if (mode === 'off') return null;
  const url = source.CHARIS_OS_URL?.trim();
  const appId = source.CHARIS_OS_APP_ID?.trim();
  const key = source.CHARIS_OS_APP_KEY?.trim();
  if (!url || !appId || !key) throw new Error('CHARIS_OS_URL, CHARIS_OS_APP_ID and CHARIS_OS_APP_KEY are required when enforcing');
  const parsed = new URL(url);
  const loopback = ['localhost', '127.0.0.1'].includes(parsed.hostname);
  if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/'
    || (parsed.protocol !== 'https:' && !(source.NODE_ENV !== 'production' && parsed.protocol === 'http:' && loopback))) {
    throw new Error('CHARIS_OS_URL must be an HTTPS origin');
  }
  if (!/^[a-f0-9-]{36}$/i.test(appId)) throw new Error('CHARIS_OS_APP_ID must be a UUID');
  return { origin: parsed.origin, appId, key };
}

const enabled = () => charisOsConfig() !== null;

async function osRequest(resource, { method = 'GET', body, checkout = false } = {}) {
  const config = charisOsConfig();
  if (!config) return null;
  let response;
  let text;
  try {
    response = await fetch(`${config.origin}/api/v1/integrations/apps/${config.appId}/${resource}`, {
      method,
      headers: { 'X-Charis-App-Key': config.key, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(checkout ? 20000 : 5000),
      redirect: 'error',
    });
    text = await response.text();
  } catch {
    throw new CharisOsError(503, 'SUBSCRIPTION_UNAVAILABLE', 'Subscription service is temporarily unavailable. Please retry.');
  }
  if (Buffer.byteLength(text) > 256 * 1024) throw new CharisOsError(503, 'SUBSCRIPTION_UNAVAILABLE', 'Subscription service returned an invalid response');
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* handled below */ }
  if (!response.ok) {
    if (checkout && [400, 404, 409, 422, 503].includes(response.status)) {
      const detail = data?.detail;
      throw new CharisOsError(response.status, 'CHECKOUT_REJECTED', typeof detail === 'string' ? detail.slice(0, 300) : 'Checkout request could not be processed');
    }
    throw new CharisOsError(503, 'SUBSCRIPTION_UNAVAILABLE', 'Subscription service is temporarily unavailable. Please retry.');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new CharisOsError(503, 'SUBSCRIPTION_UNAVAILABLE', 'Subscription service returned an invalid response');
  return data;
}

function parseSnapshot(data, appId, tenantId) {
  const invalid = () => new CharisOsError(503, 'SUBSCRIPTION_UNAVAILABLE', 'Subscription could not be verified');
  if (data.contract_version !== 1 || data.application_id !== appId || data.tenant_id !== tenantId || !STATUSES.includes(data.status)
    || !Array.isArray(data.entitlements) || data.entitlements.length > 200) throw invalid();
  for (const field of ['subscription_id', 'plan_name', 'starts_at', 'ends_at']) {
    if (data[field] !== null && typeof data[field] !== 'string') throw invalid();
  }
  if (data.status === 'active' && (!data.subscription_id || !data.starts_at || Date.parse(data.starts_at) > Date.now())) throw invalid();
  const seen = new Set();
  for (const e of data.entitlements) {
    if (!e || typeof e.feature_code !== 'string' || !/^[a-z][a-z0-9_]{1,99}$/.test(e.feature_code) || seen.has(e.feature_code) || typeof e.enabled !== 'boolean') throw invalid();
    seen.add(e.feature_code);
    if (e.enabled && !['limited', 'unlimited'].includes(e.limit_type)) throw invalid();
    if (e.enabled && e.limit_type === 'limited' && (!Number.isSafeInteger(e.limit_value) || e.limit_value < 0)) throw invalid();
  }
  const snapshot = { ...data };
  if (snapshot.status === 'active' && snapshot.ends_at && Date.parse(snapshot.ends_at) <= Date.now()) snapshot.status = 'expired';
  return snapshot;
}

const snapshotCache = new Map();
const tenantCache = new Map();

function clearCache(tenantId) {
  if (!tenantId) { snapshotCache.clear(); tenantCache.clear(); return; }
  snapshotCache.delete(tenantId);
}

/** The OS customer for a business: the earliest business owned by the same owner. */
async function billingTenantId(companyId) {
  const cached = tenantCache.get(companyId);
  if (cached && cached.until > Date.now()) return cached.tenantId;
  const { Company, UserCompany } = require('../models');
  const company = await Company.findByPk(companyId, { attributes: ['id', 'owner_id'] });
  if (!company) throw new CharisOsError(404, 'COMPANY_NOT_FOUND', 'Company is unavailable');
  let ownerId = company.owner_id;
  if (!ownerId) ownerId = (await UserCompany.findOne({ where: { company_id: companyId, role: 'owner' }, attributes: ['user_id'] }))?.user_id;
  let tenantId = companyId;
  if (ownerId) {
    const owned = await UserCompany.findAll({ where: { user_id: ownerId, role: 'owner' }, attributes: ['company_id'] });
    const first = await Company.findOne({ where: { id: owned.map(o => o.company_id).concat(companyId) }, order: [['createdAt', 'ASC'], ['id', 'ASC']], attributes: ['id'] });
    if (first) tenantId = first.id;
  }
  if (tenantCache.size >= 2000) tenantCache.clear();
  tenantCache.set(companyId, { tenantId, until: Date.now() + TENANT_TTL_MS });
  return tenantId;
}

async function getSnapshot(companyId) {
  const config = charisOsConfig();
  if (!config) return null;
  const tenantId = await billingTenantId(companyId);
  const entry = snapshotCache.get(tenantId);
  if (entry && entry.until > Date.now()) return entry.snapshot;
  const snapshot = parseSnapshot(await osRequest(`tenants/${encodeURIComponent(tenantId)}/subscription`), config.appId, tenantId);
  if (snapshotCache.size >= 2000) snapshotCache.clear();
  const endsAt = snapshot.status === 'active' && snapshot.ends_at ? Date.parse(snapshot.ends_at) : Infinity;
  snapshotCache.set(tenantId, { snapshot, until: Math.min(Date.now() + SNAPSHOT_TTL_MS, endsAt) });
  return snapshot;
}

const entitlement = (snapshot, code) => snapshot.entitlements.find(e => e.feature_code === code);

/** Deny-by-default feature decision for an active term. */
function featureAllowed(snapshot, code) {
  if (!snapshot || snapshot.status !== 'active') return false;
  return entitlement(snapshot, code)?.enabled === true;
}

/** null = unlimited; a number = limit; throws when the term or entitlement does not allow it. */
function limitFor(snapshot, code) {
  if (!snapshot || snapshot.status !== 'active') throw new CharisOsError(403, 'SUBSCRIPTION_INACTIVE', 'An active subscription is required. Please choose a plan.');
  const e = entitlement(snapshot, code);
  if (!e?.enabled) throw new CharisOsError(403, 'FEATURE_NOT_AVAILABLE', 'Your current plan does not include this feature. Please upgrade.');
  return e.limit_type === 'unlimited' ? null : e.limit_value;
}

function startOfMonthIst(now = new Date()) {
  // Asia/Kolkata has no DST: month boundaries are fixed at UTC+05:30.
  const ist = new Date(now.getTime() + 330 * 60 * 1000);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), 1) - 330 * 60 * 1000);
}

async function usageFor(companyId, now = new Date()) {
  const { Invoice, Product } = require('../models');
  const [invoices, products] = await Promise.all([
    Invoice.count({ where: { company_id: companyId, createdAt: { [Op.gte]: startOfMonthIst(now) } } }),
    Product.count({ where: { company_id: companyId } }),
  ]);
  return { invoices, products };
}

/** Number of businesses the owner's plan allows (1000 stands for unlimited in the UI). */
async function businessLimit(companyId) {
  const limit = limitFor(await getSnapshot(companyId), 'businesses');
  return limit === null ? 1000 : limit;
}

/** Session payload for the browser: plan name, status and feature map from OS (never local plans). */
async function sessionSummary(companyId) {
  try {
    const snapshot = await getSnapshot(companyId);
    const features = Object.fromEntries(snapshot.entitlements.map(e => [e.feature_code, snapshot.status === 'active' && e.enabled]));
    const plan = { plan_name: snapshot.plan_name || 'No plan' };
    return { managed_by: 'charis_os', status: snapshot.status, plan, Plan: plan, expiryDate: snapshot.ends_at, features };
  } catch {
    return { managed_by: 'charis_os', status: 'unavailable', plan: { plan_name: 'Unavailable' }, Plan: { plan_name: 'Unavailable' }, expiryDate: null, features: {} };
  }
}

async function syncCompany(companyId) {
  const config = charisOsConfig();
  if (!config) return { synced: false };
  const tenantId = await billingTenantId(companyId);
  const { Company } = require('../models');
  const company = await Company.findByPk(tenantId, { attributes: ['id', 'name', 'email', 'phone'] });
  if (!company) throw new CharisOsError(404, 'COMPANY_NOT_FOUND', 'Company is unavailable');
  const data = await osRequest(`tenants/${encodeURIComponent(tenantId)}`, { method: 'PUT', body: { name: company.name, email: company.email || null, mobile_number: company.phone || null } });
  if (data.contract_version !== 1 || data.application_id !== config.appId || data.tenant_id !== tenantId || data.synced !== true) {
    throw new CharisOsError(503, 'SUBSCRIPTION_UNAVAILABLE', 'Company sync could not be verified');
  }
  clearCache(tenantId);
  return { synced: true, tenantId };
}

async function getCatalog() {
  const config = charisOsConfig();
  if (!config) return null;
  const data = await osRequest('subscription-catalog');
  if (data.contract_version !== 1 || data.application_id !== config.appId || !Array.isArray(data.plans)) {
    throw new CharisOsError(503, 'SUBSCRIPTION_UNAVAILABLE', 'Subscription catalog is unavailable');
  }
  return data;
}

async function checkout(companyId, action = '', body) {
  const config = charisOsConfig();
  if (!config) throw new CharisOsError(404, 'CHECKOUT_DISABLED', 'Checkout is not available');
  const tenantId = await billingTenantId(companyId);
  const data = await osRequest(`tenants/${encodeURIComponent(tenantId)}/checkout${action ? `/${action}` : ''}`, { method: body ? 'POST' : 'GET', body, checkout: true });
  if (data.application_id !== config.appId || data.tenant_id !== tenantId) throw new CharisOsError(503, 'CHECKOUT_SCOPE_INVALID', 'Checkout could not be verified');
  if (action === 'verify' || action === 'orders') clearCache(tenantId);
  return data;
}

/**
 * New customers get the catalog's free plan (a visible ₹0 plan) when OS offers one.
 * OS activates ₹0 plans only for customers without a current term.
 */
async function claimFreePlan(companyId, actorId) {
  if (!enabled()) return null;
  const { synced } = await syncCompany(companyId);
  if (!synced) return null;
  const snapshot = await getSnapshot(companyId);
  if (snapshot.status !== 'unassigned' && snapshot.status !== 'expired' && snapshot.status !== 'cancelled') return snapshot;
  const free = (await getCatalog()).plans.find(p => Number(p.price) === 0);
  if (!free) return snapshot;
  try {
    await checkout(companyId, 'orders', { plan_id: free.id, idempotency_key: require('crypto').randomUUID(), actor_id: String(actorId) });
  } catch (error) {
    if (!(error instanceof CharisOsError && error.status === 409)) throw error; // 409: a term already exists.
  }
  return getSnapshot(companyId);
}

/** Background onboarding: never fails the user's request. */
function onboardInBackground(companyId, actorId) {
  if (!enabled()) return;
  claimFreePlan(companyId, actorId).catch(() => {
    process.stderr.write(`${JSON.stringify({ level: 'warn', event: 'charis_os_onboarding_deferred', companyId })}\n`);
  });
}

module.exports = {
  CharisOsError,
  billingTenantId,
  businessLimit,
  charisOsConfig,
  checkout,
  claimFreePlan,
  clearCache,
  enabled,
  featureAllowed,
  getCatalog,
  getSnapshot,
  limitFor,
  onboardInBackground,
  parseSnapshot,
  sessionSummary,
  startOfMonthIst,
  syncCompany,
  usageFor,
};
