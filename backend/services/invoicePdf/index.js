/**
 * Invoice PDF: builds the shared printable model (invoiceCore.mjs, identical to the frontend's
 * copy) and draws it with pdfkit. Screen and PDF use the same template tokens and numbers.
 */
const path = require('path');
const PDFDocument = require('pdfkit');
const { render, registerFonts } = require('./render');

const corePromise = import(path.join(__dirname, 'invoiceCore.mjs'));

function draw(model, paper, uploadRoot, pageHeight) {
  const doc = new PDFDocument({ size: [paper.width, pageHeight], margin: 0, autoFirstPage: true, info: { Title: `Invoice ${model.meta.number}`, Author: model.seller.name } });
  registerFonts(doc, model.style.font);
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const done = new Promise((resolve, reject) => { doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject); });
  const bottom = render(doc, model, { paper: { ...paper, height: paper.height }, uploadRoot });
  doc.end();
  return { done, bottom };
}

/** @returns {Promise<Buffer>} */
async function generateInvoicePdf(invoice, company) {
  const { buildInvoiceDocument, PAPERS } = await corePromise;
  const uploadRoot = require('../../utils/fileStore').UPLOAD_ROOT;
  const plain = (value) => (value && typeof value.toJSON === 'function' ? value.toJSON() : value);
  const model = buildInvoiceDocument(plain(invoice), plain(company));
  const paper = PAPERS[model.settings.paper] || PAPERS.A4;
  if (paper.height !== null) return draw(model, paper, uploadRoot, paper.height).done;
  // Thermal roll: draw once on a tall page to learn the height, then on a page of exactly that height.
  const measured = draw(model, paper, uploadRoot, 20000);
  await measured.done;
  return draw(model, paper, uploadRoot, Math.ceil(measured.bottom)).done;
}

module.exports = { generateInvoicePdf };
