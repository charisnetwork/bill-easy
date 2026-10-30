import React, { useMemo } from 'react';
import { buildInvoiceDocument, formatMoney, PAPERS } from '../../lib/invoice/invoiceCore';
import { getAssetUrl } from '../../config/api';

/**
 * On-screen invoice, drawn from the same model and template tokens as the PDF
 * (backend/services/invoicePdf/render.js), so what the user sees is what prints.
 */
const FONT_STACKS = {
  sans: "'Inter', 'DejaVu Sans', system-ui, sans-serif",
  serif: "Georgia, 'DejaVu Serif', 'Times New Roman', serif",
  mono: "ui-monospace, 'DejaVu Sans Mono', Menlo, monospace",
};
// Screen width for each paper at 96 dpi (1 pt = 4/3 px).
const pxWidth = (paper) => Math.round((PAPERS[paper] || PAPERS.A4).width * (4 / 3));

const plain = (n) => `${Number(n || 0) < 0 ? '-' : ''}${Math.abs(Number(n || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const money = (n) => (Number(n || 0) < 0 ? `-${formatMoney(Math.abs(n))}` : formatMoney(n));
const qty = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 3 });
const date = (value) => (value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
const tint = (hex, amount) => {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(n >> 16)}, ${mix((n >> 8) & 255)}, ${mix(n & 255)})`;
};

const Label = ({ children, color }) => (
  <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color }}>{children}</p>
);

