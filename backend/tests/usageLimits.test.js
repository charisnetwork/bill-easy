const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

// Real Postgres for the counter (set TEST_DATABASE_URL, e.g. a throwaway local container).
const dbUrl = process.env.TEST_DATABASE_URL;
if (dbUrl) process.env.DATABASE_URL = dbUrl;

const charisOs = require('../services/charisOsService');
const usageLimits = require('../services/usageLimits');

const active = (entitlements) => ({ status: 'active', entitlements });
const limit = (code, value) => ({ feature_code: code, enabled: true, limit_type: value === null ? 'unlimited' : 'limited', limit_value: value });
const off = (code) => ({ feature_code: code, enabled: false, limit_type: 'unlimited', limit_value: null });

function stubSnapshot(snapshot) {
  const original = charisOs.getSnapshot;
  charisOs.getSnapshot = async () => snapshot;
  return () => { charisOs.getSnapshot = original; };
}

function runMiddleware(middleware, req = { companyId: 'company-a' }) {
  return new Promise((resolve) => {
    const res = { status(code) { this.code = code; return this; }, json(body) { resolve({ status: this.code, body }); } };
    middleware(req, res, (err) => resolve({ next: true, err }));
  });
}

test('requireFeature denies a feature the plan does not include', async () => {
  const restore = stubSnapshot(active([off('purchase_orders')]));
  try {
    const result = await runMiddleware(usageLimits.requireFeature('purchase_orders'));
    assert.equal(result.status, 403);
    assert.equal(result.body.code, 'FEATURE_NOT_AVAILABLE');
    assert.equal(result.body.feature, 'purchase_orders');
    assert.equal(result.body.upgradeRequired, true);
  } finally { restore(); }
});

test('requireFeature lets an included feature through', async () => {
  const restore = stubSnapshot(active([limit('purchase_orders', null)]));
  try {
    assert.deepEqual(await runMiddleware(usageLimits.requireFeature('purchase_orders')), { next: true, err: undefined });
  } finally { restore(); }
});

test('requireRecordLimit returns the quota body at the limit', async () => {
  const restore = stubSnapshot(active([limit('godowns', 2)]));
  const originalUsage = charisOs.usageFor;
  charisOs.usageFor = async () => ({ godowns: 2 });
  try {
    const result = await runMiddleware(usageLimits.requireRecordLimit('godowns'));
    assert.equal(result.status, 403);
    assert.deepEqual(
      { code: result.body.code, feature: result.body.feature, limit: result.body.limit, used: result.body.used, upgradeRequired: result.body.upgradeRequired },
      { code: 'QUOTA_EXCEEDED', feature: 'godowns', limit: 2, used: 2, upgradeRequired: true },
    );
    assert.equal(typeof result.body.error, 'string');
  } finally { restore(); charisOs.usageFor = originalUsage; }
});

test('requireRecordLimit passes below the limit', async () => {
  const restore = stubSnapshot(active([limit('godowns', 2)]));
  const originalUsage = charisOs.usageFor;
  charisOs.usageFor = async () => ({ godowns: 1 });
  try {
    assert.equal((await runMiddleware(usageLimits.requireRecordLimit('godowns'))).next, true);
  } finally { restore(); charisOs.usageFor = originalUsage; }
});

test('monthly counters', { skip: !dbUrl && 'TEST_DATABASE_URL not set' }, async (t) => {
  const { sequelize, UsageCounter } = require('../models');
  await UsageCounter.sync(); // shared with other test files running in parallel; tests use random company ids
  t.after(() => sequelize.close());
  const may = new Date('2026-10-15T10:00:00+05:30');

  await t.test('consumeMonthly allows exactly the limit', async () => {
    const restore = stubSnapshot(active([limit('report_exports', 10)]));
    const companyId = crypto.randomUUID();
    try {
      for (let i = 1; i <= 10; i++) assert.deepEqual(await usageLimits.consumeMonthly(companyId, 'report_exports', may), { used: i, limit: 10 });
      await assert.rejects(usageLimits.consumeMonthly(companyId, 'report_exports', may), (err) => {
        assert.equal(err.code, 'QUOTA_EXCEEDED'); assert.equal(err.status, 403);
        assert.equal(err.used, 10); assert.equal(err.limit, 10); assert.equal(err.feature, 'report_exports');
        return true;
      });
    } finally { restore(); }
  });

  await t.test('parallel consumption at limit-1 lets exactly one through', async () => {
    const restore = stubSnapshot(active([limit('ai_messages', 10)]));
    const companyId = crypto.randomUUID();
    try {
      for (let i = 0; i < 9; i++) await usageLimits.consumeMonthly(companyId, 'ai_messages', may);
      const results = await Promise.allSettled(Array.from({ length: 5 }, () => usageLimits.consumeMonthly(companyId, 'ai_messages', may)));
      assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
    } finally { restore(); }
  });

  await t.test('a new month (India time) starts at zero', async () => {
    const restore = stubSnapshot(active([limit('report_exports', 1)]));
    const companyId = crypto.randomUUID();
    try {
      await usageLimits.consumeMonthly(companyId, 'report_exports', new Date('2026-10-31T23:59:00+05:30'));
      assert.deepEqual(await usageLimits.consumeMonthly(companyId, 'report_exports', new Date('2026-11-01T00:00:00+05:30')), { used: 1, limit: 1 });
    } finally { restore(); }
  });

  await t.test('unlimited plans still count', async () => {
    const restore = stubSnapshot(active([limit('ai_messages', null)]));
    const companyId = crypto.randomUUID();
    try {
      await usageLimits.consumeMonthly(companyId, 'ai_messages', may);
      assert.deepEqual(await usageLimits.consumeMonthly(companyId, 'ai_messages', may), { used: 2, limit: null });
    } finally { restore(); }
  });

  await t.test('refundMonthly gives one unit back and never goes below zero', async () => {
    const restore = stubSnapshot(active([limit('ai_messages', 1)]));
    const companyId = crypto.randomUUID();
    try {
      await usageLimits.consumeMonthly(companyId, 'ai_messages', may);
      await usageLimits.refundMonthly(companyId, 'ai_messages', may);
      await usageLimits.refundMonthly(companyId, 'ai_messages', may);
      assert.deepEqual(await usageLimits.consumeMonthly(companyId, 'ai_messages', may), { used: 1, limit: 1 });
    } finally { restore(); }
  });

  await t.test('a feature switched off cannot be consumed', async () => {
    const restore = stubSnapshot(active([off('ai_messages')]));
    try {
      await assert.rejects(usageLimits.consumeMonthly(crypto.randomUUID(), 'ai_messages', may), (err) => err.code === 'FEATURE_NOT_AVAILABLE' && err.status === 403);
    } finally { restore(); }
  });
});
