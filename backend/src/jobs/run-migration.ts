import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'zimgrid_billing',
  user: process.env.DB_USER || 'zimgrid_admin',
  password: process.env.DB_PASSWORD || 'zimgrid_dev_pass',
});

async function runMigrations() {
  const migrationsDir = process.env.MIGRATIONS_DIR || path.join(__dirname, '../../db/migrations');
  
  console.log('🔍 Looking for migrations in:', migrationsDir);
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found:', migrationsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📂 Found ${files.length} migration file(s)`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    console.log(`  → Running ${file}...`);
    
    const sql = fs.readFileSync(filePath, 'utf-8');
    await db.query(sql);
    
    console.log(`    ✅ ${file} complete`);
  }

  console.log('🎉 All migrations applied successfully');
  await db.end();
}

runMigrations().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});