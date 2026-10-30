import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Loader2, Sparkles, RotateCcw, Check } from 'lucide-react';
import { toast } from 'sonner';
import api, { invoiceAPI } from '../../services/api';
import { getAssetUrl } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { cn } from '../../lib/utils';
import { InvoiceDocument } from '../invoice/InvoiceDocument';
import { TemplateThumbnail, SAMPLE_INVOICE } from '../invoice/TemplateThumbnail';
import {
  ACCENTS, FONTS, PAPERS, TEMPLATES, TIER_FEATURES, normalizeInvoiceSettings, resolvedStyle, templateAllowed, templateById,
} from '../../lib/invoice/invoiceCore';

const TIER_LABEL = { free: null, premium: 'Premium', pro: 'Pro' };
const COLUMN_LABELS = { hsn: 'HSN / SAC code', description: 'Item description', discount: 'Discount', tax_split: 'CGST & SGST columns', batch: 'Batch number', expiry: 'Expiry date', free_qty: 'Free quantity', alt_unit: 'Alternate unit' };
const PARTY_LABELS = { phone: 'Customer phone', gstin: 'Customer GSTIN', shipping_address: 'Shipping address', place_of_supply: 'Place of supply' };
const SHOW_LABELS = { bank: 'Bank details', upi_qr: 'UPI ID & QR code', signature: 'Signature', terms: 'Terms & conditions', amount_in_words: 'Amount in words', po_number: 'PO number', eway_bill: 'E-way bill number', vehicle_number: 'Vehicle number', party_balance: 'Customer previous balance' };

/** Up to three dominant colours of the logo, for the AI suggestion. Empty when the image cannot be read. */
async function logoColours(logo) {
  if (!logo) return [];
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getAssetUrl(logo);
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 32, 32);
    const counts = new Map();
    const { data } = ctx.getImageData(0, 0, 32, 32);
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a < 200 || (r > 235 && g > 235 && b > 235) || (r < 20 && g < 20 && b < 20)) continue; // skip transparent, white, black
      const key = [r, g, b].map((c) => Math.round(c / 32) * 32).map((c) => Math.min(255, c).toString(16).padStart(2, '0')).join('');
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([hex]) => `#${hex}`);
  } catch {
    return [];
  }
}

const Section = ({ title, children }) => (
  <div className="space-y-3 border-b border-slate-200 p-5">
    <h4 className="text-sm font-bold text-slate-800">{title}</h4>
    {children}
  </div>
);

const Toggles = ({ labels, values, onChange }) => (
  <div className="space-y-2.5">
    {Object.entries(labels).map(([key, label]) => (
      <label key={key} className="flex items-center justify-between gap-3 text-sm text-slate-700 cursor-pointer">
        <span>{label}</span>
        <Switch checked={!!values[key]} onCheckedChange={(on) => onChange({ ...values, [key]: on })} aria-label={label} />
      </label>
    ))}
  </div>
);

