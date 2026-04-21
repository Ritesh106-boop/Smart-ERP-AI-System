import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function fixPasswords() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'smarterp'
  });

  const hash = await bcrypt.hash('password123', 10);
  console.log('Generated hash:', hash);
  console.log('Hash length:', hash.length);

  // Update all demo users
  const [result] = await conn.query('UPDATE users SET password_hash = ?', [hash]);
  console.log(`✅ Updated ${result.affectedRows} users with correct password hash`);

  // Verify
  const [users] = await conn.query('SELECT email, password_hash FROM users LIMIT 1');
  const valid = await bcrypt.compare('password123', users[0].password_hash);
  console.log(`✅ Verification: password123 valid = ${valid}`);

  await conn.end();
}

fixPasswords();
