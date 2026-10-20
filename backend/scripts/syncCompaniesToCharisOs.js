/**
 * Go-live helper for CHARIS_SUBSCRIPTION_MODE=enforce.
 *
 *   node scripts/syncCompaniesToCharisOs.js           # dry run: report only, changes nothing
 *   node scripts/syncCompaniesToCharisOs.js --apply   # register customers in OS, start Free plans
 *
 * Every owner's first business becomes the OS customer. Owners on the local free tier get the
 * OS free plan. Owners with a still-active PAID local plan are listed for an OS administrator to
 * carry over deliberately (Subscriptions > assign, with a migration reason); this script never
 * grants paid access or records revenue.
 */
require('dotenv').config();
const { sequelize, Company, Subscription, Plan } = require('../models');
const charisOs = require('../services/charisOsService');

const apply = process.argv.includes('--apply');

async function main() {
  if (!charisOs.enabled()) throw new Error('Set CHARIS_SUBSCRIPTION_MODE=enforce and the CHARIS_OS_* variables first');
  const companies = await Company.findAll({ attributes: ['id', 'name', 'owner_id', 'createdAt'], order: [['createdAt', 'ASC']] });
  const tenants = new Map();
  for (const company of companies) {
    const tenantId = await charisOs.billingTenantId(company.id);
    if (!tenants.has(tenantId)) tenants.set(tenantId, company);
  }
  const rows = [];
  for (const [tenantId, company] of tenants) {
    const local = await Subscription.findOne({ where: { company_id: tenantId }, include: [Plan] });
    const planName = local?.Plan?.plan_name || 'none';
    const paidActive = local && Number(local.Plan?.price) > 0 && ['active', 'trial'].includes(local.status)
      && (!local.expiry_date || new Date(local.expiry_date) > new Date());
    let action = paidActive ? 'ASSIGN_PAID_PLAN_IN_OS' : 'START_FREE_PLAN';
    if (apply) {
      try {
        if (paidActive) await charisOs.syncCompany(tenantId);
        else {
          const snapshot = await charisOs.claimFreePlan(tenantId, company.owner_id || 'migration');
          action = `FREE:${snapshot.status}`;
        }
      } catch (error) {
        action = `FAILED:${error.code || error.message}`;
      }
    }
    rows.push({ tenantId, company: company.name, localPlan: planName, localExpiry: local?.expiry_date ? new Date(local.expiry_date).toISOString().slice(0, 10) : '', action });
  }
  console.log('tenant_id,company,local_plan,local_expiry,action');
  for (const r of rows) console.log([r.tenantId, JSON.stringify(r.company), r.localPlan, r.localExpiry, r.action].join(','));
  const paid = rows.filter(r => r.action === 'ASSIGN_PAID_PLAN_IN_OS');
  console.error(`\n${rows.length} OS customers (${companies.length} businesses). ${paid.length} have active paid local plans to carry over in OS.${apply ? '' : ' Dry run: nothing changed. Re-run with --apply.'}`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => sequelize.close());
