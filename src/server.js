require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const { toAppError, logError } = require('./utils/errors');
const { createLogger } = require('./utils/logger');

const attendanceRoutes = require('./routes/attendance');
const classRoutes = require('./routes/classes');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const publicDir = path.join(__dirname, '..', 'public');
const logger = createLogger('http');

if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: {
        write: message => logger.info(message.trim())
      }
    })
  );
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.options('*', cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(publicDir));

app.use('/api/attendance', attendanceRoutes);
app.use('/api/classes', classRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Bulunamadı' });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((err, req, res, next) => {
  const appError = toAppError(err);
  logError(appError, {
    scope: 'express.errorHandler',
    method: req.method,
    path: req.originalUrl
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

  res.status(appError.statusCode || 500).json(payload);
});

app.listen(PORT, HOST, () => {
  logger.info('Ata Akademi yoklama sunucusu başlatıldı.', {
    host: HOST,
    port: Number(PORT)
  });
});
