const test = require('node:test');
const assert = require('node:assert/strict');
const { planView } = require('../controllers/charisOsSubscriptionController');

const base = { id: 'p1', name: 'Pro', price: '499.00', currency: 'INR', duration_value: 1, duration_unit: 'month', entitlements: [] };

test('plan cards carry OS card content as plain values only', () => {
  const view = planView({
    ...base,
    highlights: ['Unlimited invoices', { html: '<b>x</b>' }, 'Priority support'],
    artwork: 'crown', accent: 'violet', coupons_allowed: true,
    offer: { code: 'LAUNCH50', label: 'Launch', discount_type: 'percentage', discount_value: '50.0000', ends_at: '2026-12-01T00:00:00Z', extra: 'ignored' },
  });
  assert.deepEqual(view.highlights, ['Unlimited invoices', 'Priority support']);
  assert.equal(view.artwork, 'crown');
  assert.deepEqual(view.offer, { code: 'LAUNCH50', label: 'Launch', discount_type: 'percentage', discount_value: 50, ends_at: '2026-12-01T00:00:00Z' });
});

test('an older OS without card content still gives safe defaults', () => {
  const view = planView(base);
  assert.deepEqual(view.highlights, []);
  assert.equal(view.artwork, 'auto');
  assert.equal(view.coupons_allowed, true);
  assert.equal(view.offer, null);
});
