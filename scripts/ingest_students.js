#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');
const process = require('process');

require('dotenv').config();

const { Pool } = require('pg');
const xlsx = require('xlsx');

const DATA_DIR = process.env.DATA_DIR || '/mnt/data';

const TURKISH_CHAR_MAP = new Map([
  ['ç', 'c'],
  ['Ç', 'c'],
  ['ğ', 'g'],
  ['Ğ', 'g'],
  ['ı', 'i'],
  ['İ', 'i'],
  ['ö', 'o'],
  ['Ö', 'o'],
  ['ş', 's'],
  ['Ş', 's'],
  ['ü', 'u'],
  ['Ü', 'u'],
]);

function normalizeTurkish(value) {
  return value
    .split('')
    .map((char) => TURKISH_CHAR_MAP.get(char) || char)
    .join('');
}

function normalizeClassCode(rawName) {
  const normalized = normalizeTurkish(rawName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized;
}

function inferLevel(rawName) {
  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();
  if (/^(9|10|11|12)(\b|\s)/.test(trimmed)) {
    return trimmed.split(/\s+/)[0];
  }
  if (lower.includes('mezun')) {
    return 'Mezun';
  }
  if (lower === 'tyt' || lower.includes('tyt')) {
    return 'TYT';
  }
  return null;
}

async function collectExcelFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return collectExcelFiles(fullPath);
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.xlsx')) {
        return fullPath;
      }
      return [];
    }),
  );
  return files.flat();
}

function sanitizeFullName(name) {
  return name.replace(/\s+/g, ' ').trim();
}

function splitName(fullName) {
  const sanitized = sanitizeFullName(fullName);
  if (!sanitized) {
    return null;
  }
  const tokens = sanitized.split(' ');
  if (tokens.length < 2) {
    return { firstName: sanitized, lastName: null };
  }
  const lastName = tokens.pop();
  const firstName = tokens.join(' ');
  return { firstName, lastName };
}

async function ensureSchema(client) {
  await client.query(`
    create extension if not exists pgcrypto;

    create table if not exists students (
      id uuid primary key default gen_random_uuid(),
      first_name text not null,
      last_name  text not null,
      full_name  text not null,
      student_no text unique,
      phone      text,
      created_at timestamptz default now()
    );

    create table if not exists class_groups (
      id uuid primary key default gen_random_uuid(),
      code text unique not null,
      name text not null,
      level text,
      created_at timestamptz default now()
    );

    create table if not exists enrollments (
      id uuid primary key default gen_random_uuid(),
      student_id uuid not null references students(id) on delete cascade,
      class_group_id uuid not null references class_groups(id) on delete cascade,
      status text default 'active',
      created_at timestamptz default now(),
      unique(student_id, class_group_id)
    );

    create index if not exists idx_students_name on students(last_name, first_name);
    create index if not exists idx_enroll_class on enrollments(class_group_id);
  `);
}

async function upsertClassGroup(client, { code, name, level }) {
  await client.query(
    `insert into class_groups (code, name, level)
     values ($1, $2, $3)
     on conflict (code) do update set name = excluded.name, level = coalesce(excluded.level, class_groups.level);
    `,
    [code, name, level],
  );
  const { rows } = await client.query('select id from class_groups where code = $1', [code]);
  return rows[0].id;
}

async function upsertStudent(client, { firstName, lastName, fullName }) {
  const { rows } = await client.query(
    `select id from students where full_name = $1 and first_name = $2 and last_name = $3`,
    [fullName, firstName, lastName],
  );
  if (rows.length) {
    return rows[0].id;
  }
  const insert = await client.query(
    `insert into students (first_name, last_name, full_name)
     values ($1, $2, $3)
     returning id;`,
    [firstName, lastName, fullName],
  );
  return insert.rows[0].id;
}

async function ensureEnrollment(client, studentId, classGroupId) {
  await client.query(
    `insert into enrollments (student_id, class_group_id)
     values ($1, $2)
     on conflict (student_id, class_group_id) do nothing;`,
    [studentId, classGroupId],
  );
}

