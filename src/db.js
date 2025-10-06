// src/db.js
require('dotenv').config();
const { Pool } = require('pg');

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.PG_CONNECTION_STRING ||
  process.env.POSTGRES_URL;

const hasDatabase = Boolean(databaseUrl);

let pool;
if (hasDatabase) {
  const poolConfig = {
    connectionString: databaseUrl
  };

  const shouldUseSSL = process.env.DATABASE_SSL !== 'false';
  if (shouldUseSSL) {
    poolConfig.ssl = {
      rejectUnauthorized: false
    };
  }

  pool = new Pool(poolConfig);
}

let initPromise;
let studentSchemaPromise;

async function ensureDatabase() {
  if (!hasDatabase) {
    return;
  }

  if (!initPromise) {
    initPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS attendance (
          id SERIAL PRIMARY KEY,
          student_id TEXT NOT NULL,
          date DATE NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('geldi', 'gelmedi', 'mazeretli', 'izinli')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT unique_attendance UNIQUE (student_id, date)
        )
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS attendance_date_idx ON attendance(date)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS attendance_student_idx ON attendance(student_id)
      `);
    })().catch(error => {
      initPromise = undefined;
      throw error;
    });
  }

  return initPromise;
}

async function getStudentSchema() {
  if (!hasDatabase) {
    return null;
  }

  if (!studentSchemaPromise) {
    studentSchemaPromise = (async () => {
      await ensureDatabase();

      const { rows } = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'students'
      `);

      const columns = rows.map(row => row.column_name.toLowerCase());

      const idColumn =
        (columns.includes('id') && 'id') ||
        (columns.includes('student_id') && 'student_id');

      if (!idColumn) {
        throw new Error('Students tablosunda birincil anahtar kolonu bulunamadı.');
      }

      const nameColumn =
        (columns.includes('name') && 'name') ||
        (columns.includes('full_name') && 'full_name') ||
        (columns.includes('student_name') && 'student_name') ||
        (columns.includes('adsoyad') && 'adsoyad');

      if (!nameColumn) {
        throw new Error('Students tablosunda öğrenci adı için uygun bir kolon bulunamadı.');
      }

      const classColumn =
        (columns.includes('class') && 'class') ||
        (columns.includes('class_name') && 'class_name') ||
        (columns.includes('sinif') && 'sinif') ||
        (columns.includes('group_name') && 'group_name');

      if (!classColumn) {
        throw new Error('Students tablosunda sınıf kolonu bulunamadı.');
      }

      return {
        idColumn,
        nameColumn,
        classColumn,
        orderColumn: nameColumn
      };
    })().catch(error => {
      studentSchemaPromise = undefined;
      throw error;
    });
  }

  return studentSchemaPromise;
}

module.exports = {
  hasDatabase,
  ensureDatabase,
  getStudentSchema,
  query: async (text, params) => {
    if (!hasDatabase) {
      throw new Error('DATABASE_URL ayarlanmadığı için veritabanına bağlanılamıyor.');
    }

    await ensureDatabase();
    return pool.query(text, params);
  }
};
