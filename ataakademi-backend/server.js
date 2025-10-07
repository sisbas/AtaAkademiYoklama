const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const { initializeDatabase } = require('./utils/seedData');
const errorHandler = require('./middleware/errorHandler');

const classesRouter = require('./routes/classes');
const attendanceRouter = require('./routes/attendance');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : undefined;

const corsOptions = {
  origin: corsOrigins || true,
  credentials: true,
};

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(limiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/classes', classesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/reports', reportsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Kaynak bulunamadı' });
});

app.use(errorHandler);

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor`);
    });
  })
  .catch((error) => {
    console.error('Veritabanı başlangıç hatası:', error);
    process.exit(1);
  });
