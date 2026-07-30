import { createConnection } from '@sap/hana-client';

const connParams = {
  host: process.env.HANA_HOST || 'localhost',
  port: parseInt(process.env.HANA_PORT || '30015'),
  user: process.env.HANA_USER || 'SYSTEM',
  password: process.env.HANA_PASSWORD || '',
  databaseName: process.env.HANA_TENANT_DB || 'HDB',
};

console.log('🔌 Testing SAP HANA connection...');
console.log(`   Host: ${connParams.host}:${connParams.port}`);
console.log(`   Database: ${connParams.databaseName}`);

const conn = createConnection();

conn.connect(connParams, (err: any) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    console.log('   (This is expected in dev mode without a HANA instance)');
    process.exit(0);
  }

  console.log('✅ Connected to SAP HANA');

  conn.exec('SELECT * FROM M_DATABASE', (err: any, result: any) => {
    if (err) {
      console.error('❌ Query failed:', err.message);
    } else {
      console.log('📊 Database info:', result[0]);
    }
    conn.disconnect();
  });
});
