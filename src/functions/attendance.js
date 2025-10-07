const {
  VALID_STATUSES,
  getClassInfo,
  getStudentsWithAttendance,
  saveAttendance,
  deleteAttendance
} = require('../services/attendanceService');
const {
  ValidationError,
  toAppError,
  logError,
  buildErrorResponse
} = require('../utils/errors');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Surrogate-Control': 'no-store',
  'Expires': '0'
};

function parseJsonBody(body) {
  if (!body) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    throw new ValidationError('Gönderilen JSON gövdesi çözümlenemedi.', {
      cause: error,
      details: { body }
    });
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const requestContext = {
    method: event.httpMethod,
    path: event.path,
    requestId: event.requestContext?.requestId
  };

  try {
    if (event.httpMethod === 'GET') {
      const { class: className, date } = event.queryStringParameters || {};

      if (!className || !date) {
        throw new ValidationError('Sınıf ve tarih zorunludur.', {
          details: { className, date }
        });
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
      const body = parseJsonBody(event.body);
      const { studentId, date, status } = body;

      if (!studentId || !date || !status) {
        throw new ValidationError('Öğrenci, tarih ve durum bilgileri zorunludur.', {
          details: { studentId, date, status }
        });
      }

      if (!VALID_STATUSES.includes(status)) {
        throw new ValidationError('Geçersiz yoklama durumu.', {
          details: { status }
        });
      }

      const result = await saveAttendance(studentId, date, status);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, ...result })
      };
    }

    if (event.httpMethod === 'DELETE') {
      const body = parseJsonBody(event.body);
      const { studentId, date } = body;

      if (!studentId || !date) {
        throw new ValidationError('Öğrenci ve tarih bilgileri zorunludur.', {
          details: { studentId, date }
        });
      }

      const result = await deleteAttendance(studentId, date);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, ...result })
      };
    }

    throw new ValidationError('İstek yöntemi desteklenmiyor.', {
      statusCode: 405,
      details: { method: event.httpMethod },
      publicMessage: 'İstek yöntemi desteklenmiyor.'
    });
  } catch (error) {
    const appError = toAppError(error);
    logError(appError, { ...requestContext, scope: 'attendance.handler' });

    return buildErrorResponse(appError, headers, {
      requestId: requestContext.requestId
    });
  }
};
