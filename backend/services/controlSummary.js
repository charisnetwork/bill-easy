/**
 * Charis OS → Bill Easy read-only reporting (Control Centre → Overview → Application activity).
 * Counts and business contact only: no invoices, amounts or customer records leave Bill Easy.
 * Same contract as Buildtrack Civil; Bill Easy reports its own numbers as `metrics`.
 */
const crypto = require('crypto');
const { Op, fn, col } = require('sequelize');

const DAY_MS = 24 * 60 * 60 * 1000;

class ControlSummaryError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function controlSummaryConfig(source = process.env) {
  const token = (source.CHARIS_OS_SUMMARY_TOKEN || '').trim();
  if (!token) return null;
  if (token.length < 32) throw new Error('CHARIS_OS_SUMMARY_TOKEN must be at least 32 characters');
  return { token };
}

const digest = (value) => crypto.createHash('sha256').update(value).digest();
function summaryTokenMatches(header, token) {
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return false;
  return crypto.timingSafeEqual(digest(header.slice(7)), digest(token));
}

function isoDate(value, name) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:\d{2}))?$/.test(value)) throw new ControlSummaryError(400, `${name} must be an ISO date`);
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) throw new ControlSummaryError(400, `${name} must be an ISO date`);
  return parsed;
}

function parseRange(query, now = new Date()) {
  if (Object.keys(query).some((key) => !['from', 'to'].includes(key))) throw new ControlSummaryError(400, 'Unsupported query parameter');
  const to = query.to === undefined ? now : isoDate(query.to, 'to');
  const from = query.from === undefined ? new Date(to.getTime() - 30 * DAY_MS) : isoDate(query.from, 'from');
  if (from >= to) throw new ControlSummaryError(400, 'from must be before to');
  if (to.getTime() - from.getTime() > 366 * DAY_MS) throw new ControlSummaryError(400, 'Range cannot exceed 366 days');
  return { from, to };
}

function parseCustomerQuery(query) {
  if (Object.keys(query).some((key) => !['page', 'page_size', 'search', 'status'].includes(key))) throw new ControlSummaryError(400, 'Unsupported query parameter');
  const int = (value, fallback, max, name) => {
    if (value === undefined) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > max) throw new ControlSummaryError(400, `${name} must be between 1 and ${max}`);
    return parsed;
  };
  const search = query.search === undefined ? '' : String(query.search).trim();
  if (typeof query.search === 'object' || search.length > 100) throw new ControlSummaryError(400, 'search must be at most 100 characters');
  const status = query.status === undefined ? null : String(query.status);
  if (status !== null && !['active', 'disabled'].includes(status)) throw new ControlSummaryError(400, 'status must be active or disabled');
  return { page: int(query.page, 1, 100000, 'page'), pageSize: int(query.page_size, 50, 100, 'page_size'), search, status };
}

async function getSummary(range, now = new Date()) {
  const { Company, User, Invoice, Product, Customer } = require('../models');
  const since = (days) => new Date(now.getTime() - days * DAY_MS);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const [total, newInRange, activeCompanies, users, enabled, active24h, active7d, invoices, invoicesThisMonth, products, customers] = await Promise.all([
    Company.count(),
    Company.count({ where: { createdAt: { [Op.gte]: range.from, [Op.lt]: range.to } } }),
    User.count({ distinct: true, col: 'company_id', where: { last_login: { [Op.gte]: since(30) }, company_id: { [Op.ne]: null } } }),
    User.count(),
    User.count({ where: { is_active: true } }),
    User.count({ where: { last_login: { [Op.gte]: since(1) } } }),
    User.count({ where: { last_login: { [Op.gte]: since(7) } } }),
    Invoice.count(),
    Invoice.count({ where: { createdAt: { [Op.gte]: monthStart } } }),
    Product.count(),
    Customer.count(),
  ]);
  return {
    contract_version: 1,
    generated_at: now.toISOString(),
    range: { from: range.from.toISOString(), to: range.to.toISOString() },
    customers: { total, active_30d: activeCompanies, new_in_range: newInRange },
    users: { total: users, enabled, active_24h: active24h, active_7d: active7d },
    metrics: [
      { label: 'Invoices this month', value: invoicesThisMonth },
      { label: 'Invoices in total', value: invoices },
      { label: 'Items', value: products },
      { label: 'Customers of businesses', value: customers },
    ],
  };
}

async function listCustomers(query) {
  const { Company, User, Invoice, UserCompany } = require('../models');
  const where = {};
  if (query.search) {
    const like = { [Op.iLike]: `%${query.search.replace(/[\\%_]/g, (c) => `\\${c}`)}%` };
    where[Op.or] = [{ name: like }, { email: like }, { phone: like }, { city: like }];
  }
  const companies = await Company.findAll({ where, attributes: ['id', 'name', 'email', 'phone', 'city', 'state', 'owner_id', 'createdAt'], order: [['createdAt', 'DESC'], ['id', 'ASC']], raw: true });
  const ownerIds = [...new Set(companies.map((c) => c.owner_id).filter(Boolean))];
  const owners = new Map((await User.findAll({ where: { id: ownerIds }, attributes: ['id', 'name', 'is_active'], raw: true })).map((u) => [u.id, u]));
  const status = (company) => (owners.get(company.owner_id)?.is_active ? 'active' : 'disabled');
  const filtered = query.status ? companies.filter((c) => status(c) === query.status) : companies;
  const page = filtered.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
  const ids = page.map((c) => c.id);
  const grouped = async (model, attrs) => new Map((await model.findAll({ where: { company_id: ids }, attributes: ['company_id', ...attrs], group: ['company_id'], raw: true })).map((row) => [row.company_id, row]));
  const [members, invoices, logins] = ids.length ? await Promise.all([
    grouped(UserCompany, [[fn('COUNT', col('id')), 'n']]),
    grouped(Invoice, [[fn('COUNT', col('id')), 'n']]),
    grouped(User, [[fn('MAX', col('last_login')), 'last']]),
  ]) : [new Map(), new Map(), new Map()];
  return {
    contract_version: 1,
    page: query.page,
    page_size: query.pageSize,
    total: filtered.length,
    count_label: 'invoices',
    items: page.map((company) => {
      const last = logins.get(company.id)?.last;
      return {
        external_id: company.id,
        company: company.name,
        owner: owners.get(company.owner_id)?.name ?? null,
        email: company.email || null,
        phone: company.phone || null,
        city: company.city || null,
        state: company.state || null,
        registered_at: new Date(company.createdAt).toISOString(),
        last_login_at: last ? new Date(last).toISOString() : null,
        last_active_at: last ? new Date(last).toISOString() : null,
        users: Number(members.get(company.id)?.n || 0),
        projects: Number(invoices.get(company.id)?.n || 0),
        status: status(company),
      };
    }),
  };
}

module.exports = { ControlSummaryError, controlSummaryConfig, summaryTokenMatches, parseRange, parseCustomerQuery, getSummary, listCustomers };
