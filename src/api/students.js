const DEFAULT_API_URL = '/.netlify/functions/students-db';
const PAGE_SIZE = 200;

const resolveBaseUrl = () => {
  const configured = import.meta.env.VITE_STUDENTS_API;
  if (configured) {
    return configured;
  }
  return DEFAULT_API_URL;
};

const ensureUrl = (base) => {
  if (base.startsWith('http://') || base.startsWith('https://')) {
    return new URL(base);
  }
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'http://localhost';
  return new URL(base, origin);
};

async function fetchStudentsPage({
  limit = PAGE_SIZE,
  offset = 0,
  classId,
  section,
  hasEmail,
  signal
} = {}) {
  const baseUrl = ensureUrl(resolveBaseUrl());
  const params = baseUrl.searchParams;
  params.set('limit', String(Math.max(1, Math.min(limit, PAGE_SIZE))));
  params.set('offset', String(Math.max(0, offset)));

  if (classId) {
    params.set('class', classId);
  }

  if (section) {
    params.set('section', section);
  }

  if (typeof hasEmail === 'boolean') {
    params.set('hasEmail', hasEmail ? 'true' : 'false');
  }

  const response = await fetch(baseUrl.toString(), {
    method: 'GET',
    signal
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let parsedBody = null;
    if (errorText) {
      try {
        parsedBody = JSON.parse(errorText);
      } catch (parseError) {
        // metin JSON değilse sessizce yoksay
      }
    }

    const error = new Error(
      parsedBody?.error
        ? `Öğrenci verileri alınamadı: ${parsedBody.error}`
        : `Öğrenci verileri alınamadı (HTTP ${response.status})`
    );
    error.status = response.status;
    error.payload = parsedBody;
    error.rawBody = errorText;
    throw error;
    throw new Error(
      `Öğrenci verileri alınamadı (HTTP ${response.status}): ${errorText}`
    );
  }

  const payload = await response.json();
  const total = typeof payload.total === 'number' ? payload.total : 0;
  const rows = Array.isArray(payload.rows) ? payload.rows : [];

  return { total, rows, limit: payload.limit, offset: payload.offset };
}

export async function fetchAllStudents({ signal, classId, section, hasEmail } = {}) {
  const allRows = [];
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const { rows, total: pageTotal } = await fetchStudentsPage({
      limit: PAGE_SIZE,
      offset,
      classId,
      section,
      hasEmail,
      signal
    });

    if (!Number.isFinite(total)) {
      if (Number.isFinite(pageTotal) && pageTotal > 0) {
        total = pageTotal;
      } else {
        total = offset + rows.length;
      }
    }

    allRows.push(...rows);

    if (rows.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return { rows: allRows, total: Number.isFinite(total) ? total : allRows.length };
}

export async function fetchStudentsWithFilters(options = {}) {
  return fetchAllStudents(options);
}

export { PAGE_SIZE };
