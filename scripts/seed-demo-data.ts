import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'zimgrid_billing',
  user: process.env.DB_USER || 'zimgrid_admin',
  password: process.env.DB_PASSWORD || 'zimgrid_dev_pass',
});

const regions = [
  { code: 'HR', name: 'Harare', lat: -17.8252, lng: 31.0335 },
  { code: 'BY', name: 'Bulawayo', lat: -20.1325, lng: 28.6265 },
  { code: 'MV', name: 'Masvingo', lat: -20.0746, lng: 30.8326 },
  { code: 'ML', name: 'Mutare', lat: -18.9757, lng: 32.6504 },
  { code: 'GW', name: 'Gweru', lat: -19.4563, lng: 29.8122 },
];

const suburbs = ['Highlands', 'Borrowdale', 'Mabelreign', 'Tafara', 'Mbare', 'Chitungwiza', 'Kuwadzana', 'Glen Norah', 'Budiriro', 'Waterfalls'];
const firstNames = ['Tendai', 'Rudo', 'Kudakwashe', 'Tatenda', 'Shingirai', 'Farai', 'Blessing', 'Memory', 'Lovemore', 'Tinashe', 'Chipo', 'Rumbidzai', 'Simbarashe', 'Tariro', 'Nyarai'];
const lastNames = ['Moyo', 'Mupfumi', 'Chiwenga', 'Makoni', 'Dube', 'Ncube', 'Sibanda', 'Mudzuri', 'Gumbo', 'Chikore', 'Mushonga', 'Tsvangirai', 'Mangwende', 'Marufu', 'Charamba'];

function rand(arr: any[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min: number, max: number, dec: number = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec));
}

