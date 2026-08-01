import { Router } from 'express';
import { db } from '../config/database';
import { redis } from '../config/redis';
import { v4 as uuidv4 } from 'uuid';

export const prepaidRouter = Router();

prepaidRouter.get('/tokens', async (req, res) => {
  const { page = '1', limit = '20', meter_serial, status } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  let query = `SELECT t.*, ca.contract_account_number FROM prepaid_tokens t LEFT JOIN contract_accounts ca ON t.contract_account_id = ca.contract_account_id WHERE 1=1`;
  const params: any[] = [];

  if (meter_serial) { params.push(meter_serial); query += ' AND t.meter_serial = $' + params.length; }
  if (status) { params.push(status); query += ' AND t.status = $' + params.length; }

  query += ' ORDER BY t.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
  params.push(limitNum, offset);

  const result = await db.query(query, params);
  res.json({ data: result.rows, page: pageNum, limit: limitNum });
});

prepaidRouter.post('/vend-token', async (req, res) => {
  const { meter_serial, amount, payment_method, payment_reference } = req.body;
  const idempotency_key = `${meter_serial}:${payment_reference}`;

  const lock = await redis.set(`lock:${idempotency_key}`, '1', { NX: true, EX: 30 });
  if (!lock) return res.status(429).json({ error: 'Vend in progress' });

  try {
    const existing = await db.query('SELECT token_id FROM prepaid_tokens WHERE idempotency_key = $1', [idempotency_key]);
    if (existing.rows.length > 0) return res.json({ token_id: existing.rows[0].token_id, status: 'already_issued' });

    const token_number = uuidv4().replace(/-/g, '').substring(0, 20).toUpperCase();
    const kwh_credited = amount * 5.2;

    await db.query(
      `INSERT INTO prepaid_tokens (token_number, meter_serial, purchase_amount, kwh_credited, tariff_rate_applied, idempotency_key, payment_reference, payment_method, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ISSUED')`,
      [token_number, meter_serial, amount, kwh_credited, 0.1923, idempotency_key, payment_reference, payment_method]
    );

    const result = await db.query(`SELECT token_id FROM prepaid_tokens WHERE token_number = $1`, [token_number]);
    res.json({ token_id: result.rows[0].token_id, token_number, kwh_credited, status: 'issued' });
  } finally {
    await redis.del(`lock:${idempotency_key}`);
  }
});