export const InvoiceDesignSettings = ({ company, onSaved }) => {
  const { hasFeature, subscription } = useAuth();
  const features = subscription?.features || {};
  const saved = useMemo(() => normalizeInvoiceSettings(company?.settings), [company]);
  const [design, setDesign] = useState(saved);
  const [previewInvoice, setPreviewInvoice] = useState(SAMPLE_INVOICE);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const dirty = JSON.stringify(design) !== JSON.stringify(saved);
  const style = resolvedStyle(design);
  const template = templateById(design.template_id);

  useEffect(() => setDesign(saved), [saved]);

  // Preview with the business's latest invoice when there is one.
  useEffect(() => {
    let cancelled = false;
    invoiceAPI.getAll({ limit: 1 })
      .then((res) => {
        const list = res.data?.invoices || res.data?.data || res.data || [];
        return list[0]?.id ? invoiceAPI.get(list[0].id) : null;
      })
      .then((res) => { if (!cancelled && res?.data?.items?.length) setPreviewInvoice(res.data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const set = (patch) => setDesign((d) => normalizeInvoiceSettings({ ...d, ...patch }));
  const locked = (id) => !templateAllowed(id, features);

  const chooseTemplate = (id) => {
    if (locked(id) && id !== saved.template_id) {
      const t = templateById(id);
      window.dispatchEvent(new CustomEvent('UPGRADE_REQUIRED', { detail: { feature: TIER_FEATURES[t.tier], error: `The ${t.name} template is included in the ${TIER_LABEL[t.tier]} plan.` } }));
      return;
    }
    const t = templateById(id);
    set({ template_id: id, paper: t.papers.includes(design.paper) ? design.paper : t.papers[0] });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/company/settings', { settings: design });
      toast.success('Invoice design saved');
      onSaved?.();
    } catch (error) {
      if (error.response?.status !== 403) toast.error(error.response?.data?.error || 'Could not save the invoice design');
    } finally {
      setSaving(false);
    }
  };

  const suggest = async () => {
    if (!hasFeature('ai_invoice_design')) {
      window.dispatchEvent(new CustomEvent('UPGRADE_REQUIRED', { detail: { feature: 'ai_invoice_design', error: 'AI invoice design is included in the Pro plan.' } }));
      return;
    }
    setSuggesting(true);
    try {
      const { data } = await api.post('/company/invoice-design/suggest', { logo_colors: await logoColours(company?.logo) });
      const t = templateById(data.template_id);
      set({ template_id: t.id, paper: t.papers[0], accent: data.accent, columns: { ...design.columns, ...(data.columns || {}) } });
      toast.success(data.source === 'ai' ? `Suggested: ${t.name}. Review the preview and save.` : `Suggested the usual design for your business type: ${t.name}.`);
    } catch (error) {
      if (error.response?.status !== 403) toast.error('Could not suggest a design right now');
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <div className="-m-6 flex flex-col bg-slate-50 lg:h-[calc(100vh-140px)] lg:flex-row lg:overflow-hidden">
      {/* Live preview: the same renderer the invoice page and PDF use */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Invoice design</h3>
            <p className="text-sm text-slate-500">{template.name} · {PAPERS[design.paper].label} · preview of {previewInvoice === SAMPLE_INVOICE ? 'a sample bill' : `invoice ${previewInvoice.invoice_number}`}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 bg-white" onClick={() => setDesign(saved)} disabled={!dirty}><RotateCcw className="h-4 w-4" />Undo changes</Button>
            <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={save} disabled={!dirty || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Save design
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-3 sm:p-6">
          <InvoiceDocument invoice={previewInvoice} company={company} settings={design} />
        </div>
      </div>

      {/* Controls */}
      <div className="w-full shrink-0 overflow-y-auto border-l border-slate-200 bg-white lg:w-[380px]">
        <div className="border-b border-slate-200 p-5">
          <Button variant="outline" className="w-full gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={suggest} disabled={suggesting}>
            {suggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Suggest a design with AI
            {!hasFeature('ai_invoice_design') && <Lock className="ml-auto h-3.5 w-3.5" />}
          </Button>
          <p className="mt-2 text-xs text-slate-500">Uses your business type and logo colours.</p>
        </div>

        <Section title="Template">
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map((t) => {
              const isLocked = locked(t.id) && t.id !== saved.template_id;
              const active = design.template_id === t.id;
              return (
                <button key={t.id} type="button" onClick={() => chooseTemplate(t.id)} aria-pressed={active}
                  className={cn('group relative rounded-lg border-2 p-1.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    active ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300')}>
                  <div className={cn('overflow-hidden rounded border border-slate-100', isLocked && 'opacity-60')}>
                    <TemplateThumbnail templateId={t.id} company={company} width={150} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-1 px-0.5">
                    <span className="text-xs font-semibold text-slate-700">{t.name}</span>
                    {TIER_LABEL[t.tier] && <span className={cn('flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase', t.tier === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-700')}>{isLocked && <Lock className="h-2.5 w-2.5" />}{TIER_LABEL[t.tier]}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Colour and font">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => set({ accent: null })} className={cn('rounded-full border px-2.5 py-1 text-xs', !design.accent ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600')}>Template colour</button>
            {ACCENTS.map((c) => (
              <button key={c} type="button" aria-label={`Colour ${c}`} onClick={() => set({ accent: c })}
                className={cn('h-7 w-7 rounded-full border-2 transition-transform', style.accent === c && design.accent ? 'scale-110 border-slate-400' : 'border-white shadow')} style={{ background: c }} />
            ))}
            <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-slate-300" title="Custom colour">
              <input type="color" value={style.accent} onChange={(e) => set({ accent: e.target.value.toUpperCase() })} className="absolute -inset-2 h-12 w-12 cursor-pointer" aria-label="Custom colour" />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(FONTS).map(([key, label]) => (
              <button key={key} type="button" onClick={() => set({ font: key === template.font ? null : key })}
                className={cn('rounded-md border py-1.5 text-sm', style.font === key ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600')}
                style={{ fontFamily: key === 'serif' ? 'Georgia, serif' : key === 'mono' ? 'ui-monospace, monospace' : undefined }}>{label}</button>
            ))}
          </div>
        </Section>

        <Section title="Paper and logo">
          <div className="flex flex-wrap gap-2">
            {template.papers.map((p) => (
              <button key={p} type="button" onClick={() => set({ paper: p })} className={cn('rounded-md border px-3 py-1.5 text-sm', design.paper === p ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600')}>{PAPERS[p].label}</button>
            ))}
          </div>
          {design.paper !== 'thermal' && (
            <div className="flex gap-2">
              {['left', 'center', 'right'].map((pos) => (
                <button key={pos} type="button" onClick={() => set({ logo_position: pos })} className={cn('flex-1 rounded-md border py-1.5 text-sm capitalize', design.logo_position === pos ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600')}>Logo {pos}</button>
              ))}
            </div>
          )}
          {!company?.logo && <p className="text-xs text-slate-500">Add your logo in Manage Business.</p>}
        </Section>

        <Section title="Item table columns">
          <Toggles labels={COLUMN_LABELS} values={design.columns} onChange={(columns) => set({ columns })} />
          <p className="text-xs text-slate-500">Columns with no values on a bill are left out automatically.</p>
        </Section>

        <Section title="Customer details">
          <Toggles labels={PARTY_LABELS} values={design.party} onChange={(party) => set({ party })} />
        </Section>

        <Section title="Show on invoice">
          <Toggles labels={SHOW_LABELS} values={design.show} onChange={(show) => set({ show })} />
        </Section>

        <Section title="Payment and footer">
          <div className="space-y-1.5">
            <Label htmlFor="upi-id">UPI ID</Label>
            <Input id="upi-id" placeholder="yourshop@okhdfcbank" value={design.upi_id} onChange={(e) => setDesign((d) => ({ ...d, upi_id: e.target.value }))} />
            <p className="text-xs text-slate-500">Bank account, QR code and terms are set in Payment &amp; Bank.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="footer-note">Footer note</Label>
            <textarea id="footer-note" maxLength={300} rows={2} value={design.footer_note} onChange={(e) => setDesign((d) => ({ ...d, footer_note: e.target.value }))}
              placeholder="Thank you for your business!" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </Section>
      </div>
    </div>
  );
};

export default InvoiceDesignSettings;
