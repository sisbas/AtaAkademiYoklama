// src/functions/attendance.js
const db = require('../db');

const classes = [
  "TYT Sınıfı", "9. Sınıf", "10. Sınıf", "11 Say 1", "11 Say 2", "11 Ea 1", "11 Ea 2",
  "12 Say 1", "12 Say 2", "12 Say 3", "12 Ea 1", "12 Ea 2", "12 Ea 3",
  "Mezun Ea 1", "Mezun Ea 2", "Mezun Ea 3", "Mezun Say 1", "Mezun Say 2", "Mezun Say 3"
];

const fallbackStudents = classes.flatMap((className, classIndex) =>
  Array.from({ length: 5 }, (_, idx) => ({
    id: classIndex * 100 + idx + 1,
    name: `${className} Öğrenci ${idx + 1}`,
    class: className
  }))
);

const fallbackAttendance = new Map();

let fallbackActive = !db.hasDatabase;

function getFallbackKey(studentId, date) {
  return `${studentId}::${date}`;
}

function ensureFallbackNotice() {
  if (fallbackActive && !ensureFallbackNotice.notified) {
    console.warn('Veritabanına ulaşılamadığı için yoklama verileri bellek üzerinde tutuluyor.');
    ensureFallbackNotice.notified = true;
  }
}

ensureFallbackNotice.notified = false;

function isConnectionIssue(error) {
  const connectionErrorCodes = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'EAI_AGAIN', 'ENETUNREACH']);
  if (!error) {
    return false;
  }

  if (error.code && connectionErrorCodes.has(error.code)) {
    return true;
  }

  if (Array.isArray(error.errors) && error.errors.some(inner => connectionErrorCodes.has(inner.code))) {
    return true;
  }

  if (typeof error[Symbol.iterator] === 'function') {
    for (const inner of error) {
      if (inner && connectionErrorCodes.has(inner.code)) {
        return true;
      }
    }
  }

  const message = (error.message || '').toString();
  return [...connectionErrorCodes].some(code => message.includes(code));
}

function activateFallback(error) {
  fallbackActive = true;
  ensureFallbackNotice();
  console.warn('Veritabanı bağlantısı hatası nedeniyle geçici hafıza moduna geçildi.', error);
}

exports.handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      const { class: className, date } = event.queryStringParameters || {};
      
      if (!className || !date) {
        return { 
          statusCode: 400, 
          headers, 
          body: JSON.stringify({ error: 'Sınıf ve tarih zorunlu.' }) 
        };
      }

      if (!fallbackActive) {
        try {
          // Öğrenci listesi + yoklama durumu
          const students = await db.query(
            `SELECT s.id, s.name, s.class,
                    COALESCE(a.status, '') as status,
                    a.id as attendance_id
             FROM students s
             LEFT JOIN attendance a ON s.id = a.student_id AND a.date = $1
             WHERE s.class = $2
             ORDER BY s.name`,
            [date, className]
          );

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(students.rows)
          };
        } catch (error) {
          if (isConnectionIssue(error)) {
            activateFallback(error);
          } else {
            throw error;
          }
        }
      }

      ensureFallbackNotice();

      const students = fallbackStudents
        .filter(student => student.class === className)
        .map(student => {
          const key = getFallbackKey(student.id, date);
          const status = fallbackAttendance.get(key) || '';
          return {
            ...student,
            status,
            attendance_id: status ? key : null
          };
        });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(students)
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { studentId, date, status } = body;

      if (!studentId || !date || !status) {
        return { 
          statusCode: 400, 
          headers, 
          body: JSON.stringify({ error: 'Eksik veri.' }) 
        };
      }

      // Status kontrolü
      const validStatuses = ['geldi', 'gelmedi', 'mazeretli', 'izinli'];
      if (!validStatuses.includes(status)) {
        return { 
          statusCode: 400, 
          headers, 
          body: JSON.stringify({ error: 'Geçersiz durum.' }) 
        };
      }

      if (!fallbackActive) {
        try {
          // Mevcut kayıt kontrolü
          const existing = await db.query(
            'SELECT id FROM attendance WHERE student_id = $1 AND date = $2',
            [studentId, date]
          );

          if (existing.rows.length > 0) {
            // Güncelle
            await db.query(
              'UPDATE attendance SET status = $1 WHERE student_id = $2 AND date = $3',
              [status, studentId, date]
            );

            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ success: true, message: 'Yoklama güncellendi.' })
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
            body: JSON.stringify({ success: true, message: 'Yoklama kaydedildi.' })
          };
        } catch (error) {
          if (isConnectionIssue(error)) {
            activateFallback(error);
          } else {
            throw error;
          }
        }
      }

      ensureFallbackNotice();
      const key = getFallbackKey(studentId, date);
      fallbackAttendance.set(key, status);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Yoklama kaydedildi (geçici hafıza).' })
      };
    }

    if (event.httpMethod === 'DELETE') {
      const body = JSON.parse(event.body);
      const { studentId, date } = body;

      if (!studentId || !date) {
        return { 
          statusCode: 400, 
          headers, 
          body: JSON.stringify({ error: 'Eksik veri.' }) 
        };
      }

      if (!fallbackActive) {
        try {
          await db.query(
            'DELETE FROM attendance WHERE student_id = $1 AND date = $2',
            [studentId, date]
          );

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Yoklama silindi.' })
          };
        } catch (error) {
          if (isConnectionIssue(error)) {
            activateFallback(error);
          } else {
            throw error;
          }
        }
      }

      ensureFallbackNotice();
      const key = getFallbackKey(studentId, date);
      fallbackAttendance.delete(key);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Yoklama silindi (geçici hafıza).' })
      };
    }

    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };

  } catch (error) {
    console.error('DB Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Sunucu hatası', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      })
    };
  }
};
