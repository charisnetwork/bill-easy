import React from 'react';
import { InvoiceDocument } from './InvoiceDocument';
import { PAPERS, templateById } from '../../lib/invoice/invoiceCore';

/** Sample bill used for template previews before a business has its own invoices. */
export const SAMPLE_INVOICE = {
  invoice_number: 'INV-0001', invoice_date: new Date().toISOString(), payment_status: 'unpaid', paid_amount: 0,
  Customer: { name: 'Sample Customer', address: '45 MG Road', city: 'Bengaluru', state: 'Karnataka', phone: '9000000000', gst_number: '29ABCDE1234F1Z5' },
  items: [
    { quantity: 2, unit_price: 450, tax_rate: 18, Product: { name: 'Product one', hsn_code: '8471', unit: 'PCS' } },
    { quantity: 5, unit_price: 120, tax_rate: 12, Product: { name: 'Product two', hsn_code: '3004', unit: 'PCS' } },
    { quantity: 1, unit_price: 999, tax_rate: 5, Product: { name: 'Service charge', hsn_code: '9983', unit: 'NOS' } },
  ],
};

/** The real invoice renderer, scaled down to a card: thumbnails always match the PDF. */
export const TemplateThumbnail = ({ templateId, company, accent, width = 150 }) => {
  const template = templateById(templateId);
  const paper = template.papers[0];
  const pagePx = PAPERS[paper].width * (4 / 3);
  const scale = width / pagePx;
  const pageHeight = paper === 'thermal' ? pagePx * 2.2 : pagePx * 1.414;
  return (
    <div className="relative overflow-hidden bg-white" style={{ width, height: Math.round(Math.min(pageHeight, pagePx * 1.414) * scale) }} aria-hidden="true">
      <div style={{ width: pagePx, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
        <InvoiceDocument invoice={SAMPLE_INVOICE} company={company} settings={{ ...(company?.settings || {}), template_id: templateId, paper, accent: accent || null }} />
      </div>
    </div>
  );
};

export default TemplateThumbnail;
