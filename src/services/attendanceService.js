const db = require('../db');
const {
  ValidationError,
  NetworkError,
  InternalError
} = require('../utils/errors');

const CLASS_LIST = [
  'TYT Sınıfı',
  '9. Sınıf',
  '10. Sınıf',
  '11 Say 1',
  '11 Say 2',
  '11 Ea 1',
  '11 Ea 2',
  '12 Say 1',
  '12 Say 2',
  '12 Say 3',
  '12 Ea 1',
  '12 Ea 2',
  '12 Ea 3',
  'Mezun Ea 1',
  'Mezun Ea 2',
  'Mezun Ea 3',
  'Mezun Say 1',
  'Mezun Say 2',
  'Mezun Say 3'
];

const SCHEDULE_RULES = [
  {
    test: name => name.toLowerCase().includes('mezun'),
    schedule: {
      Pazartesi: 6,
      Salı: 6,
      Perşembe: 6,
      Cuma: 6
    },
    notes: 'Mezun grupları hafta içi dört gün boyunca altışar ders yapar.'
  },
  {
    test: name => name.startsWith('12'),
    schedule: {
      Salı: 4,
      Perşembe: 4,
      Cumartesi: 6,
      Pazar: 6
    },
    notes: '12. sınıflar hafta içi iki gün dört, hafta sonu iki gün altı ders yapar.'
  },
  {
    test: name => name.startsWith('10'),
    schedule: {
      Salı: 4,
      Perşembe: 4
    },
    notes: '10. sınıflar salı ve perşembe günleri dörder ders yapar.'
  },
  {
    test: name => name.startsWith('9'),
    schedule: {
      Cumartesi: 4,
      Pazar: 4
    },
    notes: '9. sınıflar hafta sonları dörder ders yapar.'
  },
  {
    test: name => name === 'TYT Sınıfı',
    schedule: {
      Cumartesi: 6,
      Pazar: 4
    },
    notes: 'TYT sınıfı hafta sonu cumartesi altı, pazar dört ders yapar.'
  }
];

const DEFAULT_SCHEDULE_NOTE = 'Ders programı henüz tanımlanmadı. Danışmanınızla iletişime geçebilirsiniz.';

const VALID_STATUSES = ['geldi', 'gelmedi', 'mazeretli', 'izinli'];

const fallbackStudents = CLASS_LIST.flatMap((className, classIndex) =>
  Array.from({ length: 5 }, (_, idx) => ({
    id: `${classIndex * 100 + idx + 1}`,
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

function isRecoverableDatabaseIssue(error) {
  if (isConnectionIssue(error)) {
    return true;
  }

  if (!error || !error.message) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('students tablosunda') ||
    message.includes('relation "students" does not exist') ||
    message.includes('relation "attendance" does not exist') ||
    message.includes('column') && message.includes('students') ||
    message.includes('student_schema_unavailable')
  );
}

function getClassInfo(name) {
  const rule = SCHEDULE_RULES.find(({ test }) => test(name));
  const schedule = rule ? rule.schedule : null;
  const notes = rule ? rule.notes : DEFAULT_SCHEDULE_NOTE;
  const weeklyTotal = schedule
    ? Object.values(schedule).reduce((total, count) => total + Number(count || 0), 0)
    : 0;

  return {
    name,
    schedule,
    notes,
    weeklyTotal
  };
}

function getClasses() {
  return CLASS_LIST.map(getClassInfo);
}

async function fetchStudentsFromDatabase(className, date) {
  const schema = await db.getStudentSchema();
  if (!schema) {
    throw new InternalError('Öğrenci şeması alınamadı.', {
      details: { reason: 'STUDENT_SCHEMA_UNAVAILABLE' }
    });
  }

  const { idColumn, nameColumn, classColumn, orderColumn } = schema;
  const query = `
    SELECT
      s.${idColumn}::text AS id,
      s.${nameColumn} AS name,
      s.${classColumn} AS class,
      COALESCE(a.status, '') AS status
    FROM students s
    LEFT JOIN attendance a
      ON s.${idColumn}::text = a.student_id AND a.date = $1
    WHERE s.${classColumn} = $2
    ORDER BY s.${orderColumn}
  `;

  const { rows } = await db.query(query, [date, className]);
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    class: row.class,
    status: row.status || ''
  }));
}

