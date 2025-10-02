// src/functions/attendance.js
const db = require('../db');

const classes = [
  "TYT Sınıfı", "9. Sınıf", "10. Sınıf", "11 Say 1", "11 Say 2", "11 Ea 1", "11 Ea 2",
  "12 Say 1", "12 Say 2", "12 Say 3", "12 Ea 1", "12 Ea 2", "12 Ea 3",
  "Mezun Ea 1", "Mezun Ea 2", "Mezun Ea 3", "Mezun Say 1", "Mezun Say 2", "Mezun Say 3"
];

exports.handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Öğrenci listesi + yoklama durumu döndür
      const { class: className, date } = event.queryStringParameters || {};
      if (!className || !date) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Sınıf ve tarih zorunlu.' }) };
      }

      const students = await db.query(
        `SELECT s.id, s.name, s.class, a.status 
         FROM students s 
         LEFT JOIN attendance a ON s.id = a.student_id AND a.date = $1
         WHERE s.class = $2`,
        [date, className]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(students.rows)
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { studentId, date, status } = body;

      if (!studentId || !date || !status) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Eksik veri.' }) };
      }

      // Mevcut kayıt kontrolü
      const existing = await db.query(
        'SELECT * FROM attendance WHERE student_id = $1 AND date = $2',
        [studentId, date]
      );

      if (existing.rows.length > 0) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'Bu öğrenci için bu tarihte zaten yoklama girilmiş.' })
        };
      }

      // Yeni kayıt ekle
      await db.query(
        'INSERT INTO attendance (student_id, date, status) VALUES ($1, $2, $3)',
        [studentId, date, status]
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    console.error('DB Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Sunucu hatası' })
    };
  }
};
