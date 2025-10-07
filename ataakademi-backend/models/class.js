const pool = require('../config/database');

const createClassesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      schedule JSONB,
      weekly_total INTEGER DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await pool.query(query);
};

const upsertClass = async ({ id, name, schedule = null, weekly_total = 0, notes = null }) => {
  const query = `
    INSERT INTO classes (id, name, schedule, weekly_total, notes, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name,
          schedule = EXCLUDED.schedule,
          weekly_total = EXCLUDED.weekly_total,
          notes = EXCLUDED.notes,
          updated_at = NOW();
  `;

  await pool.query(query, [id, name, schedule, weekly_total, notes]);
};

const getAllClasses = async () => {
  const { rows } = await pool.query(
    'SELECT id, name, schedule, weekly_total, notes FROM classes ORDER BY name ASC'
  );
  return rows;
};

module.exports = {
  createClassesTable,
  upsertClass,
  getAllClasses,
};
