const test = require('node:test');
const assert = require('node:assert/strict');
const ExcelJS = require('exceljs');
const { readSpreadsheetRows } = require('../services/spreadsheetRows');

test('reads an .xlsx sheet as rows of plain values, skipping blank rows', async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Items');
  sheet.addRow(['Item Name', 'HSN', 'Sale Price', 'Stock']);
  sheet.addRow(['Paracetamol 650', '3004', 20.5, 100]);
  sheet.addRow([]);
  sheet.addRow(['Bandage', { formula: '1000+6', result: 1006 }, { richText: [{ text: '4' }, { text: '5' }] }, 7]);
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  assert.deepEqual(await readSpreadsheetRows(buffer), [
    ['Item Name', 'HSN', 'Sale Price', 'Stock'],
    ['Paracetamol 650', '3004', 20.5, 100],
    ['Bandage', 1006, '45', 7],
  ]);
});

test('reads CSV with quoted commas, quotes and a byte-order mark', async () => {
  const csv = '﻿Item Name,Sale Price,Notes\r\n"Rice, Basmati 5kg",450,"says ""best"""\r\n\r\nSugar,45,\n';
  assert.deepEqual(await readSpreadsheetRows(Buffer.from(csv)), [
    ['Item Name', 'Sale Price', 'Notes'],
    ['Rice, Basmati 5kg', '450', 'says "best"'],
    ['Sugar', '45', ''],
  ]);
});

test('an old .xls file is refused with a clear message', async () => {
  const xls = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0, 0, 0]);
  await assert.rejects(readSpreadsheetRows(xls), (err) => err.status === 400 && /xlsx or \.csv/i.test(err.message));
});
