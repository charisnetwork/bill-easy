'use strict';

/**
 * Staff & attendance: richer staff records, one attendance record per person per day, and the
 * company on each attendance row. Tables that do not exist yet are created by the model sync.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = (await queryInterface.showAllTables()).map((t) => (typeof t === 'string' ? t : t.tableName));
    const q = (sql) => queryInterface.sequelize.query(sql);

    if (tables.includes('staff')) {
      const columns = await queryInterface.describeTable('staff');
      const add = async (name, spec) => { if (!columns[name]) await queryInterface.addColumn('staff', name, spec); };
      await add('email', { type: Sequelize.STRING });
      await add('department', { type: Sequelize.STRING });
      await add('joining_date', { type: Sequelize.DATEONLY });
      await add('salary_type', { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'monthly' });
      await add('weekly_offs', { type: Sequelize.JSONB, allowNull: false, defaultValue: [0] });
      await add('user_id', { type: Sequelize.UUID });
      await add('notes', { type: Sequelize.TEXT });
      await add('deleted_at', { type: Sequelize.DATE });
    }

    if (tables.includes('staffattendance')) {
      const columns = await queryInterface.describeTable('staffattendance');
      const add = async (name, spec) => { if (!columns[name]) await queryInterface.addColumn('staffattendance', name, spec); };
      await add('company_id', { type: Sequelize.UUID });
      await add('check_in', { type: Sequelize.STRING(5) });
      await add('check_out', { type: Sequelize.STRING(5) });
      await add('overtime_hours', { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 });
      await add('marked_by', { type: Sequelize.UUID });
      // The old enum allowed only present/absent/late/half-day: keep the values, widen the column.
      if (/enum/i.test(columns.status?.type || '') || columns.status?.special?.length) {
        await q(`ALTER TABLE staffattendance ALTER COLUMN status DROP DEFAULT`);
        await q(`ALTER TABLE staffattendance ALTER COLUMN status TYPE VARCHAR(20) USING (CASE status::text WHEN 'half-day' THEN 'half_day' WHEN 'late' THEN 'present' ELSE status::text END)`);
        await q(`ALTER TABLE staffattendance ALTER COLUMN status SET DEFAULT 'present'`);
        await q(`DROP TYPE IF EXISTS "enum_staffattendance_status"`);
      }
      await q(`UPDATE staffattendance a SET company_id = s.company_id FROM staff s WHERE a.staff_id = s.id AND a.company_id IS NULL`);
      // One record per person per day: keep the latest if older data has duplicates.
      // Older databases name the timestamp updatedAt or updated_at; ctid breaks ties.
      const stamp = columns.updatedAt ? '"updatedAt"' : columns.updated_at ? 'updated_at' : null;
      const newer = stamp ? `(a.${stamp} < b.${stamp} OR (a.${stamp} IS NOT DISTINCT FROM b.${stamp} AND a.ctid < b.ctid))` : 'a.ctid < b.ctid';
      await q(`DELETE FROM staffattendance a USING staffattendance b
               WHERE a.staff_id = b.staff_id AND a.date = b.date AND ${newer}`);
      const [indexes] = await q(`SELECT indexname FROM pg_indexes WHERE tablename = 'staffattendance' AND indexname = 'staffattendance_staff_date_unique'`);
      if (!indexes.length) await q(`CREATE UNIQUE INDEX staffattendance_staff_date_unique ON staffattendance (staff_id, date)`);
    }
  },

  async down(queryInterface) {
    return queryInterface;
  }
};
