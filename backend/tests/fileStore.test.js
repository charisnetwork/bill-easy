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
