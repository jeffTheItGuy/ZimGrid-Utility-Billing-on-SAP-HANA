import { logger } from '../utils/logger';

let createConnection: any;
try {
  const hana = require('@sap/hana-client');
  createConnection = hana.createConnection;
} catch (err) {
  logger.warn('@sap/hana-client not installed — HANA connectivity unavailable');
}

const connParams = {
  host: process.env.HANA_HOST || 'localhost',
  port: parseInt(process.env.HANA_PORT || '30015'),
  user: process.env.HANA_USER || 'SYSTEM',
  password: process.env.HANA_PASSWORD || '',
  databaseName: process.env.HANA_TENANT_DB || 'HDB',
};

export interface HanaQueryResult {
  rows: any[];
  rowCount: number;
}

export const hanaQuery = async (sql: string, params?: any[]): Promise<HanaQueryResult> => {
  if (!createConnection) {
    throw new Error('HANA client not available. Install @sap/hana-client or run in PostgreSQL dev mode.');
  }

  return new Promise((resolve, reject) => {
    const conn = createConnection();

    conn.connect(connParams, (err: any) => {
      if (err) {
        logger.error('HANA connection failed', { error: err.message });
        reject(err);
        return;
      }

      conn.exec(sql, params || [], (err: any, result: any) => {
        if (err) {
          logger.error('HANA query failed', { sql, error: err.message });
          conn.disconnect();
          reject(err);
          return;
        }

        const rows = Array.isArray(result) ? result : [];
        conn.disconnect();
        resolve({ rows, rowCount: rows.length });
      });
    });
  });
};

export const hanaConfig = { ...connParams };

logger.info(`HANA configuration loaded for tenant: ${connParams.databaseName}`);
