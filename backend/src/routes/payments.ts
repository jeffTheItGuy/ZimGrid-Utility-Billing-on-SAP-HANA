import { Router } from 'express';
import { db } from '../config/database';
import { redis } from '../config/redis';

export const paymentRouter = Router();

paymentRouter.post('/process', async (req, res) => {
  const { account_id, amount, method, reference, idempotency_key } = req.body;

  const existing = await redis.get(`payment:${idempotency_key}`);
  if (existing) {
    return res.status(409).json({ error: 'Duplicate payment detected', payment_id: existing });
  }

  const result = await db.query(
    `INSERT INTO incoming_payments 
     (contract_account_id, amount, payment_method, payment_reference, currency_code)
     VALUES ($1, $2, $3, $4, 'USD')
     RETURNING payment_id`,
    [account_id, amount, method, reference]
  );

  const payment_id = result.rows[0].payment_id;
  await redis.setex(`payment:${idempotency_key}`, 86400, payment_id);

  res.json({ payment_id, status: 'processed' });
});
