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

operationsRouter.get('/grid-assets', async (req, res) => {
  const { page = '1', limit = '50', region, type } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  let query = `
    SELECT g.*, s.substation_name, s.substation_code
    FROM grid_assets g
    LEFT JOIN substations s ON g.substation_id = s.substation_id
    WHERE g.is_active = true
  `;
  const params: any[] = [];

  if (region) {
    params.push(region);
    query += ' AND g.region_code = $' + params.length;
  }
  if (type) {
    params.push(type);
    query += ' AND g.asset_category = $' + params.length;
  }

  query += ' ORDER BY g.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(limitNum, offset);

  const result = await db.query(query, params);
  res.json({ data: result.rows, page: pageNum, limit: limitNum });
});
