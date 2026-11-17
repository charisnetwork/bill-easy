const { Company } = require('../models');

// A business without GST registration cannot collect GST: it issues a Bill of Supply
// with every line at 0%, whatever rate the browser sends.
async function sellerChargesGst(companyId, transaction) {
  const company = await Company.findByPk(companyId, { attributes: ['gst_registered', 'gst_number'], transaction });
  return Boolean(company && (company.gst_registered || company.gst_number));
}

function withoutGst(items) {
  return (items || []).map((item) => ({ ...item, tax_rate: 0, tax_amount: 0 }));
}

module.exports = { sellerChargesGst, withoutGst };