export const InvoiceDocument = ({ invoice, company, settings, className = '' }) => {
  const model = useMemo(() => buildInvoiceDocument(invoice, company, settings ?? company?.settings), [invoice, company, settings]);
  const { style, columns, seller, buyer, meta, totals, bank } = model;
  const s = model.settings;
  const accent = style.accent;
  const header = style.template.header;
  const table = style.template.table;
  const thermal = s.paper === 'thermal';
  const small = s.paper !== 'A4';
  const split = columns.tax_split && !model.interState;
  const asset = (path) => (path ? getAssetUrl(path) : null);

  const details = [
    ['Invoice No', meta.number], ['Date', date(meta.date)], meta.dueDate && ['Due date', date(meta.dueDate)],
    s.party.place_of_supply && meta.placeOfSupply && ['Place of supply', meta.placeOfSupply],
    s.show.po_number && meta.poNumber && ['PO No', meta.poNumber],
    s.show.eway_bill && meta.ewayBill && ['E-way bill', meta.ewayBill],
    s.show.vehicle_number && meta.vehicleNumber && ['Vehicle', meta.vehicleNumber],
  ].filter(Boolean);
  const buyerLines = [buyer.address, s.party.phone && buyer.phone && `Ph: ${buyer.phone}`, s.party.gstin && buyer.gstin && `GSTIN: ${buyer.gstin}`,
    s.show.party_balance && buyer.balance > 0 && `Previous balance: ${money(buyer.balance)}`].filter(Boolean);
  const sellerContact = [seller.phone && `Ph: ${seller.phone}`, seller.email].filter(Boolean).join('  |  ');

  const cols = thermal
    ? [['name', 'Item'], ['quantity', 'Qty', true], ['rate', 'Rate', true], ['total', 'Amt (₹)', true]]
    : [
      ['sn', '#'], ['name', 'Item'], columns.hsn && ['hsn', 'HSN'], columns.batch && ['batch', 'Batch'], columns.expiry && ['expiry', 'Expiry'],
      ['quantity', 'Qty', true], columns.free_qty && ['free_qty', 'Free', true], ['rate', 'Rate', true], columns.discount && ['discount', 'Disc', true],
      !small && ['taxable', 'Taxable', true], ['taxRate', 'GST', true],
      !small && split && ['cgst', 'CGST', true], !small && split && ['sgst', 'SGST', true], !small && !split && ['tax', model.interState ? 'IGST' : 'Tax', true],
      ['total', 'Amount (₹)', true],
    ].filter(Boolean);
  const cell = (line, key) => {
    if (key === 'quantity') return `${qty(line.quantity)}${!small && line.unit ? ` ${line.unit}` : ''}`;
    if (['rate', 'discount', 'taxable', 'cgst', 'sgst', 'tax', 'total'].includes(key)) return plain(line[key]);
    if (key === 'taxRate') return `${qty(line.taxRate)}%`;
    if (key === 'expiry') return line.expiry ? date(line.expiry) : '';
    if (key === 'free_qty') return line.free_qty ? qty(line.free_qty) : '';
    return line[key] ?? '';
  };
  const filledHead = !thermal && (table === 'striped' || table === 'boxed');

  const logo = !thermal && seller.logo && <img src={asset(seller.logo)} alt="" className={small ? 'h-12 w-12 object-contain' : 'h-16 w-16 object-contain'} />;

  return (
    <div
      className={`invoice-document mx-auto bg-white text-slate-900 shadow-sm ${className}`}
      style={{ width: '100%', maxWidth: pxWidth(s.paper), fontFamily: FONT_STACKS[style.font] || FONT_STACKS.sans, fontSize: thermal ? 11 : small ? 11.5 : 12.5 }}
      data-template={s.template_id}
    >
      {/* Header */}
      {header === 'band' && !thermal ? (
        <div className="flex items-start justify-between gap-4 px-8 py-6 text-white" style={{ background: accent }}>
          <div className="flex items-start gap-4 min-w-0">
            {s.logo_position !== 'right' && logo && <div className="rounded-lg bg-white/95 p-1">{logo}</div>}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight">{seller.name}</h1>
              <p className="mt-1 text-[11px] opacity-90">{seller.address}</p>
              {sellerContact && <p className="text-[11px] opacity-90">{sellerContact}</p>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold tracking-[0.12em]">{model.title}</p>
            {seller.gstin && <p className="mt-1 text-[11px]">GSTIN {seller.gstin}</p>}
          </div>
        </div>
      ) : header === 'centered' || thermal ? (
        <div className={thermal ? 'px-3 pt-4 text-center' : 'px-8 pt-8 text-center'}>
          {logo && <div className="mb-2 flex justify-center">{logo}</div>}
          <h1 className={thermal ? 'text-base font-bold' : 'text-3xl font-bold'} style={{ color: thermal ? undefined : accent }}>{seller.name}</h1>
          <p className="mt-1 text-[11px] text-slate-500">{seller.address}</p>
          {sellerContact && <p className="text-[11px] text-slate-500">{sellerContact}</p>}
          {seller.gstin && <p className="mt-0.5 text-[11px] font-bold">GSTIN: {seller.gstin}</p>}
          {thermal ? (
            <p className="mt-2 border-t border-dashed border-slate-900 pt-1 font-bold">{model.title}</p>
          ) : (
            <p className="mt-4 border-y py-1.5 text-sm font-bold tracking-[0.3em]" style={{ color: accent, borderColor: accent }}>{model.title}</p>
          )}
        </div>
      ) : (
        <div className="mx-8 mt-8 flex items-start justify-between gap-6 pb-3" style={{ borderBottom: `${table === 'plain' ? 1 : 2}px solid ${accent}` }}>
          <div className={`flex items-start gap-4 min-w-0 ${s.logo_position === 'right' ? 'flex-row-reverse' : ''}`}>
            {logo}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight" style={{ color: table === 'boxed' ? accent : undefined }}>{seller.name}</h1>
              {seller.tagline && <p className="text-[11px] text-slate-500">{seller.tagline}</p>}
              <p className="mt-1 text-[11px] text-slate-500">{seller.address}</p>
              {sellerContact && <p className="text-[11px] text-slate-500">{sellerContact}</p>}
              {seller.gstin && <p className="text-[11px] font-bold">GSTIN: {seller.gstin}</p>}
            </div>
          </div>
          <p className="shrink-0 text-xl font-bold tracking-[0.1em]" style={{ color: accent }}>{model.title}</p>
        </div>
      )}

      {/* Bill to and invoice details */}
      {thermal ? (
        <div className="px-3 py-2 text-[11px]">
          {details.map(([k, v]) => <p key={k}>{k}: {v}</p>)}
          <p className="mt-1 font-bold">Bill to: {buyer.name}</p>
          {buyerLines.map((l) => <p key={l} className="text-slate-500">{l}</p>)}
        </div>
      ) : (
        <div className={`grid grid-cols-2 gap-3 ${header === 'band' ? 'px-8 pt-5' : 'px-8 pt-5'}`}>
          <div className={table === 'boxed' ? 'border border-slate-200 p-3' : 'rounded-md p-3'} style={table === 'boxed' ? undefined : { background: tint(accent, 0.94) }}>
            <Label color={accent}>Bill to</Label>
            <p className="mt-1 text-[15px] font-bold">{buyer.name}</p>
            {buyerLines.map((l) => <p key={l} className="text-[11px] text-slate-500">{l}</p>)}
            {s.party.shipping_address && buyer.shippingAddress && (<><div className="mt-2"><Label color={accent}>Ship to</Label></div><p className="text-[11px] text-slate-500">{buyer.shippingAddress}</p></>)}
          </div>
          <div className={table === 'boxed' ? 'border border-slate-200 p-3' : 'rounded-md bg-slate-50 p-3'}>
            {details.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 py-0.5 text-[11px]"><span className="text-slate-500">{k}</span><span className="font-bold text-right">{v}</span></div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className={thermal ? 'px-3' : 'px-8 pt-4'}>
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr style={filledHead ? { background: accent, color: '#fff' } : { color: table === 'lined' ? accent : undefined, borderBottom: `1px ${thermal ? 'dashed' : 'solid'} ${table === 'lined' ? accent : '#0f172a'}`, borderTop: thermal ? '1px dashed #0f172a' : undefined }}>
              {cols.map(([key, label, right]) => <th key={key} className={`px-1.5 py-1.5 font-bold whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}>{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {model.lines.map((line, i) => (
              <tr key={line.sn} style={{ background: table === 'striped' && !thermal && i % 2 === 1 ? tint(accent, 0.95) : undefined }}
                className={table === 'boxed' && !thermal ? 'border border-slate-200 [&>td]:border-l [&>td]:border-slate-200' : table === 'lined' || (table === 'striped' && !thermal) ? 'border-b border-slate-200' : ''}>
                {cols.map(([key, , right]) => (
                  <td key={key} className={`px-1.5 py-1.5 align-top ${right ? 'text-right whitespace-nowrap' : ''} ${key === 'total' ? 'font-bold' : ''}`}>
                    {key === 'name' ? (<><span className={thermal ? '' : 'font-semibold'}>{line.name}</span>{columns.description && line.description && <span className="block text-[10px] text-slate-500">{line.description}</span>}</>) : cell(line, key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {(thermal || table === 'plain') && <div className={`border-t ${thermal ? 'border-dashed' : ''} border-slate-900 mt-0.5`} />}
      </div>

      {/* Tax summary and totals */}
      <div className={thermal ? 'px-3 py-2' : 'grid grid-cols-[1fr_auto] gap-6 px-8 pt-4'}>
        {!thermal && (
          <div>
            {totals.tax > 0 && model.taxSummary.length > 0 && (
              <table className="w-full text-[10.5px]">
                <thead><tr style={{ background: tint(accent, 0.9), color: accent }}>
                  {(model.interState ? ['GST %', 'Taxable', 'IGST'] : ['GST %', 'Taxable', 'CGST', 'SGST']).map((h, i) => <th key={h} className={`px-1.5 py-1 font-bold ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}
                </tr></thead>
                <tbody>{model.taxSummary.map((r) => (
                  <tr key={r.rate} className="border-b border-slate-200">
                    <td className="px-1.5 py-1">{qty(r.rate)}%</td><td className="px-1.5 py-1 text-right">{money(r.taxable)}</td>
                    {model.interState ? <td className="px-1.5 py-1 text-right">{money(r.igst)}</td> : (<><td className="px-1.5 py-1 text-right">{money(r.cgst)}</td><td className="px-1.5 py-1 text-right">{money(r.sgst)}</td></>)}
                  </tr>
                ))}</tbody>
              </table>
            )}
            {s.show.amount_in_words && <p className="mt-2 text-[11px] font-bold">{totals.words}</p>}
          </div>
        )}
        <div className={thermal ? 'text-[11px]' : 'w-64 text-[11.5px]'}>
          {[['Taxable value', money(totals.taxable)], totals.discount > 0 && ['Discount', `- ${money(totals.discount)}`],
            ...(model.interState ? [['IGST', money(totals.tax)]] : [['CGST', money(totals.tax / 2)], ['SGST', money(totals.tax - totals.tax / 2)]]),
            Math.abs(totals.roundOff) >= 0.01 && ['Round off', money(totals.roundOff)]].filter(Boolean).map(([k, v]) => (
            <div key={k} className="flex justify-between py-0.5"><span className="text-slate-500">{k}</span><span>{v}</span></div>
          ))}
          <div className={`mt-1 flex justify-between px-2 py-1.5 text-[15px] font-bold ${thermal ? 'border-t border-slate-900 px-0' : 'text-white'}`} style={thermal ? undefined : { background: accent }}>
            <span>Total</span><span>{money(totals.total)}</span>
          </div>
          {totals.paid > 0 && (<>
            <div className="flex justify-between pt-1"><span className="text-slate-500">Received</span><span>{money(totals.paid)}</span></div>
            <div className="flex justify-between font-bold"><span>Balance due</span><span className={totals.due > 0 ? 'text-red-700' : ''}>{money(totals.due)}</span></div>
          </>)}
          {thermal && s.show.amount_in_words && <p className="mt-1 font-bold">{totals.words}</p>}
        </div>
      </div>

      {/* Payment, terms, signature */}
      {(() => {
        const bankLines = s.show.bank ? [bank.name && `Bank: ${bank.name}`, bank.account && `A/c No: ${bank.account}`, bank.ifsc && `IFSC: ${bank.ifsc}`, bank.branch && `Branch: ${bank.branch}`].filter(Boolean) : [];
        const upi = s.show.upi_qr ? bank.upiId : '';
        const qr = s.show.upi_qr && bank.qr ? asset(bank.qr) : null;
        const terms = s.show.terms ? [model.terms, model.notes].filter(Boolean).join('\n') : '';
        if (thermal) {
          return (
            <div className="px-3 pb-4 text-center text-[10.5px]">
              {[...bankLines, upi && `UPI: ${upi}`].filter(Boolean).map((l) => <p key={l}>{l}</p>)}
              {qr && <img src={qr} alt="Payment QR" className="mx-auto my-2 h-24 w-24 object-contain" />}
              {terms && <p className="whitespace-pre-line text-slate-500">{terms}</p>}
              <p className="mt-2 font-bold">{model.footerNote || 'Thank you! Visit again.'}</p>
            </div>
          );
        }
        return (
          <div className="grid grid-cols-2 gap-6 px-8 pt-6 pb-8">
            <div className="space-y-3 text-[11px]">
              {(bankLines.length > 0 || upi) && (
                <div className="flex gap-3">
                  <div className="flex-1"><Label color={accent}>Payment details</Label>{[...bankLines, upi && `UPI ID: ${upi}`].filter(Boolean).map((l) => <p key={l}>{l}</p>)}</div>
                  {qr && <img src={qr} alt="Payment QR" className="h-24 w-24 object-contain" />}
                </div>
              )}
              {terms && <div><Label color={accent}>Terms &amp; conditions</Label><p className="whitespace-pre-line text-[10.5px] text-slate-500">{terms}</p></div>}
            </div>
            {s.show.signature && (
              <div className="flex flex-col items-end text-[11px]">
                <p className="font-bold">For {seller.name}</p>
                {seller.signature ? <img src={asset(seller.signature)} alt="Signature" className="my-1 h-12 object-contain" /> : <div className="h-12" />}
                <p className="w-40 border-t border-slate-200 pt-1 text-right text-slate-500">Authorised signatory</p>
              </div>
            )}
            {model.footerNote && <p className="col-span-2 text-center text-[11px]">{model.footerNote}</p>}
            <p className="col-span-2 text-center text-[10px] text-slate-400">This is a computer-generated invoice.</p>
          </div>
        );
      })()}
    </div>
  );
};

export default InvoiceDocument;
