import { Router } from 'express';
import { hanaQuery } from '../config/database';
import { logger } from '../utils/logger';

export const hanaAdminRouter = Router();

// Middleware: return mock data in PostgreSQL dev mode so UI still renders
hanaAdminRouter.use((req: any, res: any, next: any) => {
  res.locals.mockMode = process.env.USE_HANA !== 'true';
  next();
});

hanaAdminRouter.get('/memory', async (req, res) => {
  if (res.locals.mockMode) {
    return res.json({
      mode: 'MOCK',
      memory: {
        host: 'hana-primary-harare',
        used_gb: 1247.50,
        total_gb: 2048.00,
        pct_used: 60.92,
        peak_gb: 1890.30,
      }
    });
  }

  try {
    const result = await hanaQuery(`
      SELECT 
        HOST,
        ROUND(USED_PHYSICAL_MEMORY/1024/1024/1024, 2) AS USED_GB,
        ROUND(TOTAL_PHYSICAL_MEMORY/1024/1024/1024, 2) AS TOTAL_GB,
        ROUND(USED_PHYSICAL_MEMORY * 100.0 / TOTAL_PHYSICAL_MEMORY, 2) AS PCT_USED,
        ROUND(PEAK_PHYSICAL_MEMORY/1024/1024/1024, 2) AS PEAK_GB
      FROM M_HOST_INFORMATION
      WHERE KEY IN ('used_physical_memory', 'total_physical_memory', 'peak_physical_memory')
    `);
    res.json({ mode: 'HANA', memory: result.rows[0] });
  } catch (err: any) {
    logger.error('HANA memory query failed', err);
    res.status(503).json({ error: 'HANA unavailable', detail: err.message });
  }
});

hanaAdminRouter.get('/replication', async (req, res) => {
  if (res.locals.mockMode) {
    return res.json({
      mode: 'MOCK',
      replication: {
        primary_site: 'Harare_DC',
        secondary_site: 'Bulawayo_DR',
        replication_mode: 'ASYNC',
        status: 'ACTIVE',
        lag_seconds: 12,
      }
    });
  }

  try {
    const result = await hanaQuery(`
      SELECT 
        SITE_NAME AS PRIMARY_SITE,
        SECONDARY_SITE_NAME,
        REPLICATION_MODE,
        REPLICATION_STATUS,
        ROUND(SECONDARY_LOG_POSITION - PRIMARY_LOG_POSITION, 2) AS LAG_SECONDS
      FROM M_SYSTEM_REPLICATION
    `);
    res.json({ mode: 'HANA', replication: result.rows[0] });
  } catch (err: any) {
    logger.error('HANA replication query failed', err);
    res.status(503).json({ error: 'HANA unavailable', detail: err.message });
  }
});

hanaAdminRouter.get('/delta-merge', async (req, res) => {
  if (res.locals.mockMode) {
    return res.json({
      mode: 'MOCK',
      tables: [
        { schema: 'ZESA_BILLING', table: 'METER_READINGS', delta_mb: 4200, main_mb: 89000, delta_pct: 4.5 },
        { schema: 'ZESA_BILLING', table: 'BILLING_DOCUMENTS', delta_mb: 180, main_mb: 42000, delta_pct: 0.4 },
        { schema: 'ZESA_BILLING', table: 'INCOMING_PAYMENTS', delta_mb: 95, main_mb: 28000, delta_pct: 0.3 },
        { schema: 'ZESA_BILLING', table: 'PREPAID_TOKENS', delta_mb: 310, main_mb: 15000, delta_pct: 2.0 },
      ]
    });
  }

  try {
    const result = await hanaQuery(`
      SELECT 
        SCHEMA_NAME,
        TABLE_NAME,
        ROUND(MEMORY_SIZE_IN_DELTA/1024/1024, 2) AS DELTA_MB,
        ROUND(MEMORY_SIZE_IN_MAIN/1024/1024, 2) AS MAIN_MB,
        ROUND(MEMORY_SIZE_IN_DELTA * 100.0 / NULLIF(MEMORY_SIZE_IN_DELTA + MEMORY_SIZE_IN_MAIN, 0), 2) AS DELTA_PCT
      FROM M_TABLES
      WHERE TABLE_TYPE = 'COLUMN'
      ORDER BY MEMORY_SIZE_IN_DELTA DESC
      LIMIT 20
    `);
    res.json({ mode: 'HANA', tables: result.rows });
  } catch (err: any) {
    logger.error('HANA delta merge query failed', err);
    res.status(503).json({ error: 'HANA unavailable', detail: err.message });
  }
});

hanaAdminRouter.get('/backup-catalog', async (req, res) => {
  if (res.locals.mockMode) {
    return res.json({
      mode: 'MOCK',
      backups: [
        { entry_type: 'complete data backup', utc_start: '2026-07-30T02:00:00Z', state: 'successful', size_gb: 847.2 },
        { entry_type: 'log backup', utc_start: '2026-07-30T14:15:00Z', state: 'successful', size_gb: 2.1 },
        { entry_type: 'log backup', utc_start: '2026-07-30T14:00:00Z', state: 'successful', size_gb: 1.9 },
      ]
    });
  }

  try {
    const result = await hanaQuery(`
      SELECT 
        ENTRY_TYPE_NAME AS ENTRY_TYPE,
        UTC_START_TIME AS UTC_START,
        STATE_NAME AS STATE,
        ROUND(BACKUP_SIZE/1024/1024/1024, 2) AS SIZE_GB
      FROM M_BACKUP_CATALOG
      WHERE ENTRY_TYPE_NAME IN ('complete data backup', 'log backup', 'incremental data backup')
      ORDER BY UTC_START_TIME DESC
      LIMIT 10
    `);
    res.json({ mode: 'HANA', backups: result.rows });
  } catch (err: any) {
    logger.error('HANA backup catalog query failed', err);
    res.status(503).json({ error: 'HANA unavailable', detail: err.message });
  }
});

hanaAdminRouter.get('/active-statements', async (req, res) => {
  if (res.locals.mockMode) {
    return res.json({ mode: 'MOCK', statements: [] });
  }

  try {
    const result = await hanaQuery(`
      SELECT 
        STATEMENT_ID,
        LEFT(STATEMENT_STRING, 120) AS STATEMENT_PREVIEW,
        ROUND(DURATION_MICROSEC/1000000, 2) AS DURATION_SEC,
        USER_NAME,
        APPLICATION_NAME
      FROM M_ACTIVE_STATEMENTS
      WHERE DURATION_MICROSEC > 1000000
      ORDER BY DURATION_MICROSEC DESC
      LIMIT 20
    `);
    res.json({ mode: 'HANA', statements: result.rows });
  } catch (err: any) {
    logger.error('HANA active statements query failed', err);
    res.status(503).json({ error: 'HANA unavailable', detail: err.message });
  }
});
