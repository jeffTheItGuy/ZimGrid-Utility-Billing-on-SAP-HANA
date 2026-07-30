import { Router } from 'express';
import { db } from '../config/database';

export const billingRouter = Router();

billingRouter.get('/documents', async (req, res) => {
  const { account_id, status, page = '1', limit = '20' } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  let query = 'SELECT * FROM billing_documents WHERE 1=1';
  const params: any[] = [];

  if (account_id) {
    params.push(account_id);
    query += ' AND contract_account_id = $' + params.length;
  }
  if (status) {
    params.push(status);
    query += ' AND payment_status = $' + params.length;
  }

  query += ' ORDER BY bill_date DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(limit, offset);

  const result = await db.query(query, params);
  res.json(result.rows);
});
