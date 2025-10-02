import { Pool } from 'pg';

const connectionDetails = resolveConnectionString();
const connectionString = connectionDetails.connectionString;

let pool;

const getPool = () => {
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl:
        process.env.NEON_SSL_DISABLED === 'true'
          ? false
          : { rejectUnauthorized: false }
    });
  }

  return pool;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function maskForPublicMode(records) {
  return records.map((record) => ({
    ad: record.ad ? `${record.ad[0] ?? ''}.` : '',
    soyad: record.soyad ? `${record.soyad[0] ?? ''}***` : '',
    sinif: record.sinif ?? null,
    sube: record.sube ?? null
  }));
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders };
  }

  if (!connectionString) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error:
          'Neon bağlantı adresi tanımlı değil. NEON_DATABASE_URL veya NETLIFY_DATABASE_URL ortam değişkenini ekleyin.'
      })
    };
  }

  try {
    const activePool = getPool();

    if (!activePool) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error:
            'Neon bağlantı adresi tanımlı değil. NEON_DATABASE_URL veya NETLIFY_DATABASE_URL ortam değişkenini ekleyin.'
        })
      };
    }

    const url = new URL(event.rawUrl);
    const qClass = url.searchParams.get('class');
    const qSection = url.searchParams.get('section');
    const hasEmail = url.searchParams.get('hasEmail') === 'true';
    const limit = Math.max(1, Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

    const conditions = [];
    const params = [];

    if (qClass) {
      params.push(qClass);
      conditions.push(`o.sinif = $${params.length}`);
    }

    if (qSection) {
      params.push(qSection.toLowerCase());
      conditions.push(`lower(o.sube) = $${params.length}`);
    }

    let sql = `
      SELECT
        o.id,
        o.ad,
        o.soyad,
        o.sinif,
        o.sube,
        COALESCE(
          json_agg(
            json_build_object('alan', c.alan, 'deger', c.deger)
            ORDER BY c.alan
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::json
        ) AS iletisim,
        COUNT(*) OVER() AS total_count
      FROM ogrenciler o
      LEFT JOIN ogrenci_iletisim c ON c.ogrenci_id = o.id
    `;

    if (conditions.length) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' GROUP BY o.id';

    if (hasEmail) {
      sql += ` HAVING BOOL_OR(c.alan ILIKE '%mail%' AND COALESCE(c.deger, '') <> '')`;
    }

    sql += ' ORDER BY o.sinif NULLS LAST, o.sube NULLS LAST, o.ad';

    params.push(limit);
    sql += ` LIMIT $${params.length}`;
    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const { rows } = await activePool.query(sql, params);

    const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
    const responseRows = rows.map(({ total_count, ...rest }) => rest);
    const publicMode = process.env.PUBLIC_MODE === 'true';
    const rowsForResponse = publicMode ? maskForPublicMode(responseRows) : responseRows;

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=30, s-maxage=120'
      },
      body: JSON.stringify(
        {
          total,
          limit,
          offset,
          rows: rowsForResponse
        },
        null,
        2
      )
    };
  } catch (error) {
    console.error('students-db function error', error);

    const friendlyMessage = describeDatabaseError(error, connectionDetails);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: friendlyMessage,
        code: typeof error?.code === 'string' ? error.code : undefined
      })
    };
  }
}

function describeDatabaseError(error, details = {}) {
  if (!error) {
    return 'Beklenmeyen bir hata oluştu.';
  }

  const lowerMessage = String(error?.message || '').toLowerCase();
  const code = typeof error?.code === 'string' ? error.code : '';
  const hostHint = details?.host ? ` (${details.host})` : '';

  if (code === 'ENOTFOUND' || lowerMessage.includes('getaddrinfo enotfound')) {
    return `Neon veritabanı adresi çözümlenemedi${hostHint}. DNS ayarlarınızı, bağlantı adresinizi ve Neon ana makine adını doğrulayın.`;
  }

  if (code === 'ENETUNREACH' || lowerMessage.includes('connect enetunreach')) {
    return 'Neon veritabanına bağlanılamadı (ENETUNREACH). Netlify çıkış IP adreslerini Neon güvenlik ayarlarına ekleyip tekrar deneyin.';
  }

  if (code === 'ECONNREFUSED' || lowerMessage.includes('connection refused')) {
    return 'Neon veritabanı bağlantısı reddedildi. Bağlantı dizesini ve veritabanı erişim izinlerini doğrulayın.';
  }

  if (code === 'ETIMEDOUT' || lowerMessage.includes('timed out')) {
    return 'Neon veritabanına bağlanma isteği zaman aşımına uğradı. Ağ bağlantınızı ve Neon bölge seçiminizi kontrol edin.';
  }

  if (code === '28000' || lowerMessage.includes('password authentication failed')) {
    return 'Neon veritabanı kimlik doğrulaması başarısız oldu. Kullanıcı adı ve şifreyi kontrol edin.';
  }

  if (code === '28P01') {
    return 'Neon veritabanı kimlik doğrulaması başarısız oldu. Kullanıcı adı ve şifreyi kontrol edin.';
  }

  if (code === '3D000') {
    return 'Belirtilen Neon veritabanı bulunamadı. Bağlantı dizesindeki veritabanı adını doğrulayın.';
  }

  return 'Öğrenci verileri alınırken beklenmeyen bir hata oluştu. Neon bağlantı ayarlarınızı kontrol edip tekrar deneyin.';
}

function resolveConnectionString() {
  const rawConnectionString =
    process.env.NEON_DATABASE_URL ||
    process.env.NETLIFY_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_CONNECTION_STRING ||
    process.env.PG_DATABASE_URL ||
    '';

  if (!rawConnectionString) {
    return { connectionString: '', host: null };
  }

  const overrideHost = process.env.NEON_HOST_OVERRIDE || process.env.NEON_PGHOST;
  const overridePort = process.env.NEON_PORT_OVERRIDE || process.env.NEON_PGPORT;

  try {
    const parsedUrl = new URL(rawConnectionString);
    const details = { connectionString: rawConnectionString, host: parsedUrl.hostname };

    let mutated = false;

    if (overrideHost && parsedUrl.hostname !== overrideHost) {
      parsedUrl.hostname = overrideHost;
      details.host = overrideHost;
      mutated = true;
    }

    if (overridePort) {
      parsedUrl.port = overridePort;
      mutated = true;
    }

    if (mutated) {
      details.connectionString = parsedUrl.toString();
    }

    return details;
  } catch (error) {
    console.warn('Neon connection string parse failed, using raw value.', error);
    return { connectionString: rawConnectionString, host: null };
  }
}
