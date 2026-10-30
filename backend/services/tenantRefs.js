// Ids sent by the client (product, godown, customer, supplier) must belong to the business the
// request is acting for; otherwise a user of one business could move another business's stock
// or balances just by sending its ids.
const MODELS = { product: 'Product', godown: 'Godown', customer: 'Customer', supplier: 'Supplier' };
const LABELS = { product: 'Product', godown: 'Godown', customer: 'Customer', supplier: 'Supplier' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class ForeignRefError extends Error {
  constructor(kind) {
    super(`${LABELS[kind]} not found`);
    this.status = 404;
  }
}

// refs: { product: id | id[], godown: ..., customer: ..., supplier: ... }. Empty values are skipped.
const assertOwnedByCompany = async (companyId, refs, transaction) => {
  const models = require('../models');
  for (const [kind, value] of Object.entries(refs)) {
    const ids = [...new Set([].concat(value).filter((id) => id !== undefined && id !== null && id !== ''))];
    if (!ids.length) continue;
    if (ids.some((id) => typeof id !== 'string' || !UUID.test(id))) throw new ForeignRefError(kind);
    const found = await models[MODELS[kind]].count({ where: { id: ids, company_id: companyId }, transaction });
    if (found !== ids.length) throw new ForeignRefError(kind);
  }
};

const itemProductIds = (items) => (Array.isArray(items) ? items.map((item) => item && item.product_id) : []);

module.exports = { assertOwnedByCompany, itemProductIds, ForeignRefError };
