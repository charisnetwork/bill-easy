const test = require('node:test');
const assert = require('node:assert/strict');
const { memberValidation } = require('../middleware/validation');

async function run(body) {
  const req = { body };
  let sent = null;
  const res = { status(code) { this.code = code; return this; }, json(payload) { sent = { code: this.code, payload }; return this; } };
  for (const step of memberValidation) {
    let advanced = false;
    await step(req, res, () => { advanced = true; });
    if (!advanced) break;
  }
  return sent;
}

test('a weak member password is refused without echoing what was typed', async () => {
  const sent = await run({ name: 'Ravi', email: 'ravi@example.com', password: 'secret1', role: 'staff' });
  assert.equal(sent.code, 400);
  assert.match(sent.payload.error, /at least 8 characters/);
  assert.ok(!JSON.stringify(sent.payload).includes('secret1'));
});

test('an owner account cannot be created from Add Member', async () => {
  const sent = await run({ name: 'Ravi', email: 'ravi@example.com', password: 'Strong#Pass1', role: 'owner' });
  assert.equal(sent.code, 400);
  assert.equal(sent.payload.error, 'Role must be Admin or Staff');
});

test('a valid staff member passes', async () => {
  assert.equal(await run({ name: 'Ravi', email: 'ravi@example.com', password: 'Strong#Pass1', role: 'staff' }), null);
});
