const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'billeasy-store-'));
process.env.UPLOAD_ROOT = root;
const { removeCompanyAsset, saveCompanyAsset, storageConfig } = require('../utils/fileStore');

const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(16)]);
const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(16)]);

test('assets are stored locally under random names', async () => {
  assert.equal(storageConfig().driver, 'local');
  const a = await saveCompanyAsset(png, 'logo', 'image/png');
  const b = await saveCompanyAsset(jpeg, 'signature', 'image/jpeg');
  assert.match(a, /^company\/logos\/[0-9a-f-]{36}\.png$/);
  assert.match(b, /^company\/signatures\/[0-9a-f-]{36}\.jpg$/);
  assert.ok(fs.existsSync(path.join(root, a)));
  await removeCompanyAsset(a);
  assert.ok(!fs.existsSync(path.join(root, a)));
});

test('only real PNG/JPG content is accepted, whatever the browser claims', async () => {
  const html = Buffer.from('<html><script>alert(1)</script></html>');
  await assert.rejects(saveCompanyAsset(html, 'logo', 'image/png'), (e) => e.status === 400);
  await assert.rejects(saveCompanyAsset(png, 'logo', 'image/jpeg'), (e) => e.status === 400);
  await assert.rejects(saveCompanyAsset(png, 'logo', 'application/pdf'), (e) => e.status === 400);
  await assert.rejects(saveCompanyAsset(png, 'logo', 'image/svg+xml'), (e) => e.status === 400);
});

test('removal never leaves the company asset folder', async () => {
  const outside = path.join(root, 'secret.txt');
  fs.writeFileSync(outside, 'keep');
  await removeCompanyAsset('company/../secret.txt');
  await removeCompanyAsset('../../etc/passwd');
  await removeCompanyAsset('https://storage.googleapis.com/x/y.png');
  assert.equal(fs.readFileSync(outside, 'utf8'), 'keep');
});

test('R2 settings must be complete', () => {
  const { r2Config } = require('../utils/fileStore');
  assert.throws(() => r2Config({ R2_BUCKET: 'qa-bucket' }), /R2_ACCOUNT_ID/);
  assert.throws(() => r2Config({ R2_ACCOUNT_ID: 'a', R2_ACCESS_KEY_ID: 'b', R2_SECRET_ACCESS_KEY: 'c', R2_BUCKET: 'Bad_Name' }), /bucket/);
  assert.throws(() => r2Config({ R2_ACCOUNT_ID: 'a', R2_ACCESS_KEY_ID: 'b', R2_SECRET_ACCESS_KEY: 'c', R2_BUCKET: 'qa-bucket', R2_ENDPOINT: 'http://example.com' }), /HTTPS/);
  assert.equal(r2Config({ R2_ACCOUNT_ID: 'abc', R2_ACCESS_KEY_ID: 'b', R2_SECRET_ACCESS_KEY: 'c', R2_BUCKET: 'qa-bucket' }).endpoint, 'https://abc.r2.cloudflarestorage.com');
});

// Only against a local S3-compatible server: R2_QA_ENDPOINT=http://127.0.0.1:9100 (bucket qa-bucket).
test('with R2, assets live in the bucket and come back after the disk is wiped', { skip: !process.env.R2_QA_ENDPOINT && 'R2_QA_ENDPOINT not set' }, async (t) => {
  const saved = { ...process.env };
  t.after(() => { for (const key of ['STORAGE_DRIVER', 'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_ENDPOINT']) { if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key]; } });
  Object.assign(process.env, { STORAGE_DRIVER: 'r2', R2_ACCOUNT_ID: 'qa', R2_ACCESS_KEY_ID: 'qa-only', R2_SECRET_ACCESS_KEY: 'qa-only', R2_BUCKET: 'qa-bucket', R2_ENDPOINT: process.env.R2_QA_ENDPOINT });
  const { ensureCompanyAssets } = require('../utils/fileStore');
  assert.equal(storageConfig().driver, 'r2');
  const logo = await saveCompanyAsset(png, 'logo', 'image/png');
  const inBucket = `${process.env.R2_QA_ENDPOINT}/qa-bucket/${logo}`;
  assert.equal((await fetch(inBucket)).status, 200);
  fs.rmSync(path.join(root, logo)); // a redeploy wipes the server disk
  await ensureCompanyAssets({ logo, signature: null, qr_code: 'https://example.com/old.png' });
  assert.deepEqual(fs.readFileSync(path.join(root, logo)), png);
  await removeCompanyAsset(logo);
  assert.equal((await fetch(inBucket)).status, 404);
  assert.ok(!fs.existsSync(path.join(root, logo)));
});