async function seed() {
  console.log('🌱 Seeding ZimGrid demo data...');

  // 1. Rate categories
  console.log('  → Rate categories...');
  await db.query(`
    INSERT INTO rate_categories (rate_category_code, description, voltage_level, customer_type, effective_from)
    VALUES
      ('DOM01', 'Domestic Low Voltage', 'LOW', 'DOMESTIC', '2024-01-01'),
      ('COM01', 'Commercial Low Voltage', 'LOW', 'COMMERCIAL', '2024-01-01'),
      ('IND01', 'Industrial High Voltage', 'HIGH', 'INDUSTRIAL', '2024-01-01'),
      ('AGR01', 'Agriculture Irrigational', 'LOW', 'AGRICULTURE', '2024-01-01')
    ON CONFLICT DO NOTHING
  `);

  // 2. Tariff steps (USD)
  console.log('  → Tariff steps...');
  await db.query(`
    INSERT INTO tariff_steps (rate_category_id, step_number, step_from_kwh, step_to_kwh, energy_rate, fixed_charge, vat_rate, effective_from)
    VALUES
      (1, 1, 0, 50, 0.1200, 5.00, 0.15, '2024-01-01'),
      (1, 2, 51, 100, 0.1800, 5.00, 0.15, '2024-01-01'),
      (1, 3, 101, 200, 0.2500, 5.00, 0.15, '2024-01-01'),
      (1, 4, 201, 999999, 0.3500, 5.00, 0.15, '2024-01-01'),
      (2, 1, 0, 100, 0.2200, 15.00, 0.15, '2024-01-01'),
      (2, 2, 101, 500, 0.2800, 15.00, 0.15, '2024-01-01'),
      (2, 3, 501, 999999, 0.3800, 15.00, 0.15, '2024-01-01')
    ON CONFLICT DO NOTHING
  `);

  // 3. Substations
  console.log('  → Substations...');
  for (const r of regions) {
    await db.query(`
      INSERT INTO substations (substation_code, substation_name, region_code, voltage_level, location_point)
      VALUES ($1, $2, $3, '33KV', ST_SetSRID(ST_MakePoint($4, $5), 4326))
      ON CONFLICT DO NOTHING
    `, [`SUB-${r.code}-01`, `${r.name} Main Substation`, r.code, r.lng, r.lat]);
  }

  // 4. Grid assets (transformers)
  console.log('  → Grid assets...');
  const subs = await db.query('SELECT substation_id, region_code FROM substations');
  for (const sub of subs.rows) {
    for (let i = 1; i <= 5; i++) {
      const latOffset = (Math.random() - 0.5) * 0.05;
      const lngOffset = (Math.random() - 0.5) * 0.05;
      const lat = regions.find(r => r.code === sub.region_code)!.lat + latOffset;
      const lng = regions.find(r => r.code === sub.region_code)!.lng + lngOffset;
      await db.query(`
        INSERT INTO grid_assets (asset_number, asset_category, description, rated_capacity_kva, location_point, region_code, substation_id)
        VALUES ($1, 'TRANSFORMER', $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7)
        ON CONFLICT DO NOTHING
      `, [
        `TRF-${sub.region_code}-${String(i).padStart(3, '0')}`,
        `${rand([50, 100, 200, 500])}kVA Distribution Transformer`,
        rand([50, 100, 200, 500]),
        lng, lat, sub.region_code, sub.substation_id
      ]);
    }
  }

  // 5. Business partners (customers)
  console.log('  → Business partners (50 customers)...');
  const customerIds: number[] = [];
  for (let i = 1; i <= 50; i++) {
    const fn = rand(firstNames);
    const ln = rand(lastNames);
    const region = rand(regions);
    const result = await db.query(`
      INSERT INTO business_partners (partner_number, first_name, last_name, national_id, phone_primary, customer_class, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, 'ADMIN')
      RETURNING partner_id
    `, [
      `BP-${String(i).padStart(6, '0')}`,
      fn, ln,
      `${randInt(63, 86)}-${randInt(1000000, 9999999)}A${randInt(10, 99)}`,
      `+263${randInt(71, 78)}${randInt(1000000, 9999999)}`,
      rand(['DOMESTIC', 'COMMERCIAL', 'INDUSTRIAL'])
    ]);
    customerIds.push(result.rows[0].partner_id);

    // Address
    await db.query(`
      INSERT INTO business_partner_addresses (partner_id, suburb, city, location_point)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))
    `, [
      result.rows[0].partner_id,
      rand(suburbs),
      region.name,
      region.lng + (Math.random() - 0.5) * 0.02,
      region.lat + (Math.random() - 0.5) * 0.02
    ]);
  }

  // 6. Contract accounts + installations + meters + readings
  console.log('  → Contract accounts, meters, readings...');
  for (let i = 0; i < customerIds.length; i++) {
    const partnerId = customerIds[i];
    const isPrepaid = Math.random() > 0.3;

    // Contract account
    const caResult = await db.query(`
      INSERT INTO contract_accounts (contract_account_number, partner_id, payment_method, currency, current_balance)
      VALUES ($1, $2, $3, 'USD', 0)
      RETURNING contract_account_id
    `, [`CA-${String(i + 1).padStart(6, '0')}`, partnerId, isPrepaid ? 'PREPAID' : 'POSTPAID']);
    const caId = caResult.rows[0].contract_account_id;

    // Equipment (meter)
    const eqResult = await db.query(`
      INSERT INTO equipment_master (equipment_number, equipment_type, serial_number, meter_type, manufacturer, is_active)
      VALUES ($1, $2, $3, $4, 'Secure Meters', true)
      RETURNING equipment_id
    `, [
      `EQ-${String(i + 1).padStart(6, '0')}`,
      isPrepaid ? 'PREPAID' : 'POSTPAID',
      `SEC-${randInt(10000000, 99999999)}`,
      isPrepaid ? 'PREPAID' : 'SINGLE_PHASE'
    ]);
    const eqId = eqResult.rows[0].equipment_id;

    // Installation
    const addrResult = await db.query('SELECT address_id FROM business_partner_addresses WHERE partner_id = $1 LIMIT 1', [partnerId]);
    const addrId = addrResult.rows[0]?.address_id;

    const instResult = await db.query(`
      INSERT INTO installations (installation_number, contract_account_id, equipment_id, address_id, connection_type, rate_category, connected_load_kw)
      VALUES ($1, $2, $3, $4, $5, 'DOM01', $6)
      RETURNING installation_id
    `, [
      `INST-${String(i + 1).padStart(6, '0')}`,
      caId, eqId, addrId,
      isPrepaid ? 'PREPAID' : 'POSTPAID',
      randFloat(2, 15)
    ]);
    const instId = instResult.rows[0].installation_id;

    // Meter readings (last 90 days)
    let lastReading = randFloat(1000, 50000);
    for (let d = 90; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const consumption = randFloat(5, 45);
      lastReading += consumption;

      await db.query(`
        INSERT INTO meter_readings (reading_number, equipment_id, installation_id, contract_account_id, reading_date, reading_source, register_reading, previous_reading, consumption_kwh, billable_flag)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      `, [
        `RD-${String(i + 1).padStart(6, '0')}-${String(90 - d).padStart(3, '0')}`,
        eqId, instId, caId,
        date.toISOString().split('T')[0],
        rand(['MANUAL', 'AMR', 'SMART']),
        lastReading,
        lastReading - consumption,
        consumption
      ]);
    }

    // Billing document (last month)
    const totalKwh = await db.query(`
      SELECT SUM(consumption_kwh) as total FROM meter_readings 
      WHERE contract_account_id = $1 AND reading_date >= CURRENT_DATE - INTERVAL '30 days'
    `, [caId]);
    const kwh = parseFloat(totalKwh.rows[0].total) || 100;
    const energyCharge = kwh * 0.18;
    const fixedCharge = 5.00;
    const vat = (energyCharge + fixedCharge) * 0.15;
    const total = energyCharge + fixedCharge + vat;

    await db.query(`
      INSERT INTO billing_documents (bill_number, contract_account_id, installation_id, bill_period_from, bill_period_to, bill_date, due_date, total_consumption_kwh, energy_charge, fixed_charge, vat_amount, subtotal, total_amount, balance_due, payment_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13, '00')
    `, [
      `BILL-${String(i + 1).padStart(6, '0')}`,
      caId, instId,
      new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0],
      new Date().toISOString().split('T')[0],
      new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      kwh, energyCharge, fixedCharge, vat,
      energyCharge + fixedCharge, total
    ]);

    // Prepaid tokens (if prepaid)
    if (isPrepaid) {
      for (let t = 0; t < randInt(1, 5); t++) {
        const amount = rand([10, 20, 50, 100, 200]);
        await db.query(`
          INSERT INTO prepaid_tokens (token_number, meter_serial, contract_account_id, purchase_amount, kwh_credited, tariff_rate_applied, idempotency_key, payment_reference, payment_method, status, issued_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ISSUED', NOW())
        `, [
          `TK-${uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()}`,
          `SEC-${randInt(10000000, 99999999)}`,
          caId, amount, amount * 5.2, 0.1923,
          `idem-${uuidv4()}`,
          `EC-${randInt(100000, 999999)}`,
          rand(['ECOCASH', 'ZIPIT', 'CASH'])
        ]);
      }
    }
  }

  // 7. Service outage
  console.log('  → Service outages...');
  const assets = await db.query('SELECT asset_id, region_code FROM grid_assets LIMIT 3');
  for (const asset of assets.rows) {
    await db.query(`
      INSERT INTO service_outages (outage_number, outage_type, affected_asset_id, affected_region, start_time, status, estimated_customers)
      VALUES ($1, 'UNPLANNED', $2, $3, NOW() - INTERVAL '2 hours', 'ACTIVE', $4)
    `, [`OUT-${uuidv4().substring(0, 8).toUpperCase()}`, asset.asset_id, asset.region_code, randInt(500, 5000)]);
  }

  console.log('✅ Seed complete!');
  console.log('   50 customers, ~4,500 meter readings, 50 billing docs, ~75 prepaid tokens, 3 active outages');
  await db.end();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
