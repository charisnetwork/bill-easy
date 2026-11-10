const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

const { apiLimiter, authLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimit');

async function serve(t, ...handlers) {
  const app = express();
  app.use(express.json());
  app.post('/x', ...handlers);
  const server = app.listen(0);
  t.after(() => server.close());
  const url = `http://127.0.0.1:${server.address().port}/x`;
  return (body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.status);
}

test('failed logins for one email do not lock out other people on the same network address', async (t) => {
  const post = await serve(t, authLimiter, (req, res) => res.status(401).json({}));
  for (let i = 0; i < 5; i++) assert.equal(await post({ email: 'a@example.com' }), 401);
  assert.equal(await post({ email: 'a@example.com' }), 429);
  assert.equal(await post({ email: 'A@Example.com ' }), 429, 'case and spaces do not give a fresh allowance');
  assert.equal(await post({ email: 'b@example.com' }), 401);
});

test('one address cannot keep guessing across many emails', async (t) => {
  const post = await serve(t, authLimiter, (req, res) => res.status(401).json({}));
  let refused = 0;
  for (let i = 0; i < 60; i++) if (await post({ email: `user${i}@example.org` }) === 429) refused++;
  assert.ok(refused >= 5, `expected the address-wide cap to refuse some of 60 failures, refused ${refused}`);
});

test('sign-up is limited per address', async (t) => {
  const post = await serve(t, registerLimiter, (req, res) => res.status(201).json({}));
  const statuses = [];
  for (let i = 0; i < 12; i++) statuses.push(await post({}));
  assert.deepEqual(statuses.slice(0, 10), Array(10).fill(201));
  assert.equal(statuses[11], 429);
});

test('the general limit leaves room for a busy shop sharing one address', async (t) => {
  const post = await serve(t, apiLimiter, (req, res) => res.json({}));
  for (let i = 0; i < 350; i++) assert.equal(await post({}), 200);
});

test('password-reset emails are limited even though the endpoint always answers 200', async (t) => {
  const post = await serve(t, passwordResetLimiter, (req, res) => res.json({}));
  for (let i = 0; i < 3; i++) assert.equal(await post({ email: 'a@example.com' }), 200);
  assert.equal(await post({ email: 'a@example.com' }), 429);
  assert.equal(await post({ email: 'b@example.com' }), 200);
});

test('a login whose email is not text is passed on to validation instead of crashing', async (t) => {
  const { bruteForceProtection } = require('../middleware/rateLimit');
  const post = await serve(t, bruteForceProtection, (req, res) => res.status(400).json({}));
  assert.equal(await post({ email: { $ne: null }, password: 'x' }), 400);
  assert.equal(await post({ email: ['a@example.com'] }), 400);
});
