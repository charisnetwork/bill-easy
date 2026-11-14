const test = require('node:test');
const assert = require('node:assert/strict');
const { controlSummaryConfig, summaryTokenMatches, parseRange, parseCustomerQuery } = require('../services/controlSummary');

test('reporting is off without a token and refuses short tokens', () => {
  assert.equal(controlSummaryConfig({}), null);
  assert.throws(() => controlSummaryConfig({ CHARIS_OS_SUMMARY_TOKEN: 'short' }), /32 characters/);
  const token = 'q'.repeat(40);
  assert.equal(summaryTokenMatches(`Bearer ${token}`, token), true);
  assert.equal(summaryTokenMatches(`Bearer ${token}x`, token), false);
  assert.equal(summaryTokenMatches(token, token), false);
  assert.equal(summaryTokenMatches(undefined, token), false);
});

test('query parameters are validated like Civil', () => {
  const now = new Date('2026-11-14T00:00:00Z');
  assert.equal(parseRange({}, now).from.toISOString(), '2026-10-15T00:00:00.000Z');
  assert.throws(() => parseRange({ from: 'yesterday' }, now), /ISO date/);
  assert.throws(() => parseRange({ from: '2025-01-01', to: '2026-11-01' }, now), /366 days/);
  assert.throws(() => parseRange({ extra: '1' }, now), /Unsupported/);
  assert.deepEqual(parseCustomerQuery({ page: '2', page_size: '10', search: ' shop ', status: 'active' }), { page: 2, pageSize: 10, search: 'shop', status: 'active' });
  assert.throws(() => parseCustomerQuery({ page_size: '500' }), /between 1 and 100/);
  assert.throws(() => parseCustomerQuery({ status: 'deleted' }), /active or disabled/);
});
