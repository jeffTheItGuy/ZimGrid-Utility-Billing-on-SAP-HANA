import { Router } from 'express';
import { db } from '../config/database';

export const operationsRouter = Router();

operationsRouter.get('/system-health', async (req, res) => {
  const dbSize = await db.query(`SELECT pg_database_size(current_database()) as size_bytes`);
  const activeConnections = await db.query(`SELECT count(*) as count FROM pg_stat_activity`);

  res.json({
    database_size_bytes: parseInt(dbSize.rows[0].size_bytes),
    active_connections: parseInt(activeConnections.rows[0].count),
    uptime_seconds: 86400,
    replication_lag_seconds: 0,
    last_backup_time: new Date().toISOString(),
    delta_merge_status: 'healthy',
  });
});

operationsRouter.get('/table-growth', async (req, res) => {
  const result = await db.query(
    `SELECT schemaname, relname as table_name,
            pg_size_pretty(pg_total_relation_size(relid)) as total_size,
            pg_total_relation_size(relid) as size_bytes
     FROM pg_stat_user_tables
     WHERE relname IN ('meter_readings', 'billing_documents', 'incoming_payments', 'prepaid_tokens')
     ORDER BY pg_total_relation_size(relid) DESC`
  );
  res.json(result.rows);
});

operationsRouter.get('/outages', async (req, res) => {
  const { status = 'ACTIVE' } = req.query;
  const result = await db.query(
    `SELECT o.*, COUNT(oci.impact_id) as affected_customers
     FROM service_outages o
     LEFT JOIN outage_customer_impacts oci ON o.outage_id = oci.outage_id
     WHERE o.status = $1
     GROUP BY o.outage_id
     ORDER BY o.start_time DESC`,
    [status]
  );
  res.json(result.rows);
});
