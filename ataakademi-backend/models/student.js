const pool = require('../config/database');

const createStudentsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS students (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      student_number TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await pool.query(query);
};

const getStudentsByClass = async (classId) => {
  const { rows } = await pool.query(
    `SELECT id, name, student_number FROM students WHERE class_id = $1 ORDER BY name ASC`,
    [classId]
  );
  return rows;
};

const insertStudent = async ({ name, classId, studentNumber = null }) => {
  const query = `
    INSERT INTO students (name, class_id, student_number, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    RETURNING id, name, class_id AS "classId", student_number AS "studentNumber";
  `;

  const { rows } = await pool.query(query, [name, classId, studentNumber]);
  return rows[0];
};

const countStudentsInClass = async (classId) => {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::INT AS count FROM students WHERE class_id = $1',
    [classId]
  );
  return rows[0]?.count || 0;
};

module.exports = {
  createStudentsTable,
  getStudentsByClass,
  insertStudent,
  countStudentsInClass,
};
