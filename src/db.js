// src/db.js
require('dotenv').config();
const { Pool } = require('pg');

const hasDatabase = Boolean(process.env.DATABASE_URL);

let pool;
if (hasDatabase) {
  const poolConfig = {
    connectionString: process.env.DATABASE_URL
  };

  // Production ortamlarında SSL gerekli olabilir. Yerel geliştirmede
  // "DATABASE_SSL=false" tanımlanarak devre dışı bırakılabilir.
  const shouldUseSSL = process.env.DATABASE_SSL !== 'false';
  if (shouldUseSSL) {
    poolConfig.ssl = {
      rejectUnauthorized: false // Neon ile uyumlu
    };
  }

  pool = new Pool(poolConfig);
}

let initPromise;

async function ensureSchema() {
  if (!hasDatabase) {
    return;
  }

  if (!initPromise) {
    initPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS students (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          class TEXT NOT NULL
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS attendance (
          id SERIAL PRIMARY KEY,
          student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          status TEXT NOT NULL,
          CONSTRAINT unique_attendance UNIQUE (student_id, date)
        )
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS attendance_date_idx ON attendance(date)
      `);
    })().catch(error => {
      initPromise = undefined;
      throw error;
    });
  }

  return initPromise;
}

module.exports = {
  hasDatabase,
  query: async (text, params) => {
    if (!hasDatabase) {
      throw new Error('DATABASE_URL ayarlanmadığı için veritabanına bağlanılamıyor.');
    }

    await ensureSchema();
    return pool.query(text, params);
  }
};
