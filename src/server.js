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
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function handleOptions(res) {
  res.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
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
      const className = parsedUrl.searchParams.get('class');
      const date = parsedUrl.searchParams.get('date');

      if (!className || !date) {
        sendJson(res, 400, { error: 'Sınıf ve tarih zorunludur.' });
        return true;
      }

      const students = await getStudentsWithAttendance(className, date);
      const recordedCount = students.filter(student => VALID_STATUSES.includes(student.status)).length;

      sendJson(res, 200, {
        students,
        metadata: {
          className,
          date,
          total: students.length,
          recorded: recordedCount,
          hasAttendance: recordedCount > 0
        },
        classInfo: getClassInfo(className)
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
    console.error('API hata:', error);
    sendJson(res, 500, {
      error: 'Sunucu hatası',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
  console.log(`Ata Akademi yoklama sunucusu ${HOST}:${PORT} üzerinde çalışıyor.`);
});
