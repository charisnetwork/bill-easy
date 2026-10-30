const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { INDUSTRIES, invoiceDefaultsFor, signupSettingsFor, resolveIndustry } = require('../config/industries');

const frontendNames = () => [...fs.readFileSync(path.join(__dirname, '../../frontend/src/lib/industryConfig.js'), 'utf8')
  .matchAll(/^\s*'([^']+)': \{ group:/gm)].map((m) => m[1]);

test('the signup list is the same in the backend and the browser', () => {
  assert.deepEqual(frontendNames(), Object.keys(INDUSTRIES));
});

test('there are plenty of business types to choose from, grouped for the picker', () => {
  assert.ok(Object.keys(INDUSTRIES).length >= 40, `${Object.keys(INDUSTRIES).length} industries`);
  for (const [name, industry] of Object.entries(INDUSTRIES)) assert.ok(industry.category, `${name} has a picker category`);
});

test('every business type starts on a free template, so new Free accounts never get a locked design', async () => {
  const { templateById } = await import(path.join(__dirname, '../services/invoicePdf/invoiceCore.mjs'));
  for (const name of Object.keys(INDUSTRIES)) {
    const id = invoiceDefaultsFor(name).template_id;
    assert.equal(templateById(id).id, id, `${name}: unknown template ${id}`);
    assert.equal(templateById(id).tier, 'free', `${name}: ${id} is not free`);
  }
});

test('typical businesses get a fitting design', () => {
  assert.equal(invoiceDefaultsFor('Pharma').template_id, 'classic-gst');
  assert.deepEqual([invoiceDefaultsFor('Pharma').columns.batch, invoiceDefaultsFor('Pharma').columns.expiry], [true, true]);
  assert.equal(invoiceDefaultsFor('Restaurants').template_id, 'thermal');
  assert.equal(invoiceDefaultsFor('Cafe & Bakery').template_id, 'thermal');
  assert.equal(invoiceDefaultsFor('Freelancer').template_id, 'minimal');
  assert.equal(invoiceDefaultsFor('Wholesale Trader').template_id, 'classic-gst');
});

test('business types saved by earlier versions still resolve', () => {
  for (const name of ['General Store', 'Retail Shop', 'Cloth Store', 'Restaurants', 'Pharma', 'Hospital', 'Transport', 'IT and Consultant']) assert.equal(resolveIndustry(name), name);
  assert.equal(resolveIndustry('Something new'), null);
  assert.equal(resolveIndustry(''), null);
});

test('a new business starts with its industry design in settings', () => {
  const settings = signupSettingsFor('Restaurants');
  assert.equal(settings.template_id, 'thermal');
  assert.equal(settings.paper, 'thermal');
  assert.equal(settings.invoice_industry_type, 'Restaurants');
});
