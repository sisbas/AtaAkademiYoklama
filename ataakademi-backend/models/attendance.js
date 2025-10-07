const pool = require('../config/database');

const ALLOWED_STATUSES = ['geldi', 'gelmedi', 'mazeretli', 'izinli'];

const createAttendanceTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS attendance (
      id BIGSERIAL PRIMARY KEY,
      student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      status TEXT NOT NULL CHECK (status = ANY (ARRAY['geldi','gelmedi','mazeretli','izinli'])),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT unique_student_date UNIQUE (student_id, date)
    );
  `;

  await pool.query(query);
};

const getAttendanceByClassAndDate = async (classId, date) => {
  const query = `
    SELECT
      s.id AS student_id,
      s.name,
      s.student_number,
      a.status,
      a.date
    FROM students s
    LEFT JOIN attendance a
      ON a.student_id = s.id AND a.date = $2
    WHERE s.class_id = $1
    ORDER BY s.name ASC;
  `;

  const { rows } = await pool.query(query, [classId, date]);
  return rows.map((row) => ({
    studentId: row.student_id,
    name: row.name,
    studentNumber: row.student_number,
    status: row.status,
    date: row.date,
  }));
};

const upsertAttendance = async ({ studentId, date, status }) => {
  if (!ALLOWED_STATUSES.includes(status)) {
    const error = new Error('Geçersiz yoklama durumu');
    error.status = 400;
    throw error;
  }

  const query = `
    INSERT INTO attendance (student_id, date, status, created_at, updated_at)
    VALUES ($1, $2, $3, NOW(), NOW())
    ON CONFLICT (student_id, date)
    DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
    RETURNING id, student_id, date, status;
  `;

  const { rows } = await pool.query(query, [studentId, date, status]);
  const record = rows[0];
  return {
    id: record.id,
    studentId: record.student_id,
    date: record.date,
    status: record.status,
  };
};

const getAttendanceSummary = async ({ classId, startDate, endDate }) => {
  const params = [];
  const whereClauses = [];

  if (classId) {
    params.push(classId);
    whereClauses.push(`s.class_id = $${params.length}`);
  }

  if (startDate) {
    params.push(startDate);
    whereClauses.push(`a.date >= $${params.length}`);
  }

  if (endDate) {
    params.push(endDate);
    whereClauses.push(`a.date <= $${params.length}`);
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const query = `
    SELECT
      s.class_id AS class_id,
      c.name AS class_name,
      a.date,
      a.status,
      COUNT(*)::INT AS count
    FROM attendance a
    INNER JOIN students s ON s.id = a.student_id
    INNER JOIN classes c ON c.id = s.class_id
    ${whereSql}
    GROUP BY s.class_id, c.name, a.date, a.status
    ORDER BY a.date DESC, c.name ASC, a.status ASC;
  `;

  const { rows } = await pool.query(query, params);

  return rows.map((row) => ({
    classId: row.class_id,
    className: row.class_name,
    date: row.date,
    status: row.status,
    count: row.count,
  }));
};

module.exports = {
  ALLOWED_STATUSES,
  createAttendanceTable,
  getAttendanceByClassAndDate,
  upsertAttendance,
  getAttendanceSummary,
};
