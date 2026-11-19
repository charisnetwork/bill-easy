const test = require('node:test');
const assert = require('node:assert/strict');
const { partyFields } = require('../utils/partyFields');

test('valid contact details are normalised', () => {
  assert.deepEqual(partyFields({ phone: '+91 98450 12345', email: 'Ravi@Example.com', gst_number: '27aapfu0939f1zv' }), { phone: '9845012345', email: 'ravi@example.com', gst_number: '27AAPFU0939F1ZV' });
  assert.deepEqual(partyFields({ phone: '080-2345 6789', email: '', gst_number: '' }), { phone: '08023456789', email: null, gst_number: null });
  assert.equal(partyFields({ phone: '+971 50 123 4567' }).phone, '+971501234567');
});

test('junk phone numbers and GSTINs are refused', () => {
  for (const body of [{ phone: '12345' }, { phone: 'abc' }, { gst_number: 'ABC123' }, { gst_number: '27AAPFU0939F1ZX' }, { email: 'bad' }]) {
    assert.throws(() => partyFields(body), (error) => error.status === 400, JSON.stringify(body));
  }
});
