import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { hanaQuery, hanaConfig } from './hana';

// PostgreSQL pool (Development / HANA-compatible schema)
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

// HANA configuration & query helper
export { hanaQuery, hanaConfig };

// Landscape mode indicator
export const landscapeMode = process.env.USE_HANA === 'true' ? 'SAP_HANA_PROD' : 'POSTGRESQL_DEV';

logger.info(`Database pool initialized [Landscape: ${landscapeMode}]`);
