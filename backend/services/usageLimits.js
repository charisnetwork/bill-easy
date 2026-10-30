/**
 * One gate for every Charis OS feature code.
 *
 * - requireFeature(code): on/off features.
 * - requireRecordLimit(code): limits counted from Bill Easy's own records (invoices, products,
 *   purchase bills, godowns).
 * - consumeMonthly(companyId, code): limits Bill Easy counts itself in usage_counters (report
 *   exports, AI answers). Check and increment are one SQL statement, so parallel requests can
 *   never exceed the limit.
 */
const charisOs = require('./charisOsService');

const LABELS = {
  invoices: 'Monthly invoice limit',
  products: 'Item limit',
  purchase_bills: 'Monthly purchase bill limit',
  godowns: 'Godown limit',
  businesses: 'Business limit',
  report_exports: 'Monthly report download limit',
  ai_messages: 'Monthly AI message limit',
};

class QuotaError extends Error {
  constructor(feature, limit, used) {
    super(`${LABELS[feature] || 'Plan limit'} reached (${limit}). Upgrade your plan for more.`);
    this.status = 403;
    this.code = 'QUOTA_EXCEEDED';
    this.feature = feature;
    this.limit = limit;
    this.used = used;
  }
}

/** 'YYYY-MM' of the month in India time (Asia/Kolkata has no DST). */
function periodOf(now = new Date()) {
  return new Date(now.getTime() + 330 * 60 * 1000).toISOString().slice(0, 7);
}

/** Express response for a gate error; anything else goes to the error handler. */
function sendGateError(res, next, error, feature) {
  if (error instanceof QuotaError) {
    return res.status(403).json({ error: error.message, code: error.code, feature: error.feature, limit: error.limit, used: error.used, upgradeRequired: true });
  }
  if (error instanceof charisOs.CharisOsError) {
    return res.status(error.status).json({ error: error.message, code: error.code, feature, upgradeRequired: error.status === 403 });
  }
  return next(error);
}

const requireFeature = (code) => async (req, res, next) => {
  try {
    if (charisOs.featureAllowed(await charisOs.getSnapshot(req.companyId), code)) return next();
    return res.status(403).json({ error: 'Your current plan does not include this feature. Please upgrade.', code: 'FEATURE_NOT_AVAILABLE', feature: code, upgradeRequired: true });
  } catch (error) {
    return sendGateError(res, next, error, code);
  }
};

const requireRecordLimit = (code) => async (req, res, next) => {
  try {
    const limit = charisOs.limitFor(await charisOs.getSnapshot(req.companyId), code);
    if (limit !== null) {
      const used = (await charisOs.usageFor(req.companyId))[code] || 0;
      if (used >= limit) throw new QuotaError(code, limit, used);
    }
    return next();
  } catch (error) {
    return sendGateError(res, next, error, code);
  }
};

async function consumeMonthly(companyId, code, now = new Date()) {
  const limit = charisOs.limitFor(await charisOs.getSnapshot(companyId), code);
  const { sequelize } = require('../models');
  const period = periodOf(now);
  const replacements = { companyId, code, period, limit };
  if (limit !== null && limit <= 0) throw new QuotaError(code, limit, 0);
  const [rows] = await sequelize.query(`
    INSERT INTO usage_counters (id, company_id, feature_code, period, count, created_at, updated_at)
    VALUES (gen_random_uuid(), :companyId, :code, :period, 1, now(), now())
    ON CONFLICT (company_id, feature_code, period)
    DO UPDATE SET count = usage_counters.count + 1, updated_at = now()
    ${limit === null ? '' : 'WHERE usage_counters.count < :limit'}
    RETURNING count`, { replacements });
  if (rows.length === 0) {
    const [[current]] = await sequelize.query(
      'SELECT count FROM usage_counters WHERE company_id = :companyId AND feature_code = :code AND period = :period',
      { replacements });
    throw new QuotaError(code, limit, current ? current.count : limit);
  }
  return { used: rows[0].count, limit };
}

/** Gives back one unit, e.g. when the AI provider failed after the unit was taken. */
async function refundMonthly(companyId, code, now = new Date()) {
  const { sequelize } = require('../models');
  await sequelize.query(
    `UPDATE usage_counters SET count = GREATEST(count - 1, 0), updated_at = now()
     WHERE company_id = :companyId AND feature_code = :code AND period = :period`,
    { replacements: { companyId, code, period: periodOf(now) } });
}

/** Used and limit for every limited feature on the plan, for the plan page. */
async function usageSummary(companyId, now = new Date()) {
  const snapshot = await charisOs.getSnapshot(companyId);
  const { UsageCounter } = require('../models');
  const [records, counters] = await Promise.all([
    charisOs.usageFor(companyId, now),
    UsageCounter.findAll({ where: { company_id: companyId, period: periodOf(now) }, raw: true }),
  ]);
  const counted = Object.fromEntries(counters.map((c) => [c.feature_code, c.count]));
  const summary = {};
  for (const code of Object.keys(LABELS)) {
    let limit;
    try { limit = charisOs.limitFor(snapshot, code); } catch { continue; } // Not on this plan.
    summary[code] = { used: records[code] ?? counted[code] ?? 0, limit };
  }
  return summary;
}

module.exports = { QuotaError, periodOf, requireFeature, requireRecordLimit, consumeMonthly, refundMonthly, usageSummary };
