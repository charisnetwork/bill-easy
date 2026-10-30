/** Things every business needs from the moment it exists. */
const { Godown } = require('../models');

/** "Main Store", the default godown stock goes in and out of, unless the business already has one. */
async function ensureDefaultGodown(company) {
  const existing = await Godown.findOne({ where: { company_id: company.id, is_default: true } });
  if (existing) return existing;
  return Godown.create({ company_id: company.id, name: 'Main Store', address: company.address || 'Main Office', is_default: true, is_active: true });
}

module.exports = { ensureDefaultGodown };
