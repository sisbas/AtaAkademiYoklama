const db = require('../db');
const {
  ValidationError,
  NetworkError,
  InternalError
} = require('../utils/errors');
const { createLogger } = require('../utils/logger');

const logger = createLogger('services:attendance');

const CLASS_DEFINITIONS = [
  { id: 'tyt-sinifi', name: 'TYT Sınıfı' },
  { id: '9-sinif', name: '9. Sınıf' },
  { id: '10-sinif', name: '10. Sınıf' },
  { id: '11-say-1', name: '11 Say 1' },
  { id: '11-say-2', name: '11 Say 2' },
  { id: '11-ea-1', name: '11 Ea 1' },
  { id: '11-ea-2', name: '11 Ea 2' },
  { id: '12-say-1', name: '12 Say 1' },
  { id: '12-say-2', name: '12 Say 2' },
  { id: '12-say-3', name: '12 Say 3' },
  { id: '12-ea-1', name: '12 Ea 1' },
  { id: '12-ea-2', name: '12 Ea 2' },
  { id: '12-ea-3', name: '12 Ea 3' },
  { id: 'mezun-ea-1', name: 'Mezun Ea 1' },
  { id: 'mezun-ea-2', name: 'Mezun Ea 2' },
  { id: 'mezun-ea-3', name: 'Mezun Ea 3' },
  { id: 'mezun-say-1', name: 'Mezun Say 1' },
  { id: 'mezun-say-2', name: 'Mezun Say 2' },
  { id: 'mezun-say-3', name: 'Mezun Say 3' }
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

const CLASS_LOOKUP = new Map(CLASS_DEFINITIONS.map(cls => [cls.id, cls]));

const VALID_STATUSES = ['geldi', 'gelmedi', 'mazeretli', 'izinli'];

const fallbackStudents = CLASS_DEFINITIONS.flatMap((classDef, classIndex) =>
  Array.from({ length: 5 }, (_, idx) => ({
    id: `${classIndex * 100 + idx + 1}`,
    name: `${classDef.name} Öğrenci ${idx + 1}`,
    classId: classDef.id,
    className: classDef.name,
    class: classDef.name
  }))
);

const fallbackAttendance = new Map();

let fallbackActive = !db.hasDatabase;
const fallbackRetryValue = Number.parseInt(
  process.env.FALLBACK_RETRY_INTERVAL_MS ?? '5000',
  10
);
const FALLBACK_RETRY_INTERVAL_MS = Number.isFinite(fallbackRetryValue)
  ? Math.max(fallbackRetryValue, 1000)
  : 5000;
let lastFallbackAttempt = 0;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function resolveClassDefinition(identifier) {
  if (!identifier) {
    return null;
  }

  const trimmed = `${identifier}`.trim();
  if (!trimmed) {
    return null;
  }

  if (CLASS_LOOKUP.has(trimmed)) {
    return CLASS_LOOKUP.get(trimmed);
  }

  const lower = trimmed.toLowerCase();
  return CLASS_DEFINITIONS.find(cls => cls.name.toLowerCase() === lower) || null;
}

function requireClassDefinition(identifier) {
  const definition = resolveClassDefinition(identifier);

  if (!definition) {
    throw new ValidationError('Geçersiz sınıf kimliği.', {
      details: { classId: identifier }
    });
  }

  if (definition.id !== identifier) {
    logger.warn('Sınıf adı parametresi kullanıldı, kimlik ile çağrı yapılması önerilir.', {
      provided: identifier,
      resolvedId: definition.id
    });
  }

  return definition;
}

function normaliseIsoDate(date) {
  if (!date || typeof date !== 'string') {
    throw new ValidationError('Geçersiz tarih formatı.', {
      details: { date }
    });
  }

  const trimmed = date.trim();

  if (!ISO_DATE_REGEX.test(trimmed)) {
    throw new ValidationError('Tarih formatı YYYY-AA-GG olmalıdır.', {
      details: { date }
    });
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError('Geçersiz tarih değeri.', {
      details: { date }
    });
  }

  return trimmed;
}

function buildClassInfo(definition) {
  if (!definition) {
    return null;
  }

  const rule = SCHEDULE_RULES.find(({ test }) => test(definition.name));
  const schedule = rule ? rule.schedule : null;
  const notes = rule ? rule.notes : DEFAULT_SCHEDULE_NOTE;
  const weeklyTotal = schedule
    ? Object.values(schedule).reduce((total, count) => total + Number(count || 0), 0)
    : 0;

  return {
    id: definition.id,
    name: definition.name,
    schedule,
    notes,
    weeklyTotal
  };
}

function getFallbackKey(studentId, date) {
  return `${studentId}::${date}`;
}

function ensureFallbackNotice() {
  if (fallbackActive && !ensureFallbackNotice.notified) {
    logger.warn('Veritabanına ulaşılamadığı için yoklama verileri bellek üzerinde tutuluyor.');
    ensureFallbackNotice.notified = true;
  }
}

ensureFallbackNotice.notified = false;

function resetFallbackNotice() {
  ensureFallbackNotice.notified = false;
}

function markFallbackAttempt() {
  lastFallbackAttempt = Date.now();
}

function shouldAttemptDatabase() {
  if (!db.hasDatabase) {
    return false;
  }

  if (!fallbackActive) {
    return true;
  }

  return Date.now() - lastFallbackAttempt >= FALLBACK_RETRY_INTERVAL_MS;
}

function deactivateFallback() {
  fallbackActive = false;
  lastFallbackAttempt = 0;
  fallbackAttendance.clear();
  resetFallbackNotice();
  logger.info('Veritabanı bağlantısı yeniden sağlandı; geçici hafıza devre dışı bırakıldı.');
}

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
  markFallbackAttempt();
  ensureFallbackNotice();
  if (error) {
    logger.warn('Veritabanı bağlantısı hatası nedeniyle geçici hafıza moduna geçildi.', {
      error: {
        message: error.message,
        code: error.code
      }
    });
  } else {
    logger.warn('Veritabanı bağlantısı hatası nedeniyle geçici hafıza moduna geçildi.');
  }
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

function getClassInfo(identifier) {
  return buildClassInfo(resolveClassDefinition(identifier));
}

function getClasses() {
  return CLASS_DEFINITIONS.map(buildClassInfo);
}

async function fetchStudentsFromDatabase(classDefinition, date) {
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

  const { rows } = await db.query(query, [date, classDefinition.name]);
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    class: row.class || classDefinition.name,
    classId: classDefinition.id,
    className: classDefinition.name,
    status: row.status || ''
  }));
}

