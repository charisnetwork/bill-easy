/**
 * Company asset storage (logo, signature, payment QR).
 *
 * Default: files live on this server under UPLOAD_ROOT/company/... (your own data centre).
 * Google Cloud is used only when STORAGE_DRIVER=gcs is set explicitly.
 * With STORAGE_DRIVER=r2 every file is kept in a private Cloudflare R2 bucket and the server
 * keeps a local copy; after a redeploy wipes the disk, copies are fetched back from R2 when
 * a page or PDF first needs them (ensureLocalAsset).
 *
 * Local files get random, unguessable names and are stored as a relative path such as
 * "company/logos/<uuid>.png"; the frontend turns it into BACKEND_URL/uploads/<path>
 * and the invoice PDF service reads it from UPLOAD_ROOT.
 */
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_ROOT || path.join(__dirname, '../uploads'));
const PUBLIC_DIR = 'company';
const KINDS = { logo: 'logos', signature: 'signatures', qrcode: 'qrcodes' };
// Images only: no PDFs/SVGs for assets that are embedded in invoices and web pages.
const EXTENSIONS = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/jpg': '.jpg' };

// The browser-supplied MIME type is not trusted: check the file's own signature.
const isPng = (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
const isJpeg = (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;

const driver = () => (process.env.STORAGE_DRIVER || 'local').trim().toLowerCase();

/** R2 settings; R2_ENDPOINT is only for local QA against an S3-compatible server. */
function r2Config(source = process.env) {
  const [accountId, accessKeyId, secretAccessKey, bucket] = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'].map((name) => (source[name] || '').trim());
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) throw new Error('STORAGE_DRIVER=r2 needs R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET');
  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)) throw new Error('Invalid R2 bucket name');
  const endpoint = ((source.R2_ENDPOINT || '').trim() || `https://${accountId}.r2.cloudflarestorage.com`).replace(/\/+$/, '');
  if (!/^https:\/\//.test(endpoint) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(endpoint)) throw new Error('R2_ENDPOINT must use HTTPS');
  return { bucket, endpoint, accessKeyId, secretAccessKey };
}

function storageConfig() {
  const value = driver();
  if (!['local', 'gcs', 'r2'].includes(value)) throw new Error('STORAGE_DRIVER must be local, gcs or r2');
  if (value === 'r2') r2Config();
  return { driver: value, uploadRoot: UPLOAD_ROOT };
}

let r2Client;
async function r2Request(method, key, { body, headers } = {}) {
  const config = r2Config();
  const { AwsClient } = require('aws4fetch');
  r2Client = r2Client || new AwsClient({ accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey, service: 's3', region: 'auto' });
  const url = `${config.endpoint}/${config.bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
  const response = await r2Client.fetch(url, { method, headers, body: body ? new Uint8Array(body) : undefined, signal: AbortSignal.timeout(20000) });
  if (!response.ok && !(method === 'DELETE' && response.status === 404)) {
    const error = new Error(`R2 ${method} failed with HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response;
}

const isCompanyPath = (stored) => typeof stored === 'string' && !/^https?:/i.test(stored)
  && path.resolve(UPLOAD_ROOT, stored).startsWith(path.join(UPLOAD_ROOT, PUBLIC_DIR) + path.sep);

async function writeLocal(relative, buffer) {
  const target = path.join(UPLOAD_ROOT, relative);
  await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o750 });
  await fs.writeFile(target, buffer, { mode: 0o640 });
}

/** With R2, makes sure the server has a local copy of a stored asset (logo, signature, QR). */
async function ensureLocalAsset(stored) {
  if (driver() !== 'r2' || !isCompanyPath(stored)) return;
  const target = path.resolve(UPLOAD_ROOT, stored);
  try { await fs.access(target); return; } catch { /* not cached yet */ }
  try {
    const response = await r2Request('GET', stored);
    await writeLocal(stored, Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    if (error.status !== 404) console.warn('R2 copy unavailable:', error.message);
  }
}

async function saveCompanyAsset(buffer, kind, mimetype) {
  const folder = KINDS[kind];
  const ext = EXTENSIONS[mimetype];
  if (!folder) throw new Error('Unknown asset type');
  if (!ext || !(ext === '.png' ? isPng(buffer) : isJpeg(buffer))) {
    const error = new Error('Only PNG or JPG images are allowed');
    error.status = 400;
    throw error;
  }
  const relative = `${PUBLIC_DIR}/${folder}/${crypto.randomUUID()}${ext}`;
  if (driver() === 'gcs') {
    const { uploadToGCS } = require('./gcs');
    return uploadToGCS(buffer, relative, mimetype);
  }
  if (driver() === 'r2') {
    await r2Request('PUT', relative, { body: buffer, headers: { 'Content-Type': ext === '.png' ? 'image/png' : 'image/jpeg', 'Cache-Control': 'private, max-age=300' } });
    await writeLocal(relative, buffer);
    return relative;
  }
  const target = path.join(UPLOAD_ROOT, relative);
  await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o750 });
  await fs.writeFile(target, buffer, { mode: 0o640, flag: 'wx' });
  return relative;
}

/** Remove a previously stored local asset; ignores URLs and anything outside company/. */
async function removeCompanyAsset(stored) {
  if (!isCompanyPath(stored)) return;
  if (driver() === 'r2') await r2Request('DELETE', stored);
  await fs.rm(path.resolve(UPLOAD_ROOT, stored), { force: true });
}

/** Before drawing a PDF: the company's logo, signature and payment QR are on this server. */
const ensureCompanyAssets = (company) => Promise.all([company?.logo, company?.signature, company?.qr_code].map(ensureLocalAsset));

module.exports = { PUBLIC_DIR, UPLOAD_ROOT, ensureCompanyAssets, ensureLocalAsset, r2Config, removeCompanyAsset, saveCompanyAsset, storageConfig };
