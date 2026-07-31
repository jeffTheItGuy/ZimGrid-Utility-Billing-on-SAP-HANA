import { Router } from 'express';
import { db } from '../config/database';

export const operationsRouter = Router();

operationsRouter.get('/system-health', async (req, res) => {
  const health = await db.getSystemHealth();
  res.json(health);
});

operationsRouter.get('/table-growth', async (req, res) => {
  const tables = await db.getTableGrowth();
  res.json(tables);
});

operationsRouter.get('/outages', async (req, res) => {
  const { status = 'ACTIVE' } = req.query;

  const result = await db.query(
    `SELECT o.*, 
        (SELECT COUNT(*) FROM outage_customer_impacts oci WHERE oci.outage_id = o.outage_id) as affected_customers
     FROM service_outages o
     WHERE o.status = $1
     ORDER BY o.start_time DESC`,
    [status]
  );

  res.json(result.rows);
});
