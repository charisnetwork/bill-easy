/**
 * GSTR-1 Excel Export Service
 *
 * Generates a government-compliant GSTR-1 workbook with three sheets:
 *   - b2b   : B2B invoices (customers with GSTIN), split by tax rate per row
 *   - b2cs  : B2C Small invoices (unregistered consumers), aggregated by POS + Rate
 *   - hsn   : HSN-wise summary aggregated across all invoices
 *
 * Rows 1–3 are reserved for government summary parameters.
 * Data headers start at Row 4, data at Row 5.
 */

const ExcelJS = require('exceljs');

// ── Indian state code map (for Place of Supply formatting) ──────────────────
const STATE_CODES = {
  '01': 'Jammu and Kashmir',   '02': 'Himachal Pradesh',    '03': 'Punjab',
  '04': 'Chandigarh',          '05': 'Uttarakhand',          '06': 'Haryana',
  '07': 'Delhi',               '08': 'Rajasthan',            '09': 'Uttar Pradesh',
  '10': 'Bihar',               '11': 'Sikkim',               '12': 'Arunachal Pradesh',
  '13': 'Nagaland',            '14': 'Manipur',              '15': 'Mizoram',
  '16': 'Tripura',             '17': 'Meghalaya',            '18': 'Assam',
  '19': 'West Bengal',         '20': 'Jharkhand',            '21': 'Odisha',
  '22': 'Chhattisgarh',        '23': 'Madhya Pradesh',       '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',         '28': 'Andhra Pradesh',       '29': 'Karnataka',
  '30': 'Goa',                 '31': 'Lakshadweep',          '32': 'Kerala',
  '33': 'Tamil Nadu',          '34': 'Puducherry',           '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',           '37': 'Andhra Pradesh (New)', '38': 'Ladakh',
  '97': 'Other Territory',     '99': 'Other Country',
};

/**
 * Derive state code from GSTIN (first 2 digits) or state name lookup.
 */
const getPOS = (gstin, stateName) => {
  if (gstin && gstin.length >= 2) {
    const code = gstin.substring(0, 2);
    const name = STATE_CODES[code] || stateName || 'Unknown';
    return `${code}-${name}`;
  }
  // Try to find code from state name
  if (stateName) {
    const entry = Object.entries(STATE_CODES).find(
      ([, v]) => v.toLowerCase() === stateName.toLowerCase()
    );
    if (entry) return `${entry[0]}-${entry[1]}`;
    return `99-${stateName}`;
  }
  return '99-Other Territory';
};

/**
 * Format date as DD-MMM-YYYY (e.g. 04-Jun-2026)
 */
const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
};

const n = (v) => parseFloat(v) || 0;

// ── Shared style helpers ─────────────────────────────────────────────────────
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
const HEADER_FONT = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
const DATA_FONT   = { name: 'Calibri', size: 10 };
const BORDER      = {
  top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
};

const applyHeader = (row) => {
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = BORDER;
  });
  row.height = 32;
};

const applyData = (row, shaded = false) => {
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = DATA_FONT;
    cell.alignment = { vertical: 'middle', wrapText: false };
    cell.border = BORDER;
    if (shaded) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  });
  row.height = 18;
};

