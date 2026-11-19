'use strict';

/** Links a quotation to the invoice it became, so it cannot be converted (and billed) twice. */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('quotations');
    if (!columns.converted_invoice_id) {
      await queryInterface.addColumn('quotations', 'converted_invoice_id', { type: Sequelize.UUID, allowNull: true });
    }
  },

  async down(queryInterface) {
    return queryInterface;
  }
};
