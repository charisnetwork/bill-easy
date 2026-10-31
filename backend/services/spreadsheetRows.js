/**
 * First sheet of an uploaded .xlsx or CSV file as rows of plain values (blank rows dropped).
 * Old binary .xls files are refused: exceljs reads only .xlsx, and the unmaintained `xlsx`
 * package that read .xls has unfixed security issues.
 */
const ExcelJS = require('exceljs');

const isZip = (b) => b.length > 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04; // .xlsx
const isOldXls = (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));

class SpreadsheetError extends Error {
  constructor(message) { super(message); this.status = 400; }
}

/** Formula results, rich text, hyperlinks and dates become plain values. */
function plain(value) {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value !== 'object') return value;
  if ('result' in value) return plain(value.result);
  if (Array.isArray(value.richText)) return value.richText.map((part) => part.text).join('');
  if ('text' in value) return plain(value.text);
  return String(value);
}

const isBlank = (row) => row.every((cell) => cell === '' || cell == null);

/** RFC 4180 CSV: quoted fields may hold commas, quotes ("") and line breaks. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

async function readSpreadsheetRows(buffer) {
  if (isOldXls(buffer)) throw new SpreadsheetError('Old .xls files are not supported. Please save the file as .xlsx or .csv and upload again.');
  let rows;
  if (isZip(buffer)) {
    const workbook = new ExcelJS.Workbook();
    try { await workbook.xlsx.load(buffer); } catch { throw new SpreadsheetError('This Excel file could not be read. Please save it as .xlsx or .csv and try again.'); }
    const sheet = workbook.worksheets[0];
    rows = [];
    sheet?.eachRow({ includeEmpty: false }, (row) => {
      // row.values is 1-based (index 0 is empty)
      const values = [];
      for (let col = 1; col <= row.cellCount; col++) values.push(plain(row.getCell(col).value));
      rows.push(values);
    });
  } else {
    rows = parseCsv(buffer.toString('utf8').replace(/^﻿/, ''));
  }
  return rows.filter((row) => !isBlank(row));
}

module.exports = { readSpreadsheetRows, SpreadsheetError };