// ── B2B Sheet ────────────────────────────────────────────────────────────────
function buildB2B(ws, invoices) {
  ws.properties.defaultRowHeight = 18;

  // Rows 1–3: Reserved for government summary params
  ws.getRow(1).getCell(1).value = 'Summary of B2B Invoices';
  ws.getRow(1).getCell(1).font = { bold: true, size: 12 };
  ws.getRow(2).getCell(1).value = '(Reserved for government filing parameters)';
  ws.getRow(2).getCell(1).font = { italic: true, color: { argb: 'FF6B7280' }, size: 9 };
  ws.getRow(3).getCell(1).value = '';

  // Row 4: Headers
  const COLS = [
    { header: 'GSTIN/UIN of Recipient', key: 'gstin', width: 22 },
    { header: 'Receiver Name', key: 'name', width: 24 },
    { header: 'Invoice Number', key: 'inv_no', width: 20 },
    { header: 'Invoice Date', key: 'inv_date', width: 14 },
    { header: 'Invoice Value (₹)', key: 'inv_val', width: 16 },
    { header: 'Place Of Supply', key: 'pos', width: 22 },
    { header: 'Reverse Charge', key: 'rc', width: 14 },
    { header: 'Invoice Type', key: 'inv_type', width: 16 },
    { header: 'E-Commerce GSTIN', key: 'ecom', width: 20 },
    { header: 'Rate (%)', key: 'rate', width: 10 },
    { header: 'Taxable Value (₹)', key: 'taxable', width: 18 },
    { header: 'Cess Amount (₹)', key: 'cess', width: 16 },
  ];

  ws.columns = COLS.map(c => ({ key: c.key, width: c.width }));
  const headerRow = ws.getRow(4);
  COLS.forEach((col, i) => { headerRow.getCell(i + 1).value = col.header; });
  applyHeader(headerRow);

  // Data rows starting at row 5
  let rowIdx = 5;
  const b2bInvoices = invoices.filter(inv => inv.Customer?.gstin || inv.customer_gstin);

  b2bInvoices.forEach((inv) => {
    const gstin    = inv.Customer?.gstin || inv.customer_gstin || '';
    const name     = inv.Customer?.name || inv.customer_name || '';
    const invNo    = String(inv.invoice_number || inv.id);
    const invDate  = fmtDate(inv.invoice_date);
    const invTotal = n(inv.total_amount);
    const supGstin = inv.Company?.gst_number || '';
    const pos      = getPOS(gstin, inv.Customer?.state || inv.place_of_supply);
    const isInter  = supGstin.substring(0, 2) !== gstin.substring(0, 2);
    const invType  = isInter ? 'Regular' : 'Regular';

    // Group items by tax rate
    const items = inv.InvoiceItems || inv.items || [];
    if (items.length === 0) {
      const taxable = n(inv.taxable_amount || inv.subtotal);
      const rate    = n(inv.gst_rate || 18);
      const dataRow = ws.getRow(rowIdx++);
      dataRow.values = [gstin, name, invNo, invDate, invTotal, pos, 'N', invType, '', rate, taxable, 0];
      applyData(dataRow, rowIdx % 2 === 0);
    } else {
      // Group by rate
      const byRate = {};
      items.forEach(item => {
        const r = String(n(item.gst_rate || item.tax_rate || 18));
        if (!byRate[r]) byRate[r] = 0;
        const unitPrice = n(item.unit_price || item.price);
        const qty       = n(item.quantity || 1);
        byRate[r] += unitPrice * qty;
      });
      Object.entries(byRate).forEach(([rate, taxable]) => {
        const dataRow = ws.getRow(rowIdx++);
        dataRow.values = [gstin, name, invNo, invDate, invTotal, pos, 'N', invType, '', parseFloat(rate), taxable, 0];
        applyData(dataRow, rowIdx % 2 === 0);
      });
    }
  });
}

// ── B2CS Sheet ───────────────────────────────────────────────────────────────
function buildB2CS(ws, invoices) {
  ws.properties.defaultRowHeight = 18;

  ws.getRow(1).getCell(1).value = 'Summary of B2C Small Invoices';
  ws.getRow(1).getCell(1).font = { bold: true, size: 12 };
  ws.getRow(2).getCell(1).value = '(Reserved for government filing parameters)';
  ws.getRow(2).getCell(1).font = { italic: true, color: { argb: 'FF6B7280' }, size: 9 };
  ws.getRow(3).getCell(1).value = '';

  const COLS = [
    { header: 'Type', width: 10 },
    { header: 'Place Of Supply', width: 26 },
    { header: 'Rate (%)', width: 10 },
    { header: 'Taxable Value (₹)', width: 20 },
    { header: 'Cess Amount (₹)', width: 18 },
    { header: 'E-Commerce GSTIN', width: 22 },
  ];
  ws.columns = COLS.map((c, i) => ({ key: `c${i}`, width: c.width }));
  const headerRow = ws.getRow(4);
  COLS.forEach((col, i) => { headerRow.getCell(i + 1).value = col.header; });
  applyHeader(headerRow);

  // Aggregate by POS + Rate
  const agg = {};
  const b2cInvoices = invoices.filter(inv => !(inv.Customer?.gstin || inv.customer_gstin));

  b2cInvoices.forEach((inv) => {
    const pos = getPOS('', inv.Customer?.state || inv.place_of_supply || '');
    const items = inv.InvoiceItems || inv.items || [];

    if (items.length === 0) {
      const rate    = String(n(inv.gst_rate || 18));
      const key     = `${pos}__${rate}`;
      const taxable = n(inv.taxable_amount || inv.subtotal);
      agg[key]      = (agg[key] || 0) + taxable;
    } else {
      items.forEach(item => {
        const rate    = String(n(item.gst_rate || item.tax_rate || 18));
        const key     = `${pos}__${rate}`;
        const taxable = n(item.unit_price || item.price) * n(item.quantity || 1);
        agg[key]      = (agg[key] || 0) + taxable;
      });
    }
  });

  let rowIdx = 5;
  Object.entries(agg).forEach(([key, taxable]) => {
    const [pos, rate] = key.split('__');
    const dataRow = ws.getRow(rowIdx++);
    dataRow.values = ['OE', pos, parseFloat(rate), parseFloat(taxable.toFixed(2)), 0, ''];
    applyData(dataRow, rowIdx % 2 === 0);
  });
}

