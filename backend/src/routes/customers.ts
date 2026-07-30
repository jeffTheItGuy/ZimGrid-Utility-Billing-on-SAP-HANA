import { Router } from 'express';
import { db } from '../config/database';

export const customerRouter = Router();

customerRouter.get('/', async (req, res) => {
  const { page = '1', limit = '20', search } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  let query = 'SELECT * FROM business_partners WHERE is_active = true';
  let params: any[] = [];

  if (search) {
    query += ' AND (first_name ILIKE $1 OR last_name ILIKE $1 OR partner_number ILIKE $1)';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(limit, offset);

  const result = await db.query(query, params);
  res.json({ data: result.rows, page: parseInt(page as string), limit: parseInt(limit as string) });
});

customerRouter.get('/:id/installations', async (req, res) => {
  const { id } = req.params;
  const result = await db.query(
    `SELECT i.*, e.equipment_number, e.meter_type 
     FROM installations i 
     JOIN equipment_master e ON i.equipment_id = e.equipment_id
     WHERE i.contract_account_id = $1`,
    [id]
  );
  res.json(result.rows);
});