function wrapDatabaseError(error, message) {
  if (isConnectionIssue(error)) {
    return new NetworkError(message || 'Veritabanı bağlantısı sağlanamadı.', { cause: error });
  }

  return new InternalError(message || 'Veritabanı işlemi sırasında hata oluştu.', { cause: error });
}

async function getStudentsWithAttendance(className, date) {
  if (!className || !date) {
    throw new ValidationError('Sınıf ve tarih bilgileri zorunludur.', {
      details: { className, date }
    });
  }

  if (!fallbackActive) {
    try {
      const students = await fetchStudentsFromDatabase(className, date);
      return students;
    } catch (error) {
      if (isRecoverableDatabaseIssue(error)) {
        activateFallback(error);
      } else {
        throw wrapDatabaseError(error, 'Öğrenci listesi alınırken hata oluştu.');
      }
    }
  }

  ensureFallbackNotice();

  return fallbackStudents
    .filter(student => student.class === className)
    .map(student => {
      const key = getFallbackKey(student.id, date);
      const status = fallbackAttendance.get(key) || '';
      return {
        ...student,
        status
      };
    });
}

async function saveAttendance(studentId, date, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new ValidationError('Geçersiz yoklama durumu.', {
      details: { status }
    });
  }

  const normalizedId = `${studentId}`;

  if (!fallbackActive) {
    try {
      const existing = await db.query(
        'SELECT id, status FROM attendance WHERE student_id = $1 AND date = $2',
        [normalizedId, date]
      );

      if (existing.rows.length > 0) {
        const current = existing.rows[0];
        if (current.status === status) {
          return {
            operation: 'unchanged',
            message: 'Yoklama zaten bu durum ile kayıtlı.'
          };
        }

        await db.query(
          'UPDATE attendance SET status = $1, updated_at = NOW() WHERE student_id = $2 AND date = $3',
          [status, normalizedId, date]
        );

        return {
          operation: 'updated',
          message: 'Yoklama güncellendi.'
        };
      }

      await db.query(
        'INSERT INTO attendance (student_id, date, status) VALUES ($1, $2, $3)',
        [normalizedId, date, status]
      );

      return {
        operation: 'created',
        message: 'Yoklama kaydedildi.'
      };
    } catch (error) {
      if (isRecoverableDatabaseIssue(error)) {
        activateFallback(error);
      } else {
        throw wrapDatabaseError(error, 'Yoklama kaydedilirken hata oluştu.');
      }
    }
  }

  ensureFallbackNotice();

  const key = getFallbackKey(normalizedId, date);
  const previous = fallbackAttendance.get(key);
  fallbackAttendance.set(key, status);

  if (previous === status) {
    return {
      operation: 'unchanged',
      message: 'Yoklama zaten bu durum ile kayıtlı (geçici hafıza).'
    };
  }

  return {
    operation: previous ? 'updated' : 'created',
    message: previous
      ? 'Yoklama güncellendi (geçici hafıza).'
      : 'Yoklama kaydedildi (geçici hafıza).'
  };
}

async function deleteAttendance(studentId, date) {
  const normalizedId = `${studentId}`;

  if (!fallbackActive) {
    try {
      await db.query(
        'DELETE FROM attendance WHERE student_id = $1 AND date = $2',
        [normalizedId, date]
      );

      return {
        success: true,
        message: 'Yoklama silindi.'
      };
    } catch (error) {
      if (isRecoverableDatabaseIssue(error)) {
        activateFallback(error);
      } else {
        throw wrapDatabaseError(error, 'Yoklama silinirken hata oluştu.');
      }
    }
  }

  ensureFallbackNotice();

  const key = getFallbackKey(normalizedId, date);
  const existed = fallbackAttendance.delete(key);

  return {
    success: existed,
    message: existed
      ? 'Yoklama silindi (geçici hafıza).'
      : 'Kayıt bulunamadı (geçici hafıza).'
  };
}

module.exports = {
  CLASS_LIST,
  VALID_STATUSES,
  getClassInfo,
  getClasses,
  getStudentsWithAttendance,
  saveAttendance,
  deleteAttendance
};
