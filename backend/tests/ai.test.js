const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const dbUrl = process.env.TEST_DATABASE_URL;
if (dbUrl) process.env.DATABASE_URL = dbUrl;

const aiProvider = require('../services/aiProvider');
const aiQuickSearch = require('../services/aiQuickSearch');

const env = { AI_PROVIDER: 'nvidia', NVIDIA_API_KEY: 'nvapi-test', NVIDIA_MODEL: 'nvidia/test-model', NVIDIA_BASE_URL: 'https://ai.example.test/v1' };
function withEnv(values) {
  const saved = {};
  for (const [k, v] of Object.entries(values)) { saved[k] = process.env[k]; if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  return () => { for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } };
}
function mockFetch(handler) {
  const original = global.fetch;
  const calls = [];
  global.fetch = async (url, init) => { calls.push({ url, body: JSON.parse(init.body), headers: init.headers }); return handler(calls.length); };
  return { calls, restore: () => { global.fetch = original; } };
}
const reply = (message, status = 200) => ({ ok: status < 400, status, json: async () => ({ choices: [{ message }] }), text: async () => 'error' });

test('the provider sends an OpenAI-style request to NVIDIA and returns text and tool calls', async () => {
  const restoreEnv = withEnv(env);
  const fetch = mockFetch(() => reply({ content: 'Hello', tool_calls: [{ id: 't1', type: 'function', function: { name: 'get_top_debtors', arguments: '{"limit":5}' } }] }));
  try {
    const result = await aiProvider.chat({ messages: [{ role: 'user', content: 'hi' }], tools: [{ type: 'function', function: { name: 'get_top_debtors', parameters: { type: 'object', properties: {} } } }] });
    assert.equal(fetch.calls[0].url, 'https://ai.example.test/v1/chat/completions');
    assert.equal(fetch.calls[0].headers.Authorization, 'Bearer nvapi-test');
    assert.equal(fetch.calls[0].body.model, 'nvidia/test-model');
    // Nemotron reasoning models otherwise spend the whole token budget thinking and return no text.
    assert.deepEqual(fetch.calls[0].body.chat_template_kwargs, { enable_thinking: false });
    assert.equal(result.content, 'Hello');
    assert.deepEqual(result.toolCalls, [{ id: 't1', name: 'get_top_debtors', arguments: { limit: 5 } }]);
  } finally { fetch.restore(); restoreEnv(); }
});

test('a missing key or a provider error is AiUnavailableError', async () => {
  let restoreEnv = withEnv({ ...env, NVIDIA_API_KEY: undefined });
  try {
    await assert.rejects(aiProvider.chat({ messages: [] }), aiProvider.AiUnavailableError);
  } finally { restoreEnv(); }
  restoreEnv = withEnv(env);
  const fetch = mockFetch(() => reply({}, 500));
  try {
    await assert.rejects(aiProvider.chat({ messages: [{ role: 'user', content: 'x' }] }), aiProvider.AiUnavailableError);
  } finally { fetch.restore(); restoreEnv(); }
});

test('quick search answers an invoice number from the database without AI', async () => {
  const models = {
    Invoice: { findOne: async ({ where }) => (String(where.invoice_number[Object.getOwnPropertySymbols(where.invoice_number)[0]]).toUpperCase() === 'INV-102'
      ? { invoice_number: 'INV-102', total_amount: '1180.00', paid_amount: '180.00', payment_status: 'partial', invoice_date: '2026-10-02', Customer: { name: 'Ravi Traders' } } : null) },
    Customer: { findOne: async () => null, findAll: async () => [] },
    Product: { findOne: async () => null, findAll: async () => [] },
  };
  const answer = await aiQuickSearch.answer('c1', 'INV-102', models);
  assert.match(answer.reply, /INV-102/);
  assert.match(answer.reply, /Ravi Traders/);
  assert.equal(await aiQuickSearch.answer('c1', 'Why are my sales lower than last month?', models), null);
});

