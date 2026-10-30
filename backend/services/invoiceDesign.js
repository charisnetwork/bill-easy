/**
 * Invoice design settings: server-side validation and plan checks for what the Settings screen
 * saves, plus the Pro "Suggest a design" assistant. Rules come from the shared invoice core.
 */
const path = require('path');
const aiProvider = require('./aiProvider');
const { invoiceDefaultsFor } = require('../config/industries');

const corePromise = import(path.join(__dirname, 'invoicePdf', 'invoiceCore.mjs'));

class DesignError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.code = status === 403 ? 'FEATURE_NOT_AVAILABLE' : 'INVALID_INVOICE_DESIGN';
    Object.assign(this, extra);
  }
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const UPI = /^[\w.-]{2,}@[a-zA-Z][\w]{1,}$/;
/** Keys this module owns inside company.settings; older keys it replaces are removed on save. */
const DESIGN_KEYS = ['template_id', 'accent', 'font', 'paper', 'logo_position', 'columns', 'party', 'show', 'footer_note', 'upi_id'];
const LEGACY_KEYS = ['invoice_template', 'theme_color', 'show_item_description', 'show_phone_number', 'enable_free_quantity', 'show_alternate_unit', 'show_po_number', 'show_eway_bill', 'show_vehicle_number', 'show_time', 'show_party_balance'];

const isDesignUpdate = (settings) => !!settings && DESIGN_KEYS.some((key) => key in settings);

function checkSwitches(name, value, keys) {
  if (value === undefined) return;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new DesignError(400, `${name} must be a list of on/off switches`);
  for (const key of keys) {
    if (key in value && typeof value[key] !== 'boolean') throw new DesignError(400, `${name}.${key} must be true or false`);
  }
}

/**
 * Validates a design update against the plan and returns the complete settings to store
 * (current design merged with the update, normalised, legacy keys removed).
 * A business keeps a template it already uses after a downgrade; it cannot newly pick a locked one.
 */
async function validateInvoiceSettings(input, { features = {}, current = {} } = {}) {
  const core = await corePromise;
  const update = input || {};
  if (update.template_id !== undefined && !core.TEMPLATES.some((t) => t.id === update.template_id)) throw new DesignError(400, 'Unknown invoice template');
  if (update.accent !== undefined && update.accent !== null && !HEX.test(update.accent)) throw new DesignError(400, 'Colour must look like #1D4ED8');
  if (update.font !== undefined && update.font !== null && !Object.hasOwn(core.FONTS, update.font)) throw new DesignError(400, 'Unknown font');
  if (update.logo_position !== undefined && !['left', 'right', 'center'].includes(update.logo_position)) throw new DesignError(400, 'Logo position must be left, right or center');
  checkSwitches('columns', update.columns, core.COLUMN_KEYS);
  checkSwitches('party', update.party, core.PARTY_KEYS);
  checkSwitches('show', update.show, core.SHOW_KEYS);
  if (update.footer_note !== undefined && (typeof update.footer_note !== 'string' || update.footer_note.length > 300)) throw new DesignError(400, 'Footer note can be up to 300 characters');
  if (update.upi_id !== undefined && update.upi_id !== '' && (typeof update.upi_id !== 'string' || !UPI.test(update.upi_id.trim()))) throw new DesignError(400, 'UPI ID must look like name@bank');

  const before = core.normalizeInvoiceSettings(current);
  const templateId = update.template_id ?? before.template_id;
  const template = core.templateById(templateId);
  if (update.paper !== undefined && !template.papers.includes(update.paper)) throw new DesignError(400, `${template.name} prints on ${template.papers.join(' or ')}`);
  if (templateId !== before.template_id && !core.templateAllowed(templateId, features)) {
    throw new DesignError(403, `The ${template.name} template is not included in your current plan. Please upgrade.`, { feature: core.TIER_FEATURES[template.tier], upgradeRequired: true });
  }

  const merged = {
    ...before,
    ...Object.fromEntries(DESIGN_KEYS.filter((k) => update[k] !== undefined).map((k) => [k, update[k]])),
    columns: { ...before.columns, ...(update.columns || {}) },
    party: { ...before.party, ...(update.party || {}) },
    show: { ...before.show, ...(update.show || {}) },
  };
  const normalized = core.normalizeInvoiceSettings(merged);
  // normalizeInvoiceSettings would map an unknown/legacy id; keep the validated choice.
  normalized.template_id = templateId;
  return normalized;
}

/** company.settings after a design save: other settings kept, legacy design keys dropped. */
const mergeIntoCompanySettings = (currentSettings, design) => {
  const next = { ...(currentSettings || {}) };
  for (const key of LEGACY_KEYS) delete next[key];
  return { ...next, ...design };
};

const SYSTEM = `You design GST invoices for Indian small businesses. Reply with JSON only:
{"template_id": one of TEMPLATE_IDS, "accent": "#RRGGBB", "columns": {"hsn": bool, "discount": bool, "batch": bool, "expiry": bool, "description": bool}}
Pick a template that suits the business type, and an accent colour that matches the logo colours when given (dark enough to read white text on it).`;

/**
 * Suggests a design for the business. The model only chooses among templates the plan allows;
 * any failure or invalid answer falls back to the industry's default design.
 */
async function suggestDesign({ industry, logoColors = [], features = {} }) {
  const core = await corePromise;
  const allowed = core.TEMPLATES.filter((t) => core.templateAllowed(t.id, features)).map((t) => t.id);
  const fallback = () => {
    const defaults = invoiceDefaultsFor(industry);
    return { template_id: allowed.includes(defaults.template_id) ? defaults.template_id : 'modern', accent: null, columns: defaults.columns || {}, source: 'industry_default' };
  };
  const colours = (Array.isArray(logoColors) ? logoColors : []).filter((c) => HEX.test(c)).slice(0, 3);
  try {
    const result = await aiProvider.chat({
      json: true, temperature: 0.4, maxTokens: 200,
      messages: [
        { role: 'system', content: SYSTEM.replace('TEMPLATE_IDS', JSON.stringify(allowed)) },
        { role: 'user', content: `Business type: ${String(industry || 'General Store').slice(0, 60)}. Logo colours: ${colours.join(', ') || 'none'}.` },
      ],
    });
    const answer = JSON.parse(result.content.replace(/^```(?:json)?|```$/g, '').trim());
    if (!allowed.includes(answer.template_id)) return fallback();
    const design = await validateInvoiceSettings({ template_id: answer.template_id, accent: HEX.test(answer.accent || '') ? answer.accent : null, columns: answer.columns }, { features, current: {} });
    return { template_id: design.template_id, accent: design.accent, columns: design.columns, source: 'ai' };
  } catch {
    return fallback();
  }
}

module.exports = { DesignError, DESIGN_KEYS, isDesignUpdate, validateInvoiceSettings, mergeIntoCompanySettings, suggestDesign };
