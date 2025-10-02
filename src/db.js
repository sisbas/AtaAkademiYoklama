// src/db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Neon ile uyumlu
  }
});

let initPromise;

async function ensureSchema() {
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
  query: async (text, params) => {
    await ensureSchema();
    return pool.query(text, params);
  }
};
