const {
  VALID_STATUSES,
  getClassInfo,
  getStudentsWithAttendance,
  saveAttendance,
  deleteAttendance
} = require('../services/attendanceService');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
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
          body: JSON.stringify({ error: 'Sınıf ve tarih zorunludur.' })
        };
      }

      const students = await getStudentsWithAttendance(className, date);
      const recordedCount = students.filter(student => VALID_STATUSES.includes(student.status)).length;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          students,
          metadata: {
            className,
            date,
            total: students.length,
            recorded: recordedCount,
            hasAttendance: recordedCount > 0
          },
          classInfo: getClassInfo(className)
        })
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { studentId, date, status } = body;

      if (!studentId || !date || !status) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Öğrenci, tarih ve durum bilgileri zorunludur.' })
        };
      }

      if (!VALID_STATUSES.includes(status)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Geçersiz yoklama durumu.' })
        };
      }

      const result = await saveAttendance(studentId, date, status);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, ...result })
      };
    }

    if (event.httpMethod === 'DELETE') {
      const body = JSON.parse(event.body || '{}');
      const { studentId, date } = body;

      if (!studentId || !date) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Öğrenci ve tarih bilgileri zorunludur.' })
        };
      }

      const result = await deleteAttendance(studentId, date);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, ...result })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Attendance API error:', error);
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
