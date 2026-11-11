/**
 * "Delete my account": removes the user and every business they own, with all of its records.
 *
 * Business tables reference companies with ON DELETE CASCADE, so deleting the company row removes
 * invoices, items, customers and the rest. Tables without that link are cleared by hand. Staff
 * logins that belonged only to the deleted businesses are removed too. Everything runs in one
 * transaction; uploaded logos, signatures and QR codes are removed afterwards.
 */
const { Op } = require('sequelize');
const { sequelize, Company, UserCompany } = require('../models');
const { removeCompanyAsset } = require('../utils/fileStore');

const UNLINKED_TABLES = ['activity_logs', 'tax_settings', 'usage_counters'];

async function ownedCompanyIds(user, transaction) {
  const [memberships, owned] = await Promise.all([
    UserCompany.findAll({ where: { user_id: user.id, role: 'owner' }, attributes: ['company_id'], transaction }),
    Company.findAll({ where: { owner_id: user.id }, attributes: ['id'], transaction }),
  ]);
  const ids = new Set([...memberships.map((m) => m.company_id), ...owned.map((c) => c.id)]);
  // Older sign-ups have no membership row: the owner's own company is on the user.
  if (user.role === 'owner' && user.company_id) ids.add(user.company_id);
  return [...ids];
}

async function deleteUserAndOwnedCompanies(user) {
  const result = await sequelize.transaction(async (transaction) => {
    const companyIds = await ownedCompanyIds(user, transaction);
    const companies = companyIds.length
      ? await Company.findAll({ where: { id: { [Op.in]: companyIds } }, attributes: ['id', 'name', 'logo', 'signature', 'qr_code'], transaction })
      : [];
    const replacements = { companyIds: companyIds.length ? companyIds : ['00000000-0000-0000-0000-000000000000'], userId: user.id };

    // Other logins that exist only for these businesses go with them.
    const [orphans] = await sequelize.query(`
      SELECT u.id FROM users u
      WHERE u.id <> :userId
        AND (u.company_id IN (:companyIds) OR u.id IN (SELECT user_id FROM usercompanies WHERE company_id IN (:companyIds)))
        AND NOT EXISTS (SELECT 1 FROM usercompanies m WHERE m.user_id = u.id AND m.company_id NOT IN (:companyIds))
        AND (u.company_id IS NULL OR u.company_id IN (:companyIds))`, { replacements, transaction });
    const userIds = [user.id, ...orphans.map((row) => row.id)];

    // Users who keep other businesses move their current business to one they still belong to.
    await sequelize.query(`
      UPDATE users u SET company_id = (SELECT m.company_id FROM usercompanies m WHERE m.user_id = u.id AND m.company_id NOT IN (:companyIds) ORDER BY m.company_id LIMIT 1)
      WHERE u.company_id IN (:companyIds) AND u.id NOT IN (:userIds)`, { replacements: { ...replacements, userIds }, transaction });

    const [present] = await sequelize.query('SELECT t FROM unnest(ARRAY[:tables]::text[]) t WHERE to_regclass(t) IS NOT NULL', { replacements: { tables: UNLINKED_TABLES }, transaction });
    for (const { t: table } of present) {
      await sequelize.query(`DELETE FROM ${table} WHERE company_id IN (:companyIds)`, { replacements, transaction });
    }
    if (present.some((row) => row.t === 'activity_logs')) {
      await sequelize.query('DELETE FROM activity_logs WHERE user_id IN (:userIds)', { replacements: { userIds }, transaction });
    }
    await sequelize.query('DELETE FROM companies WHERE id IN (:companyIds)', { replacements, transaction });
    await sequelize.query('DELETE FROM users WHERE id IN (:userIds)', { replacements: { userIds }, transaction });
    return { companies, users: userIds.length };
  });

  // The records are already gone; a file that cannot be removed must not undo that.
  const files = result.companies.flatMap((c) => [c.logo, c.signature, c.qr_code]).filter(Boolean);
  await Promise.allSettled(files.map((file) => removeCompanyAsset(file)));
  return { companies: result.companies.map((c) => c.name), users: result.users };
}

module.exports = { deleteUserAndOwnedCompanies, ownedCompanyIds };
