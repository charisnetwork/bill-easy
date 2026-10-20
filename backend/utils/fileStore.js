/**
 * Company asset storage (logo, signature, payment QR).
 *
 * Default: files live on this server under UPLOAD_ROOT/company/... (your own data centre).
 * Google Cloud is used only when STORAGE_DRIVER=gcs is set explicitly.
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

function storageConfig() {
  const value = driver();
  if (!['local', 'gcs'].includes(value)) throw new Error('STORAGE_DRIVER must be local or gcs');
  return { driver: value, uploadRoot: UPLOAD_ROOT };
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
  const target = path.join(UPLOAD_ROOT, relative);
  await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o750 });
  await fs.writeFile(target, buffer, { mode: 0o640, flag: 'wx' });
  return relative;
}

/** Remove a previously stored local asset; ignores URLs and anything outside company/. */
async function removeCompanyAsset(stored) {
  if (!stored || /^https?:/i.test(stored)) return;
  const target = path.resolve(UPLOAD_ROOT, stored);
  if (!target.startsWith(path.join(UPLOAD_ROOT, PUBLIC_DIR) + path.sep)) return;
  await fs.rm(target, { force: true });
}

module.exports = { PUBLIC_DIR, UPLOAD_ROOT, removeCompanyAsset, saveCompanyAsset, storageConfig };
