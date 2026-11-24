'use strict';

/**
 * Speed: every list, dashboard figure and save filters by company (or by the parent record), but
 * those columns had no index, so each query read the whole table.
 *
 * Old `sync({ alter: true })` runs also added a new copy of each column-level unique constraint
 * on every start (users_email_key1 … key56). Each copy is another index every insert and update
 * has to write. Copies are dropped only when an identical constraint (same table, same columns)
 * stays, so nothing loses its uniqueness.
 */

// [table, columns]: names follow Sequelize's default (table_col1_col2) so model syncs match.
const INDEXES = [
  ['invoices', ['company_id', 'invoice_date']],
  ['invoices', ['customer_id']],
  ['invoice_items', ['invoice_id']],
  ['invoice_items', ['product_id']],
  ['payments', ['company_id', 'payment_date']],
  ['payments', ['invoice_id']],
  ['payments', ['customer_id']],
  ['customers', ['company_id']],
  ['products', ['company_id']],
  ['suppliers', ['company_id']],
  ['purchases', ['company_id', 'bill_date']],
  ['purchase_items', ['purchase_id']],
  ['expenses', ['company_id', 'date']],
  ['quotations', ['company_id']],
  ['quotationitems', ['quotation_id']],
  ['creditnotes', ['company_id']],
  ['stockmovements', ['company_id']],
  ['stockmovements', ['product_id']],
  ['usercompanies', ['user_id']],
  ['usercompanies', ['company_id']],
];

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;
    // A new database gets its tables from the model sync after this runs: nothing to do yet.
    const tables = (await queryInterface.showAllTables()).map((t) => (typeof t === 'string' ? t : t.tableName));

    for (const [table, columns] of INDEXES) {
      if (!tables.includes(table)) continue;
      const described = await queryInterface.describeTable(table);
      if (!columns.every((c) => described[c])) continue;
      const name = `${table}_${columns.join('_')}`;
      await sequelize.query(`CREATE INDEX IF NOT EXISTS "${name}" ON "${table}" (${columns.map((c) => `"${c}"`).join(', ')})`);
    }

    // Duplicate unique constraints: same table and columns; keep the plain-named one (or the first).
    const [dupes] = await sequelize.query(`
      SELECT conrelid::regclass::text AS tbl, conname
      FROM (
        SELECT conrelid, conname,
               row_number() OVER (PARTITION BY conrelid, conkey
                                  ORDER BY (conname ~ '_key[0-9]+$'), length(conname), conname) AS rn
        FROM pg_constraint
        WHERE contype = 'u' AND connamespace = 'public'::regnamespace
      ) ranked
      WHERE rn > 1`);
    for (const { tbl, conname } of dupes) {
      // A foreign key built on this exact index makes the drop fail: keep that one.
      try {
        await sequelize.query(`ALTER TABLE ${tbl} DROP CONSTRAINT "${conname.replace(/"/g, '""')}"`);
      } catch (error) {
        console.warn(`Kept duplicate constraint ${conname}: ${error.message}`);
      }
    }
  },

  async down(queryInterface) {
    for (const [table, columns] of INDEXES) {
      await queryInterface.sequelize.query(`DROP INDEX IF EXISTS "${table}_${columns.join('_')}"`);
    }
  }
};
