const assert = require('node:assert/strict');
const test = require('node:test');
const { CharisOsError, charisOsConfig, featureAllowed, limitFor, parseSnapshot, startOfMonthIst } = require('../services/charisOsService');

const appId = '11111111-1111-4111-8111-111111111111';
const snapshot = (overrides = {}) => ({
  contract_version: 1, application_id: appId, tenant_id: 'company-a', status: 'active', subscription_id: 'sub-1',
  plan_name: 'Premium', starts_at: '2026-01-01T00:00:00Z', ends_at: null,
  entitlements: [
    { feature_code: 'eway_bills', enabled: true, limit_type: 'unlimited', limit_value: null, unit: null, reset_period: null },
    { feature_code: 'multi_godowns', enabled: false, limit_type: null, limit_value: null, unit: null, reset_period: null },
    { feature_code: 'invoices', enabled: true, limit_type: 'limited', limit_value: 5, unit: 'invoices', reset_period: 'monthly' },
    { feature_code: 'products', enabled: true, limit_type: 'unlimited', limit_value: null, unit: null, reset_period: null },
  ],
  ...overrides,
});

test('OS mode is explicit and requires a server-side HTTPS credential', () => {
  assert.equal(charisOsConfig({}), null);
  assert.equal(charisOsConfig({ CHARIS_SUBSCRIPTION_MODE: 'off', CHARIS_OS_APP_KEY: 'unused' }), null);
  assert.throws(() => charisOsConfig({ CHARIS_SUBSCRIPTION_MODE: 'on' }));
  assert.throws(() => charisOsConfig({ CHARIS_SUBSCRIPTION_MODE: 'enforce' }));
  const base = { CHARIS_SUBSCRIPTION_MODE: 'enforce', CHARIS_OS_APP_ID: appId, CHARIS_OS_APP_KEY: 'key' };
  assert.throws(() => charisOsConfig({ ...base, NODE_ENV: 'production', CHARIS_OS_URL: 'http://localhost:8010' }));
  assert.throws(() => charisOsConfig({ ...base, CHARIS_OS_URL: 'https://os.example.com/api' }));
  assert.throws(() => charisOsConfig({ ...base, CHARIS_OS_URL: 'https://os.example.com', CHARIS_OS_APP_ID: 'not-a-uuid' }));
  assert.deepEqual(charisOsConfig({ ...base, CHARIS_OS_URL: 'https://os.example.com/' }), { origin: 'https://os.example.com', appId, key: 'key' });
  assert.equal(charisOsConfig({ ...base, CHARIS_OS_URL: 'http://127.0.0.1:8010' }).origin, 'http://127.0.0.1:8010');
});

test('snapshots must match this app and tenant and be well formed', () => {
  assert.equal(parseSnapshot(snapshot(), appId, 'company-a').status, 'active');
  assert.throws(() => parseSnapshot(snapshot(), appId, 'company-b'), CharisOsError);
  assert.throws(() => parseSnapshot(snapshot(), 'other-app', 'company-a'), CharisOsError);
  assert.throws(() => parseSnapshot(snapshot({ status: 'paid' }), appId, 'company-a'), CharisOsError);
  assert.throws(() => parseSnapshot(snapshot({ starts_at: '2999-01-01T00:00:00Z' }), appId, 'company-a'), CharisOsError);
  const duplicate = snapshot(); duplicate.entitlements.push(duplicate.entitlements[0]);
  assert.throws(() => parseSnapshot(duplicate, appId, 'company-a'), CharisOsError);
  const negative = snapshot(); negative.entitlements[2].limit_value = -1;
  assert.throws(() => parseSnapshot(negative, appId, 'company-a'), CharisOsError);
  assert.equal(parseSnapshot(snapshot({ ends_at: '2026-02-01T00:00:00Z' }), appId, 'company-a').status, 'expired');
});

test('features and limits are deny-by-default', () => {
  const active = snapshot();
  assert.equal(featureAllowed(active, 'eway_bills'), true);
  assert.equal(featureAllowed(active, 'multi_godowns'), false);
  assert.equal(featureAllowed(active, 'not_in_plan'), false);
  assert.equal(featureAllowed(snapshot({ status: 'suspended' }), 'eway_bills'), false);
  assert.equal(featureAllowed(null, 'eway_bills'), false);
  assert.equal(limitFor(active, 'invoices'), 5);
  assert.equal(limitFor(active, 'products'), null);
  assert.throws(() => limitFor(active, 'businesses'), (e) => e.code === 'FEATURE_NOT_AVAILABLE');
  assert.throws(() => limitFor(snapshot({ status: 'expired' }), 'invoices'), (e) => e.code === 'SUBSCRIPTION_INACTIVE');
});

test('monthly invoice quota resets at midnight India time on the 1st', () => {
  assert.equal(startOfMonthIst(new Date('2026-10-20T10:00:00Z')).toISOString(), '2026-09-30T18:30:00.000Z');
  assert.equal(startOfMonthIst(new Date('2026-10-31T18:29:59Z')).toISOString(), '2026-09-30T18:30:00.000Z');
  assert.equal(startOfMonthIst(new Date('2026-10-31T18:30:00Z')).toISOString(), '2026-10-31T18:30:00.000Z');
});

test('plain HTTP to OS only for an explicitly allowed private service name', () => {
  const base = { NODE_ENV: 'production', CHARIS_SUBSCRIPTION_MODE: 'enforce', CHARIS_OS_APP_ID: appId, CHARIS_OS_APP_KEY: 'key' };
  assert.throws(() => charisOsConfig({ ...base, CHARIS_OS_URL: 'http://os-api:8000' }));
  assert.equal(charisOsConfig({ ...base, CHARIS_OS_URL: 'http://os-api:8000', CHARIS_OS_INTERNAL_HTTP: 'true' }).origin, 'http://os-api:8000');
  assert.throws(() => charisOsConfig({ ...base, CHARIS_OS_URL: 'http://os.example.com', CHARIS_OS_INTERNAL_HTTP: 'true' }));
});

test('every enforced feature code is published to Charis OS', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const { BILLEASY_FEATURES } = require('../services/charisOsService');
  const published = new Set(BILLEASY_FEATURES.map((f) => f.code));
  assert.equal(published.size, BILLEASY_FEATURES.length);
  const src = ['routes', 'middleware', 'controllers'].flatMap((dir) => fs.readdirSync(path.join(__dirname, '..', dir)).map((f) => fs.readFileSync(path.join(__dirname, '..', dir, f), 'utf8'))).join('\n');
  const used = new Set([...src.matchAll(/checkFeatureAccess\('([a-z_]+)'\)/g)].map((m) => m[1]));
  for (const code of [...used, 'invoices', 'products', 'businesses', 'advanced_reports', 'enterprise_reports']) assert.ok(published.has(code), `${code} is enforced but not published`);
});
