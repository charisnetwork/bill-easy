const test = require('node:test');
const assert = require('node:assert/strict');
const { validateInvoiceSettings, suggestDesign, DesignError } = require('../services/invoiceDesign');
const aiProvider = require('../services/aiProvider');

const FREE = {};
const PREMIUM = { premium_templates: true };
const PRO = { premium_templates: true, pro_templates: true, ai_invoice_design: true };

const rejects = (promise, status, code) => assert.rejects(promise, (err) => {
  assert.ok(err instanceof DesignError, err.message);
  assert.equal(err.status, status);
  if (code) assert.equal(err.code, code);
  return true;
});

test('an unknown template is refused', () => rejects(validateInvoiceSettings({ template_id: 'fancy' }, { features: PRO, current: {} }), 400));

test('an accent that is not #RRGGBB is refused', () => rejects(validateInvoiceSettings({ accent: 'red' }, { features: FREE, current: {} }), 400));

test('a paper the template does not support is refused', () => rejects(validateInvoiceSettings({ template_id: 'thermal', paper: 'A4' }, { features: FREE, current: {} }), 400));

test('a column switch must be true or false', () => rejects(validateInvoiceSettings({ columns: { hsn: 'yes' } }, { features: FREE, current: {} }), 400));

test('Bold needs premium templates', async () => {
  await rejects(validateInvoiceSettings({ template_id: 'bold' }, { features: FREE, current: {} }), 403, 'FEATURE_NOT_AVAILABLE');
  const saved = await validateInvoiceSettings({ template_id: 'bold' }, { features: PREMIUM, current: {} });
  assert.equal(saved.template_id, 'bold');
});

test('Corporate needs pro templates, premium is not enough', () => rejects(validateInvoiceSettings({ template_id: 'corporate' }, { features: PREMIUM, current: {} }), 403, 'FEATURE_NOT_AVAILABLE'));

test('after a downgrade the saved template stays and other options can still be saved', async () => {
  const current = { template_id: 'corporate', accent: '#1D4ED8' };
  const saved = await validateInvoiceSettings({ template_id: 'corporate', footer_note: 'Thank you for your business' }, { features: FREE, current });
  assert.equal(saved.template_id, 'corporate');
  assert.equal(saved.footer_note, 'Thank you for your business');
});

test('valid settings are returned complete and old keys are dropped', async () => {
  const saved = await validateInvoiceSettings({ template_id: 'classic-gst', accent: '#0F766E', columns: { batch: true, made_up: true }, upi_id: 'shop@okhdfc' }, { features: FREE, current: { theme_color: '#000000' } });
  assert.equal(saved.columns.batch, true);
  assert.equal('made_up' in saved.columns, false);
  assert.equal(saved.upi_id, 'shop@okhdfc');
  assert.equal(saved.theme_color, undefined);
});

test('a UPI ID must look like name@bank', () => rejects(validateInvoiceSettings({ upi_id: 'not a upi' }, { features: FREE, current: {} }), 400));

test('AI design falls back to the industry default when the model answers nonsense', async () => {
  const original = aiProvider.chat;
  aiProvider.chat = async () => ({ content: 'Sure! I think blue would look nice.', toolCalls: [], message: {} });
  try {
    const design = await suggestDesign({ industry: 'Pharma', logoColors: ['#123456'], features: PRO });
    assert.equal(design.template_id, 'classic-gst');
    assert.equal(design.source, 'industry_default');
  } finally { aiProvider.chat = original; }
});

test('AI design uses a valid model answer', async () => {
  const original = aiProvider.chat;
  aiProvider.chat = async () => ({ content: '{"template_id":"elegant","accent":"#8B5CF6","columns":{"hsn":true,"batch":false}}', toolCalls: [], message: {} });
  try {
    const design = await suggestDesign({ industry: 'Hotel', logoColors: [], features: PRO });
    assert.deepEqual([design.template_id, design.accent, design.source], ['elegant', '#8B5CF6', 'ai']);
  } finally { aiProvider.chat = original; }
});

test('AI design never suggests a template the plan cannot use', async () => {
  const original = aiProvider.chat;
  aiProvider.chat = async () => ({ content: '{"template_id":"corporate","accent":"#1D4ED8"}', toolCalls: [], message: {} });
  try {
    const design = await suggestDesign({ industry: 'Retail Shop', logoColors: [], features: PREMIUM });
    assert.notEqual(design.template_id, 'corporate');
  } finally { aiProvider.chat = original; }
});

test('AI design still answers when the AI is down', async () => {
  const original = aiProvider.chat;
  aiProvider.chat = async () => { throw new aiProvider.AiUnavailableError(); };
  try {
    const design = await suggestDesign({ industry: 'Restaurants', logoColors: [], features: PRO });
    assert.equal(design.template_id, 'thermal');
    assert.equal(design.source, 'industry_default');
  } finally { aiProvider.chat = original; }
});
