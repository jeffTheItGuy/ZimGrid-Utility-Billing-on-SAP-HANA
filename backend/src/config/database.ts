import { Pool } from 'pg';
import { logger } from '../utils/logger';

const isHana = process.env.USE_HANA === 'true';

export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'zesa_billing',
  user: process.env.DB_USER || 'zesa_admin',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

db.on('error', (err) => {
  logger.error('Unexpected database error', err);
});

export const hanaConfig = {
  host: process.env.HANA_HOST,
  port: parseInt(process.env.HANA_PORT || '30015'),
  user: process.env.HANA_USER,
  password: process.env.HANA_PASSWORD,
  databaseName: process.env.HANA_TENANT_DB || 'HDB',
};

logger.info(`Database pool initialized (${isHana ? 'HANA' : 'PostgreSQL'})`);
