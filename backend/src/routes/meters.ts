import { Router } from 'express';
import { db } from '../config/database';

export const meterRouter = Router();

meterRouter.get('/', async (req, res) => {
  const { page = '1', limit = '20', search, type } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  let query = `SELECT e.*, i.installation_number, i.contract_account_id, i.connection_status, i.rate_category FROM equipment_master e LEFT JOIN installations i ON e.equipment_id = i.equipment_id WHERE e.is_active = true`;
  const params: any[] = [];

  if (type) { params.push(type); query += ' AND e.equipment_type = $' + params.length; }
  if (search) {
    const term = `%${search}%`;
    query += ' AND (e.serial_number ILIKE $' + (params.length + 1) + ' OR e.equipment_number ILIKE $' + (params.length + 2) + ')';
    params.push(term, term);
  }

  query += ' ORDER BY e.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(limitNum, offset);

  const result = await db.query(query, params);
  res.json({ data: result.rows, page: pageNum, limit: limitNum });
});

meterRouter.get('/readings', async (req, res) => {
  const { equipment_id, from, to, limit = '100' } = req.query;
  const result = await db.query(
    `SELECT * FROM meter_readings WHERE equipment_id = $1 AND reading_date BETWEEN $2 AND $3 ORDER BY reading_date DESC, reading_time DESC LIMIT $4`,
    [equipment_id, from, to, parseInt(limit as string)]
  );
  res.json(result.rows);
});

meterRouter.get('/:id/consumption-trend', async (req, res) => {
  const { id } = req.params;
  const result = await db.query(
    `SELECT TO_CHAR(reading_date, 'YYYY-MM') as month, SUM(consumption_kwh) as total_kwh, COUNT(*) as reading_count FROM meter_readings WHERE equipment_id = $1 AND reading_date >= CURRENT_DATE - INTERVAL '12 months' GROUP BY TO_CHAR(reading_date, 'YYYY-MM') ORDER BY month`,
    [id]
  );
  res.json(result.rows);
});