test('chat', { skip: !dbUrl && 'TEST_DATABASE_URL not set' }, async (t) => {
  const { sequelize, UsageCounter, Company } = require('../models');
  await UsageCounter.sync();
  const charisOs = require('../services/charisOsService');
  charisOs.getSnapshot = async () => ({ status: 'active', entitlements: [{ feature_code: 'ai_messages', enabled: true, limit_type: 'limited', limit_value: 10 }] });
  Company.findByPk = async () => ({ name: 'Test Shop' });
  const { chatWithAssistant } = require('../controllers/aiController');
  const { usageSummary } = require('../services/usageLimits');
  charisOs.usageFor = async () => ({});
  const ask = (companyId, question) => new Promise((resolve) => {
    const res = { code: 200, status(c) { this.code = c; return this; }, json(body) { resolve({ status: this.code, body }); } };
    chatWithAssistant({ companyId, user: { id: 'u1' }, body: { question } }, res);
  });
  const restoreEnv = withEnv(env);
  t.after(restoreEnv);
  // The throwaway database has no business tables: quick search finds nothing unless a test says so.
  const realQuickSearch = aiQuickSearch.answer;
  aiQuickSearch.answer = async () => null;
  t.after(() => { aiQuickSearch.answer = realQuickSearch; });

  await t.test('a quick search is answered without calling the AI or using a message', async () => {
    const companyId = crypto.randomUUID();
    aiQuickSearch.answer = async () => ({ reply: 'Invoice INV-102: ₹1,180', data: {} });
    const fetch = mockFetch(() => { throw new Error('AI must not be called'); });
    try {
      const { status, body } = await ask(companyId, 'INV-102');
      assert.equal(status, 200);
      assert.equal(body.answer, 'Invoice INV-102: ₹1,180');
      assert.equal(fetch.calls.length, 0);
      assert.equal((await usageSummary(companyId)).ai_messages, 0);
    } finally { aiQuickSearch.answer = async () => null; fetch.restore(); }
  });

  await t.test('an AI answer uses one message', async () => {
    const companyId = crypto.randomUUID();
    const fetch = mockFetch(() => reply({ content: 'Your sales are steady.' }));
    try {
      const { status, body } = await ask(companyId, 'How is my business doing?');
      assert.equal(status, 200);
      assert.equal(body.answer, 'Your sales are steady.');
      assert.deepEqual(body.usage, { used: 1, limit: 10 });
    } finally { fetch.restore(); }
  });

  await t.test('a model that keeps asking for tools is made to answer on the last round', async () => {
    const companyId = crypto.randomUUID();
    const toolCall = (n) => ({ content: '', tool_calls: [{ id: `t${n}`, type: 'function', function: { name: 'no_such_tool', arguments: '{}' } }] });
    const fetch = mockFetch((n) => reply(n < 4 ? toolCall(n) : { content: 'Here is your answer.' }));
    try {
      const { status, body } = await ask(companyId, 'Tell me everything about my business');
      assert.equal(status, 200);
      assert.equal(body.answer, 'Here is your answer.');
      assert.equal(fetch.calls.length, 4);
      assert.equal(fetch.calls[3].body.tool_choice, 'none');
      assert.equal(fetch.calls[0].body.tool_choice, undefined);
    } finally { fetch.restore(); }
  });

  await t.test('a provider failure gives the message back and returns 503', async () => {
    const companyId = crypto.randomUUID();
    const fetch = mockFetch(() => reply({}, 500));
    try {
      const { status, body } = await ask(companyId, 'How is my business doing?');
      assert.equal(status, 503);
      assert.equal(body.code, 'AI_UNAVAILABLE');
      assert.equal((await usageSummary(companyId)).ai_messages, 0);
    } finally { fetch.restore(); }
  });

  await t.test('a missing NVIDIA key returns 503 without using a message', async () => {
    const companyId = crypto.randomUUID();
    const restore = withEnv({ NVIDIA_API_KEY: undefined });
    try {
      const { status, body } = await ask(companyId, 'How is my business doing?');
      assert.equal(status, 503);
      assert.equal(body.code, 'AI_UNAVAILABLE');
      assert.equal((await usageSummary(companyId)).ai_messages, 0);
    } finally { restore(); }
  });

  await t.test('the 11th AI message on a limit of 10 is refused with the quota body', async () => {
    const companyId = crypto.randomUUID();
    const fetch = mockFetch(() => reply({ content: 'ok' }));
    try {
      for (let i = 0; i < 10; i++) assert.equal((await ask(companyId, `Question ${i} about my business?`)).status, 200);
      const { status, body } = await ask(companyId, 'One more question about my business?');
      assert.equal(status, 403);
      assert.equal(body.code, 'QUOTA_EXCEEDED');
      assert.equal(body.feature, 'ai_messages');
    } finally { fetch.restore(); }
  });
});