async function processWorkbook(client, filePath, anomalyLog) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const rawName = sanitizeFullName(fileName);
  const classCode = normalizeClassCode(rawName);
  const level = inferLevel(rawName);

  const classGroupId = await upsertClassGroup(client, {
    code: classCode,
    name: rawName,
    level,
  });

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    anomalyLog.missingSheets.push(filePath);
    return { processed: 0 };
  }
  const worksheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (rows.length === 0) {
    return { processed: 0 };
  }
  const header = rows[0].map((value) => String(value).trim().toLowerCase());
  const fullNameIdx = header.findIndex((value) => value === 'ad soyad');
  if (fullNameIdx === -1) {
    anomalyLog.missingColumns.push({ filePath, header: rows[0] });
    return { processed: 0 };
  }

  let processed = 0;

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const value = row[fullNameIdx];
    if (typeof value !== 'string' && typeof value !== 'number') {
      if (value !== '') {
        anomalyLog.invalidRows.push({ filePath, rowNumber: i + 1, value });
      }
      continue;
    }
    const fullName = sanitizeFullName(String(value));
    if (!fullName) {
      anomalyLog.emptyNames.push({ filePath, rowNumber: i + 1 });
      continue;
    }

    const nameParts = splitName(fullName);
    if (!nameParts || !nameParts.lastName) {
      anomalyLog.unparsedNames.push({ filePath, rowNumber: i + 1, fullName });
      continue;
    }

    const studentId = await upsertStudent(client, {
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      fullName,
    });
    await ensureEnrollment(client, studentId, classGroupId);
    processed += 1;
  }

  return { processed };
}

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined. Please set it via environment variables.');
  }

  const pool = new Pool({ connectionString: dbUrl });
  const client = await pool.connect();
  const anomalyLog = {
    emptyNames: [],
    unparsedNames: [],
    missingColumns: [],
    invalidRows: [],
    missingSheets: [],
  };

  try {
    await client.query('BEGIN');

    await ensureSchema(client);

    try {
      await fs.access(DATA_DIR);
    } catch (err) {
      throw new Error(`Data directory not found: ${DATA_DIR}`);
    }

    const excelFiles = await collectExcelFiles(DATA_DIR);
    if (excelFiles.length === 0) {
      throw new Error(`No .xlsx files found under ${DATA_DIR}`);
    }

    let totalRows = 0;

    for (const filePath of excelFiles.sort()) {
      const { processed } = await processWorkbook(client, filePath, anomalyLog);
      totalRows += processed;
      console.log(`Processed ${processed} students from ${filePath}`);
    }

    await client.query('COMMIT');

    const summary = await client.query(
      `select
         (select count(*) from class_groups) as class_count,
         (select count(*) from students) as student_count,
         (select count(*) from enrollments) as enrollment_count;
      `,
    );

    console.log('\n=== Import Summary ===');
    console.log(`DATABASE_URL: ${dbUrl}`);
    console.log(`Excel files processed: ${excelFiles.length}`);
    console.log(`Total student rows processed: ${totalRows}`);
    console.log(`Class groups: ${summary.rows[0].class_count}`);
    console.log(`Students: ${summary.rows[0].student_count}`);
    console.log(`Enrollments: ${summary.rows[0].enrollment_count}`);

    const topClasses = await client.query(`
      select cg.name, count(e.id) as student_in_class
      from enrollments e
      join class_groups cg on cg.id = e.class_group_id
      group by cg.name
      order by student_in_class desc
      limit 5;
    `);

    console.log('\nTop 5 classes by enrollment:');
    topClasses.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.name} — ${row.student_in_class}`);
    });

    const anomalyEntries = Object.entries(anomalyLog).filter(([, arr]) => arr.length > 0);
    if (anomalyEntries.length) {
      console.log('\n=== Anomalies ===');
      for (const [key, arr] of anomalyEntries) {
        console.log(`\n${key}:`);
        arr.forEach((item) => console.log(JSON.stringify(item)));
      }
    } else {
      console.log('\nNo anomalies detected.');
    }

    console.log('\nDataclip queries:');
    console.log(`Ata Akademi — Sınıf Bazlı Öğrenci Sayıları:\nselect\n  cg.code,\n  cg.name,\n  coalesce(count(e.id),0) as student_count\nfrom class_groups cg\nleft join enrollments e on e.class_group_id = cg.id\ngroup by cg.code, cg.name\norder by cg.name;`);

    console.log(`\nTüm Öğrenci Listesi (Ad, Soyad, Sınıf):\nselect\n  s.first_name,\n  s.last_name,\n  cg.name as class_name\nfrom enrollments e\njoin students s on s.id=e.student_id\njoin class_groups cg on cg.id=e.class_group_id\norder by cg.name, s.last_name, s.first_name;`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Import failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