function wrapDatabaseError(error, message) {
  if (isConnectionIssue(error)) {
    return new NetworkError(message || 'Veritabanı bağlantısı sağlanamadı.', { cause: error });
  }

  return new InternalError(message || 'Veritabanı işlemi sırasında hata oluştu.', { cause: error });
}

async function attemptDatabaseOperation(operation, message, options = {}) {
  const { allowFallbackOnError = false } = options;
  try {
    const result = await operation();

    if (fallbackActive) {
      deactivateFallback();
    }

    return result;
  } catch (error) {
    if (allowFallbackOnError || isRecoverableDatabaseIssue(error)) {
      if (!fallbackActive) {
        activateFallback(error);
      } else {
        logger.warn('Veritabanı işlemi hatası nedeniyle geçici hafıza kullanılacak.', {
          error: {
            message: error?.message,
            code: error?.code
          },
          operation: message
        });
      }
      return null;
    }

    throw wrapDatabaseError(error, message);
  }
}

async function getStudentsWithAttendance(classIdentifier, date) {
  if (!classIdentifier || !date) {
    throw new ValidationError('Sınıf ve tarih bilgileri zorunludur.', {
      details: { classId: classIdentifier, date }
    });
  }

  const classDefinition = requireClassDefinition(classIdentifier);
  const normalisedDate = normaliseIsoDate(date);

  logger.debug('Yoklama sorgusu alındı.', {
    classId: classDefinition.id,
    className: classDefinition.name,
    date: normalisedDate,
    fallbackActive
  });

  if (shouldAttemptDatabase()) {
    const students = await attemptDatabaseOperation(
      () => fetchStudentsFromDatabase(classDefinition, normalisedDate),
      'Öğrenci listesi alınırken hata oluştu.',
      { allowFallbackOnError: true }
    );

    if (students) {
      return students;
    }
  }

  ensureFallbackNotice();

  return fallbackStudents
    .filter(student => student.classId === classDefinition.id)
    .map(student => {
      const key = getFallbackKey(student.id, normalisedDate);
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
  const normalisedDate = normaliseIsoDate(date);

  logger.debug('Yoklama kaydetme isteği alındı.', {
    studentId: normalizedId,
    date: normalisedDate,
    status
  });

  if (shouldAttemptDatabase()) {
    const dbResult = await attemptDatabaseOperation(async () => {
      const existing = await db.query(
        'SELECT id, status FROM attendance WHERE student_id = $1 AND date = $2',
        [normalizedId, normalisedDate]
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
          [status, normalizedId, normalisedDate]
        );

        return {
          operation: 'updated',
          message: 'Yoklama güncellendi.'
        };
      }

      await db.query(
        'INSERT INTO attendance (student_id, date, status) VALUES ($1, $2, $3)',
        [normalizedId, normalisedDate, status]
      );

      return {
        operation: 'created',
        message: 'Yoklama kaydedildi.'
      };
    }, 'Yoklama kaydedilirken hata oluştu.', { allowFallbackOnError: true });

    if (dbResult) {
      return dbResult;
    }
  }

  ensureFallbackNotice();

  const fallbackKey = getFallbackKey(normalizedId, normalisedDate);
  const previous = fallbackAttendance.get(fallbackKey);
  fallbackAttendance.set(fallbackKey, status);

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
  const normalisedDate = normaliseIsoDate(date);

  logger.debug('Yoklama silme isteği alındı.', {
    studentId: normalizedId,
    date: normalisedDate
  });

  if (shouldAttemptDatabase()) {
    const dbResult = await attemptDatabaseOperation(async () => {
      await db.query(
        'DELETE FROM attendance WHERE student_id = $1 AND date = $2',
        [normalizedId, normalisedDate]
      );

      return {
        success: true,
        message: 'Yoklama silindi.'
      };
    }, 'Yoklama silinirken hata oluştu.', { allowFallbackOnError: true });

    if (dbResult) {
      return dbResult;
    }
  }

  ensureFallbackNotice();

  const fallbackKey = getFallbackKey(normalizedId, normalisedDate);
  const existed = fallbackAttendance.delete(fallbackKey);

  return {
    success: existed,
    message: existed
      ? 'Yoklama silindi (geçici hafıza).'
      : 'Kayıt bulunamadı (geçici hafıza).'
  };
}

module.exports = {
  CLASS_DEFINITIONS,
  VALID_STATUSES,
  getClassInfo,
  getClasses,
  getStudentsWithAttendance,
  saveAttendance,
  deleteAttendance
};
