import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../public/data');
const INDEX_FILE = path.join(DATA_DIR, 'ogrenciler.index.json');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

let cachedData = null;
let lastLoaded = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function loadAllStudents() {
  const now = Date.now();
  if (cachedData && now - lastLoaded < CACHE_TTL_MS) {
    return cachedData;
  }

  const indexRaw = await fs.readFile(INDEX_FILE, 'utf8');
  const indexJson = JSON.parse(indexRaw);

  const pageUrls = Array.isArray(indexJson.sayfalar) ? indexJson.sayfalar : [];
  const pages = await Promise.all(
    pageUrls.map(async (page) => {
      if (!page?.url) return [];
      const filePath = path.join(DATA_DIR, path.basename(page.url));
      const pageRaw = await fs.readFile(filePath, 'utf8');
      try {
        const parsed = JSON.parse(pageRaw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        console.error('Page parse error:', page.url, err);
        return [];
      }
    })
  );

  const rows = pages.flat();
  cachedData = { rows, meta: indexJson._meta || {} };
  lastLoaded = now;
  return cachedData;
}

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

  try {
    const { rows, meta } = await loadAllStudents();
    const url = new URL(event.rawUrl);
    const qClass = url.searchParams.get('class');
    const qSection = url.searchParams.get('section');
    const hasEmail = url.searchParams.get('hasEmail') === 'true';
    const limit = Math.max(1, Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

    let filtered = rows.slice();
    if (qClass) {
      filtered = filtered.filter(
        (row) => (row.sinif ?? '').toString().toLowerCase() === qClass.toLowerCase()
      );
    }

    if (qSection) {
      filtered = filtered.filter(
        (row) => (row.sube ?? '').toString().toLowerCase() === qSection.toLowerCase()
      );
    }

    if (hasEmail) {
      filtered = filtered.filter((row) =>
        Array.isArray(row.iletisim) &&
        row.iletisim.some(
          (contact) =>
            typeof contact?.alan === 'string' &&
            contact.alan.toLowerCase().includes('mail') &&
            typeof contact?.deger === 'string' &&
            contact.deger.trim() !== ''
        )
      );
    }

    const total = filtered.length;
    const page = filtered.slice(offset, offset + limit);
    const publicMode = process.env.PUBLIC_MODE === 'true';
    const rowsForResponse = publicMode ? maskForPublicMode(page) : page;

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
      },
      body: JSON.stringify(
        {
          total,
          limit,
          offset,
          meta,
          rows: rowsForResponse
        },
        null,
        2
      )
    };
  } catch (error) {
    console.error('students function error', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Beklenmeyen bir hata oluştu.' })
    };
  }
}
