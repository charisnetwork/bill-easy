'use strict';

/** GST paid on an expense (from the supplier's tax invoice), counted as input tax credit. */
module.exports = {
  async up(queryInterface, Sequelize) {
    // A new database gets the table (with this column) from the model sync instead.
    const tables = (await queryInterface.showAllTables()).map((t) => (typeof t === 'string' ? t : t.tableName));
    if (!tables.includes('expenses')) return;
    const columns = await queryInterface.describeTable('expenses');
    if (!columns.gst_amount) {
      await queryInterface.addColumn('expenses', 'gst_amount', { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 });
    }
  },

  async down(queryInterface) {
    return queryInterface;
  }
};