test('business questions that mention "code" are not refused as off-topic', async () => {
  const { chatWithAssistant } = require('../controllers/aiController');
  const original = aiQuickSearch.answer;
  aiQuickSearch.answer = async () => ({ reply: 'HSN for rice is 1006.', data: {} });
  try {
    const body = await new Promise((resolve) => chatWithAssistant({ companyId: 'c1', user: { id: 'u1' }, body: { question: 'What is the HSN code for rice?' } }, { status() { return this; }, json: resolve }));
    assert.equal(body.source, 'quick_search');
  } finally { aiQuickSearch.answer = original; }
});

test('bill scanning', { skip: !dbUrl && 'TEST_DATABASE_URL not set' }, async (t) => {
  const { sequelize, UsageCounter } = require('../models');
  await UsageCounter.sync();
  t.after(() => sequelize.close());
  const charisOs = require('../services/charisOsService');
  charisOs.getSnapshot = async () => ({ status: 'active', entitlements: [{ feature_code: 'ai_messages', enabled: true, limit_type: 'limited', limit_value: 10 }] });
  charisOs.usageFor = async () => ({});
  const { processPDFExtract } = require('../controllers/aiController');
  const { usageSummary } = require('../services/usageLimits');
  const scan = (companyId) => new Promise((resolve) => processPDFExtract({ companyId, body: { extractedText: 'Paracetamol 10 x 20', documentType: 'bill' } }, { code: 200, status(c) { this.code = c; return this; }, json(body) { resolve({ status: this.code, body }); } }));

  await t.test('with the AI key missing it returns 503 and uses no message', async () => {
    const companyId = crypto.randomUUID();
    const restore = withEnv({ ...env, NVIDIA_API_KEY: undefined });
    try {
      const { status, body } = await scan(companyId);
      assert.equal(status, 503);
      assert.equal(body.code, 'AI_UNAVAILABLE');
      assert.equal((await usageSummary(companyId)).ai_messages, 0);
    } finally { restore(); }
  });

  await t.test('a successful scan uses one message, taken by the scan itself (not by route middleware)', async () => {
    const companyId = crypto.randomUUID();
    const restore = withEnv(env);
    const fetch = mockFetch(() => reply({ content: '{"items":[]}' }));
    try {
      assert.equal((await scan(companyId)).status, 200);
      assert.equal((await usageSummary(companyId)).ai_messages, 1);
      const route = require('fs').readFileSync(require('path').join(__dirname, '../routes/ai.js'), 'utf8');
      assert.doesNotMatch(route, /consumeMonthlyUnit\('ai_messages'\)/, 'the route must not take a message before the AI has run');
    } finally { fetch.restore(); restore(); }
  });

  await t.test('with the AI down it gives the message back', async () => {
    const companyId = crypto.randomUUID();
    const restore = withEnv(env);
    const fetch = mockFetch(() => reply({}, 500));
    try {
      assert.equal((await scan(companyId)).status, 503);
      assert.equal((await usageSummary(companyId)).ai_messages, 0);
    } finally { fetch.restore(); restore(); }
  });
});
