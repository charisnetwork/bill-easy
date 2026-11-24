const test = require('node:test');
const assert = require('node:assert/strict');
const { lineItemProblem, refuseBadLineItems } = require('../services/lineItemRules');

const item = (quantity, unit_price = 100, extra = {}) => ({ quantity, unit_price, ...extra });

test('quantity must be more than 0', () => {
  assert.equal(lineItemProblem({ items: [item(-2)] }), 'Quantity must be more than 0');
  assert.equal(lineItemProblem({ items: [item(0)] }), 'Quantity must be more than 0');
  assert.equal(lineItemProblem({ items: [item('abc')] }), 'Quantity must be more than 0');
});

test('rate and line discount cannot be negative or exceed the line', () => {
  assert.equal(lineItemProblem({ items: [item(1, -5)] }), 'Rate cannot be negative');
  assert.equal(lineItemProblem({ items: [item(2, 100, { discount: -1 })] }), 'Discount cannot be negative');
  assert.equal(lineItemProblem({ items: [item(2, 100, { discount: 201 })] }), "Discount can't be more than the line amount");
});

test('bill discount cannot exceed the subtotal or 100 percent', () => {
  assert.equal(lineItemProblem({ items: [item(2)], discount: 500, discount_type: 'fixed' }), "Discount can't be more than the subtotal");
  assert.equal(lineItemProblem({ items: [item(2)], discount: 150, discount_type: 'percentage' }), "Discount can't be more than 100%");
  assert.equal(lineItemProblem({ items: [item(2)], discount: -10 }), 'Discount cannot be negative');
});

test('normal bills pass: 100% off is allowed, qty 2 × 100 less 20 is fine', () => {
  assert.equal(lineItemProblem({ items: [item(2)], discount: 100, discount_type: 'percentage' }), null);
  assert.equal(lineItemProblem({ items: [item(2)], discount: 20, discount_type: 'fixed' }), null);
  assert.equal(lineItemProblem({ items: [item(2)], discount: 200 }), null);
  assert.equal(lineItemProblem({ items: [item('0.5', '10')] }), null);
  assert.equal(lineItemProblem({}), null, 'a body without items (e.g. a status change) is not checked');
});

test('the route guard answers 400 with the problem and does not call next', () => {
  const result = {};
  const res = { status(code) { result.status = code; return this; }, json(body) { result.body = body; return this; } };
  let called = false;
  refuseBadLineItems({ body: { items: [item(-2)] } }, res, () => { called = true; });
  assert.equal(result.status, 400);
  assert.equal(result.body.error, 'Quantity must be more than 0');
  assert.equal(called, false);
  refuseBadLineItems({ body: { items: [item(2)] } }, res, () => { called = true; });
  assert.equal(called, true);
});

test('every create/update route for bills with items runs the guard', () => {
  const guarded = (file, method, path) => {
    const router = require(`../routes/${file}`);
    const layer = router.stack.find(l => l.route && l.route.path === path && l.route.methods[method]);
    assert.ok(layer, `${file} ${method} ${path} exists`);
    return layer.route.stack.some(s => s.handle === refuseBadLineItems);
  };
  for (const [file, routes] of Object.entries({
    invoices: [['post', '/'], ['put', '/:id']],
    quotations: [['post', '/'], ['put', '/:id']],
    purchases: [['post', '/'], ['put', '/:id']],
    purchaseOrders: [['post', '/'], ['put', '/:id']],
    recurring: [['post', '/'], ['put', '/:id']],
    creditNotes: [['post', '/']],
  })) for (const [method, path] of routes) assert.ok(guarded(file, method, path), `${file} ${method} ${path} is guarded`);
});
