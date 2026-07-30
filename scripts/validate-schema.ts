import { Pool } from 'pg';

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'zimgrid_billing',
  user: process.env.DB_USER || 'zimgrid_admin',
  password: process.env.DB_PASSWORD || 'zimgrid_dev_pass',
});

const requiredTables = [
  'business_partners',
  'business_partner_addresses',
  'contract_accounts',
  'equipment_master',
  'installations',
  'grid_assets',
  'substations',
  'meter_readings',
  'rate_categories',
  'tariff_steps',
  'billing_documents',
  'billing_line_items',
  'prepaid_tokens',
  'incoming_payments',
  'service_outages',
  'outage_customer_impacts',
  'audit_logs',
  'analytic_privileges',
];

async function validate() {
  console.log('🔍 Validating ZimGrid schema...');

  const results = await db.query(`
    SELECT table_name 
    FROM information.tables 
    WHERE table_schema = 'public'
  `);

  const existing = new Set(results.rows.map(r => r.table_name));
  let missing = 0;

  for (const table of requiredTables) {
    if (existing.has(table)) {
      console.log(`  ✅ ${table}`);
    } else {
      console.log(`  ❌ ${table} — MISSING`);
      missing++;
    }
  }

  if (missing === 0) {
    console.log('✅ All 18 tables present. Schema is valid.');
  } else {
    console.log(`⚠️  ${missing} table(s) missing. Run migrations first.`);
    process.exit(1);
  }

  await db.end();
}

validate().catch(err => {
  console.error('❌ Validation failed:', err);
  process.exit(1);
});
