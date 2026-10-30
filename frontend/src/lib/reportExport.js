/** CSV of every table shown in a report, so any report on screen can be downloaded. */
export function tablesToCsv(container) {
  const quote = (text) => {
    let value = String(text).replace(/\s+/g, ' ').trim();
    // A cell starting with = + - @ would run as a formula in Excel: keep it as text.
    if (/^[=+\-@]/.test(value) && !/^-?[\d.,]+%?$/.test(value)) value = `'${value}`;
    return `"${value.replace(/"/g, '""')}"`;
  };
  const blocks = [...container.querySelectorAll('table')].map((table) =>
    [...table.querySelectorAll('tr')]
      .map((row) => [...row.querySelectorAll('th, td')].map((cell) => quote(cell.innerText)).join(','))
      .join('\n'));
  return blocks.join('\n\n');
}

export function downloadText(filename, text, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob(['﻿', text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
