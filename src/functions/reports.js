const db = require('../db');
const { getClasses } = require('../services/attendanceService');
const {
  ValidationError,
  InternalError,
  toAppError,
  logError,
  buildErrorResponse
} = require('../utils/errors');
const { createLogger } = require('../utils/logger');

const logger = createLogger('functions:reports');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Surrogate-Control': 'no-store',
  'Expires': '0'
};

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const STATUS_MAP = new Map([
  ['geldi', 'present'],
  ['gelmedi', 'absent'],
  ['mazeretli', 'excused'],
  ['izinli', 'permitted']
]);

function normaliseIsoDate(value, field) {
  if (!value || typeof value !== 'string' || !ISO_DATE_REGEX.test(value)) {
    throw new ValidationError(`${field} değeri geçerli bir tarih (YYYY-AA-GG) olmalıdır.`, {
      details: { field, value }
    });
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`${field} değeri geçerli bir tarih olmalıdır.`, {
      details: { field, value }
    });
  }

  return value;
}

function findClassDefinition(identifier, classes) {
  if (!identifier) {
    return null;
  }

  const trimmed = `${identifier}`.trim();
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();
  return (
    classes.find(cls => cls.id === trimmed) ||
    classes.find(cls => cls.name.toLowerCase() === lower)
  ) || null;
}

async function fetchAttendanceRows(startDate, endDate, classFilter) {
  try {
    const schema = await db.getStudentSchema();
    if (!schema) {
      throw new InternalError('Öğrenci şeması alınamadı.', {
        details: { reason: 'STUDENT_SCHEMA_UNAVAILABLE' }
      });
    }

    const { idColumn, nameColumn, classColumn } = schema;
    const params = [startDate, endDate];
    let paramIndex = params.length + 1;
    const filters = [];

    if (classFilter) {
      const conditions = [
        `cg.code = $${paramIndex}`,
        `cg.id::text = $${paramIndex}`,
        `LOWER(cg.name) = LOWER($${paramIndex + 1})`
      ];
      if (classColumn) {
        conditions.push(`s.${classColumn} = $${paramIndex}`);
        conditions.push(`LOWER(s.${classColumn}) = LOWER($${paramIndex + 1})`);
      }
      filters.push(`(${conditions.join(' OR ')})`);
      params.push(classFilter.id, classFilter.name);
      paramIndex += 2;
    }

    const whereClause = filters.length > 0 ? `AND ${filters.join(' AND ')}` : '';
    const classSelect = classColumn ? `, s.${classColumn} AS student_class` : '';

    const query = `
      SELECT
        a.student_id,
        a.date,
        a.status,
        cg.code AS class_code,
        cg.name AS class_name,
        s.${nameColumn} AS student_name
        ${classSelect}
      FROM attendance a
      LEFT JOIN students s
        ON s.${idColumn}::text = a.student_id
      LEFT JOIN enrollments e
        ON e.student_id::text = s.${idColumn}::text
        AND (e.status IS NULL OR e.status = 'active')
      LEFT JOIN class_groups cg
        ON cg.id::text = e.class_group_id::text
      WHERE a.date BETWEEN $1 AND $2
        ${whereClause}
    `;

    const { rows } = await db.query(query, params);
    return rows;
  } catch (error) {
    logger.error('Rapor verileri veritabanından alınırken hata oluştu.', {
      error: {
        message: error?.message,
        code: error?.code
      },
      startDate,
      endDate,
      classId: classFilter?.id || null
    });
    throw error;
  }
}

