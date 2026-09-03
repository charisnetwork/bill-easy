const crypto = require('crypto');
const express = require('express');
const { Op, fn, col } = require('sequelize');
const { sequelize, Company, User, Subscription, Plan, Invoice } = require('../models');

const router = express.Router();

function validKey(value) {
  const expected = process.env.CONTROL_CENTER_INTEGRATION_KEY;
  if (!expected || !value) return false;
  const left = Buffer.from(expected, 'utf8');
  const right = Buffer.from(value, 'utf8');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function integrationAuth(req, res, next) {
  if (!process.env.CONTROL_CENTER_INTEGRATION_KEY) {
    return res.status(503).json({ error: 'Control integration is not configured', code: 'INTEGRATION_NOT_CONFIGURED' });
  }
  if (!validKey(req.get('x-control-center-key'))) {
    return res.status(401).json({ error: 'Invalid integration credentials', code: 'INTEGRATION_UNAUTHORIZED' });
  }
  return next();
}

function page(query) {
  return {
    limit: Math.min(Math.max(Number.parseInt(query.limit, 10) || 50, 1), 100),
    offset: Math.max(Number.parseInt(query.offset, 10) || 0, 0)
  };
}

function customer(company) {
  const value = company.toJSON();
  const owner = value.Owner || value.Users?.find((user) => user.role === 'owner') || null;
  const subscription = value.Subscription;
  return {
    tenantId: value.id,
    companyName: value.name,
    email: value.email || owner?.email || null,
    phone: value.phone || owner?.mobile_number || null,
    owner: owner ? { id: owner.id, name: owner.name, email: owner.email || null } : null,
    activeUsers: Array.isArray(value.Users) ? value.Users.filter((user) => user.is_active).length : null,
    lastLoginAt: owner?.last_login || null,
    subscription: subscription ? {
      status: subscription.status, paymentStatus: subscription.payment_status,
      startDate: subscription.start_date, expiryDate: subscription.expiry_date,
      plan: subscription.Plan ? { id: subscription.Plan.id, name: subscription.Plan.plan_name } : null
    } : null
  };
}

const customerInclude = [
  { model: User, as: 'Owner', attributes: ['id', 'name', 'email', 'mobile_number', 'last_login'] },
  { model: User, attributes: ['id', 'name', 'email', 'role', 'is_active'] },
  { model: Subscription, include: [{ model: Plan, attributes: ['id', 'plan_name'] }] }
];

router.use(integrationAuth);

router.get('/health', async (_req, res, next) => {
  try { await sequelize.authenticate(); return res.json({ status: 'ok', service: 'bill-easy-control-integration', timestamp: new Date().toISOString() }); }
  catch (error) { return next(error); }
});

router.get('/customers', async (req, res, next) => {
  try {
    const { limit, offset } = page(req.query);
    const result = await Company.findAndCountAll({ attributes: ['id', 'name', 'email', 'phone'], include: customerInclude, order: [['createdAt', 'DESC']], limit, offset, distinct: true });
    return res.json({ data: result.rows.map(customer), page: { limit, offset, total: result.count } });
  } catch (error) { return next(error); }
});

router.get('/customers/:tenantId', async (req, res, next) => {
  try {
    const company = await Company.findByPk(req.params.tenantId, { attributes: ['id', 'name', 'email', 'phone'], include: customerInclude });
    if (!company) return res.status(404).json({ error: 'Tenant not found', code: 'TENANT_NOT_FOUND' });
    return res.json({ data: customer(company) });
  } catch (error) { return next(error); }
});

router.get('/customers/:tenantId/usage', async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ where: { company_id: req.params.tenantId }, include: [{ model: Plan, attributes: ['max_invoices_per_month', 'max_products', 'max_users', 'storage_limit'] }] });
    if (!subscription) return res.status(404).json({ error: 'Subscription not found', code: 'SUBSCRIPTION_NOT_FOUND' });
    const usage = subscription.usage || {};
    const plan = subscription.Plan;
    return res.json({ tenantId: req.params.tenantId, usage, limits: plan ? {
      'invoice.monthly': plan.max_invoices_per_month, 'product.total': plan.max_products,
      'users.max': plan.max_users, 'storage.mb': plan.storage_limit
    } : {}, period: { startsAt: usage.invoice_period_start || null, endsAt: usage.invoice_period_end || null } });
  } catch (error) { return next(error); }
});

router.get('/activity', async (req, res, next) => {
  try {
    const { limit, offset } = page(req.query);
    const result = await Invoice.findAndCountAll({ attributes: ['id', 'company_id', 'invoice_number', 'invoice_date', 'final_amount', 'payment_status', 'status', 'createdAt'], include: [{ model: Company, attributes: ['name'] }], order: [['createdAt', 'DESC']], limit, offset });
    return res.json({ data: result.rows.map((invoice) => ({
      id: invoice.id, type: 'invoice.created', tenantId: invoice.company_id, companyName: invoice.Company?.name || null, occurredAt: invoice.createdAt,
      summary: { invoiceNumber: invoice.invoice_number, status: invoice.status, paymentStatus: invoice.payment_status, amount: invoice.final_amount }
    })), page: { limit, offset, total: result.count } });
  } catch (error) { return next(error); }
});

router.get('/revenue-summary', async (req, res, next) => {
  try {
    const start = req.query.start ? new Date(req.query.start) : new Date(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1);
    const end = req.query.end ? new Date(req.query.end) : new Date();
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return res.status(400).json({ error: 'Invalid date range', code: 'INVALID_DATE_RANGE' });
    const where = { invoice_date: { [Op.between]: [start, end] }, status: { [Op.ne]: 'cancelled' } };
    const [invoiceCount, totals, activeTenants, activeUsers] = await Promise.all([
      Invoice.count({ where }),
      Invoice.findOne({ where, attributes: [[fn('COALESCE', fn('SUM', col('final_amount')), 0), 'grossInvoicedAmount'], [fn('COALESCE', fn('SUM', col('paid_amount')), 0), 'paidAmount']] }),
      Company.count({ include: [{ model: Subscription, where: { status: { [Op.in]: ['active', 'trial'] } }, required: true }], distinct: true }),
      User.count({ where: { is_active: true } })
    ]);
    return res.json({ period: { start: start.toISOString(), end: end.toISOString() }, invoiceCount,
      grossInvoicedAmount: totals?.get('grossInvoicedAmount') || '0', paidAmount: totals?.get('paidAmount') || '0', activeTenants, activeUsers,
      monthlyRecurringRevenue: null, monthlyRecurringRevenueStatus: 'unavailable', source: 'bill-easy-invoices' });
  } catch (error) { return next(error); }
});

module.exports = router;
