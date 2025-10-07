require('dotenv').config();
const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');
const {
  VALID_STATUSES,
  getClasses,
  getClassInfo,
  getStudentsWithAttendance,
  saveAttendance,
  deleteAttendance
} = require('./services/attendanceService');
const { toAppError, logError } = require('./utils/errors');
const { createLogger } = require('./utils/logger');

const logger = createLogger('http');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const publicDir = path.join(__dirname, '..', 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Surrogate-Control': 'no-store',
    'Expires': '0'
  });
  res.end(body);
}

function handleOptions(res) {
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Surrogate-Control': 'no-store',
    'Expires': '0'
  });
  res.end();
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new Error('Geçersiz JSON gövdesi'));
      }
    });
    req.on('error', reject);
  });
}

async function handleApiRequest(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;
  const query = Object.fromEntries(parsedUrl.searchParams.entries());

  logger.debug('API isteği alındı.', {
    method: req.method,
    path: pathname,
    query
  });

  if (req.method === 'OPTIONS') {
    handleOptions(res);
    return true;
  }

  try {
    if (pathname === '/api/health' && req.method === 'GET') {
      sendJson(res, 200, { status: 'ok' });
      return true;
    }

    if (pathname === '/api/classes' && req.method === 'GET') {
      sendJson(res, 200, getClasses());
      return true;
    }

    if (pathname === '/api/attendance' && req.method === 'GET') {
      const classId = parsedUrl.searchParams.get('classId') || parsedUrl.searchParams.get('class');
      const date = parsedUrl.searchParams.get('date');

      if (!classId || !date) {
        sendJson(res, 400, { error: 'Sınıf ve tarih zorunludur.' });
        return true;
      }

      const students = await getStudentsWithAttendance(classId, date);
      const recordedCount = students.filter(student => VALID_STATUSES.includes(student.status)).length;
      const classInfo = getClassInfo(classId);

      sendJson(res, 200, {
        students,
        metadata: {
          classId: classInfo?.id || classId,
          className: classInfo?.name || students[0]?.className || classId,
          date,
          total: students.length,
          recorded: recordedCount,
          hasAttendance: recordedCount > 0
        },
        classInfo
      });
      return true;
    }

    if (pathname === '/api/attendance' && req.method === 'POST') {
      const body = await readRequestBody(req);
      const { studentId, date, status } = body;

      if (!studentId || !date || !status) {
        sendJson(res, 400, { error: 'Öğrenci, tarih ve durum bilgileri zorunludur.' });
        return true;
      }

      if (!VALID_STATUSES.includes(status)) {
        sendJson(res, 400, { error: 'Geçersiz yoklama durumu.' });
        return true;
      }

      const result = await saveAttendance(studentId, date, status);
      sendJson(res, 200, { success: true, ...result });
      return true;
    }

    if (pathname === '/api/attendance' && req.method === 'DELETE') {
      const body = await readRequestBody(req);
      const { studentId, date } = body;

      if (!studentId || !date) {
        sendJson(res, 400, { error: 'Öğrenci ve tarih bilgileri zorunludur.' });
        return true;
      }

      const result = await deleteAttendance(studentId, date);
      sendJson(res, 200, { success: true, ...result });
      return true;
    }
  } catch (error) {
    const appError = toAppError(error);
    logError(appError, {
      scope: 'server.handleApiRequest',
      method: req.method,
      path: pathname,
      query
    });

    const payload = {
      error: appError.publicMessage,
      category: appError.category
    };

    if (appError.category === 'ValidationError' && appError.details) {
      payload.details = appError.details;
    }

    if (process.env.NODE_ENV !== 'production') {
      payload.debug = {
        message: appError.message
      };
    }

    sendJson(res, appError.statusCode || 500, payload);
    return true;
  }

  return false;
}

function serveStaticFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // SPA fallback
        const indexPath = path.join(publicDir, 'index.html');
        fs.readFile(indexPath, (indexErr, indexContent) => {
          if (indexErr) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Sunucu hatası');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(indexContent);
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Sunucu hatası');
      }
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  if (parsedUrl.pathname.startsWith('/api/')) {
    const handled = await handleApiRequest(req, res, parsedUrl);
    if (handled) {
      return;
    }
    sendJson(res, 404, { error: 'Bulunamadı' });
    return;
  }

  let safePath = path.normalize(parsedUrl.pathname).replace(/^\/+/, '');
  if (safePath.endsWith('/')) {
    safePath += 'index.html';
  }

  const filePath = path.join(publicDir, safePath || 'index.html');
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Erişim reddedildi');
    return;
  }

  serveStaticFile(res, filePath);
});

server.listen(PORT, HOST, () => {
  logger.info('Ata Akademi yoklama sunucusu başlatıldı.', {
    host: HOST,
    port: Number(PORT)
  });
});
