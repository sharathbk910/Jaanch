import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = path.resolve('supabase/migrations');

console.log('Verifying Supabase PostgreSQL Migrations in:', MIGRATIONS_DIR);

if (!fs.existsSync(MIGRATIONS_DIR)) {
  console.error('ERROR: Migrations directory does not exist:', MIGRATIONS_DIR);
  process.exit(1);
}

const files = fs.readdirSync(MIGRATIONS_DIR).sort();
const forwardMigrations = files.filter((f) => f.endsWith('.sql') && !f.endsWith('.down.sql'));
const downMigrations = files.filter((f) => f.endsWith('.down.sql'));

console.log(`Found ${forwardMigrations.length} forward migrations and ${downMigrations.length} rollback migrations.\n`);

let hasErrors = false;

for (const fwd of forwardMigrations) {
  const baseName = fwd.replace(/\.sql$/, '');
  const expectedDown = `${baseName}.down.sql`;

  if (!downMigrations.includes(expectedDown)) {
    console.error(`FAIL: Missing down migration for '${fwd}' (expected '${expectedDown}')`);
    hasErrors = true;
  } else {
    const fwdContent = fs.readFileSync(path.join(MIGRATIONS_DIR, fwd), 'utf8');
    const downContent = fs.readFileSync(path.join(MIGRATIONS_DIR, expectedDown), 'utf8');

    if (fwdContent.trim().length === 0) {
      console.error(`FAIL: Forward migration '${fwd}' is empty`);
      hasErrors = true;
    } else if (downContent.trim().length === 0) {
      console.error(`FAIL: Down migration '${expectedDown}' is empty`);
      hasErrors = true;
    } else {
      console.log(`PASS: ${fwd} <--> ${expectedDown} (Valid pair)`);
    }
  }
}

if (hasErrors) {
  console.error('\nMigration verification FAILED.');
  process.exit(1);
} else {
  console.log('\nAll migrations verified successfully!');
}

