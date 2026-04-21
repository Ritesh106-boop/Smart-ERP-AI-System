import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  // First connect without specifying database to create it
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  console.log('Connected to MySQL');

  const sqlFile = path.join(__dirname, 'migrations', '001_init.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  try {
    await conn.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ Some seed data already exists, skipping duplicates');
    } else {
      console.error('❌ Migration error:', err.message);
    }
  }

  await conn.end();
}

runMigration();
