'use strict';

/** Adds locale fields without rewriting existing company data. */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('companies');
    if (!columns.country_code) {
      await queryInterface.addColumn('companies', 'country_code', {
        type: Sequelize.STRING(2), allowNull: false, defaultValue: 'IN'
      });
    }
    if (!columns.language) {
      await queryInterface.addColumn('companies', 'language', {
        type: Sequelize.STRING, allowNull: false, defaultValue: 'en-IN'
      });
    }
  },

  async down(queryInterface) {
    // Retain locale data on rollback; removal needs an explicit retention review.
    return queryInterface;
  }
};
