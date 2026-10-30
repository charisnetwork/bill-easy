/**
 * Draws a printable invoice model (invoiceCore.buildInvoiceDocument) with pdfkit. Each template
 * is a combination of a header style (band / split / centered / compact) and a table style
 * (striped / boxed / lined / plain), so the same tokens drive the screen and the PDF.
 */
const fs = require('fs');
const path = require('path');

const FONT_DIR = path.join(__dirname, 'fonts');
const FONT_FILES = {
  sans: ['DejaVuSans.ttf', 'DejaVuSans-Bold.ttf'],
  serif: ['DejaVuSerif.ttf', 'DejaVuSerif-Bold.ttf'],
  mono: ['DejaVuSansMono.ttf', 'DejaVuSansMono-Bold.ttf'],
};
const INK = '#0F172A';
const MUTED = '#64748B';
const RULE = '#E2E8F0';
const TINT = '#F8FAFC';

function registerFonts(doc, font) {
  const [regular, bold] = FONT_FILES[font] || FONT_FILES.sans;
  doc.registerFont('regular', path.join(FONT_DIR, regular));
  doc.registerFont('bold', path.join(FONT_DIR, bold));
}

/** Local company image (logo, signature, QR) under UPLOAD_ROOT/company; anything else is skipped. */
function imagePath(stored, uploadRoot) {
  if (!stored || /^https?:/i.test(stored)) return null;
  const target = path.resolve(uploadRoot, String(stored).replace(/^\/?uploads\//, ''));
  if (!target.startsWith(path.join(uploadRoot, 'company') + path.sep)) return null;
  return fs.existsSync(target) ? target : null;
}

const amount = (n) => Math.abs(Number(n || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (n) => `${Number(n || 0) < 0 ? '-' : ''}₹${amount(n)}`;
const plainMoney = (n) => `${Number(n || 0) < 0 ? '-' : ''}${amount(n)}`;
const qty = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 3 });
const date = (value) => (value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

/** Lighter version of an accent colour for fills. */
function tint(hex, amount = 0.88) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  return `#${[mix(n >> 16), mix((n >> 8) & 255), mix(n & 255)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Draws the model on doc and returns the y after the last line. With `paper.height === null`
 * (thermal) the caller measures first on a tall page, then draws on a page of that height.
 */
function render(doc, model, { paper, uploadRoot }) {
  const { style, columns, settings } = model;
  const accent = style.accent;
  const thermal = paper.height === null;
  const small = paper.width < 500; // A5 and thermal
  const margin = thermal ? 10 : small ? 24 : 36;
  const width = paper.width - margin * 2;
  const left = margin;
  const right = paper.width - margin;
  const base = thermal ? 7.5 : small ? 8 : 9;
  const pageBottom = paper.height ? paper.height - margin : Infinity;
  const tableStyle = style.template.table;
  let y = margin;

  const text = (value, x, top, options = {}) => {
    const { size = base, bold = false, color = INK, ...rest } = options;
    doc.font(bold ? 'bold' : 'regular').fontSize(size).fillColor(color).text(String(value ?? ''), x, top, { lineBreak: true, ...rest });
    return doc.y;
  };
  /** One line that never wraps: the font shrinks (to 5 pt at most) until the text fits. */
  const line1 = (value, x, top, options = {}) => {
    const { size = base, bold = false, width: w, ...rest } = options;
    let fitted = size;
    doc.font(bold ? 'bold' : 'regular');
    while (fitted > 5 && doc.fontSize(fitted).widthOfString(String(value ?? '')) > w) fitted -= 0.25;
    return text(value, x, top + (size - fitted) / 2, { ...rest, size: fitted, bold, width: w + 1, lineBreak: false, height: fitted * 1.3 });
  };
  const height = (value, w, size = base, bold = false) => doc.font(bold ? 'bold' : 'regular').fontSize(size).heightOfString(String(value ?? ''), { width: w });
  const ensure = (needed, onNewPage) => {
    if (y + needed <= pageBottom) return;
    doc.addPage({ size: [paper.width, paper.height], margin: 0 });
    y = margin;
    if (onNewPage) onNewPage();
  };
  const image = (stored, x, top, fit) => {
    const file = imagePath(stored, uploadRoot);
    if (!file) return false;
    try { doc.image(file, x, top, { fit, align: 'center', valign: 'center' }); return true; } catch { return false; }
  };

  /* ── Header ── */
  const seller = model.seller;
  const sellerLines = [seller.address, [seller.phone && `Ph: ${seller.phone}`, seller.email].filter(Boolean).join('  |  ')].filter(Boolean);
  const logoSize = thermal ? 0 : small ? 40 : 54;

  if (style.template.header === 'band') {
    const bandHeight = small ? 70 : 86;
    doc.rect(0, 0, paper.width, bandHeight).fill(accent);
    const hasLogo = settings.logo_position !== 'right' && seller.logo && image(seller.logo, left, 14, [logoSize, logoSize]);
    const x = hasLogo ? left + logoSize + 10 : left;
    text(seller.name, x, small ? 14 : 18, { size: base + (small ? 6 : 9), bold: true, color: '#FFFFFF', width: width * 0.6 });
    text(sellerLines.join('\n'), x, doc.y + 2, { size: base - 1, color: '#E0E7FF', width: width * 0.6 });
    text(model.title, left, small ? 16 : 20, { size: base + (small ? 4 : 6), bold: true, color: '#FFFFFF', width, align: 'right', characterSpacing: 1 });
    if (seller.gstin) text(`GSTIN ${seller.gstin}`, left, doc.y + 2, { size: base - 0.5, color: '#FFFFFF', width, align: 'right' });
    y = bandHeight + 14;
  } else if (style.template.header === 'centered' || thermal) {
    if (!thermal && seller.logo && image(seller.logo, paper.width / 2 - logoSize / 2, y, [logoSize, logoSize])) y += logoSize + 6;
    y = text(seller.name, left, y, { size: base + (thermal ? 4 : small ? 7 : 10), bold: true, color: thermal ? INK : accent, width, align: 'center' });
    y = text(sellerLines.join('\n'), left, y + 2, { size: base - 0.5, color: MUTED, width, align: 'center' });
    if (seller.gstin) y = text(`GSTIN: ${seller.gstin}`, left, y + 1, { size: base - 0.5, bold: true, width, align: 'center' });
    y += 6;
    if (thermal) {
      doc.moveTo(left, y).lineTo(right, y).dash(2, { space: 2 }).strokeColor(INK).lineWidth(0.5).stroke().undash();
      y = text(model.title, left, y + 4, { size: base + 1, bold: true, width, align: 'center' }) + 4;
    } else {
      doc.moveTo(left, y).lineTo(right, y).strokeColor(accent).lineWidth(1.2).stroke();
      y = text(model.title, left, y + 6, { size: base + 3, bold: true, color: accent, width, align: 'center', characterSpacing: 2 });
      doc.moveTo(left, y + 4).lineTo(right, y + 4).strokeColor(accent).lineWidth(0.6).stroke();
      y += 14;
    }
  } else {
    // split: business on the left (logo on the chosen side), invoice title on the right
    const logoRight = settings.logo_position === 'right';
    const hasLogo = seller.logo && image(seller.logo, logoRight ? right - logoSize : left, y, [logoSize, logoSize]);
    const x = hasLogo && !logoRight ? left + logoSize + 10 : left;
    const blockWidth = width * 0.58 - (x - left);
    let leftY = text(seller.name, x, y, { size: base + (small ? 6 : 8), bold: true, color: style.template.table === 'boxed' ? accent : INK, width: blockWidth });
    if (seller.tagline) leftY = text(seller.tagline, x, leftY, { size: base - 1, color: MUTED, width: blockWidth });
    leftY = text(sellerLines.join('\n'), x, leftY + 2, { size: base - 1, color: MUTED, width: blockWidth });
    if (seller.gstin) leftY = text(`GSTIN: ${seller.gstin}`, x, leftY + 1, { size: base - 0.5, bold: true, width: blockWidth });
    const titleX = left + width * 0.6;
    const titleWidth = width * 0.4 - (hasLogo && logoRight ? logoSize + 10 : 0);
    text(model.title, titleX, y, { size: base + (small ? 4 : 7), bold: true, color: accent, width: titleWidth, align: 'right', characterSpacing: 1 });
    y = Math.max(leftY, y + (hasLogo ? logoSize : 0)) + 8;
    doc.moveTo(left, y).lineTo(right, y).strokeColor(accent).lineWidth(style.template.table === 'plain' ? 0.6 : 1.5).stroke();
    y += 10;
  }

  /* ── Invoice details and party ── */
  const meta = model.meta;
  const details = [
    ['Invoice No', meta.number], ['Date', date(meta.date)], meta.dueDate && ['Due date', date(meta.dueDate)],
    settings.party.place_of_supply && meta.placeOfSupply && ['Place of supply', meta.placeOfSupply],
    settings.show.po_number && meta.poNumber && ['PO No', meta.poNumber],
    settings.show.eway_bill && meta.ewayBill && ['E-way bill', meta.ewayBill],
    settings.show.vehicle_number && meta.vehicleNumber && ['Vehicle', meta.vehicleNumber],
  ].filter(Boolean);
  const buyer = model.buyer;
  const buyerLines = [buyer.address, settings.party.phone && buyer.phone && `Ph: ${buyer.phone}`, settings.party.gstin && buyer.gstin && `GSTIN: ${buyer.gstin}`,
    settings.show.party_balance && buyer.balance > 0 && `Previous balance: ${money(buyer.balance)}`].filter(Boolean);

  if (thermal) {
    for (const [label, value] of details) y = text(`${label}: ${value}`, left, y, { size: base - 0.5, width });
    y = text(`Bill to: ${buyer.name}`, left, y + 2, { bold: true, width });
    for (const line of buyerLines) y = text(line, left, y, { size: base - 1, color: MUTED, width });
    y += 4;
  } else {
    const colWidth = (width - 12) / 2;
    const rx = left + colWidth + 12;
    const inner = colWidth - 16;
    const label = (value, x, top) => text(value, x, top, { size: base - 1.5, bold: true, color: accent, characterSpacing: 1 });
    const ship = settings.party.shipping_address && buyer.shippingAddress;
    // Measure both boxes first so the background is drawn once, under the text.
    const leftHeight = 14 + height('BILL TO', inner, base - 1.5, true) + 2 + height(buyer.name, inner, base + 1.5, true) + 1
      + (buyerLines.length ? height(buyerLines.join('\n'), inner, base - 0.5) : 0)
      + (ship ? 5 + height('SHIP TO', inner, base - 1.5, true) + 1 + height(buyer.shippingAddress, inner, base - 0.5) : 0);
    const rowHeight = ([k, v]) => Math.max(height(k, colWidth * 0.42, base - 1), height(v, colWidth * 0.58 - 16, base - 0.5, true)) + 2;
    const rightHeight = 14 + details.reduce((sum, row) => sum + rowHeight(row), 0);
    const boxHeight = Math.max(leftHeight, rightHeight);
    if (tableStyle === 'boxed') {
      doc.rect(left, y, colWidth, boxHeight).strokeColor(RULE).lineWidth(0.8).stroke();
      doc.rect(rx, y, colWidth, boxHeight).strokeColor(RULE).lineWidth(0.8).stroke();
    } else {
      doc.roundedRect(left, y, colWidth, boxHeight, 4).fill(tint(accent, 0.94));
      doc.roundedRect(rx, y, colWidth, boxHeight, 4).fill(TINT);
    }
    let ly = label('BILL TO', left + 8, y + 7);
    ly = text(buyer.name, left + 8, ly + 2, { size: base + 1.5, bold: true, width: inner });
    if (buyerLines.length) ly = text(buyerLines.join('\n'), left + 8, ly + 1, { size: base - 0.5, color: MUTED, width: inner });
    if (ship) {
      ly = label('SHIP TO', left + 8, ly + 5);
      text(buyer.shippingAddress, left + 8, ly + 1, { size: base - 0.5, color: MUTED, width: inner });
    }
    let ry = y + 7;
    for (const row of details) {
      text(row[0], rx + 8, ry, { size: base - 1, color: MUTED, width: colWidth * 0.42 });
      text(row[1], rx + 8 + colWidth * 0.42, ry, { size: base - 0.5, bold: true, width: colWidth * 0.58 - 16, align: 'right' });
      ry += rowHeight(row);
    }
    const boxBottom = y + boxHeight;
    y = boxBottom + 12;
  }

  /* ── Items table ── */
  const split = columns.tax_split && !model.interState;
  const cols = thermal
    ? [{ key: 'name', label: 'Item', flex: 3 }, { key: 'quantity', label: 'Qty', w: 28, align: 'right' }, { key: 'rate', label: 'Rate', w: 44, align: 'right' }, { key: 'total', label: 'Amt (₹)', w: 52, align: 'right' }]
    : [
      { key: 'sn', label: '#', w: 14 },
      { key: 'name', label: 'Item', flex: 1 },
      columns.hsn && { key: 'hsn', label: 'HSN', w: small ? 34 : 40 },
      columns.batch && { key: 'batch', label: 'Batch', w: 38 },
      columns.expiry && { key: 'expiry', label: 'Expiry', w: 40 },
      { key: 'quantity', label: 'Qty', w: small ? 30 : 42, align: 'right' },
      columns.free_qty && { key: 'free_qty', label: 'Free', w: 26, align: 'right' },
      { key: 'rate', label: 'Rate', w: small ? 40 : 46, align: 'right' },
      columns.discount && { key: 'discount', label: 'Disc', w: 34, align: 'right' },
      !small && { key: 'taxable', label: 'Taxable', w: 50, align: 'right' },
      { key: 'taxRate', label: 'GST', w: 30, align: 'right' },
      !small && split && { key: 'cgst', label: 'CGST', w: 40, align: 'right' },
      !small && split && { key: 'sgst', label: 'SGST', w: 40, align: 'right' },
      !small && !split && { key: 'tax', label: model.interState ? 'IGST' : 'Tax', w: 46, align: 'right' },
      { key: 'total', label: 'Amount (₹)', w: small ? 52 : 58, align: 'right' },
    ].filter(Boolean);
  const fixed = cols.reduce((sum, c) => sum + (c.w || 0), 0);
  const flexTotal = cols.reduce((sum, c) => sum + (c.flex || 0), 0);
  let x = left;
  for (const c of cols) { c.width = c.w || ((width - fixed) * c.flex) / flexTotal; c.x = x; x += c.width; }
  const pad = thermal ? 1.5 : 4;
  const cell = (line, key) => {
    if (key === 'quantity') return `${qty(line.quantity)}${!small && line.unit ? ` ${line.unit}` : ''}`;
    if (['rate', 'discount', 'taxable', 'cgst', 'sgst', 'tax', 'total'].includes(key)) return plainMoney(line[key]); // ₹ is in the header
    if (key === 'taxRate') return `${qty(line.taxRate)}%`;
    if (key === 'expiry') return line.expiry ? date(line.expiry) : '';
    if (key === 'free_qty') return line.free_qty ? qty(line.free_qty) : '';
    return line[key] ?? '';
  };

  const drawHead = () => {
    const h = base + (thermal ? 6 : 10);
    if (thermal) {
      doc.moveTo(left, y).lineTo(right, y).dash(2, { space: 2 }).strokeColor(INK).lineWidth(0.5).stroke().undash();
    } else if (tableStyle === 'plain' || tableStyle === 'lined') {
      doc.moveTo(left, y + h).lineTo(right, y + h).strokeColor(tableStyle === 'plain' ? INK : accent).lineWidth(1).stroke();
    } else {
      doc.rect(left, y, width, h).fill(accent);
    }
    const color = thermal || tableStyle === 'plain' || tableStyle === 'lined' ? (tableStyle === 'lined' ? accent : INK) : '#FFFFFF';
    for (const c of cols) line1(c.label, c.x + pad, y + (thermal ? 3 : 5), { size: base - 1, bold: true, color, width: c.width - pad * 2, align: c.align || 'left' });
    y += h + (thermal ? 2 : 0);
  };
  drawHead();

  model.lines.forEach((line, index) => {
    const nameText = columns.description && line.description ? `${line.name}\n${line.description}` : line.name;
    const nameCol = cols.find((c) => c.key === 'name');
    const rowHeight = Math.max(height(nameText, nameCol.width - pad * 2, base), base + 2) + (thermal ? 3 : 8);
    ensure(rowHeight + 4, drawHead);
    if (tableStyle === 'striped' && index % 2 === 1 && !thermal) doc.rect(left, y, width, rowHeight).fill(tint(accent, 0.95));
    for (const c of cols) {
      if (c.key === 'name') {
        text(line.name, c.x + pad, y + (thermal ? 1.5 : 4), { size: base, bold: !thermal, width: c.width - pad * 2 });
        if (columns.description && line.description) text(line.description, c.x + pad, doc.y, { size: base - 1.5, color: MUTED, width: c.width - pad * 2 });
      } else {
        line1(cell(line, c.key), c.x + pad, y + (thermal ? 1.5 : 4), { size: base - (c.key === 'total' ? 0 : 0.5), bold: c.key === 'total', width: c.width - pad * 2, align: c.align || 'left' });
      }
    }
    if (tableStyle === 'boxed') {
      doc.rect(left, y, width, rowHeight).strokeColor(RULE).lineWidth(0.6).stroke();
      for (const c of cols.slice(1)) doc.moveTo(c.x, y).lineTo(c.x, y + rowHeight).strokeColor(RULE).lineWidth(0.6).stroke();
    } else if (tableStyle === 'lined' || (tableStyle === 'striped' && !thermal)) {
      doc.moveTo(left, y + rowHeight).lineTo(right, y + rowHeight).strokeColor(RULE).lineWidth(0.5).stroke();
    }
    y += rowHeight;
  });
  if (thermal || tableStyle === 'plain') {
    doc.moveTo(left, y + 2).lineTo(right, y + 2).strokeColor(INK).lineWidth(0.5);
    if (thermal) doc.dash(2, { space: 2 });
    doc.stroke().undash();
  }
  y += 10;

  /* ── Tax summary (by rate) and totals ── */
  const totals = model.totals;
  const totalRows = [
    ['Taxable value', money(totals.taxable)],
    totals.discount > 0 && ['Discount', `- ${money(totals.discount)}`],
    ...(model.interState ? [['IGST', money(totals.tax)]] : [['CGST', money(totals.tax / 2)], ['SGST', money(totals.tax - totals.tax / 2)]]),
    Math.abs(totals.roundOff) >= 0.01 && ['Round off', money(totals.roundOff)],
  ].filter(Boolean);
  const totalsWidth = thermal ? width : Math.min(230, width * 0.45);
  const totalsX = right - totalsWidth;
  const summaryWidth = width - totalsWidth - 16;
  const blockTop = y;
  ensure(totalRows.length * (base + 6) + 70);

  if (!thermal && model.taxSummary.length && totals.tax > 0 && summaryWidth > 160) {
    const sCols = model.interState
      ? [['GST %', 0.2], ['Taxable', 0.4], ['IGST', 0.4]]
      : [['GST %', 0.16], ['Taxable', 0.32], ['CGST', 0.26], ['SGST', 0.26]];
    let sx = left;
    const sHead = base + 7;
    doc.rect(left, y, summaryWidth, sHead).fill(tint(accent, 0.9));
    for (const [label, share] of sCols) { line1(label, sx + 4, y + 4, { size: base - 1.5, bold: true, color: accent, width: summaryWidth * share - 8, align: label === 'GST %' ? 'left' : 'right' }); sx += summaryWidth * share; }
    let sy = y + sHead;
    for (const row of model.taxSummary) {
      sx = left;
      const values = model.interState ? [`${qty(row.rate)}%`, money(row.taxable), money(row.igst)] : [`${qty(row.rate)}%`, money(row.taxable), money(row.cgst), money(row.sgst)];
      values.forEach((value, i) => { line1(value, sx + 4, sy + 3, { size: base - 1, width: summaryWidth * sCols[i][1] - 8, align: i === 0 ? 'left' : 'right' }); sx += summaryWidth * sCols[i][1]; });
      sy += base + 6;
      doc.moveTo(left, sy).lineTo(left + summaryWidth, sy).strokeColor(RULE).lineWidth(0.5).stroke();
    }
    if (settings.show.amount_in_words) sy = text(totals.words, left, sy + 8, { size: base - 0.5, bold: true, width: summaryWidth });
    y = sy;
  }

  let ty = blockTop;
  for (const [label, value] of totalRows) {
    text(label, totalsX, ty, { size: base - 0.5, color: MUTED, width: totalsWidth / 2 });
    text(value, totalsX + totalsWidth / 2, ty, { size: base - 0.5, width: totalsWidth / 2, align: 'right' });
    ty += base + 6;
  }
  const grandHeight = base + (thermal ? 8 : 12);
  if (thermal) doc.moveTo(totalsX, ty).lineTo(right, ty).strokeColor(INK).lineWidth(0.8).stroke();
  else doc.rect(totalsX, ty, totalsWidth, grandHeight).fill(accent);
  text('Total', totalsX + (thermal ? 0 : 8), ty + (thermal ? 3 : 5), { size: base + 1.5, bold: true, color: thermal ? INK : '#FFFFFF', width: totalsWidth / 2 });
  text(money(totals.total), totalsX + totalsWidth / 2, ty + (thermal ? 3 : 5), { size: base + 1.5, bold: true, color: thermal ? INK : '#FFFFFF', width: totalsWidth / 2 - (thermal ? 0 : 8), align: 'right' });
  ty += grandHeight + 4;
  if (totals.paid > 0) {
    text('Received', totalsX, ty, { size: base - 0.5, color: MUTED, width: totalsWidth / 2 });
    text(money(totals.paid), totalsX + totalsWidth / 2, ty, { size: base - 0.5, width: totalsWidth / 2, align: 'right' });
    ty += base + 5;
    text('Balance due', totalsX, ty, { size: base, bold: true, width: totalsWidth / 2 });
    text(money(totals.due), totalsX + totalsWidth / 2, ty, { size: base, bold: true, color: totals.due > 0 ? '#B91C1C' : INK, width: totalsWidth / 2, align: 'right' });
    ty += base + 6;
  }
  if ((thermal || summaryWidth <= 160 || !totals.tax) && settings.show.amount_in_words) ty = text(totals.words, thermal ? left : totalsX, ty + 4, { size: base - 1, bold: true, width: thermal ? width : totalsWidth }) + 2;
  y = Math.max(y, ty) + 14;

  /* ── Bank, UPI, terms, signature ── */
  const bank = model.bank;
  const bankLines = settings.show.bank ? [bank.name && `Bank: ${bank.name}`, bank.account && `A/c No: ${bank.account}`, bank.ifsc && `IFSC: ${bank.ifsc}`, bank.branch && `Branch: ${bank.branch}`].filter(Boolean) : [];
  const upi = settings.show.upi_qr ? bank.upiId : '';
  const qrFile = settings.show.upi_qr ? imagePath(bank.qr, uploadRoot) : null;
  const termsText = settings.show.terms ? [model.terms, model.notes].filter(Boolean).join('\n') : '';
  const footerHeight = Math.max(bankLines.length * (base + 4) + (upi ? base + 4 : 0) + 18, qrFile ? 84 : 0, termsText ? height(termsText, width / 2, base - 1) + 18 : 0) + (settings.show.signature && !thermal ? 60 : 0);
  ensure(footerHeight + 30);

  if (thermal) {
    if (bankLines.length || upi) {
      y = text(bankLines.concat(upi ? [`UPI: ${upi}`] : []).join('\n'), left, y, { size: base - 1, width, align: 'center' }) + 4;
    }
    if (qrFile) { try { doc.image(qrFile, paper.width / 2 - 40, y, { fit: [80, 80] }); y += 84; } catch { /* unreadable image */ } }
    if (termsText) y = text(termsText, left, y + 2, { size: base - 1.5, color: MUTED, width, align: 'center' });
    y = text(model.footerNote || 'Thank you! Visit again.', left, y + 6, { size: base, bold: true, width, align: 'center' });
    return y + margin;
  }

  const colW = width / 2 - 8;
  let by = y;
  if (bankLines.length || upi) {
    by = text('PAYMENT DETAILS', left, by, { size: base - 1.5, bold: true, color: accent, characterSpacing: 1 });
    by = text(bankLines.concat(upi ? [`UPI ID: ${upi}`] : []).join('\n'), left, by + 3, { size: base - 0.5, width: qrFile ? colW - 84 : colW });
  }
  if (qrFile) { try { doc.image(qrFile, left + colW - 76, y, { fit: [76, 76] }); by = Math.max(by, y + 80); } catch { /* unreadable image */ } }
  if (termsText) {
    by = text('TERMS & CONDITIONS', left, by + 10, { size: base - 1.5, bold: true, color: accent, characterSpacing: 1 });
    by = text(termsText, left, by + 3, { size: base - 1.5, color: MUTED, width: colW });
  }
  let sy = y;
  if (settings.show.signature) {
    sy = text(`For ${seller.name}`, left + width / 2 + 8, sy, { size: base - 0.5, bold: true, width: colW, align: 'right' });
    if (seller.signature && image(seller.signature, right - 120, sy + 4, [120, 40])) sy += 44; else sy += 34;
    doc.moveTo(right - 130, sy + 2).lineTo(right, sy + 2).strokeColor(RULE).lineWidth(0.6).stroke();
    sy = text('Authorised signatory', left + width / 2 + 8, sy + 5, { size: base - 1, color: MUTED, width: colW, align: 'right' });
  }
  y = Math.max(by, sy) + 16;
  if (model.footerNote) y = text(model.footerNote, left, y, { size: base - 0.5, color: INK, width, align: 'center' }) + 4;
  text('This is a computer-generated invoice.', left, Math.min(y + 4, (paper.height || y + 20) - margin + 8), { size: base - 2, color: MUTED, width, align: 'center' });
  return y + 20;
}

module.exports = { render, registerFonts, imagePath };
