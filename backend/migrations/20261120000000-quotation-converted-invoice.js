'use strict';

/** Links a quotation to the invoice it became, so it cannot be converted (and billed) twice. */
module.exports = {
  async up(queryInterface, Sequelize) {
    // A new database gets the table (with this column) from the model sync instead.
    const tables = (await queryInterface.showAllTables()).map((t) => (typeof t === 'string' ? t : t.tableName));
    if (!tables.includes('quotations')) return;
    const columns = await queryInterface.describeTable('quotations');
    if (!columns.converted_invoice_id) {
      await queryInterface.addColumn('quotations', 'converted_invoice_id', { type: Sequelize.UUID, allowNull: true });
    }
  },

  async down(queryInterface) {
    return queryInterface;
  }
};
