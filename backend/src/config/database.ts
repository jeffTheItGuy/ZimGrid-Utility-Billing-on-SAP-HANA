import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { PostgresAdapter } from '../adapters/postgres-adapter';
import { HanaAdapter } from '../adapters/hana-adapter';
import { DatabaseAdapter } from '../adapters/types';
import { hanaQuery, hanaConfig } from './hana';

export { hanaQuery, hanaConfig };

export const landscapeMode = process.env.USE_HANA === 'true' ? 'SAP_HANA_PROD' : 'POSTGRESQL_DEV';

let adapter: DatabaseAdapter;

if (process.env.USE_HANA === 'true') {
  logger.info('Initializing SAP HANA Database Adapter');
  adapter = new HanaAdapter();
} else {
  logger.info('Initializing PostgreSQL Database Adapter');
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'zimgrid_billing',
    user: process.env.DB_USER || 'zimgrid_admin',
    password: process.env.DB_PASSWORD || 'zimgrid_dev_pass',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  pool.on('error', (err) => logger.error('Unexpected database error', err));
  adapter = new PostgresAdapter(pool);
}

export const db = adapter;
logger.info(`Database pool initialized [Landscape: ${landscapeMode}]`);