import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl:
    process.env.NEON_SSL_DISABLED === 'true'
      ? false
      : { rejectUnauthorized: false }
});

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

  if (!process.env.NEON_DATABASE_URL) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'NEON_DATABASE_URL tanımlı değil.' })
    };
  }

  try {
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

    const { rows } = await pool.query(sql, params);

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
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Beklenmeyen bir hata oluştu.' })
    };
  }
}
