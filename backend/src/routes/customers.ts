import { Router } from 'express';
import { db } from '../config/database';

export const customerRouter = Router();

customerRouter.get('/', async (req, res) => {
  const { page = '1', limit = '20', search } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  let query = 'SELECT * FROM business_partners WHERE is_active = true';
  const params: any[] = [];

  if (search) {
    const term = `%${search}%`;
    query += ' AND (first_name ILIKE $' + (params.length + 1) + ' OR last_name ILIKE $' + (params.length + 2) + ' OR partner_number ILIKE $' + (params.length + 3) + ')';
    params.push(term, term, term);
  }

  query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(limitNum, offset);

  const result = await db.query(query, params);
  res.json({ data: result.rows, page: pageNum, limit: limitNum });
});

customerRouter.get('/:id/installations', async (req, res) => {
  const { id } = req.params;
  const result = await db.query(
    `SELECT i.*, e.equipment_number, e.meter_type 
     FROM installations i 
     JOIN equipment_master e ON i.equipment_id = e.equipment_id 
     JOIN contract_accounts ca ON i.contract_account_id = ca.contract_account_id 
     WHERE ca.partner_id = $1`,
    [id]
  );
  res.json(result.rows);
});