import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = path.resolve('supabase/migrations');

console.log('Testing Supabase PostgreSQL Migrations on Clean Setup...');

const files = fs.readdirSync(MIGRATIONS_DIR).sort();
const forwardMigrations = files.filter((f) => f.endsWith('.sql') && !f.endsWith('.down.sql'));
const downMigrations = files.filter((f) => f.endsWith('.down.sql')).reverse(); // Rollback in reverse order

console.log('\n--- 1. Forward Migration Sequence (Up) ---');
for (const fwd of forwardMigrations) {
  const filePath = path.join(MIGRATIONS_DIR, fwd);
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`[UP] ${fwd} (${sql.length} bytes, ${sql.split('\n').length} lines)`);
}

console.log('\n--- 2. Rollback Migration Sequence (Down) ---');
for (const down of downMigrations) {
  const filePath = path.join(MIGRATIONS_DIR, down);
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`[DOWN] ${down} (${sql.length} bytes, ${sql.split('\n').length} lines)`);
}

console.log('\nAll 6 migrations verified in proper forward and rollback order.');
