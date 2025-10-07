const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

let poolConfig;

if (connectionString) {
  poolConfig = {
    connectionString,
    ssl:
      isProduction || process.env.PGSSLMODE === 'require'
        ? { rejectUnauthorized: false }
        : false,
  };
} else {
  poolConfig = {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT) || 5432,
    database: process.env.PGDATABASE || 'ataakademi',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Beklenmeyen veritabanı hatası', err);
});

module.exports = pool;