// ── HSN Sheet ────────────────────────────────────────────────────────────────
function buildHSN(ws, invoices, companyGstin) {
  ws.properties.defaultRowHeight = 18;

  ws.getRow(1).getCell(1).value = 'HSN-wise Summary of Outward Supplies';
  ws.getRow(1).getCell(1).font = { bold: true, size: 12 };
  ws.getRow(2).getCell(1).value = '(Reserved for government filing parameters)';
  ws.getRow(2).getCell(1).font = { italic: true, color: { argb: 'FF6B7280' }, size: 9 };
  ws.getRow(3).getCell(1).value = '';

  const COLS = [
    { header: 'HSN', width: 12 },
    { header: 'Description', width: 28 },
    { header: 'UQC', width: 8 },
    { header: 'Total Quantity', width: 14 },
    { header: 'Total Value (₹)', width: 16 },
    { header: 'Taxable Value (₹)', width: 18 },
    { header: 'Integrated Tax (₹)', width: 18 },
    { header: 'Central Tax (₹)', width: 16 },
    { header: 'State/UT Tax (₹)', width: 16 },
    { header: 'Cess (₹)', width: 12 },
  ];
  ws.columns = COLS.map((c, i) => ({ key: `h${i}`, width: c.width }));
  const headerRow = ws.getRow(4);
  COLS.forEach((col, i) => { headerRow.getCell(i + 1).value = col.header; });
  applyHeader(headerRow);

  const supStateCode = companyGstin ? companyGstin.substring(0, 2) : '';

  // Aggregate by HSN
  const hsnMap = {};

  invoices.forEach(inv => {
    const custGstin = inv.Customer?.gstin || inv.customer_gstin || '';
    const custState = custGstin.substring(0, 2);
    const isInter   = supStateCode && custGstin && supStateCode !== custState;

    const items = inv.InvoiceItems || inv.items || [];
    if (items.length === 0) {
      // Whole invoice as one HSN entry
      const hsn   = String(inv.hsn_code || '');
      const rate  = n(inv.gst_rate || 18);
      const taxable = n(inv.taxable_amount || inv.subtotal);
      const gstAmt  = taxable * rate / 100;
      if (!hsnMap[hsn]) hsnMap[hsn] = { desc: '', uqc: 'OTH', qty: 0, total: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0 };
      hsnMap[hsn].qty     += 1;
      hsnMap[hsn].total   += n(inv.total_amount);
      hsnMap[hsn].taxable += taxable;
      if (isInter) { hsnMap[hsn].igst += gstAmt; }
      else         { hsnMap[hsn].cgst += gstAmt / 2; hsnMap[hsn].sgst += gstAmt / 2; }
    } else {
      items.forEach(item => {
        const hsn  = String(item.hsn_code || item.Product?.hsn_code || '');
        const rate = n(item.gst_rate || item.tax_rate || item.Product?.gst_rate || 18);
        const qty  = n(item.quantity || 1);
        const up   = n(item.unit_price || item.price || item.sale_price);
        const taxable = up * qty;
        const gstAmt  = taxable * rate / 100;
        const total   = taxable + gstAmt;
        const uqc     = item.unit || item.Product?.unit || 'OTH';

        if (!hsnMap[hsn]) hsnMap[hsn] = { desc: '', uqc, qty: 0, total: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0 };
        hsnMap[hsn].desc  = item.name || item.Product?.name || hsnMap[hsn].desc;
        hsnMap[hsn].uqc   = uqc;
        hsnMap[hsn].qty     += qty;
        hsnMap[hsn].total   += total;
        hsnMap[hsn].taxable += taxable;
        if (isInter) { hsnMap[hsn].igst += gstAmt; }
        else         { hsnMap[hsn].cgst += gstAmt / 2; hsnMap[hsn].sgst += gstAmt / 2; }
      });
    }
  });

  let rowIdx = 5;
  Object.entries(hsnMap).forEach(([hsn, d]) => {
    const dataRow = ws.getRow(rowIdx++);
    dataRow.values = [
      hsn,
      d.desc,
      d.uqc.toUpperCase(),
      parseFloat(d.qty.toFixed(3)),
      parseFloat(d.total.toFixed(2)),
      parseFloat(d.taxable.toFixed(2)),
      parseFloat(d.igst.toFixed(2)),
      parseFloat(d.cgst.toFixed(2)),
      parseFloat(d.sgst.toFixed(2)),
      0,
    ];
    applyData(dataRow, rowIdx % 2 === 0);
  });
}

// ── Main Export Function ─────────────────────────────────────────────────────

/**
 * Generate government-compliant GSTR-1 Excel workbook.
 *
 * @param {Array}  invoices      - Array of invoice objects (with associations: Customer, InvoiceItems, Company)
 * @param {Object} meta          - { companyName, gstin, period } e.g. { period: 'May-2026' }
 * @returns {Buffer}             - Excel file buffer (.xlsx)
 */
const generateGstr1Excel = async (invoices, meta = {}) => {
  const wb = new ExcelJS.Workbook();
  wb.creator     = 'BillEasy';
  wb.created     = new Date();
  wb.modified    = new Date();
  wb.lastModifiedBy = meta.companyName || 'BillEasy';

  const b2bWs  = wb.addWorksheet('b2b');
  const b2csWs = wb.addWorksheet('b2cs');
  const hsnWs  = wb.addWorksheet('hsn');

  buildB2B(b2bWs, invoices);
  buildB2CS(b2csWs, invoices);
  buildHSN(hsnWs, invoices, meta.gstin || '');

  const buffer = await wb.xlsx.writeBuffer();
  return buffer;
};

module.exports = { generateGstr1Excel };