function buildSummary(rows, classFilter) {
  const totals = { present: 0, absent: 0, excused: 0, permitted: 0 };
  const classMap = new Map();
  const dateMap = new Map();
  const studentIds = new Set();
  const uniqueDates = new Set();

  rows.forEach(row => {
    const statusKey = STATUS_MAP.get((row.status || '').toLowerCase());
    if (statusKey) {
      totals[statusKey] += 1;
    }

    const resolvedClassId = row.class_code || (row.student_class ? String(row.student_class) : null) || classFilter?.id || null;
    const resolvedClassName = row.class_name || (row.student_class ? String(row.student_class) : null) || classFilter?.name || (resolvedClassId || 'Bilinmeyen Sınıf');
    const classKey = resolvedClassId || resolvedClassName;

    if (!classMap.has(classKey)) {
      classMap.set(classKey, {
        id: resolvedClassId,
        name: resolvedClassName,
        counts: { present: 0, absent: 0, excused: 0, permitted: 0, total: 0 }
      });
    }

    const classEntry = classMap.get(classKey);
    if (statusKey) {
      classEntry.counts[statusKey] += 1;
    }
    classEntry.counts.total += 1;

    const dateKey = row.date ? new Date(row.date).toISOString().split('T')[0] : null;
    if (dateKey) {
      uniqueDates.add(dateKey);
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          present: 0,
          absent: 0,
          excused: 0,
          permitted: 0,
          total: 0
        });
      }
      const dateEntry = dateMap.get(dateKey);
      if (statusKey) {
        dateEntry[statusKey] += 1;
      }
      dateEntry.total += 1;
    }

    if (row.student_id) {
      studentIds.add(row.student_id);
    }
  });

  const totalsByClass = Array.from(classMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  const totalsByDate = Array.from(dateMap.values()).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const recordedEntries = totals.present + totals.absent + totals.excused + totals.permitted;
  const attendanceRate = recordedEntries > 0 ? Number(((totals.present / recordedEntries) * 100).toFixed(2)) : 0;

  return {
    totals,
    totalsByClass,
    totalsByDate,
    metrics: {
      attendanceRate,
      recordedEntries,
      uniqueStudents: studentIds.size,
      uniqueDays: uniqueDates.size
    }
  };
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
    if (event.httpMethod !== 'GET') {
      throw new ValidationError('İstek yöntemi desteklenmiyor.', {
        statusCode: 405,
        details: { method: event.httpMethod },
        publicMessage: 'İstek yöntemi desteklenmiyor.'
      });
    }

    const params = event.queryStringParameters || {};
    const startDate = normaliseIsoDate(params.startDate || params.start || params.from, 'startDate');
    const endDate = normaliseIsoDate(params.endDate || params.end || params.to, 'endDate');

    if (startDate > endDate) {
      throw new ValidationError('Başlangıç tarihi bitiş tarihinden sonra olamaz.', {
        details: { startDate, endDate }
      });
    }

    const classes = getClasses();
    const classIdentifier = params.classId || params.class || null;
    let classFilter = null;

    if (classIdentifier) {
      const definition = findClassDefinition(classIdentifier, classes);
      if (!definition) {
        throw new ValidationError('Geçersiz sınıf kimliği.', {
          details: { classId: classIdentifier }
        });
      }
      classFilter = { id: definition.id, name: definition.name };
    }

    const type = (params.type || 'summary').toLowerCase();

    if (!db.hasDatabase) {
      const emptyTotals = { present: 0, absent: 0, excused: 0, permitted: 0 };
      const fallbackClasses = classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        counts: { ...emptyTotals, total: 0 }
      }));

      logger.info('Veritabanı bağlantısı bulunamadı, rapor isteği boş sonuçla döndürüldü.', {
        startDate,
        endDate,
        classId: classFilter?.id || null
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          range: { startDate, endDate },
          classFilter,
          type,
          totals: emptyTotals,
          totalsByClass: fallbackClasses,
          totalsByDate: [],
          metrics: {
            attendanceRate: 0,
            recordedEntries: 0,
            uniqueStudents: 0,
            uniqueDays: 0
          },
          fallback: true
        })
      };
    }

    const rows = await fetchAttendanceRows(startDate, endDate, classFilter);
    const summary = buildSummary(rows, classFilter);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        range: { startDate, endDate },
        classFilter,
        type,
        ...summary,
        generatedAt: new Date().toISOString()
      })
    };
  } catch (error) {
    const appError = toAppError(error);
    logError(appError, { ...requestContext, scope: 'reports.handler' });

    return buildErrorResponse(appError, headers, {
      requestId: requestContext.requestId
    });
  }
};
